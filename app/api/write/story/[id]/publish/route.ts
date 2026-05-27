import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

const Body = z.object({ publish: z.boolean() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let userId: string;
  try { userId = await getUserIdOrThrow(req); } catch { return NextResponse.json({ error: 'unauthenticated' }, { status: 401 }); }
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const story = await prisma.story.findUnique({ where: { id } });
  if (!story || story.authorId !== userId) return NextResponse.json({ error: 'not found' }, { status: 404 });

  if (parsed.data.publish) {
    await prisma.$transaction([
      prisma.story.update({ where: { id }, data: { visibility: 'PUBLIC', publishedAt: story.publishedAt ?? new Date() } }),
      prisma.chapter.updateMany({ where: { storyId: id, NOT: { text: '' } }, data: { status: 'PUBLISHED' } }),
    ]);
  } else {
    await prisma.story.update({ where: { id }, data: { visibility: 'PRIVATE' } });
  }
  return NextResponse.json({ ok: true });
}
