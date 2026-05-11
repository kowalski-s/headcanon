// tests/lib/reader/useReaderSettings.test.ts
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReaderSettings, DEFAULT_SETTINGS } from '@/lib/reader/useReaderSettings';

describe('useReaderSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with defaults when localStorage is empty', () => {
    const { result } = renderHook(() => useReaderSettings());
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('persists changes to localStorage', () => {
    const { result } = renderHook(() => useReaderSettings());
    act(() => {
      result.current.setSetting('font', 'bodoni');
    });
    expect(result.current.settings.font).toBe('bodoni');
    const stored = JSON.parse(localStorage.getItem('headcanon:reader-settings')!);
    expect(stored.font).toBe('bodoni');
  });

  it('hydrates from localStorage on mount', () => {
    localStorage.setItem(
      'headcanon:reader-settings',
      JSON.stringify({ ...DEFAULT_SETTINGS, fontSize: 18, theme: 'sepia' }),
    );
    const { result } = renderHook(() => useReaderSettings());
    expect(result.current.settings.fontSize).toBe(18);
    expect(result.current.settings.theme).toBe('sepia');
  });

  it('ignores corrupt JSON', () => {
    localStorage.setItem('headcanon:reader-settings', '{not json');
    const { result } = renderHook(() => useReaderSettings());
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('persists chapterLength', () => {
    const { result } = renderHook(() => useReaderSettings());
    expect(result.current.settings.chapterLength).toBe('short');
    act(() => {
      result.current.setSetting('chapterLength', 'long');
    });
    expect(result.current.settings.chapterLength).toBe('long');
    const stored = JSON.parse(localStorage.getItem('headcanon:reader-settings')!);
    expect(stored.chapterLength).toBe('long');
  });
});
