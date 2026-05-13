import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/llm-openai', () => ({
  openaiLlm: {
    completeStructured: vi.fn(async () => ({
      suggestions: Array.from({ length: 7 }, (_, i) => ({
        names: ['A' + i, 'B' + i],
        label_ru: `A${i} × B${i}`,
        popularity: 0.5,
        avatar_prompt: 'two figures',
        rarity: 'top',
        focus_compatible: ['romance'],
      })),
    })),
  },
}));
vi.mock('@/lib/cache/ai-suggestion', () => ({
  getSuggestion: vi.fn(async () => null),
  setSuggestion: vi.fn(async () => undefined),
}));

const FANDOM_ID = 'f1f1f1f1-1111-1111-1111-111111111111';

function makeReq(params: Record<string, string>) {
  const u = new URL('http://x/api/create/suggestions/characters');
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return new NextRequest(u);
}

beforeEach(async () => {
  await prisma.tag.upsert({
    where: { type_slug: { type: 'FANDOM', slug: 'hp-test-chars' } },
    create: { id: FANDOM_ID, type: 'FANDOM', name: 'HP', slug: 'hp-test-chars' },
    update: {},
  });
});

describe('GET /api/create/suggestions/characters', () => {
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

  it('returns suggestions array on success', async () => {
    const res = await GET(makeReq({ fandomId: FANDOM_ID, focus: 'ROMANCE' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.suggestions).toHaveLength(7);
    expect(body.suggestions[0]).toHaveProperty('label_ru');
  });
});
