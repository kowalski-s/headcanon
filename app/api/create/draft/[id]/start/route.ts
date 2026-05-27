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
  if (!draft.fandomId) {
    return NextResponse.json({ error: 'draft_incomplete', reason: 'fandom' }, { status: 400 });
  }
  if (!draft.focusType) {
    return NextResponse.json({ error: 'draft_incomplete', reason: 'focus' }, { status: 400 });
  }
  if (draft.characters.length === 0) {
    return NextResponse.json({ error: 'draft_incomplete', reason: 'characters' }, { status: 400 });
  }

  const quota = await debitDaily(userId, 'stories', FREE_DAILY_STORIES);
  if (!quota.allowed) {
    return NextResponse.json({ error: 'quota_exceeded' }, { status: 429 });
  }

  const focusType = draft.focusType;
  const fandomId = draft.fandomId;

  const { storyId, chapterId } = await prisma.$transaction(async (tx) => {
    const story = await tx.story.create({
      data: {
        authorId: userId,
        title: '(черновик)',
        source: 'GENERATED',
        visibility: 'PRIVATE',
        focusType,
        rating: draft.rating,
        category: draft.category,
        warnings: draft.warnings,
        pov: draft.pov,
        tense: draft.tense,
        tones: draft.tones,
        tone: draft.tones[0] ?? null,    // legacy single-value field
        timeline: draft.timeline,
        timelineNote: draft.timelineNote,
        genres: draft.genres,
        premise: draft.premise,
      },
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

    await tx.storyTag.create({ data: { storyId: story.id, tagId: fandomId } });

    // RELATIONSHIP tag: only for ROMANCE/FRIENDSHIP focuses with ≥2 characters.
    const relationshipFocuses: Array<typeof focusType> = ['ROMANCE', 'FRIENDSHIP'];
    if (relationshipFocuses.includes(focusType) && draft.characters.length >= 2) {
      const relName = draft.characters.join(' × ');
      const slug = toSlug(relName);
      const tag = await tx.tag.upsert({
        where: { type_slug: { type: 'RELATIONSHIP', slug } },
        create: { type: 'RELATIONSHIP', name: relName, slug },
        update: {},
      });
      await tx.storyTag.upsert({
        where: { storyId_tagId: { storyId: story.id, tagId: tag.id } },
        create: { storyId: story.id, tagId: tag.id },
        update: {},
      });
    }

    for (const charName of draft.characters) {
      const slug = toSlug(charName);
      const tag = await tx.tag.upsert({
        where: { type_slug: { type: 'CHARACTER_TAG', slug } },
        create: { type: 'CHARACTER_TAG', name: charName, slug },
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

    for (const genre of draft.genres) {
      const slug = toSlug(genre);
      const tag = await tx.tag.upsert({
        where: { type_slug: { type: 'FREEFORM', slug } },
        create: { type: 'FREEFORM', name: genre, slug },
        update: {},
      });
      await tx.storyTag.upsert({
        where: { storyId_tagId: { storyId: story.id, tagId: tag.id } },
        create: { storyId: story.id, tagId: tag.id },
        update: {},
      });
    }

    return { storyId: story.id, chapterId: chapter.id };
  });

  return NextResponse.json({ storyId, chapterId });
}
