import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';
import { debitDaily } from '@/lib/quota/check-and-debit';
import { TEMPLATE_ID, TEMPLATE_VERSION } from '@/lib/prompts/chapter';

const FREE_DAILY_STORIES = 3;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdOrThrow(req);
  const { id } = await params;
  const current = await prisma.chapter.findUnique({ where: { id }, include: { story: true } });
  if (!current || current.story.authorId !== userId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  const quota = await debitDaily(userId, 'stories', FREE_DAILY_STORIES);
  if (!quota.allowed) return NextResponse.json({ error: 'quota_exceeded' }, { status: 429 });

  const last = await prisma.chapter.findFirst({
    where: { storyId: current.storyId }, orderBy: { ordinal: 'desc' },
  });
  const newOrdinal = (last?.ordinal ?? 0) + 1;
  const created = await prisma.$transaction(async (tx) => {
    const ch = await tx.chapter.create({
      data: {
        storyId: current.storyId, ordinal: newOrdinal, status: 'DRAFT',
        templateId: TEMPLATE_ID, templateVersion: TEMPLATE_VERSION,
      },
    });
    await tx.chapterUsage.create({ data: { chapterId: ch.id } });
    return ch;
  });
  return NextResponse.json({ chapterId: created.id, ordinal: created.ordinal });
}
