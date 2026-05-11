import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

vi.mock('@/lib/llm-openai', () => ({
  openaiLlm: {
    completeStructured: vi.fn(async () => ({
      rating_suggestion: 'T',
      warnings_suggestion: ['no_archive_warnings_apply'],
      category: 'M/M',
      freeform_tags: ['slow-burn', 'enemies-to-lovers'],
      confidence: 0.85,
    })),
  },
}));
import { handleAutoTag } from './auto-tag';
import { prisma } from '@/lib/prisma';
import { createTestStoryWithChapter } from '@/lib/test-fixtures';
import { openaiLlm } from '@/lib/llm-openai';

const mockCompleteStructured = openaiLlm.completeStructured as ReturnType<typeof vi.fn>;

const USER_ID = '00000000-0000-0000-0000-000000000001';

afterAll(async () => {
  await prisma.story.deleteMany({ where: { authorId: USER_ID } });
});

describe('handleAutoTag', () => {
  it('persists freeform tags as prefilled + writes aiTagSuggestion blob', async () => {
    const { story, chapter } = await createTestStoryWithChapter();
    await prisma.chapter.update({ where: { id: chapter.id }, data: { status: 'PUBLISHED' } });
    await prisma.paragraph.create({ data: { chapterId: chapter.id, ordinal: 1, text: 'A sentence.' } });

    await handleAutoTag({ data: { storyId: story.id } });

    const tags = await prisma.storyTag.findMany({ where: { storyId: story.id }, include: { tag: true } });
    expect(tags).toHaveLength(2);
    expect(tags.map((t) => t.tag.slug).sort()).toEqual(['enemies-to-lovers', 'slow-burn']);
    expect(tags.every((t) => t.prefilled)).toBe(true);

    const fresh = await prisma.story.findUniqueOrThrow({ where: { id: story.id } });
    expect((fresh.aiTagSuggestion as any).rating_suggestion).toBe('T');
    expect((fresh.aiTagSuggestion as any).freeform_tags).toEqual(['slow-burn', 'enemies-to-lovers']);
  }, 20_000);

  it('normalizes mixed-case freeform slugs and preserves display name', async () => {
    // Use unique tag values to avoid collision with Tags created by other tests.
    mockCompleteStructured.mockResolvedValueOnce({
      rating_suggestion: 'T',
      warnings_suggestion: ['no_archive_warnings_apply'],
      category: 'M/M',
      freeform_tags: ['Found Family', 'Hurt To Comfort'],
      confidence: 0.85,
    });

    const { story, chapter } = await createTestStoryWithChapter();
    await prisma.chapter.update({ where: { id: chapter.id }, data: { status: 'PUBLISHED' } });
    await prisma.paragraph.create({ data: { chapterId: chapter.id, ordinal: 1, text: 'A sentence.' } });

    await handleAutoTag({ data: { storyId: story.id } });

    const tags = await prisma.storyTag.findMany({ where: { storyId: story.id }, include: { tag: true } });
    expect(tags).toHaveLength(2);

    const slugs = tags.map((t) => t.tag.slug).sort();
    // Slugs are lowercased and spaces replaced with hyphens.
    expect(slugs).toEqual(['found-family', 'hurt-to-comfort']);

    const names = tags.map((t) => t.tag.name).sort();
    // Display names retain original casing from LLM output.
    expect(names).toEqual(['Found Family', 'Hurt To Comfort']);
  }, 20_000);

  it('is idempotent — re-running produces 2 storyTags, not 4', async () => {
    const { story, chapter } = await createTestStoryWithChapter();
    await prisma.chapter.update({ where: { id: chapter.id }, data: { status: 'PUBLISHED' } });
    await prisma.paragraph.create({ data: { chapterId: chapter.id, ordinal: 1, text: 'A sentence.' } });

    await handleAutoTag({ data: { storyId: story.id } });
    await handleAutoTag({ data: { storyId: story.id } });

    const tags = await prisma.storyTag.findMany({ where: { storyId: story.id } });
    expect(tags).toHaveLength(2);
  }, 30_000);
});
