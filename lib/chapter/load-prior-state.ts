import { prisma } from '@/lib/prisma';
import type { PriorState } from '@/lib/prompts/chapter';

export async function loadPriorState(
  storyId: string,
  chapterOrdinal: number,
): Promise<PriorState | null> {
  if (chapterOrdinal <= 1) return null;

  const [worldState, characterStates, summaries, recentChapters] = await Promise.all([
    prisma.worldState.findUnique({ where: { storyId } }),
    prisma.characterState.findMany({ where: { storyId } }),
    prisma.chapterSummary.findMany({
      where: { chapter: { storyId, ordinal: { lt: chapterOrdinal - 1 } } },
      orderBy: { chapter: { ordinal: 'asc' } },
    }),
    prisma.chapter.findMany({
      where: {
        storyId,
        ordinal: { in: [chapterOrdinal - 2, chapterOrdinal - 1].filter((n) => n > 0) },
      },
      include: { paragraphs: { orderBy: { ordinal: 'asc' } } },
      orderBy: { ordinal: 'asc' },
    }),
  ]);

  if (!worldState) return null;

  return {
    worldState: worldState.stateJson as PriorState['worldState'],
    characterStates: characterStates.map(
      (cs) => cs.stateJson as PriorState['characterStates'][number],
    ),
    summaries: summaries.map((s) => s.summary),
    recentChapters: recentChapters.map((ch) => ch.paragraphs.map((p) => p.text).join('\n\n')),
  };
}
