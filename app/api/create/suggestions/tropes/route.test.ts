import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

const MOCK_TROPES = [
  { slug: 'enemies-to-lovers', label: 'Enemies to Lovers', description: 'Rivals discover they can\'t live without each other.', popularity: 0.95 },
  { slug: 'slow-burn', label: 'Slow Burn', description: 'Tension builds across many chapters before resolution.', popularity: 0.9 },
  { slug: 'fake-dating', label: 'Fake Dating', description: 'Pretending to date leads to real feelings.', popularity: 0.8 },
  { slug: 'hurt-comfort', label: 'Hurt/Comfort', description: 'One character hurt, the other offers solace.', popularity: 0.85 },
  { slug: 'mutual-pining', label: 'Mutual Pining', description: 'Both characters yearn but neither confesses.', popularity: 0.88 },
  { slug: 'coffee-shop-au', label: 'Coffee Shop AU', description: 'Modern alternate universe set in a café.', popularity: 0.7 },
  { slug: 'forced-proximity', label: 'Forced Proximity', description: 'Circumstances trap them together unexpectedly.', popularity: 0.82 },
  { slug: 'canon-divergence', label: 'Canon Divergence', description: 'Story branches from a pivotal canon moment.', popularity: 0.75 },
];
const MOCK_SENSEI_TIP = 'Ship these two with an enemies-to-lovers arc — their canon tension practically writes itself!';

const { completeStructuredMock } = vi.hoisted(() => ({
  completeStructuredMock: vi.fn(async () => ({ tropes: MOCK_TROPES, sensei_tip: MOCK_SENSEI_TIP })),
}));

vi.mock('@/lib/llm-openai', () => ({
  openaiLlm: { completeStructured: completeStructuredMock },
}));

import { GET } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSuggestion } from '@/lib/cache/ai-suggestion';

const FANDOM_ID = '00000000-0000-0000-0000-000000000201';
const NONEXISTENT_ID = '00000000-0000-0000-0000-000000000999';
const SHIP_ID = 'harry-draco';

async function seedFandom() {
  await prisma.tag.deleteMany({ where: { id: FANDOM_ID } });
  return prisma.tag.create({
    data: {
      id: FANDOM_ID,
      type: 'FANDOM',
      name: 'Harry Potter',
      slug: `harry-potter-tropes-${FANDOM_ID}`,
    },
  });
}

function makeReq(params: Record<string, string>) {
  const url = new URL('http://localhost/api/create/suggestions/tropes');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url.toString());
}

describe('GET /api/create/suggestions/tropes', () => {
  beforeEach(async () => {
    await prisma.aiSuggestion.deleteMany({ where: { scope: 'trope_suggestions' } });
    completeStructuredMock.mockClear();
  });

  afterAll(async () => {
    await prisma.aiSuggestion.deleteMany({ where: { scope: 'trope_suggestions' } });
    await prisma.tag.deleteMany({ where: { id: FANDOM_ID } });
  });

  it('returns 400 without fandomId', async () => {
    const res = await GET(makeReq({ shipId: SHIP_ID }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('fandomId required');
  });

  it('returns 400 without shipId', async () => {
    const res = await GET(makeReq({ fandomId: FANDOM_ID }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('shipId required');
  });

  it('returns 404 for unknown fandomId', async () => {
    const res = await GET(makeReq({ fandomId: NONEXISTENT_ID, shipId: SHIP_ID }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('fandom not found');
  });

  it('calls LLM, returns tropes + sensei_tip, writes cache with 7-day TTL', async () => {
    await seedFandom();
    const before = Date.now();
    const res = await GET(makeReq({ fandomId: FANDOM_ID, shipId: SHIP_ID }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cached).toBe(false);
    expect(body.tropes).toHaveLength(MOCK_TROPES.length);
    expect(body.sensei_tip).toBe(MOCK_SENSEI_TIP);
    expect(completeStructuredMock).toHaveBeenCalledOnce();

    // verify cache row was written with ~7-day TTL
    const row = await prisma.aiSuggestion.findFirst({ where: { scope: 'trope_suggestions' } });
    expect(row).not.toBeNull();
    expect(row!.model).toBeTruthy();
    const sevenDays = 7 * 24 * 3600 * 1000;
    const expectedExpiry = before + sevenDays;
    // allow ±5s tolerance
    expect(row!.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedExpiry - 5000);
    expect(row!.expiresAt.getTime()).toBeLessThanOrEqual(expectedExpiry + 5000);
  });

  it('returns cached: true on second call, LLM not called again', async () => {
    await seedFandom();
    const cacheKey = { scope: 'trope_suggestions', fandomId: FANDOM_ID, shipId: SHIP_ID };
    await setSuggestion(
      'trope_suggestions',
      cacheKey,
      { tropes: MOCK_TROPES, sensei_tip: MOCK_SENSEI_TIP },
      'gpt-5o-mini',
      3600,
    );

    const res = await GET(makeReq({ fandomId: FANDOM_ID, shipId: SHIP_ID }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cached).toBe(true);
    expect(body.tropes).toHaveLength(MOCK_TROPES.length);
    expect(body.sensei_tip).toBe(MOCK_SENSEI_TIP);
    expect(completeStructuredMock).not.toHaveBeenCalled();
  });
});
