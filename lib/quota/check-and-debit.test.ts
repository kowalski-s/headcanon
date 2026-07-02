import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { debitDaily, debitChapter } from './check-and-debit';
import { createTestStoryWithChapter } from '@/lib/test-fixtures';

const userId = '00000000-0000-0000-0000-000000000001';

describe('debitDaily(stories, 3/day)', () => {
  beforeEach(async () => {
    await prisma.dailyUsage.deleteMany({ where: { userId } });
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: 'qa@hc.test', handle: 'qa' },
    });
  });

  afterAll(async () => {
    await prisma.dailyUsage.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } }).catch(() => {
      // ignore if already deleted
    });
  });

  it('allows first 3, blocks 4th', async () => {
    expect((await debitDaily(userId, 'stories', 3)).allowed).toBe(true);
    expect((await debitDaily(userId, 'stories', 3)).allowed).toBe(true);
    expect((await debitDaily(userId, 'stories', 3)).allowed).toBe(true);
    const fourth = await debitDaily(userId, 'stories', 3);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it('survives concurrent debits without exceeding limit', async () => {
    const results = await Promise.all(
      Array.from({ length: 10 }, () => debitDaily(userId, 'stories', 3)),
    );
    expect(results.filter((r) => r.allowed).length).toBe(3);
  });
});

describe('debitChapter(regens, 5/chapter)', () => {
  let storyId: string;
  let chapterId: string;

  beforeEach(async () => {
    const fixture = await createTestStoryWithChapter();
    storyId = fixture.story.id;
    chapterId = fixture.chapter.id;
  });

  afterAll(async () => {
    // Cascade: deleting Story drops Chapter and ChapterUsage
    if (storyId) {
      await prisma.story.delete({ where: { id: storyId } }).catch(() => {});
    }
  });

  it('allows first 5 regens, blocks 6th', async () => {
    for (let i = 0; i < 5; i++) {
      const result = await debitChapter(chapterId, 'regens', 5);
      expect(result.allowed).toBe(true);
    }
    const sixth = await debitChapter(chapterId, 'regens', 5);
    expect(sixth.allowed).toBe(false);
    expect(sixth.remaining).toBe(0);
  });

  it('throws on invalid resource name', async () => {
    await expect(debitChapter(chapterId, 'badField' as never, 5)).rejects.toThrow(
      'Invalid ChapterResource',
    );
  });
});
