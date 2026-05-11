import { describe, it, expect, vi, afterAll } from 'vitest';
vi.mock('@/lib/llm-openai', () => ({
  openaiLlm: { stream: async function* () { yield 'Hello '; yield 'world.'; } },
}));
import { GET } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTestStoryWithChapter } from '@/lib/test-fixtures';

const USER_ID = '00000000-0000-0000-0000-000000000001';

afterAll(async () => {
  await prisma.story.deleteMany({ where: { authorId: USER_ID } });
});

describe('GET /api/chapter/[id]/stream', () => {
  it('streams text for owner', async () => {
    const { user, chapter } = await createTestStoryWithChapter();
    const res = await GET(
      new NextRequest('http://x?length=short', { headers: { 'x-test-user-id': user.id } }),
      { params: Promise.resolve({ id: chapter.id }) },
    );
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toBe('Hello world.');
  });

  it('returns 404 when wrong author', async () => {
    const { chapter } = await createTestStoryWithChapter();
    // Create a different user
    const otherUser = await prisma.user.upsert({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'other@hc.test',
        handle: 'otheruser',
      },
    });
    const res = await GET(
      new NextRequest('http://x?length=short', { headers: { 'x-test-user-id': otherUser.id } }),
      { params: Promise.resolve({ id: chapter.id }) },
    );
    expect(res.status).toBe(404);
  });

  it('returns 409 when paragraphs already exist', async () => {
    const { user, chapter } = await createTestStoryWithChapter();
    // Insert a paragraph to simulate already-generated state
    await prisma.paragraph.create({
      data: {
        chapterId: chapter.id,
        ordinal: 1,
        text: 'Existing paragraph.',
      },
    });
    const res = await GET(
      new NextRequest('http://x?length=short', { headers: { 'x-test-user-id': user.id } }),
      { params: Promise.resolve({ id: chapter.id }) },
    );
    expect(res.status).toBe(409);
  });
});
