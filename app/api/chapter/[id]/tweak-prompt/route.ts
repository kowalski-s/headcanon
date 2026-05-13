import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';
import { debitChapter } from '@/lib/quota/check-and-debit';
import { openaiLlm } from '@/lib/llm-openai';
import * as chapterPrompt from '@/lib/prompts/chapter';
import { loadPriorState } from '@/lib/chapter/load-prior-state';
import { wrapUserInput } from '@/lib/safety/injection-guard';

const Body = z.object({
  hint: z.string().min(1).max(500),
  length: z.enum(['short', 'medium', 'long']).default('short'),
});

const PROMPT_TWEAKS_LIMIT = 2;

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdOrThrow(req);
  const { id } = await ctx.params;
  const { hint, length } = Body.parse(await req.json());

  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: { story: { include: { tags: { include: { tag: true } } } } },
  });
  if (!chapter || chapter.story.authorId !== userId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const quota = await debitChapter(id, 'promptTweaks', PROMPT_TWEAKS_LIMIT);
  if (!quota.allowed) return NextResponse.json({ error: 'quota_exceeded' }, { status: 429 });

  const priorState = await loadPriorState(chapter.storyId, chapter.ordinal);
  const fandomName = chapter.story.tags.find((st) => st.tag.type === 'FANDOM')?.tag.name ?? 'unknown';
  const characters = chapter.story.tags
    .filter((st) => st.tag.type === 'CHARACTER_TAG')
    .map((st) => st.tag.name);

  const { system, user } = chapterPrompt.build({
    fandomName,
    focusType: chapter.story.focusType ?? 'ROMANCE',
    characters,
    tropes: [],
    rating: chapter.story.rating ?? undefined,
    category: chapter.story.category ?? undefined,
    warnings: chapter.story.warnings,
    pov: chapter.story.pov ?? undefined,
    tense: chapter.story.tense ?? undefined,
    tones: chapter.story.tones,
    genres: chapter.story.genres,
    timeline: chapter.story.timeline ?? undefined,
    timelineNote: chapter.story.timelineNote ?? undefined,
    chapterLength: length,
    chapterOrdinal: chapter.ordinal,
    priorState: priorState ?? undefined,
    premise: chapter.ordinal === 1 ? hint : undefined,
  });
  // chapterPrompt.build only injects premise for ordinal=1; for N>1 append hint to user prompt explicitly
  const userWithHint = chapter.ordinal === 1
    ? user
    : `${user}\n\nAuthor rewrite note: ${wrapUserInput(hint)}`;

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of openaiLlm.stream({
          callType: 'chapter_tweak',
          templateId: chapterPrompt.TEMPLATE_ID,
          templateVersion: chapterPrompt.TEMPLATE_VERSION,
          system,
          user: userWithHint,
          contextIds: { storyId: chapter.storyId, chapterId: id, userId },
          abortSignal: req.signal,
        })) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (e) {
        controller.error(e);
        return;
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
