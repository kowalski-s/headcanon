import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

const MOCK_TROPES = [
  { slug: 'enemies-to-lovers', label_ru: 'от врагов к возлюбленным', description_ru: 'враждуют, потом любят', popularity: 0.95 },
  { slug: 'slow-burn', label_ru: 'слоуберн', description_ru: 'медленное развитие', popularity: 0.9 },
  { slug: 'fake-dating', label_ru: 'фэйк-релейшеншип', description_ru: 'притворная пара', popularity: 0.8 },
  { slug: 'hurt-comfort', label_ru: 'хёрт/комфорт', description_ru: 'один ранен, второй утешает', popularity: 0.85 },
  { slug: 'mutual-pining', label_ru: 'взаимная тоска', description_ru: 'оба скучают', popularity: 0.88 },
  { slug: 'coffee-shop-au', label_ru: 'coffee shop AU', description_ru: 'современная AU в кафе', popularity: 0.7 },
  { slug: 'forced-proximity', label_ru: 'вынужденная близость', description_ru: 'обстоятельства запирают вместе', popularity: 0.82 },
  { slug: 'canon-divergence', label_ru: 'отклонение от канона', description_ru: 'ветвление от ключевой сцены', popularity: 0.75 },
];
const MOCK_SENSEI_TIP = 'враги-в-любовники с этой парой пишутся сами.';

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
const FOCUS = 'ROMANCE';
const CHARACTERS = 'Гарри,Драко';

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
    const res = await GET(makeReq({ focus: FOCUS, characters: CHARACTERS }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('fandomId required');
  });

  it('returns 400 without focus', async () => {
    const res = await GET(makeReq({ fandomId: FANDOM_ID, characters: CHARACTERS }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('focus required');
  });

  it('returns 400 on invalid focus', async () => {
    const res = await GET(makeReq({ fandomId: FANDOM_ID, focus: 'BOGUS', characters: CHARACTERS }));
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown fandomId', async () => {
    const res = await GET(makeReq({ fandomId: NONEXISTENT_ID, focus: FOCUS, characters: CHARACTERS }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('fandom not found');
  });

  it('calls LLM, returns tropes + sensei_tip, writes cache with 7-day TTL', async () => {
    await seedFandom();
    const before = Date.now();
    const res = await GET(makeReq({ fandomId: FANDOM_ID, focus: FOCUS, characters: CHARACTERS }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cached).toBe(false);
    expect(body.tropes).toHaveLength(MOCK_TROPES.length);
    expect(body.sensei_tip).toBe(MOCK_SENSEI_TIP);
    expect(completeStructuredMock).toHaveBeenCalledOnce();

    const row = await prisma.aiSuggestion.findFirst({ where: { scope: 'trope_suggestions' } });
    expect(row).not.toBeNull();
    expect(row!.model).toBeTruthy();
    const sevenDays = 7 * 24 * 3600 * 1000;
    const expectedExpiry = before + sevenDays;
    expect(row!.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedExpiry - 5000);
    expect(row!.expiresAt.getTime()).toBeLessThanOrEqual(expectedExpiry + 5000);
  });

  it('returns cached: true on second call, LLM not called again', async () => {
    await seedFandom();
    const cacheKey = { scope: 'trope_suggestions', fandomId: FANDOM_ID, focus: FOCUS, characters: ['Гарри', 'Драко'] };
    await setSuggestion(
      'trope_suggestions',
      cacheKey,
      { tropes: MOCK_TROPES, sensei_tip: MOCK_SENSEI_TIP },
      'gpt-4o-mini',
      3600,
    );

    const res = await GET(makeReq({ fandomId: FANDOM_ID, focus: FOCUS, characters: CHARACTERS }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cached).toBe(true);
    expect(body.tropes).toHaveLength(MOCK_TROPES.length);
    expect(body.sensei_tip).toBe(MOCK_SENSEI_TIP);
    expect(completeStructuredMock).not.toHaveBeenCalled();
  });
});
