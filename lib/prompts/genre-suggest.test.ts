import { describe, it, expect } from 'vitest';
import { build, GenreSuggestSchema, TEMPLATE_ID } from './genre-suggest';

describe('genre-suggest', () => {
  it('builds prompt with fandom + focus', () => {
    const out = build({ fandomName: 'HP', focus: 'ROMANCE' });
    expect(out.system).toMatch(/AU/i);
    expect(out.system).toMatch(/idiomatic Russian/i);
    expect(out.user).toMatch(/HP/);
  });

  it('schema produces label_ru in Russian', () => {
    const sample = {
      genres: Array.from({ length: 10 }, (_, i) => ({
        slug: `g-${i}`,
        label_ru: `жанр ${i}`,
        popularity: 0.5,
      })),
    };
    expect(() => GenreSuggestSchema.parse(sample)).not.toThrow();
  });

  it('exposes stable TEMPLATE_ID', () => {
    expect(TEMPLATE_ID).toBe('genre_suggest');
  });
});
