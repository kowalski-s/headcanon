import { describe, it, expect, vi, afterAll, beforeEach } from 'vitest';
vi.mock('@/lib/llm-openai', () => ({
  openaiLlm: { stream: async function* () { yield 'Hello '; yield 'world.'; } },
}));
import { GET } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTestStoryWithChapter } from '@/lib/test-fixtures';
import * as chapterPromptModule from '@/lib/prompts/chapter';

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

describe('GET /api/chapter/[id]/stream — coherence (priorState for N>1)', () => {
  let buildSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    buildSpy = vi.spyOn(chapterPromptModule, 'build');
  });

  afterAll(async () => {
    await prisma.story.deleteMany({ where: { authorId: USER_ID } });
  });

  it('passes priorState to chapterPrompt.build when WorldState exists for chapter N=2', async () => {
    const { user, story } = await createTestStoryWithChapter(); // creates ordinal=1

    // Create chapter 1 paragraphs so recentChapters will have content
    const chapter1 = await prisma.chapter.findFirstOrThrow({
      where: { storyId: story.id, ordinal: 1 },
    });
    await prisma.paragraph.create({
      data: { chapterId: chapter1.id, ordinal: 1, text: 'Chapter one text.' },
    });

    // Create chapter 2 (the one we will stream)
    const chapter2 = await prisma.chapter.create({
      data: { storyId: story.id, ordinal: 2, status: 'DRAFT' },
    });
    await prisma.chapterUsage.create({ data: { chapterId: chapter2.id } });

    // Seed WorldState
    const worldStateData = {
      current_location: 'forest',
      story_time: 'dusk',
      active_plot_threads: ['the chase'],
      foreshadowing: [],
    };
    await prisma.worldState.create({
      data: {
        storyId: story.id,
        stateJson: worldStateData,
        updatedAtChapter: 1,
      },
    });

    const res = await GET(
      new NextRequest('http://x?length=short', { headers: { 'x-test-user-id': user.id } }),
      { params: Promise.resolve({ id: chapter2.id }) },
    );

    expect(res.status).toBe(200);
    expect(buildSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        chapterOrdinal: 2,
        priorState: expect.objectContaining({
          worldState: expect.objectContaining({ current_location: 'forest' }),
        }),
      }),
    );
  });

  it('passes priorState=undefined to chapterPrompt.build when no WorldState exists for chapter N=2', async () => {
    const { user, story } = await createTestStoryWithChapter(); // creates ordinal=1

    // Create chapter 2 (no WorldState seeded)
    const chapter2 = await prisma.chapter.create({
      data: { storyId: story.id, ordinal: 2, status: 'DRAFT' },
    });
    await prisma.chapterUsage.create({ data: { chapterId: chapter2.id } });

    const res = await GET(
      new NextRequest('http://x?length=short', { headers: { 'x-test-user-id': user.id } }),
      { params: Promise.resolve({ id: chapter2.id }) },
    );

    expect(res.status).toBe(200);
    expect(buildSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        chapterOrdinal: 2,
        priorState: undefined,
      }),
    );
  });

  it('does not load priorState for chapter N=1', async () => {
    const { user, chapter } = await createTestStoryWithChapter(); // ordinal=1

    const res = await GET(
      new NextRequest('http://x?length=short', { headers: { 'x-test-user-id': user.id } }),
      { params: Promise.resolve({ id: chapter.id }) },
    );

    expect(res.status).toBe(200);
    expect(buildSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        chapterOrdinal: 1,
        priorState: undefined,
      }),
    );
  });
});
