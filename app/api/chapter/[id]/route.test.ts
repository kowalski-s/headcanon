import { describe, it, expect, afterAll } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTestStoryWithChapter } from '@/lib/test-fixtures';

const USER_ID = '00000000-0000-0000-0000-000000000001';

afterAll(async () => {
  await prisma.story.deleteMany({ where: { authorId: USER_ID } });
});

describe('GET /api/chapter/[id]', () => {
  it('returns paragraphs from DB', async () => {
    const { user, chapter } = await createTestStoryWithChapter();
    await prisma.paragraph.create({ data: { chapterId: chapter.id, ordinal: 1, text: 'P1' } });
    const res = await GET(
      new NextRequest('http://x', { headers: { 'x-test-user-id': user.id } }),
      { params: Promise.resolve({ id: chapter.id }) },
    );
    const json = await res.json();
    expect(json.paragraphs).toEqual([{ id: expect.any(String), ordinal: 1, text: 'P1' }]);
  });

  it('returns 404 if chapter does not exist', async () => {
    const { user } = await createTestStoryWithChapter();
    const res = await GET(
      new NextRequest('http://x', { headers: { 'x-test-user-id': user.id } }),
      { params: Promise.resolve({ id: '00000000-0000-0000-0000-999999999999' }) },
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('not found');
  });

  it('returns 403 if story is PRIVATE and requester is not author', async () => {
    const { chapter } = await createTestStoryWithChapter();
    const otherUser = await prisma.user.upsert({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      update: {},
      create: { id: '00000000-0000-0000-0000-000000000002', email: 'other@hc.test', handle: 'otheruser' },
    });
    const res = await GET(
      new NextRequest('http://x', { headers: { 'x-test-user-id': otherUser.id } }),
      { params: Promise.resolve({ id: chapter.id }) },
    );
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('forbidden');
  });

  it('returns 200 if story is PUBLIC and requester is not author', async () => {
    const { user, story, chapter } = await createTestStoryWithChapter();
    await prisma.story.update({ where: { id: story.id }, data: { visibility: 'PUBLIC' } });
    await prisma.paragraph.create({ data: { chapterId: chapter.id, ordinal: 1, text: 'Public paragraph' } });
    const otherUser = await prisma.user.upsert({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      update: {},
      create: { id: '00000000-0000-0000-0000-000000000002', email: 'other@hc.test', handle: 'otheruser' },
    });
    const res = await GET(
      new NextRequest('http://x', { headers: { 'x-test-user-id': otherUser.id } }),
      { params: Promise.resolve({ id: chapter.id }) },
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.paragraphs).toEqual([{ id: expect.any(String), ordinal: 1, text: 'Public paragraph' }]);
    // suppress unused var warning
    void user;
  });
});
