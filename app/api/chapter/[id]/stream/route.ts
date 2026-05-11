import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';
import { openaiLlm } from '@/lib/llm-openai';
import * as chapterPrompt from '@/lib/prompts/chapter';
import { loadPriorState } from '@/lib/chapter/load-prior-state';
import { canonicalFandom } from '@/lib/fandom/canonical';
import { z } from 'zod';

const LengthSchema = z.enum(['short', 'medium', 'long']).default('short');

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdOrThrow(req);
  const { id } = await params;
  const length = LengthSchema.parse(req.nextUrl.searchParams.get('length') ?? 'short');

  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: {
      story: { include: { tags: { include: { tag: true } }, characters: true } },
      paragraphs: { take: 1 },
    },
  });
  if (!chapter || chapter.story.authorId !== userId) {
    return new Response('not found', { status: 404 });
  }
  if (chapter.paragraphs.length > 0) {
    return new Response('already generated', { status: 409 });
  }

  const fandomTag = chapter.story.tags.find((st) => st.tag.type === 'FANDOM')?.tag;
  const shipTag = chapter.story.tags.find((st) => st.tag.type === 'RELATIONSHIP')?.tag;
  const tropeTags = chapter.story.tags
    .filter((st) => st.tag.type === 'FREEFORM' && !st.prefilled)
    .map((st) => st.tag.name);
  const priorState = await loadPriorState(chapter.storyId, chapter.ordinal);
  const { system, user } = chapterPrompt.build({
    fandomName: fandomTag ? canonicalFandom(fandomTag.slug, fandomTag.name) : 'unknown',
    ship: shipTag?.name ?? '(any)',
    tropes: tropeTags,
    tone: chapter.story.tone ?? undefined,
    chapterLength: length,
    chapterOrdinal: chapter.ordinal,
    priorState: priorState ?? undefined,
  });

  const stream = openaiLlm.stream({
    callType: 'chapter_stream',
    templateId: chapterPrompt.TEMPLATE_ID,
    templateVersion: chapterPrompt.TEMPLATE_VERSION,
    system, user,
    contextIds: { storyId: chapter.storyId, chapterId: chapter.id, userId },
    abortSignal: req.signal,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) controller.enqueue(encoder.encode(chunk));
      } catch (e) {
        controller.error(e);
        return;
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
