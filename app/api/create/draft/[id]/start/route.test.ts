import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTestUser } from '@/lib/test-fixtures';

const USER_ID = '00000000-0000-0000-0000-000000000001';
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

  it('creates Story + Chapter(1) + ChapterUsage with new fields; returns ids', async () => {
    const fandom = await prisma.tag.create({
      data: { type: 'FANDOM', name: 'HP-t14', slug: `${SLUG_PREFIX}hp` },
    });
    const draft = await prisma.createDraft.create({
      data: {
        userId: USER_ID,
        fandomId: fandom.id,
        focusType: 'ROMANCE',
        characters: ['Гарри', 'Драко'],
        tropes: ['enemies'],
        rating: 'MATURE',
        category: 'SLASH',
        warnings: ['cntw'],
        pov: 'CLOSE_THIRD',
        tense: 'PAST',
        tones: ['SLOW_BURN', 'ANGST'],
        timeline: 'post',
        timelineNote: 'через 5 лет',
        genres: ['современная AU'],
        premise: 'случайная встреча',
        step: 5,
      },
    });
    const res = await POST(
      new NextRequest('http://x', { method: 'POST', headers: { 'x-test-user-id': USER_ID } }),
      { params: Promise.resolve({ id: draft.id }) },
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.storyId).toBeTruthy();
    expect(json.chapterId).toBeTruthy();

    const ch = await prisma.chapter.findUniqueOrThrow({
      where: { id: json.chapterId },
      include: { usage: true },
    });
    expect(ch.ordinal).toBe(1);
    expect(ch.status).toBe('DRAFT');
    expect(ch.usage).toBeTruthy();

    const story = await prisma.story.findUniqueOrThrow({
      where: { id: json.storyId },
      include: { tags: { include: { tag: true } } },
    });
    expect(story.focusType).toBe('ROMANCE');
    expect(story.rating).toBe('MATURE');
    expect(story.category).toBe('SLASH');
    expect(story.warnings).toEqual(['cntw']);
    expect(story.pov).toBe('CLOSE_THIRD');
    expect(story.tense).toBe('PAST');
    expect(story.tones).toEqual(['SLOW_BURN', 'ANGST']);
    expect(story.tone).toBe('SLOW_BURN'); // legacy single field = first of tones[]
    expect(story.timeline).toBe('post');
    expect(story.timelineNote).toBe('через 5 лет');
    expect(story.genres).toEqual(['современная AU']);
    expect(story.premise).toBe('случайная встреча');

    // Tags: fandom, RELATIONSHIP for "Гарри × Драко", CHARACTER_TAG for each, FREEFORM for trope+genre
    const tagTypes = story.tags.map((st) => st.tag.type).sort();
    expect(tagTypes).toContain('FANDOM');
    expect(tagTypes).toContain('RELATIONSHIP');
    expect(tagTypes.filter((t) => t === 'CHARACTER_TAG').length).toBe(2);
    expect(tagTypes.filter((t) => t === 'FREEFORM').length).toBe(2); // trope + genre
  });

  it('returns 400 when focusType is null', async () => {
    const fandom = await prisma.tag.create({
      data: { type: 'FANDOM', name: 'HPnf', slug: `${SLUG_PREFIX}hpnf` },
    });
    const draft = await prisma.createDraft.create({
      data: { userId: USER_ID, fandomId: fandom.id, characters: ['x'], step: 5 },
    });
    const res = await POST(
      new NextRequest('http://x', { method: 'POST', headers: { 'x-test-user-id': USER_ID } }),
      { params: Promise.resolve({ id: draft.id }) },
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.reason).toBe('focus');
  });

  it('returns 400 when characters is empty', async () => {
    const fandom = await prisma.tag.create({
      data: { type: 'FANDOM', name: 'HPnc', slug: `${SLUG_PREFIX}hpnc` },
    });
    const draft = await prisma.createDraft.create({
      data: { userId: USER_ID, fandomId: fandom.id, focusType: 'ROMANCE', step: 5 },
    });
    const res = await POST(
      new NextRequest('http://x', { method: 'POST', headers: { 'x-test-user-id': USER_ID } }),
      { params: Promise.resolve({ id: draft.id }) },
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.reason).toBe('characters');
  });

  it('returns 429 over daily quota', async () => {
    const fandom = await prisma.tag.create({
      data: { type: 'FANDOM', name: 'HP2-t14', slug: `${SLUG_PREFIX}hp2` },
    });
    await prisma.dailyUsage.create({ data: { userId: USER_ID, day: new Date(), stories: 3 } });
    const draft = await prisma.createDraft.create({
      data: {
        userId: USER_ID,
        fandomId: fandom.id,
        focusType: 'ROMANCE',
        characters: ['x', 'y'],
        step: 5,
      },
    });
    const res = await POST(
      new NextRequest('http://x', { method: 'POST', headers: { 'x-test-user-id': USER_ID } }),
      { params: Promise.resolve({ id: draft.id }) },
    );
    expect(res.status).toBe(429);
  });

  it('GEN focus with single character creates CHARACTER_TAG tags only (no RELATIONSHIP)', async () => {
    const fandom = await prisma.tag.create({
      data: { type: 'FANDOM', name: 'HPgen', slug: `${SLUG_PREFIX}hpgen` },
    });
    const draft = await prisma.createDraft.create({
      data: {
        userId: USER_ID,
        fandomId: fandom.id,
        focusType: 'GEN',
        characters: ['Юдзи'],
        step: 5,
      },
    });
    const res = await POST(
      new NextRequest('http://x', { method: 'POST', headers: { 'x-test-user-id': USER_ID } }),
      { params: Promise.resolve({ id: draft.id }) },
    );
    expect(res.status).toBe(200);
    const { storyId } = await res.json();
    const story = await prisma.story.findUniqueOrThrow({
      where: { id: storyId },
      include: { tags: { include: { tag: true } } },
    });
    const types = story.tags.map((st) => st.tag.type);
    expect(types).not.toContain('RELATIONSHIP');
    expect(types.filter((t) => t === 'CHARACTER_TAG').length).toBe(1);
  });
});
