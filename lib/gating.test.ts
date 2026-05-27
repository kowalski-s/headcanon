import { describe, it, expect } from 'vitest';
import { storyHasCanonicalIp } from './gating';

describe('storyHasCanonicalIp', () => {
  it('true when a tag is canonical IP', () => {
    const story = { tags: [{ tag: { isCanonicalIp: false } }, { tag: { isCanonicalIp: true } }] };
    expect(storyHasCanonicalIp(story)).toBe(true);
  });
  it('false for original world (no canonical tags)', () => {
    const story = { tags: [{ tag: { isCanonicalIp: false } }] };
    expect(storyHasCanonicalIp(story)).toBe(false);
  });
  it('false when no tags', () => {
    expect(storyHasCanonicalIp({ tags: [] })).toBe(false);
  });
});
