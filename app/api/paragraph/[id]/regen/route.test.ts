import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('@/lib/llm-openai', () => ({
  openaiLlm: {
    stream: async function* () {
      yield 'new ';
      yield 'text.';
    },
  },
}));
vi.mock('@/lib/queue/boss', () => ({ enqueue: vi.fn(async () => 'job-id') }));

import { POST } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTestStoryWithChapter } from '@/lib/test-fixtures';
import { enqueue } from '@/lib/queue/boss';

function makeReq(userId: string, body: object) {
  return new NextRequest('http://x', {
    method: 'POST',
    headers: { 'x-test-user-id': userId, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/paragraph/[id]/regen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    'regen: streams replacement, persists text + bumps regensCount, enqueues bible',
    { timeout: 15_000 },
    async () => {
      const { user, chapter } = await createTestStoryWithChapter();
      const para = await prisma.paragraph.create({
        data: { chapterId: chapter.id, ordinal: 1, text: 'old' },
      });
      const res = await POST(makeReq(user.id, { mode: 'regen' }), {
        params: Promise.resolve({ id: para.id }),
      });
      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toBe('new text.');
      const after = await prisma.paragraph.findUniqueOrThrow({ where: { id: para.id } });
      expect(after.text).toBe('new text.');
      expect(after.regensCount).toBe(1);
      expect(enqueue).toHaveBeenCalledWith(
        'extract-bible',
        { chapterId: chapter.id },
        { singletonKey: chapter.id },
      );
    },
  );

  it(
    'expand: inserts new paragraphs between target and next via fractional ordinals',
    { timeout: 15_000 },
    async () => {
      const { user, chapter } = await createTestStoryWithChapter();
      const a = await prisma.paragraph.create({
        data: { chapterId: chapter.id, ordinal: 1, text: 'a' },
      });
      await prisma.paragraph.create({ data: { chapterId: chapter.id, ordinal: 2, text: 'b' } });
      // mock that yields two paragraphs separated by blank line
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const llm = (await import('@/lib/llm-openai')) as any;
      llm.openaiLlm.stream = async function* () {
        yield 'extra one.\n\nextra two.';
      };
      const res = await POST(makeReq(user.id, { mode: 'expand' }), {
        params: Promise.resolve({ id: a.id }),
      });
      expect(res.status).toBe(200);
      await res.text();
      const all = await prisma.paragraph.findMany({
        where: { chapterId: chapter.id },
        orderBy: { ordinal: 'asc' },
      });
      expect(all).toHaveLength(4);
      expect(all.map((p) => p.text)).toEqual(['a', 'extra one.', 'extra two.', 'b']);
      expect(Number(all[1].ordinal)).toBeGreaterThan(1);
      expect(Number(all[1].ordinal)).toBeLessThan(Number(all[2].ordinal));
      expect(Number(all[2].ordinal)).toBeLessThan(2);
    },
  );

  it('returns 429 over per-chapter regen limit', async () => {
    const { user, chapter } = await createTestStoryWithChapter();
    await prisma.chapterUsage.update({ where: { chapterId: chapter.id }, data: { regens: 5 } });
    const para = await prisma.paragraph.create({
      data: { chapterId: chapter.id, ordinal: 1, text: 'x' },
    });
    const res = await POST(makeReq(user.id, { mode: 'regen' }), {
      params: Promise.resolve({ id: para.id }),
    });
    expect(res.status).toBe(429);
  });

  it('returns 404 when not owner', async () => {
    const { chapter } = await createTestStoryWithChapter();
    const para = await prisma.paragraph.create({
      data: { chapterId: chapter.id, ordinal: 1, text: 'x' },
    });
    const res = await POST(makeReq('00000000-0000-0000-0000-000000000999', { mode: 'regen' }), {
      params: Promise.resolve({ id: para.id }),
    });
    expect(res.status).toBe(404);
  });

  it(
    'compress: merges target with next paragraph, deletes next, bumps regensCount',
    { timeout: 15_000 },
    async () => {
      const { user, chapter } = await createTestStoryWithChapter();
      const a = await prisma.paragraph.create({
        data: { chapterId: chapter.id, ordinal: 1, text: 'a' },
      });
      await prisma.paragraph.create({ data: { chapterId: chapter.id, ordinal: 2, text: 'b' } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const llm = (await import('@/lib/llm-openai')) as any;
      llm.openaiLlm.stream = async function* () {
        yield 'merged ab.';
      };
      const res = await POST(makeReq(user.id, { mode: 'compress' }), {
        params: Promise.resolve({ id: a.id }),
      });
      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toBe('merged ab.');
      const afterA = await prisma.paragraph.findUniqueOrThrow({ where: { id: a.id } });
      expect(afterA.text).toBe('merged ab.');
      expect(afterA.regensCount).toBe(1);
      const all = await prisma.paragraph.findMany({ where: { chapterId: chapter.id } });
      expect(all).toHaveLength(1);
    },
  );

  it(
    'compress: last-paragraph edge case — updates text + bumps regensCount, no delete',
    { timeout: 15_000 },
    async () => {
      const { user, chapter } = await createTestStoryWithChapter();
      const a = await prisma.paragraph.create({
        data: { chapterId: chapter.id, ordinal: 1, text: 'only' },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const llm = (await import('@/lib/llm-openai')) as any;
      llm.openaiLlm.stream = async function* () {
        yield 'rewritten.';
      };
      const res = await POST(makeReq(user.id, { mode: 'compress' }), {
        params: Promise.resolve({ id: a.id }),
      });
      expect(res.status).toBe(200);
      await res.text();
      const afterA = await prisma.paragraph.findUniqueOrThrow({ where: { id: a.id } });
      expect(afterA.text).toBe('rewritten.');
      expect(afterA.regensCount).toBe(1);
    },
  );

  it(
    'continue: appends new paragraphs after last paragraph with strictly increasing ordinals',
    { timeout: 15_000 },
    async () => {
      const { user, chapter } = await createTestStoryWithChapter();
      const a = await prisma.paragraph.create({
        data: { chapterId: chapter.id, ordinal: 1, text: 'start' },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const llm = (await import('@/lib/llm-openai')) as any;
      llm.openaiLlm.stream = async function* () {
        yield 'next one.\n\nnext two.\n\nnext three.';
      };
      const res = await POST(makeReq(user.id, { mode: 'continue' }), {
        params: Promise.resolve({ id: a.id }),
      });
      expect(res.status).toBe(200);
      await res.text();
      const all = await prisma.paragraph.findMany({
        where: { chapterId: chapter.id },
        orderBy: { ordinal: 'asc' },
      });
      expect(all).toHaveLength(4);
      const ordinals = all.map((p) => Number(p.ordinal));
      // strictly increasing
      for (let i = 1; i < ordinals.length; i++) {
        expect(ordinals[i]).toBeGreaterThan(ordinals[i - 1]);
      }
      // all 3 new paragraphs have ordinal > A's ordinal (1)
      expect(ordinals[1]).toBeGreaterThan(1);
      expect(ordinals[2]).toBeGreaterThan(1);
      expect(ordinals[3]).toBeGreaterThan(1);
    },
  );

  it('age gate: returns 403 with age_gate error for M-rated story when user has no ageConfirmedAt', async () => {
    const { user, story, chapter } = await createTestStoryWithChapter();
    const tag = await prisma.tag.upsert({
      where: { type_slug: { type: 'RATING', slug: 'm' } },
      update: {},
      create: { type: 'RATING', name: 'M', slug: 'm' },
    });
    await prisma.storyTag.create({
      data: { storyId: story.id, tagId: tag.id, prefilled: false },
    });
    const para = await prisma.paragraph.create({
      data: { chapterId: chapter.id, ordinal: 1, text: 'x' },
    });
    const res = await POST(makeReq(user.id, { mode: 'regen' }), {
      params: Promise.resolve({ id: para.id }),
    });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: 'age_gate' });
  });
});
