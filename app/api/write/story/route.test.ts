import { describe, it, expect, beforeEach } from 'vitest';
import { POST as createStory } from './route';
import { NextRequest } from 'next/server';
import { createTestUser } from '@/lib/test-fixtures';
import { prisma } from '@/lib/prisma';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const auth = { 'x-test-user-id': USER_ID };

describe('POST /api/write/story', () => {
  beforeEach(async () => {
    await createTestUser(USER_ID);
  });

  it('creates a WRITTEN private story with an empty first chapter', async () => {
    const res = await createStory(
      new NextRequest('http://x', { method: 'POST', headers: auth, body: JSON.stringify({ title: 'Моя история' }) }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    const story = await prisma.story.findUniqueOrThrow({ where: { id: json.storyId }, include: { chapters: true } });
    expect(story.source).toBe('WRITTEN');
    expect(story.visibility).toBe('PRIVATE');
    expect(story.authorId).toBe(USER_ID);
    expect(story.chapters).toHaveLength(1);
    expect(story.chapters[0].ordinal).toBe(1);
    expect(story.chapters[0].status).toBe('DRAFT');
  }, 15_000);

  it('401 when unauthenticated', async () => {
    const res = await createStory(new NextRequest('http://x', { method: 'POST', body: '{}' }));
    expect(res.status).toBe(401);
  });
});
