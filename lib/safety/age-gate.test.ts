import { describe, it, expect } from 'vitest';
import { requiresAgeGate, isAgeConfirmed } from './age-gate';

describe('requiresAgeGate', () => {
  it('requires gate when rating is E', () => {
    expect(requiresAgeGate({ rating: 'E', tropes: [] })).toBe(true);
  });
  it('requires gate when rating is M', () => {
    expect(requiresAgeGate({ rating: 'M', tropes: [] })).toBe(true);
  });
  it('does not require for T', () => {
    expect(requiresAgeGate({ rating: 'T', tropes: [] })).toBe(false);
  });
  it('does not require when rating is null', () => {
    expect(requiresAgeGate({ rating: null, tropes: [] })).toBe(false);
  });
});

describe('isAgeConfirmed', () => {
  it('confirmed when ageConfirmedAt is set', () => {
    expect(isAgeConfirmed({ ageConfirmedAt: new Date() })).toBe(true);
  });
  it('not confirmed when ageConfirmedAt is null', () => {
    expect(isAgeConfirmed({ ageConfirmedAt: null })).toBe(false);
  });
});
