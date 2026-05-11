import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTestStoryWithChapter } from '@/lib/test-fixtures';

const USER_ID = '00000000-0000-0000-0000-000000000001';

describe('POST /api/chapter/[id]/next', () => {
  beforeEach(async () => {
    await prisma.dailyUsage.deleteMany({ where: { userId: USER_ID } });
    await prisma.story.deleteMany({ where: { authorId: USER_ID } });
  });

  afterAll(async () => {
    await prisma.dailyUsage.deleteMany({ where: { userId: USER_ID } });
    await prisma.story.deleteMany({ where: { authorId: USER_ID } });
  });

  it('happy path: returns next chapter with ordinal+1 and creates ChapterUsage row', async () => {
    const { user, chapter } = await createTestStoryWithChapter();
    const res = await POST(
      new NextRequest('http://x', { method: 'POST', headers: { 'x-test-user-id': user.id } }),
      { params: Promise.resolve({ id: chapter.id }) },
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.chapterId).toBeTruthy();
    expect(json.ordinal).toBe(chapter.ordinal + 1);

    // Verify ChapterUsage row was created
    const usage = await prisma.chapterUsage.findUnique({ where: { chapterId: json.chapterId } });
    expect(usage).toBeTruthy();

    // Verify chapter was created with correct data
    const newChapter = await prisma.chapter.findUniqueOrThrow({ where: { id: json.chapterId } });
    expect(newChapter.status).toBe('DRAFT');
    expect(newChapter.ordinal).toBe(chapter.ordinal + 1);
  });

  it('returns 404 for nonexistent chapter', async () => {
    const { user } = await createTestStoryWithChapter();
    const res = await POST(
      new NextRequest('http://x', { method: 'POST', headers: { 'x-test-user-id': user.id } }),
      { params: Promise.resolve({ id: '00000000-0000-0000-0000-999999999999' }) },
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('not found');
  });

  it('returns 404 when requester is not the story author', async () => {
    const { chapter } = await createTestStoryWithChapter();
    const OTHER_USER = '00000000-0000-0000-0000-000000000002';
    await prisma.user.upsert({
      where: { id: OTHER_USER },
      update: {},
      create: { id: OTHER_USER, email: `${OTHER_USER}@hc.test`, handle: 'testuser2' },
    });
    const res = await POST(
      new NextRequest('http://x', { method: 'POST', headers: { 'x-test-user-id': OTHER_USER } }),
      { params: Promise.resolve({ id: chapter.id }) },
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('not found');
  });

  it('returns 429 when user is at daily quota cap', async () => {
    const { user, chapter } = await createTestStoryWithChapter();
    // Pre-fill daily usage at the cap (3 stories)
    await prisma.dailyUsage.create({ data: { userId: user.id, day: new Date(), stories: 3 } });
    const res = await POST(
      new NextRequest('http://x', { method: 'POST', headers: { 'x-test-user-id': user.id } }),
      { params: Promise.resolve({ id: chapter.id }) },
    );
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toBe('quota_exceeded');
  });
});
