import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { getSuggestion, setSuggestion } from './ai-suggestion';

describe('AiSuggestion cache', () => {
  beforeEach(async () => prisma.aiSuggestion.deleteMany());
  afterAll(async () => prisma.aiSuggestion.deleteMany());

  it('miss returns null', async () => {
    const v = await getSuggestion('ship_suggestions', { fandomId: 'x' });
    expect(v).toBeNull();
  });

  it('set then get returns value', async () => {
    await setSuggestion('ship_suggestions', { fandomId: 'x' }, { ships: ['a', 'b'] }, 'gpt-5o-mini', 30 * 24 * 3600);
    const v = await getSuggestion('ship_suggestions', { fandomId: 'x' });
    expect(v).toEqual({ ships: ['a', 'b'] });
  });

  it('expired entries return null', async () => {
    await setSuggestion('ship_suggestions', { fandomId: 'y' }, { ships: ['c'] }, 'gpt-5o-mini', -1);
    expect(await getSuggestion('ship_suggestions', { fandomId: 'y' })).toBeNull();
  });
});
