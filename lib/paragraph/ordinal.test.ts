import { describe, it, expect } from 'vitest';
import { between, needsRenumber } from './ordinal';

describe('between', () => {
  it('returns midpoint of two ordinals', () => {
    expect(between(1, 2)).toBe(1.5);
  });
  it('returns floor+1 if upper is undefined', () => {
    expect(between(5, undefined)).toBe(6);
  });
  it('returns 1 if both undefined (empty chapter)', () => {
    expect(between(undefined, undefined)).toBe(1);
  });
  it('returns upper/2 if lower undefined', () => {
    expect(between(undefined, 3)).toBe(1.5);
  });
});

describe('needsRenumber', () => {
  it('flags when gap < 0.01', () => {
    expect(needsRenumber([1, 1.5, 1.505])).toBe(true);
  });
  it('clean if gaps are roomy', () => {
    expect(needsRenumber([1, 2, 3])).toBe(false);
  });
});
