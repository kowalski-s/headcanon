import { describe, it, expect } from 'vitest';
import { estimateCost, MODEL_PRICES } from './pricing';

describe('estimateCost', () => {
  it('returns USD for known model', () => {
    const cost = estimateCost('gpt-4o-mini', 1000, 500);
    const price = MODEL_PRICES['gpt-4o-mini'];
    expect(cost).toBeCloseTo(price.inUsdPer1k * 1 + price.outUsdPer1k * 0.5, 8);
  });

  it('returns 0 for unknown model (no throw)', () => {
    expect(estimateCost('definitely-not-a-model', 100, 100)).toBe(0);
  });
});
