// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLateNightDim } from '@/lib/reader/useLateNightDim';

describe('useLateNightDim', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts un-dimmed', () => {
    const { result } = renderHook(() => useLateNightDim(1000));
    expect(result.current).toBe(false);
  });

  it('dims after timeout passes without activity', () => {
    const { result } = renderHook(() => useLateNightDim(1000));
    act(() => {
      vi.advanceTimersByTime(1001);
    });
    expect(result.current).toBe(true);
  });

  it('resets when scroll happens', () => {
    const { result } = renderHook(() => useLateNightDim(1000));
    act(() => {
      vi.advanceTimersByTime(900);
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(900);
    });
    expect(result.current).toBe(false);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe(true);
  });
});
