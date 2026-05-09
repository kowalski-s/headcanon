// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { track } from '@/lib/track';

describe('track', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('logs event name and props in dev', () => {
    track('feed_viewed', { source: 'home' });
    expect(logSpy).toHaveBeenCalledWith('[track]', 'feed_viewed', { source: 'home' });
  });

  it('accepts no props', () => {
    track('feed_pull_refresh');
    expect(logSpy).toHaveBeenCalledWith('[track]', 'feed_pull_refresh', undefined);
  });
});
