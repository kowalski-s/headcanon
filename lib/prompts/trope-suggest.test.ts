import { describe, it, expect } from 'vitest';
import { build, TropeSuggestSchema, TEMPLATE_ID, TEMPLATE_VERSION } from './trope-suggest';

describe('trope-suggest prompt', () => {
  it('exports correct TEMPLATE_ID and TEMPLATE_VERSION', () => {
    expect(TEMPLATE_ID).toBe('trope_suggest');
    expect(TEMPLATE_VERSION).toBe(1);
  });

  it('build() includes fandomName and ship in user prompt', () => {
    const { user } = build('Harry Potter', 'harry-draco');
    expect(user).toContain('Harry Potter');
    expect(user).toContain('harry-draco');
  });

  it('build() wraps inputs in user_input tags', () => {
    const { user } = build('Naruto', 'naruto-sasuke');
    expect(user).toContain('<user_input>Naruto</user_input>');
    expect(user).toContain('<user_input>naruto-sasuke</user_input>');
  });

  it('build() system includes SYSTEM_INJECTION_NOTICE', () => {
    const { system } = build('Any Fandom', 'any-ship');
    expect(system).toContain('user_input');
  });

  it('TropeSuggestSchema validates a valid object', () => {
    const valid = {
      tropes: Array.from({ length: 8 }, (_, i) => ({
        slug: `trope-${i}`,
        label: `Trope ${i}`,
        description: 'Short description.',
        popularity: 0.5,
      })),
      sensei_tip: 'A helpful tip.',
    };
    const result = TropeSuggestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('TropeSuggestSchema rejects fewer than 8 tropes', () => {
    const invalid = {
      tropes: [{ slug: 'a', label: 'A', description: 'B', popularity: 0.5 }],
      sensei_tip: 'tip',
    };
    const result = TropeSuggestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('TropeSuggestSchema rejects description over 120 chars', () => {
    const tooLong = 'x'.repeat(121);
    const invalid = {
      tropes: Array.from({ length: 8 }, (_, i) => ({
        slug: `trope-${i}`,
        label: `Trope ${i}`,
        description: i === 0 ? tooLong : 'fine',
        popularity: 0.5,
      })),
      sensei_tip: 'tip',
    };
    const result = TropeSuggestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('TropeSuggestSchema rejects sensei_tip over 220 chars', () => {
    const valid8 = Array.from({ length: 8 }, (_, i) => ({
      slug: `trope-${i}`,
      label: `Trope ${i}`,
      description: 'Fine.',
      popularity: 0.5,
    }));
    const invalid = { tropes: valid8, sensei_tip: 'x'.repeat(221) };
    const result = TropeSuggestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
