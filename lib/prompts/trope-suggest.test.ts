import { describe, it, expect } from 'vitest';
import { build, TropeSuggestSchema } from './trope-suggest';

describe('trope-suggest', () => {
  it('builds prompt with focus + characters context', () => {
    const out = build({
      fandomName: 'HP',
      focus: 'ROMANCE',
      characters: ['Гарри', 'Драко'],
    });
    expect(out.system).toMatch(/idiomatic Russian fandom slang/i);
    expect(out.user).toMatch(/HP/);
    expect(out.user).toMatch(/ROMANCE/);
    expect(out.user).toMatch(/Гарри/);
  });

  it('schema requires label_ru in Russian', () => {
    const sample = {
      tropes: Array.from({ length: 8 }, (_, i) => ({
        slug: `t-${i}`,
        label_ru: `троп ${i}`,
        description_ru: 'описание',
        popularity: 0.5,
      })),
      sensei_tip: 'Удачи.',
    };
    expect(() => TropeSuggestSchema.parse(sample)).not.toThrow();
  });
});
