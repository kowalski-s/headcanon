'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { track } from '@/lib/track';
import type { Story } from '@/lib/types/story';

export function WatchCtaCard({ story }: { story: Story }) {
  if (!story.hasWatch) return null;
  return (
    <Link
      href={`/watch/${story.id}/1` as Route}
      onClick={() => track('story_watch_tap')}
      className="mx-4 flex items-center justify-between rounded-lg border border-chrome-1/40 bg-bg-alt p-4"
    >
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-chrome-1">
          ▸ watch mode
        </span>
        <span className="font-display text-sm">слушай как мини-сериал</span>
      </div>
      <span className="text-2xl text-amber">●</span>
    </Link>
  );
}
