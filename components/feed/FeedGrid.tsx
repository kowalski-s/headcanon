'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { GrainCover } from '@/components/ui/GrainCover';
import { ScotchTag } from '@/components/ui/ScotchTag';
import { track } from '@/lib/track';
import type { Story } from '@/lib/types/story';

type Props = { stories: Story[]; columns: 2 | 4 | 5 };

export function FeedGrid({ stories, columns }: Props) {
  const colsClass =
    columns === 5 ? 'grid-cols-5' : columns === 4 ? 'grid-cols-4' : 'grid-cols-2';
  return (
    <div className={`grid ${colsClass} gap-6 px-8`}>
      {stories.map((s, idx) => (
        <Link
          key={s.id}
          href={`/story/${s.id}` as Route}
          onClick={() => track('feed_card_tap', { story_id: s.id, position: idx })}
          className="group flex flex-col gap-3 transition-transform hover:scale-[1.02]"
        >
          <div className="relative aspect-[2/3]">
            <GrainCover from={s.fandom.color1} to={s.fandom.color2} className="h-full w-full">
              <ScotchTag className="absolute left-3 top-3">{s.fandom.name}</ScotchTag>
            </GrainCover>
          </div>
          <h3 className="font-display text-sm leading-snug">{s.title}</h3>
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-dim">
            ♡ {(s.likes / 1000).toFixed(1)}k · ch {s.chapters}
          </span>
        </Link>
      ))}
    </div>
  );
}
