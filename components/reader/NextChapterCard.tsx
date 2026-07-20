'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { Chapter } from '@/lib/types/story';

// `hasWatch` остаётся в пропсах ради стабильного контракта с ReaderShell, но
// watch-чип скрыт — видео заморожено (Phase 3). Не удалять — вернём в Phase 3.
type Props = { storyId: string; nextChapter: Chapter | null; hasWatch?: boolean };

export function NextChapterCard({ storyId, nextChapter }: Props) {
  if (!nextChapter) return null;
  return (
    <div className="mx-auto mt-12 max-w-[660px] border-t border-ink-faint/20 px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <Link href={`/reader/${storyId}/${nextChapter.n}` as Route} className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-dim">
            следующая глава
          </span>
          <span className="font-display italic">{nextChapter.title}</span>
          <span className="font-mono text-[10px] text-ink-dim">{nextChapter.minutes}m</span>
        </Link>
        {/* watch-чип скрыт — видео заморожено (Phase 3). */}
      </div>
    </div>
  );
}
