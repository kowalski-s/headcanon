import { describe, it, expect } from 'vitest';
import {
  FOCUS_LABELS, FOCUS_DESCRIPTIONS,
  RATING_LABELS, CATEGORY_LABELS,
  POV_LABELS, TENSE_LABELS,
  TONE_LABELS, WARNING_LABELS, TIMELINE_LABELS,
} from './locale';

describe('locale labels', () => {
  it('has slang transliteration for tones, not literal translation', () => {
    expect(TONE_LABELS.SLOW_BURN).toBe('слоуберн');
    expect(TONE_LABELS.ANGST).toBe('ангст');
    expect(TONE_LABELS.FLUFF).toBe('флафф');
    expect(TONE_LABELS.HURT_COMFORT).toBe('хёрт/комфорт');
  });

  it('has idiomatic Russian for focus, rating, category, POV, tense', () => {
    expect(FOCUS_LABELS.ROMANCE).toBe('романтика');
    expect(FOCUS_DESCRIPTIONS.GEN).toMatch(/без любовной/i);
    expect(RATING_LABELS.GENERAL).toBe('общий');
    expect(RATING_LABELS.EXPLICIT).toBe('explicit');
    expect(CATEGORY_LABELS.SLASH).toBe('слэш');
    expect(POV_LABELS.CLOSE_THIRD).toBe('третье близкое');
    expect(TENSE_LABELS.PRESENT).toBe('настоящее');
  });

  it('has warnings and timeline labels', () => {
    expect(WARNING_LABELS.death).toBe('смерть персонажа');
    expect(WARNING_LABELS.cntw).toBe('без предупреждений');
    expect(TIMELINE_LABELS.au).toBe('AU без канона');
  });
});
