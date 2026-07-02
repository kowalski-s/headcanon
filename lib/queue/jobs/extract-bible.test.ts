import { describe, it, expect, vi, afterAll } from 'vitest';

vi.mock('@/lib/llm-openai', () => ({
  openaiLlm: {
    completeStructured: vi.fn(async () => ({
      chapter_summary: 'Test summary.',
      updated_world_state: {
        current_location: 'lib',
        story_time: 'd1',
        active_plot_threads: [],
        foreshadowing: [],
      },
      updated_character_states: [],
    })),
  },
}));

import { handleExtractBible } from './extract-bible';
import { prisma } from '@/lib/prisma';
import { createTestStoryWithChapter } from '@/lib/test-fixtures';

const USER_ID = '00000000-0000-0000-0000-000000000001';

afterAll(async () => {
  // Cascade: deleting Stories drops Chapters, Paragraphs, WorldState, ChapterSummary
  await prisma.story.deleteMany({ where: { authorId: USER_ID } });
});

describe('handleExtractBible', () => {
  it('upserts world state + summary', async () => {
    const { story, chapter } = await createTestStoryWithChapter();
    await prisma.paragraph.create({
      data: { chapterId: chapter.id, ordinal: 1, text: 'Once.' },
    });

    await handleExtractBible({ data: { chapterId: chapter.id } });

    const ws = await prisma.worldState.findUniqueOrThrow({ where: { storyId: story.id } });
    expect((ws.stateJson as unknown as { current_location: string }).current_location).toBe('lib');

    const cs = await prisma.chapterSummary.findUniqueOrThrow({
      where: { chapterId: chapter.id },
    });
    expect(cs.summary).toBe('Test summary.');
  }, 20_000);

  it('is idempotent — upsert on second call', async () => {
    const { story, chapter } = await createTestStoryWithChapter();
    await prisma.paragraph.create({
      data: { chapterId: chapter.id, ordinal: 1, text: 'Twice.' },
    });

    await handleExtractBible({ data: { chapterId: chapter.id } });
    await handleExtractBible({ data: { chapterId: chapter.id } });

    const count = await prisma.worldState.count({ where: { storyId: story.id } });
    expect(count).toBe(1);
  }, 20_000);

  it('skips gracefully when chapter not found', async () => {
    await expect(
      handleExtractBible({ data: { chapterId: '00000000-0000-0000-0000-000000000000' } }),
    ).resolves.toBeUndefined();
  }, 10_000);
});
