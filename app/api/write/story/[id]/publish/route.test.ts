import { describe, it, expect, beforeEach } from 'vitest';
import { POST as publish } from './route';
import { NextRequest } from 'next/server';
import { createTestUser } from '@/lib/test-fixtures';
import { prisma } from '@/lib/prisma';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const auth = { 'x-test-user-id': USER_ID };

describe('POST publish', () => {
  beforeEach(async () => {
    await createTestUser(USER_ID);
  });

  it('publish=true → PUBLIC + chapters with text become PUBLISHED', async () => {
    const s = await prisma.story.create({
      data: { authorId: USER_ID, title: 't', source: 'WRITTEN', visibility: 'PRIVATE' },
    });
    await prisma.chapter.create({
      data: { storyId: s.id, ordinal: 1, status: 'DRAFT', text: 'есть текст' },
    });
    await prisma.chapter.create({ data: { storyId: s.id, ordinal: 2, status: 'DRAFT', text: '' } });
    const res = await publish(
      new NextRequest('http://x', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ publish: true }),
      }),
      { params: Promise.resolve({ id: s.id }) },
    );
    expect(res.status).toBe(200);
    const after = await prisma.story.findUniqueOrThrow({
      where: { id: s.id },
      include: { chapters: { orderBy: { ordinal: 'asc' } } },
    });
    expect(after.visibility).toBe('PUBLIC');
    expect(after.publishedAt).not.toBeNull();
    expect(after.chapters[0].status).toBe('PUBLISHED'); // есть текст
    expect(after.chapters[1].status).toBe('DRAFT'); // пустая остаётся черновиком
  }, 15_000);

  it('publish=false → back to PRIVATE', async () => {
    const s = await prisma.story.create({
      data: {
        authorId: USER_ID,
        title: 't',
        source: 'WRITTEN',
        visibility: 'PUBLIC',
        publishedAt: new Date(),
      },
    });
    const res = await publish(
      new NextRequest('http://x', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ publish: false }),
      }),
      { params: Promise.resolve({ id: s.id }) },
    );
    expect(res.status).toBe(200);
    const after = await prisma.story.findUniqueOrThrow({ where: { id: s.id } });
    expect(after.visibility).toBe('PRIVATE');
  }, 15_000);
});
