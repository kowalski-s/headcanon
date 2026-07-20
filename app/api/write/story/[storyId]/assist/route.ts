import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';
import { openaiLlm } from '@/lib/llm-openai';
import * as assist from '@/lib/prompts/assist';
import { canonicalFandom } from '@/lib/fandom/canonical';

const HistoryItem = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(4000),
});

const Body = z
  .object({
    action: z.enum(['chat', 'expand', 'retry']),
    chapterId: z.string().min(1),
    message: z.string().max(2000).optional(),
    history: z.array(HistoryItem).max(20).default([]),
  })
  .refine((b) => b.action !== 'chat' || (b.message?.trim().length ?? 0) > 0, {
    message: 'message required for chat',
    path: ['message'],
  });

export async function POST(req: NextRequest, ctx: { params: Promise<{ storyId: string }> }) {
  const { storyId } = await ctx.params;

  let userId: string;
  try {
    userId = await getUserIdOrThrow(req);
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const { action, chapterId, message, history } = parsed.data;

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { story: { include: { tags: { include: { tag: true } } } } },
  });
  // Ownership + that the chapter really belongs to the story in the path.
  if (!chapter || chapter.storyId !== storyId || chapter.story.authorId !== userId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const fandomTag = chapter.story.tags.find((st) => st.tag.type === 'FANDOM')?.tag;
  const meta: assist.AssistMeta = {
    storyTitle: chapter.story.title,
    fandomName: fandomTag ? canonicalFandom(fandomTag.slug, fandomTag.name) : 'оригинальный мир',
    characters: chapter.story.tags
      .filter((st) => st.tag.type === 'CHARACTER_TAG')
      .map((st) => st.tag.name),
    tropes: chapter.story.tags
      .filter((st) => st.tag.type === 'FREEFORM' && !st.prefilled)
      .map((st) => st.tag.name),
    chapterOrdinal: chapter.ordinal,
  };
  const chapterText = chapter.text ?? '';

  // ── structured inline suggestion (expand / retry — «иначе» = новый вызов) ──
  if (action === 'expand' || action === 'retry') {
    const { system, user } = assist.buildExpand({ meta, chapterText, instruction: message });
    const suggestion = await openaiLlm.completeStructured({
      callType: 'assist_expand',
      templateId: assist.TEMPLATE_ID,
      templateVersion: assist.TEMPLATE_VERSION,
      schema: assist.AssistSuggestionSchema,
      system,
      user,
      contextIds: { storyId, chapterId, userId },
    });
    return NextResponse.json(suggestion);
  }

  // ── streaming chat ──
  const { system, user } = assist.buildChat({
    meta,
    chapterText,
    message: message ?? '',
    history,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of openaiLlm.stream({
          callType: 'assist_chat',
          templateId: assist.TEMPLATE_ID,
          templateVersion: assist.TEMPLATE_VERSION,
          system,
          user,
          contextIds: { storyId, chapterId, userId },
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
