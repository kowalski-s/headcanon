import { describe, it, expect, afterAll, beforeEach, vi } from 'vitest';

vi.mock('@/lib/queue/boss', () => ({
  enqueue: vi.fn(async () => 'job-id'),
}));

import { POST } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTestStoryWithChapter } from '@/lib/test-fixtures';
import { enqueue } from '@/lib/queue/boss';

const USER_ID = '00000000-0000-0000-0000-000000000001';

beforeEach(() => {
  vi.clearAllMocks();
});

afterAll(async () => {
  await prisma.story.deleteMany({ where: { authorId: USER_ID } });
});

describe('POST /api/chapter/[id]/save', () => {
  it('splits text into paragraphs', async () => {
    const { user, chapter } = await createTestStoryWithChapter();
    const text = 'Para one.\n\nPara two.\n\n\nPara three.';
    const res = await POST(
      new NextRequest('http://x', { method: 'POST', body: JSON.stringify({ fullText: text }), headers: { 'x-test-user-id': user.id } }),
      { params: Promise.resolve({ id: chapter.id }) },
    );
    expect(res.status).toBe(200);
    const rows = await prisma.paragraph.findMany({ where: { chapterId: chapter.id }, orderBy: { ordinal: 'asc' } });
    expect(rows.map((r) => r.text)).toEqual(['Para one.', 'Para two.', 'Para three.']);
    expect(Number(rows[0].ordinal)).toBe(1);
    expect(Number(rows[1].ordinal)).toBe(2);
  });

  it('returns 404 for wrong author', async () => {
    const { chapter } = await createTestStoryWithChapter();
    const otherUser = await prisma.user.upsert({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      update: {},
      create: { id: '00000000-0000-0000-0000-000000000002', email: 'other@hc.test', handle: 'otheruser' },
    });
    const res = await POST(
      new NextRequest('http://x', { method: 'POST', body: JSON.stringify({ fullText: 'Hello.' }), headers: { 'x-test-user-id': otherUser.id } }),
      { params: Promise.resolve({ id: chapter.id }) },
    );
    expect(res.status).toBe(404);
  });

  it('returns 400 for empty fullText', async () => {
    const { user, chapter } = await createTestStoryWithChapter();
    const res = await POST(
      new NextRequest('http://x', { method: 'POST', body: JSON.stringify({ fullText: '' }), headers: { 'x-test-user-id': user.id } }),
      { params: Promise.resolve({ id: chapter.id }) },
    );
    expect(res.status).toBe(400);
  });

  it('re-save replaces existing paragraphs', async () => {
    const { user, chapter } = await createTestStoryWithChapter();
    const first = 'First save.\n\nSecond paragraph.';
    await POST(
      new NextRequest('http://x', { method: 'POST', body: JSON.stringify({ fullText: first }), headers: { 'x-test-user-id': user.id } }),
      { params: Promise.resolve({ id: chapter.id }) },
    );
    const second = 'Only this now.';
    const res = await POST(
      new NextRequest('http://x', { method: 'POST', body: JSON.stringify({ fullText: second }), headers: { 'x-test-user-id': user.id } }),
      { params: Promise.resolve({ id: chapter.id }) },
    );
    expect(res.status).toBe(200);
    const rows = await prisma.paragraph.findMany({ where: { chapterId: chapter.id }, orderBy: { ordinal: 'asc' } });
    expect(rows).toHaveLength(1);
    expect(rows[0].text).toBe('Only this now.');
  });

  it('enqueues extract-bible and auto-tag after save', async () => {
    const { user, chapter } = await createTestStoryWithChapter();
    const res = await POST(
      new NextRequest('http://x', { method: 'POST', body: JSON.stringify({ fullText: 'Hello world.' }), headers: { 'x-test-user-id': user.id } }),
      { params: Promise.resolve({ id: chapter.id }) },
    );
    expect(res.status).toBe(200);
    expect(vi.mocked(enqueue)).toHaveBeenCalledWith('extract-bible', { chapterId: chapter.id }, { singletonKey: chapter.id });
    expect(vi.mocked(enqueue)).toHaveBeenCalledWith('auto-tag', { storyId: chapter.storyId }, { singletonKey: chapter.storyId });
  });
});
