'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { track } from '@/lib/track';
import type { Chapter } from '@/lib/types/story';

const stateLabel: Record<Chapter['state'], string> = {
  read: '✓ прочитано',
  reading: 'продолжить →',
  unread: 'дальше',
  locked: 'заблокировано',
  generating: 'пишется...',
};

const stateColor: Record<Chapter['state'], string> = {
  read: 'text-ink-dim',
  reading: 'text-amber',
  unread: 'text-ink',
  locked: 'text-ink-faint',
  generating: 'text-amber animate-pulse',
};

const numberColor: Record<Chapter['state'], string> = {
  read: 'text-ink-dim',
  reading: 'text-amber',
  unread: 'text-ink',
  locked: 'text-ink-faint',
  generating: 'text-amber',
};

type Props = { storyId: string; chapter: Chapter };

export function ChapterListItem({ storyId, chapter }: Props) {
  const padded = String(chapter.n).padStart(2, '0');
  const content = (
    <div className="flex items-baseline gap-4 border-b border-ink-faint/10 px-4 py-4">
      <span className={`font-display text-3xl ${numberColor[chapter.state]}`}>{padded}</span>
      <div className="flex flex-1 flex-col gap-1">
        <span className="font-display italic">{chapter.title}</span>
        <span
          className={`font-mono text-[10px] uppercase tracking-wider ${stateColor[chapter.state]}`}
        >
          {chapter.minutes}m · {stateLabel[chapter.state]}
        </span>
      </div>
    </div>
  );

  if (chapter.state === 'locked') {
    return content;
  }

  return (
    <Link
      href={`/reader/${storyId}/${chapter.n}` as Route}
      onClick={() => track('story_chapter_tap', { n: chapter.n, state: chapter.state })}
    >
      {content}
    </Link>
  );
}
