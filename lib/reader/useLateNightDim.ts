'use client';

import { useEffect, useState, useRef } from 'react';

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000;

export function useLateNightDim(timeoutMs: number = DEFAULT_TIMEOUT_MS) {
  const [dimmed, setDimmed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const reset = () => {
      setDimmed(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setDimmed(true), timeoutMs);
    };

    reset();

    const events = ['scroll', 'pointermove', 'keydown'] as const;
    for (const e of events) window.addEventListener(e, reset, { passive: true });
    return () => {
      for (const e of events) window.removeEventListener(e, reset);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeoutMs]);

  return dimmed;
}
