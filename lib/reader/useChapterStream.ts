'use client';

/**
 * useChapterStream
 *
 * Streams a chapter from GET /api/chapter/[id]/stream?length=... using native fetch +
 * ReadableStream. The endpoint returns plain text/plain; charset=utf-8.
 *
 * We deliberately avoid `callCompletionApi` from `ai` (which POSTs) because our
 * stream endpoint is a GET. A raw fetch + TextDecoder loop is the simplest correct
 * approach here.
 *
 * Auth: passes x-test-user-id header (dev stub). TODO: replace with real Supabase Auth
 * session cookie once M3 auth lands.
 *
 * Note on `useCompletion`: The `ai` v6 package no longer exports a `useCompletion` hook
 * (it was removed from the main package; `@ai-sdk/react` not installed). We implement
 * the same interface manually.
 */

import { useState, useCallback, useRef } from 'react';

export type StreamStatus = 'idle' | 'streaming' | 'done' | 'error';

type Options = {
  chapterId: string;
  chapterLength: 'short' | 'medium' | 'long';
  /** Called with the full completion text when the stream finishes. */
  onFinish?: (fullText: string) => void;
  /**
   * Test-user stub — passed as x-test-user-id header.
   * TODO: remove once real Supabase Auth cookie lands (M3).
   */
  testUserId?: string;
};

export function useChapterStream({ chapterId, chapterLength, onFinish, testUserId }: Options) {
  const [completion, setCompletion] = useState('');
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [error, setError] = useState<Error | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  // Guards against double-start: React 18 StrictMode runs effects twice on initial
  // mount with the same closure values (status='idle'), so the consumer's
  // `useEffect(() => { if (status === 'idle') start() })` fires twice. Without this
  // ref, two concurrent fetches both write to setCompletion and their tokens race —
  // visually the text appears to "flicker" between two distinct LLM generations.
  const inFlightRef = useRef(false);

  /** Split accumulated text into paragraphs for incremental render. */
  const paragraphs = completion.split(/\n{2,}/).filter(Boolean);

  const start = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setCompletion('');
    setStatus('streaming');
    setError(undefined);

    try {
      const headers: HeadersInit = {};
      if (testUserId) {
        (headers as Record<string, string>)['x-test-user-id'] = testUserId;
      }

      const res = await fetch(
        `/api/chapter/${chapterId}/stream?length=${chapterLength}`,
        { headers, signal: ctrl.signal, credentials: 'same-origin' },
      );

      if (!res.ok) {
        const msg = await res.text().catch(() => res.statusText);
        throw new Error(`Stream failed ${res.status}: ${msg}`);
      }

      if (!res.body) throw new Error('Response has no body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let rafPending = false;
      const flush = () => {
        rafPending = false;
        setCompletion(fullText);
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        if (!rafPending) {
          rafPending = true;
          requestAnimationFrame(flush);
        }
      }

      // Final flush to make sure the last chunk reaches React state.
      setCompletion(fullText);
      setStatus('done');
      onFinish?.(fullText);
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      setStatus('error');
    } finally {
      inFlightRef.current = false;
    }
  }, [chapterId, chapterLength, onFinish, testUserId]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
  }, []);

  return { completion, paragraphs, status, error, start, abort };
}
