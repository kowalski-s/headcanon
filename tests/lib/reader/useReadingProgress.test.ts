// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReadingProgress } from '@/lib/reader/useReadingProgress';

class MockObserver {
  callback: IntersectionObserverCallback;
  static instances: MockObserver[] = [];
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = '';
  thresholds = [];
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
    MockObserver.instances.push(this);
  }
}

describe('useReadingProgress', () => {
  beforeEach(() => {
    MockObserver.instances = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).IntersectionObserver = MockObserver;
  });

  it('starts at 0 percent', () => {
    const { result } = renderHook(() => useReadingProgress(10));
    expect(result.current.percent).toBe(0);
    expect(result.current.containerRef).toBeDefined();
  });

  it('updates percent when 5 of 10 paragraphs are seen', () => {
    const { result } = renderHook(() => useReadingProgress(10));
    const div = document.createElement('div');
    for (let i = 0; i < 10; i++) {
      const p = document.createElement('p');
      div.appendChild(p);
    }
    act(() => {
      result.current.containerRef.current = div;
      result.current._setupForTest?.();
    });
    const obs = MockObserver.instances[0];
    expect(obs).toBeDefined();
    const entries = Array.from(div.children).slice(0, 5).map(
      (el) => ({ target: el, isIntersecting: true }) as unknown as IntersectionObserverEntry,
    );
    act(() => {
      obs.callback(entries, obs as unknown as IntersectionObserver);
    });
    expect(result.current.percent).toBe(50);
  });
});
