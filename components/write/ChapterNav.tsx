'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api/client';

type Chapter = {
  id: string;
  ordinal: number;
  title: string | null;
};

type Props = {
  storyId: string;
  chapters: Chapter[];
  activeOrdinal: number;
  /** Закрыть выдвижную панель после перехода на главу (mobile/overlay). */
  onNavigate?: () => void;
};

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

export function ChapterNav({ storyId, chapters, activeOrdinal, onNavigate }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<Chapter[]>(chapters);
  const listRef = useRef<HTMLUListElement | null>(null);
  // Позиции строк до перестановки — для FLIP-анимации.
  const prevTops = useRef<Map<string, number>>(new Map());
  const shouldAnimate = useRef(false);

  // Синхронизируемся с сервером (add/delete/refresh), пока не идёт локальная анимация.
  useEffect(() => {
    setItems(chapters);
  }, [chapters]);

  const captureTops = useCallback(() => {
    const map = new Map<string, number>();
    const ul = listRef.current;
    if (ul) {
      for (const li of Array.from(ul.children)) {
        const id = (li as HTMLElement).dataset.id;
        if (id) map.set(id, (li as HTMLElement).getBoundingClientRect().top);
      }
    }
    return map;
  }, []);

  // FLIP: инвертируем сдвиг и проигрываем к нулю.
  useLayoutEffect(() => {
    if (!shouldAnimate.current) return;
    shouldAnimate.current = false;
    const ul = listRef.current;
    if (!ul || prefersReducedMotion()) return;
    for (const li of Array.from(ul.children)) {
      const el = li as HTMLElement;
      const id = el.dataset.id;
      if (!id) continue;
      const before = prevTops.current.get(id);
      if (before == null) continue;
      const after = el.getBoundingClientRect().top;
      const dy = before - after;
      if (!dy) continue;
      el.style.transition = 'none';
      el.style.transform = `translateY(${dy}px)`;
      requestAnimationFrame(() => {
        el.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        el.style.transform = '';
      });
    }
  }, [items]);

  async function handleAdd() {
    await apiFetch('/api/write/chapter', {
      method: 'POST',
      body: JSON.stringify({ storyId }),
    });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить главу? Это действие нельзя отменить.')) return;
    await apiFetch('/api/write/chapter/' + id, { method: 'DELETE' });
    router.refresh();
  }

  async function handleReorder(id: string, direction: 'up' | 'down') {
    const idx = items.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= items.length) return;

    prevTops.current = captureTops();
    shouldAnimate.current = true;
    const next = [...items];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setItems(next);

    await apiFetch('/api/write/chapter/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ storyId, order: next.map((c) => c.id) }),
    });
    router.refresh();
  }

  return (
    <nav className="space-y-1">
      <button
        onClick={handleAdd}
        className="mb-3 w-full rounded-full border border-chrome-1/40 bg-surface-raised px-5 py-2.5 font-mono text-mono-m tracking-caps uppercase text-chrome-1"
      >
        + Глава
      </button>

      <ul ref={listRef} className="space-y-1">
        {items.map((chapter, i) => {
          const isActive = chapter.ordinal === activeOrdinal;
          const isFirst = i === 0;
          const isLast = i === items.length - 1;
          const label = chapter.title ?? `Глава ${chapter.ordinal}`;

          return (
            <li key={chapter.id} data-id={chapter.id} className="flex items-center gap-1">
              <Link
                href={`/write/${storyId}?ch=${chapter.ordinal}` as Route}
                onClick={onNavigate}
                className={`flex-1 truncate rounded px-2 py-1.5 font-mono text-mono-s tracking-caps uppercase transition-colors ${
                  isActive ? 'text-amber' : 'text-ink-dim hover:text-ink'
                }`}
              >
                {label}
              </Link>

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  onClick={() => handleReorder(chapter.id, 'up')}
                  disabled={isFirst}
                  aria-label="Переместить вверх"
                  className="rounded px-1 py-0.5 font-mono text-mono-s text-ink-dim hover:text-ink disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleReorder(chapter.id, 'down')}
                  disabled={isLast}
                  aria-label="Переместить вниз"
                  className="rounded px-1 py-0.5 font-mono text-mono-s text-ink-dim hover:text-ink disabled:opacity-30"
                >
                  ↓
                </button>
                {items.length > 1 && (
                  <button
                    onClick={() => handleDelete(chapter.id)}
                    aria-label="Удалить главу"
                    className="rounded px-1 py-0.5 font-mono text-mono-s text-ink-dim hover:text-rose"
                  >
                    ×
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
