import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

const MOCK_SHIPS = [
  { names: ['Harry', 'Draco'], popularity: 0.95, avatar_prompt: 'Two boys.', rarity: 'top' as const },
  { names: ['Hermione', 'Pansy'], popularity: 0.15, avatar_prompt: 'Two girls.', rarity: 'rare' as const },
  { names: ['Ron', 'Neville'], popularity: 0.6, avatar_prompt: 'Best friends.', rarity: 'top' as const },
  { names: ['Luna', 'Ginny'], popularity: 0.55, avatar_prompt: 'Dreamy pair.', rarity: 'top' as const },
  { names: ['Harry', 'Hermione'], popularity: 0.8, avatar_prompt: 'Soulmates.', rarity: 'top' as const },
];

const { completeStructuredMock } = vi.hoisted(() => ({
  completeStructuredMock: vi.fn(async () => ({ ships: MOCK_SHIPS })),
}));

vi.mock('@/lib/llm-openai', () => ({
  openaiLlm: { completeStructured: completeStructuredMock },
}));

// We need prisma for test cleanup, but NOT mocked for route tests —
// the route uses real DB so we can also test the cache path.
import { GET } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSuggestion } from '@/lib/cache/ai-suggestion';

const FANDOM_ID = '00000000-0000-0000-0000-000000000101';
const NONEXISTENT_ID = '00000000-0000-0000-0000-000000000999';

async function seedFandom() {
  // Clean up any leftover from previous run first to avoid slug conflicts
  await prisma.tag.deleteMany({ where: { id: FANDOM_ID } });
  return prisma.tag.create({
    data: {
      id: FANDOM_ID,
      type: 'FANDOM',
      name: 'Harry Potter',
      slug: `harry-potter-ships-${FANDOM_ID}`,
    },
  });
}

function makeReq(params: Record<string, string>) {
  const url = new URL('http://localhost/api/create/suggestions/ships');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url.toString());
}

describe('GET /api/create/suggestions/ships', () => {
  beforeEach(async () => {
    await prisma.aiSuggestion.deleteMany({ where: { scope: 'ship_suggestions' } });
    completeStructuredMock.mockClear();
  });

  afterAll(async () => {
    await prisma.aiSuggestion.deleteMany({ where: { scope: 'ship_suggestions' } });
    await prisma.tag.deleteMany({ where: { id: FANDOM_ID } });
  });

  it('returns 400 without fandomId', async () => {
    const res = await GET(new NextRequest('http://localhost/api/create/suggestions/ships'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('fandomId required');
  });

  it('returns 404 for unknown fandomId', async () => {
    const res = await GET(makeReq({ fandomId: NONEXISTENT_ID }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('fandom not found');
  });

  it('calls LLM, returns ships, writes cache', async () => {
    await seedFandom();
    const res = await GET(makeReq({ fandomId: FANDOM_ID }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cached).toBe(false);
    expect(body.ships).toHaveLength(MOCK_SHIPS.length);
    expect(completeStructuredMock).toHaveBeenCalledOnce();
    // cache was written
    const row = await prisma.aiSuggestion.findFirst({ where: { scope: 'ship_suggestions' } });
    expect(row).not.toBeNull();
  });

  it('returns cached: true on second call, LLM not called again', async () => {
    await seedFandom();
    const cacheKey = { scope: 'ship_suggestions', fandomId: FANDOM_ID };
    await setSuggestion('ship_suggestions', cacheKey, { ships: MOCK_SHIPS }, 'gpt-4o-mini', 3600);

    const res = await GET(makeReq({ fandomId: FANDOM_ID }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cached).toBe(true);
    expect(body.ships).toHaveLength(MOCK_SHIPS.length);
    expect(completeStructuredMock).not.toHaveBeenCalled();
  });
});
