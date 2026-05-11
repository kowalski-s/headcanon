// lib/cost/pricing.ts
export type ModelPrice = { inUsdPer1k: number; outUsdPer1k: number };

export const MODEL_PRICES: Record<string, ModelPrice> = {
  'gpt-5o-mini': { inUsdPer1k: 0.00015, outUsdPer1k: 0.0006 },
  'gpt-4o': { inUsdPer1k: 0.0025, outUsdPer1k: 0.01 },
  'claude-sonnet-4-6': { inUsdPer1k: 0.003, outUsdPer1k: 0.015 },
  'deepseek-v3': { inUsdPer1k: 0.0003, outUsdPer1k: 0.0011 },
};

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const p = MODEL_PRICES[model];
  if (!p) return 0;
  return (
    (p.inUsdPer1k * inputTokens) / 1000 +
    (p.outUsdPer1k * outputTokens) / 1000
  );
}
