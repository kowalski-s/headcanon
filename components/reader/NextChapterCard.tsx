'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { track } from '@/lib/track';
import type { Chapter } from '@/lib/types/story';

type Props = { storyId: string; nextChapter: Chapter | null; hasWatch: boolean };

export function NextChapterCard({ storyId, nextChapter, hasWatch }: Props) {
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
        {hasWatch ? (
          <Link
            href={`/watch/${storyId}/${nextChapter.n}` as Route}
            onClick={() => track('reader_watch_chip_tap')}
            className="rounded-full border border-chrome-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-chrome-2"
          >
            ▸ watch
          </Link>
        ) : null}
      </div>
    </div>
  );
}
