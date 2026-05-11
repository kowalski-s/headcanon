import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';
import { debitDaily } from '@/lib/quota/check-and-debit';
import { TEMPLATE_ID, TEMPLATE_VERSION } from '@/lib/prompts/chapter';
import { toSlug } from '@/lib/tag/slug';

const FREE_DAILY_STORIES = 3;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdOrThrow(req);
  const { id } = await params;
  const draft = await prisma.createDraft.findUnique({ where: { id } });
  if (!draft || draft.userId !== userId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  if (!draft.fandomId || !draft.shipId) {
    return NextResponse.json({ error: 'draft incomplete' }, { status: 400 });
  }

  const quota = await debitDaily(userId, 'stories', FREE_DAILY_STORIES);
  if (!quota.allowed) {
    return NextResponse.json({ error: 'quota_exceeded' }, { status: 429 });
  }

  const { storyId, chapterId } = await prisma.$transaction(async (tx) => {
    const story = await tx.story.create({
      data: { authorId: userId, title: '(черновик)', visibility: 'PRIVATE' },
    });
    const chapter = await tx.chapter.create({
      data: {
        storyId: story.id,
        ordinal: 1,
        status: 'DRAFT',
        templateId: TEMPLATE_ID,
        templateVersion: TEMPLATE_VERSION,
      },
    });
    await tx.chapterUsage.create({ data: { chapterId: chapter.id } });

    await tx.storyTag.create({ data: { storyId: story.id, tagId: draft.fandomId! } });

    if (draft.shipId) {
      const slug = toSlug(draft.shipId);
      const tag = await tx.tag.upsert({
        where: { type_slug: { type: 'RELATIONSHIP', slug } },
        create: { type: 'RELATIONSHIP', name: draft.shipId, slug },
        update: {},
      });
      await tx.storyTag.upsert({
        where: { storyId_tagId: { storyId: story.id, tagId: tag.id } },
        create: { storyId: story.id, tagId: tag.id },
        update: {},
      });
    }

    for (const trope of draft.tropes) {
      const slug = toSlug(trope);
      const tag = await tx.tag.upsert({
        where: { type_slug: { type: 'FREEFORM', slug } },
        create: { type: 'FREEFORM', name: trope, slug },
        update: {},
      });
      await tx.storyTag.upsert({
        where: { storyId_tagId: { storyId: story.id, tagId: tag.id } },
        create: { storyId: story.id, tagId: tag.id },
        update: {},
      });
    }
    // TODO: persist draft.tone — needs Story.tone migration; for now LLM gets only ship + tropes + fandom
    return { storyId: story.id, chapterId: chapter.id };
  });

  return NextResponse.json({ storyId, chapterId });
}
