'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { track } from '@/lib/track';

export function useReadingProgress(totalParagraphs: number) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [percent, setPercent] = useState(0);
  const seenRef = useRef<Set<Element>>(new Set());
  const milestonesFiredRef = useRef<Set<number>>(new Set());

  const setup = useCallback(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const paragraphs = Array.from(el.children) as Element[];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seenRef.current.add(e.target);
        }
        const next =
          totalParagraphs === 0
            ? 0
            : Math.min(100, Math.round((seenRef.current.size / totalParagraphs) * 100));
        setPercent(next);
        for (const ms of [25, 50, 75, 100]) {
          if (next >= ms && !milestonesFiredRef.current.has(ms)) {
            milestonesFiredRef.current.add(ms);
            track('reader_progress_milestone', { percent: ms });
          }
        }
      },
      { threshold: 0.5 },
    );
    paragraphs.forEach((p) => observer.observe(p));
    return () => observer.disconnect();
  }, [totalParagraphs]);

  useEffect(() => {
    return setup();
  }, [setup]);

  return {
    percent,
    containerRef,
    _setupForTest: setup,
  };
}
