'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
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
};

export function ChapterNav({ storyId, chapters, activeOrdinal }: Props) {
  const router = useRouter();

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
    const ids = chapters.map((c) => c.id);
    const idx = ids.indexOf(id);
    if (idx === -1) return;
    const next = [...ids];
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    await apiFetch('/api/write/chapter/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ storyId, order: next }),
    });
    router.refresh();
  }

  return (
    <nav className="space-y-1">
      <button
        onClick={handleAdd}
        className="w-full rounded-full border border-chrome-1/40 bg-surface-raised px-5 py-2.5 font-mono text-mono-m tracking-caps uppercase text-chrome-1 mb-3"
      >
        + Глава
      </button>

      <ul className="space-y-1">
        {chapters.map((chapter, i) => {
          const isActive = chapter.ordinal === activeOrdinal;
          const isFirst = i === 0;
          const isLast = i === chapters.length - 1;
          const label = chapter.title ?? `Глава ${chapter.ordinal}`;

          return (
            <li key={chapter.id} className="flex items-center gap-1">
              <Link
                href={`/write/${storyId}?ch=${chapter.ordinal}` as Route}
                className={`flex-1 truncate rounded px-2 py-1.5 font-mono text-mono-s tracking-caps uppercase transition-colors ${
                  isActive ? 'text-amber' : 'text-ink-dim hover:text-ink'
                }`}
              >
                {label}
              </Link>

              <div className="flex items-center gap-0.5 shrink-0">
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
                {chapters.length > 1 && (
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
