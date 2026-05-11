import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTestUser } from '@/lib/test-fixtures';

const USER_ID = '00000000-0000-0000-0000-000000000001';
// Use unique slugs per test file to avoid collision when all tests run in parallel
const SLUG_PREFIX = 'start-t14-';

describe('POST /api/create/draft/[id]/start', () => {
  beforeEach(async () => {
    await prisma.story.deleteMany({ where: { authorId: USER_ID } });
    await prisma.createDraft.deleteMany({ where: { userId: USER_ID } });
    await prisma.dailyUsage.deleteMany({ where: { userId: USER_ID } });
    await prisma.tag.deleteMany({ where: { slug: { startsWith: SLUG_PREFIX } } });
    await createTestUser(USER_ID);
  });

  afterAll(async () => {
    await prisma.story.deleteMany({ where: { authorId: USER_ID } });
    await prisma.createDraft.deleteMany({ where: { userId: USER_ID } });
    await prisma.dailyUsage.deleteMany({ where: { userId: USER_ID } });
    await prisma.tag.deleteMany({ where: { slug: { startsWith: SLUG_PREFIX } } });
  });

  it('creates Story + Chapter(1) + ChapterUsage; returns ids', async () => {
    const fandom = await prisma.tag.create({ data: { type: 'FANDOM', name: 'HP-t14', slug: `${SLUG_PREFIX}hp` } });
    const draft = await prisma.createDraft.create({
      data: { userId: USER_ID, fandomId: fandom.id, shipId: 'drarry', step: 5, tropes: ['enemies'] },
    });
    const res = await POST(
      new NextRequest('http://x', { method: 'POST', headers: { 'x-test-user-id': USER_ID } }),
      { params: Promise.resolve({ id: draft.id }) },
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.storyId).toBeTruthy();
    expect(json.chapterId).toBeTruthy();
    const ch = await prisma.chapter.findUniqueOrThrow({ where: { id: json.chapterId }, include: { usage: true } });
    expect(ch.ordinal).toBe(1);
    expect(ch.status).toBe('DRAFT');
    expect(ch.usage).toBeTruthy();
  });

  it('returns 429 over daily quota', async () => {
    const fandom = await prisma.tag.create({ data: { type: 'FANDOM', name: 'HP2-t14', slug: `${SLUG_PREFIX}hp2` } });
    await prisma.dailyUsage.create({ data: { userId: USER_ID, day: new Date(), stories: 3 } });
    const draft = await prisma.createDraft.create({
      data: { userId: USER_ID, fandomId: fandom.id, shipId: 'd', step: 5 },
    });
    const res = await POST(
      new NextRequest('http://x', { method: 'POST', headers: { 'x-test-user-id': USER_ID } }),
      { params: Promise.resolve({ id: draft.id }) },
    );
    expect(res.status).toBe(429);
  });
});
