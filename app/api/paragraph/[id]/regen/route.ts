import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';
import { openaiLlm } from '@/lib/llm-openai';
import * as regenPrompt from '@/lib/prompts/paragraph-regen';
import { debitChapter, type ChapterResource } from '@/lib/quota/check-and-debit';
import { enqueue } from '@/lib/queue/boss';
import { requiresAgeGate, isAgeConfirmed } from '@/lib/safety/age-gate';

const Body = z.object({
  mode: z.enum(['regen', 'continue', 'expand', 'compress']),
  hint: z.string().max(500).optional(),
});

const LIMITS: Record<'regens' | 'continues', number> = { regens: 5, continues: 1 };

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdOrThrow(req);
  const { id } = await ctx.params;
  const body = Body.parse(await req.json());

  const para = await prisma.paragraph.findUnique({
    where: { id },
    include: {
      chapter: {
        include: {
          story: {
            include: {
              author: true,
              tags: { include: { tag: true } },
            },
          },
          paragraphs: { orderBy: { ordinal: 'asc' } },
        },
      },
    },
  });
  if (!para || para.chapter.story.authorId !== userId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const ratingTag =
    para.chapter.story.tags.find((st) => st.tag.type === 'RATING')?.tag.name ?? null;
  if (
    requiresAgeGate({ rating: ratingTag, tropes: [] }) &&
    !isAgeConfirmed(para.chapter.story.author)
  ) {
    return NextResponse.json({ error: 'age_gate' }, { status: 403 });
  }

  const resource: ChapterResource = body.mode === 'continue' ? 'continues' : 'regens';
  const quota = await debitChapter(para.chapter.id, resource, LIMITS[resource]);
  if (!quota.allowed) return NextResponse.json({ error: 'quota_exceeded' }, { status: 429 });

  const ordered = para.chapter.paragraphs;
  const idx = ordered.findIndex((p) => p.id === para.id);
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx < ordered.length - 1 ? ordered[idx + 1] : null;

  const fandomName =
    para.chapter.story.tags.find((st) => st.tag.type === 'FANDOM')?.tag.name ?? 'unknown';
  const ship = para.chapter.story.tags.find((st) => st.tag.type === 'RELATIONSHIP')?.tag.name ?? '';

  const { system, user } = regenPrompt.build({
    mode: body.mode,
    targetText: para.text,
    prevText: prev?.text ?? null,
    nextText: next?.text ?? null,
    storyContext: { fandomName, ship, toneNote: '' },
    hint: body.hint,
  });

  let collected = '';
  const encoder = new TextEncoder();
  const storyId = para.chapter.storyId;
  const chapterId = para.chapter.id;

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of openaiLlm.stream({
          callType: `paragraph_${body.mode}`,
          templateId: regenPrompt.TEMPLATE_ID,
          templateVersion: regenPrompt.TEMPLATE_VERSION,
          system,
          user,
          contextIds: { storyId, chapterId, userId },
          abortSignal: req.signal,
        })) {
          collected += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
        await persistResult(body.mode, para, ordered, idx, collected);
        await enqueue('extract-bible', { chapterId }, { singletonKey: chapterId });
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

type ParaWithChapter = {
  id: string;
  chapterId: string;
  ordinal: Prisma.Decimal;
  regensCount: number;
};

async function persistResult(
  mode: 'regen' | 'continue' | 'expand' | 'compress',
  target: ParaWithChapter,
  ordered: Array<{ id: string; ordinal: Prisma.Decimal; text: string }>,
  idx: number,
  fullText: string,
) {
  const trimmed = fullText.trim();
  if (mode === 'regen') {
    await prisma.paragraph.update({
      where: { id: target.id },
      data: { text: trimmed, regensCount: { increment: 1 } },
    });
    return;
  }
  if (mode === 'expand' || mode === 'continue') {
    const newTexts = trimmed
      .split(/\n{2,}/g)
      .map((s) => s.trim())
      .filter(Boolean);
    if (newTexts.length === 0) return;
    // TODO(M2-C+): switch to Prisma.Decimal arithmetic — float coercion collapses precision after ~4-5 expansions between adjacent ordinals
    const lowerOrd = Number(target.ordinal);
    const upperOrd = idx < ordered.length - 1 ? Number(ordered[idx + 1].ordinal) : undefined;
    const step = upperOrd === undefined ? 1 : (upperOrd - lowerOrd) / (newTexts.length + 1);
    await prisma.$transaction(
      newTexts.map((text, i) =>
        prisma.paragraph.create({
          data: {
            chapterId: target.chapterId,
            ordinal: lowerOrd + step * (i + 1),
            text,
          },
        }),
      ),
    );
    return;
  }
  // compress: merge target with next paragraph
  const nextPara = ordered[idx + 1];
  if (!nextPara) {
    await prisma.paragraph.update({
      where: { id: target.id },
      data: { text: trimmed, regensCount: { increment: 1 } },
    });
    return;
  }
  await prisma.$transaction([
    prisma.paragraph.update({
      where: { id: target.id },
      data: { text: trimmed, regensCount: { increment: 1 } },
    }),
    prisma.paragraph.delete({ where: { id: nextPara.id } }),
  ]);
}
