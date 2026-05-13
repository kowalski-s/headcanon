import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/llm-openai', () => ({
  openaiLlm: {
    completeStructured: vi.fn(async () => ({
      genres: Array.from({ length: 10 }, (_, i) => ({
        slug: `genre-${i}`,
        label_ru: `жанр ${i}`,
        popularity: 0.5,
      })),
    })),
  },
}));
vi.mock('@/lib/cache/ai-suggestion', () => ({
  getSuggestion: vi.fn(async () => null),
  setSuggestion: vi.fn(async () => undefined),
}));

const FANDOM_ID = 'f2f2f2f2-2222-2222-2222-222222222222';

function makeReq(params: Record<string, string>) {
  const u = new URL('http://x/api/create/suggestions/genres');
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return new NextRequest(u);
}

beforeEach(async () => {
  await prisma.tag.upsert({
    where: { type_slug: { type: 'FANDOM', slug: 'hp-test-genres' } },
    create: { id: FANDOM_ID, type: 'FANDOM', name: 'HP', slug: 'hp-test-genres' },
    update: {},
  });
});

describe('GET /api/create/suggestions/genres', () => {
  it('400 without fandomId', async () => {
    const res = await GET(makeReq({ focus: 'ROMANCE' }));
    expect(res.status).toBe(400);
  });

  it('400 without focus', async () => {
    const res = await GET(makeReq({ fandomId: FANDOM_ID }));
    expect(res.status).toBe(400);
  });

  it('400 on invalid focus', async () => {
    const res = await GET(makeReq({ fandomId: FANDOM_ID, focus: 'BOGUS' }));
    expect(res.status).toBe(400);
  });

  it('returns genres array on success', async () => {
    const res = await GET(makeReq({ fandomId: FANDOM_ID, focus: 'ROMANCE' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.genres).toHaveLength(10);
    expect(body.genres[0]).toHaveProperty('label_ru');
  });
});
