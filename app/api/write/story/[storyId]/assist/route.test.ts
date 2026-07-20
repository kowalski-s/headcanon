import { describe, it, expect, vi, afterAll } from 'vitest';

vi.mock('@/lib/llm-openai', () => ({
  openaiLlm: {
    stream: async function* () {
      yield 'Смотрю ';
      yield 'по главам.';
    },
    completeStructured: async () => ({
      teaser: 'Драко заговаривает первым',
      passage: 'Он обернулся медленно.\n\n«Ты всегда приходишь, когда не надо».',
    }),
  },
}));

import { POST } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTestStoryWithChapter } from '@/lib/test-fixtures';

const OTHER_USER = '00000000-0000-0000-0000-0000000000a3';
const createdStoryIds: string[] = [];

async function makeStory() {
  const s = await createTestStoryWithChapter();
  createdStoryIds.push(s.story.id);
  return s;
}

afterAll(async () => {
  await prisma.story.deleteMany({ where: { id: { in: createdStoryIds } } });
});

function post(storyId: string, body: unknown, headers: Record<string, string> = {}) {
  return POST(
    new NextRequest('http://x', { method: 'POST', headers, body: JSON.stringify(body) }),
    { params: Promise.resolve({ storyId }) },
  );
}

describe('POST /api/write/story/[storyId]/assist', () => {
  it('401 without auth', async () => {
    const { story, chapter } = await makeStory();
    const res = await post(story.id, { action: 'chat', chapterId: chapter.id, message: 'привет' });
    expect(res.status).toBe(401);
  });

  it('404 for a story owned by someone else', async () => {
    const { story, chapter } = await makeStory();
    await prisma.user.upsert({
      where: { id: OTHER_USER },
      update: {},
      create: { id: OTHER_USER, email: `${OTHER_USER}@hc.test`, handle: 'assist-other' },
    });
    const res = await post(
      story.id,
      { action: 'chat', chapterId: chapter.id, message: 'привет' },
      { 'x-test-user-id': OTHER_USER },
    );
    expect(res.status).toBe(404);
  });

  it('404 when the chapter does not belong to the story in the path', async () => {
    const a = await makeStory();
    const b = await makeStory();
    const res = await post(
      a.story.id,
      { action: 'chat', chapterId: b.chapter.id, message: 'привет' },
      { 'x-test-user-id': a.user.id },
    );
    expect(res.status).toBe(404);
  });

  it('400 on invalid input (chat without message)', async () => {
    const { user, story, chapter } = await makeStory();
    const res = await post(
      story.id,
      { action: 'chat', chapterId: chapter.id },
      { 'x-test-user-id': user.id },
    );
    expect(res.status).toBe(400);
  });

  it('400 on unknown action', async () => {
    const { user, story, chapter } = await makeStory();
    const res = await post(
      story.id,
      { action: 'nope', chapterId: chapter.id },
      { 'x-test-user-id': user.id },
    );
    expect(res.status).toBe(400);
  });

  it('streams the chat reply for the owner', async () => {
    const { user, story, chapter } = await makeStory();
    const res = await post(
      story.id,
      { action: 'chat', chapterId: chapter.id, message: 'что дальше?' },
      { 'x-test-user-id': user.id },
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/plain');
    const body = await res.text();
    expect(body).toBe('Смотрю по главам.');
  }, 15_000);

  it('returns a structured suggestion for expand', async () => {
    const { user, story, chapter } = await makeStory();
    const res = await post(
      story.id,
      { action: 'expand', chapterId: chapter.id },
      { 'x-test-user-id': user.id },
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.teaser).toBeTruthy();
    expect(json.passage).toContain('обернулся');
  }, 15_000);
});
