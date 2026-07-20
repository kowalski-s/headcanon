// @vitest-environment jsdom
import { StrictMode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const apiFetch = vi.fn();
vi.mock('@/lib/api/client', () => ({
  apiFetch: (...args: unknown[]) => apiFetch(...args),
}));

import { useAssist } from './useAssist';

describe('useAssist.accept', () => {
  beforeEach(() => apiFetch.mockReset());

  it('вставляет фрагмент ровно один раз (side effect вне setState-апдейтера, StrictMode)', async () => {
    apiFetch.mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ teaser: 'ход', passage: 'проза' }),
    });
    const onInsert = vi.fn();
    const { result } = renderHook(() => useAssist({ storyId: 's1', chapterId: 'c1', onInsert }), {
      wrapper: StrictMode,
    });

    act(() => {
      result.current.expand();
    });
    await waitFor(() => {
      const s = result.current.messages.find((m) => m.kind === 'suggestion');
      expect(s && s.kind === 'suggestion' && s.status).toBe('ready');
    });

    const sug = result.current.messages.find((m) => m.kind === 'suggestion');
    if (!sug) throw new Error('no suggestion');
    act(() => {
      result.current.accept(sug.id);
    });

    expect(onInsert).toHaveBeenCalledTimes(1);
    expect(onInsert).toHaveBeenCalledWith('проза');

    // Повторный accept уже принятой карточки — не вставляет снова.
    act(() => {
      result.current.accept(sug.id);
    });
    expect(onInsert).toHaveBeenCalledTimes(1);
  });

  it('на 429 показывает тихую заметку про лимит вместо реплики', async () => {
    apiFetch.mockResolvedValue({
      status: 429,
      ok: false,
      json: async () => ({ error: 'quota_exceeded' }),
    });
    const { result } = renderHook(() =>
      useAssist({ storyId: 's1', chapterId: 'c1', onInsert: vi.fn() }),
    );

    act(() => {
      result.current.send('привет');
    });
    await waitFor(() => {
      const ai = result.current.messages.find((m) => m.kind === 'ai');
      expect(ai && ai.kind === 'ai' && /лимит|обращени/i.test(ai.text)).toBe(true);
    });
  });
});
