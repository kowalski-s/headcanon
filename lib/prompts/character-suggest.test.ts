import { describe, it, expect } from 'vitest';
import { build, CharacterSuggestSchema, TEMPLATE_ID } from './character-suggest';

describe('character-suggest', () => {
  it('builds romance prompt asking for ship pairings', () => {
    const out = build({ fandomName: 'Harry Potter', focus: 'ROMANCE' });
    expect(out.system).toMatch(/ship pairings/i);
    expect(out.system).toMatch(/idiomatic Russian/i);
    expect(out.user).toMatch(/Harry Potter/);
  });

  it('builds gen prompt asking for main characters/groups', () => {
    const out = build({ fandomName: 'HP', focus: 'GEN' });
    expect(out.system).toMatch(/main characters or groups/i);
    expect(out.system).not.toMatch(/ship pairings/i);
  });

  it('builds character_study prompt asking for solo protagonists', () => {
    const out = build({ fandomName: 'HP', focus: 'CHARACTER_STUDY' });
    expect(out.system).toMatch(/solo protagonists/i);
  });

  it('builds friendship prompt asking for friend pairs/trios', () => {
    const out = build({ fandomName: 'HP', focus: 'FRIENDSHIP' });
    expect(out.system).toMatch(/friendship pairs or trios/i);
  });

  it('schema accepts focus_compatible array per suggestion', () => {
    const sample = {
      suggestions: Array.from({ length: 7 }, () => ({
        names: ['A', 'B'],
        label_ru: 'A × B',
        popularity: 0.5,
        avatar_prompt: 'two figures',
        rarity: 'top' as const,
        focus_compatible: ['romance' as const],
      })),
    };
    expect(() => CharacterSuggestSchema.parse(sample)).not.toThrow();
  });

  it('exposes stable TEMPLATE_ID', () => {
    expect(TEMPLATE_ID).toBe('character_suggest');
  });
});
