'use client';
import { useEffect, useState } from 'react';

interface Props {
  oldText: string;
  endpoint: string;
  body: object;
  onFinish: (newText: string) => void;
  onError?: (e: Error) => void;
}

export function InlineRegenStream({ oldText, endpoint, body, onFinish, onError }: Props) {
  const [streamed, setStreamed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const abort = new AbortController();
    void (async () => {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: { 'Content-Type': 'application/json' },
          signal: abort.signal,
        });
        if (!res.ok || !res.body) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error ?? `HTTP ${res.status}`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        while (true) {
          const { value, done: streamDone } = await reader.read();
          if (streamDone) break;
          buf += decoder.decode(value);
          setStreamed(buf);
        }
        setDone(true);
        onFinish(buf);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') onError?.(e as Error);
      }
    })();
    return () => abort.abort();
  }, [endpoint]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <p className="relative font-body text-body-l leading-relaxed">
      <span
        aria-hidden
        className={`absolute inset-0 transition-opacity duration-700 ${
          streamed.length > 0 ? 'opacity-20 blur-[2px]' : 'opacity-100'
        }`}
      >
        {oldText}
      </span>
      <span
        className={`relative ${
          done
            ? ''
            : 'after:ml-0.5 after:inline-block after:h-[1em] after:w-[2px] after:animate-pulse after:bg-amber'
        }`}
      >
        {streamed}
      </span>
    </p>
  );
}
