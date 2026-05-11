import { describe, it, expect } from 'vitest';
import { build } from './paragraph-regen';

const ctx = { fandomName: 'HP', ship: 'Drarry', toneNote: 'slow burn' };

describe('paragraph-regen prompt builder', () => {
  it('regen wraps target', () => {
    const p = build({ mode: 'regen', targetText: 't', prevText: null, nextText: null, storyContext: ctx });
    expect(p.user).toMatch(/<user_input>t<\/user_input>/);
  });
  it('continue asks for 3-5 paragraphs', () => {
    const p = build({ mode: 'continue', targetText: 't', prevText: null, nextText: null, storyContext: ctx });
    expect(p.system).toMatch(/3-5 new paragraphs/);
  });
  it("expand says don't rewrite target", () => {
    const p = build({ mode: 'expand', targetText: 't', prevText: null, nextText: 'n', storyContext: ctx });
    expect(p.system).toMatch(/Do NOT rewrite the target/);
  });
  it('compress merges two', () => {
    const p = build({ mode: 'compress', targetText: 'a', prevText: null, nextText: 'b', storyContext: ctx });
    expect(p.user).toMatch(/Second paragraph/);
  });
});
