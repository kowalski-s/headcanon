import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('@/lib/queue/boss', () => ({ enqueue: vi.fn(async () => 'job-id') }));

import { DELETE } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTestStoryWithChapter } from '@/lib/test-fixtures';
import { enqueue } from '@/lib/queue/boss';

function makeReq(userId: string) {
  return new NextRequest('http://x', {
    method: 'DELETE',
    headers: { 'x-test-user-id': userId },
  });
}

describe('DELETE /api/paragraph/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes paragraph and enqueues extract-bible', async () => {
    const { user, chapter } = await createTestStoryWithChapter();
    const para = await prisma.paragraph.create({
      data: { chapterId: chapter.id, ordinal: 1, text: 'gone' },
    });
    const res = await DELETE(makeReq(user.id), { params: Promise.resolve({ id: para.id }) });
    expect(res.status).toBe(200);
    expect(await prisma.paragraph.findUnique({ where: { id: para.id } })).toBeNull();
    expect(enqueue).toHaveBeenCalledWith(
      'extract-bible',
      { chapterId: chapter.id },
      { singletonKey: chapter.id },
    );
  });

  it('returns 404 when not owner', async () => {
    const { chapter } = await createTestStoryWithChapter();
    const para = await prisma.paragraph.create({
      data: { chapterId: chapter.id, ordinal: 1, text: 'safe' },
    });
    const res = await DELETE(makeReq('00000000-0000-0000-0000-000000000999'), {
      params: Promise.resolve({ id: para.id }),
    });
    expect(res.status).toBe(404);
    expect(await prisma.paragraph.findUnique({ where: { id: para.id } })).not.toBeNull();
  });
});
