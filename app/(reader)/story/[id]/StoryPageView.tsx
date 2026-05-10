'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { notFound } from 'next/navigation';
import { StoryHero } from '@/components/story/StoryHero';
import { StoryMetaPanel } from '@/components/story/StoryMetaPanel';
import { WatchCtaCard } from '@/components/story/WatchCtaCard';
import { ChapterListItem } from '@/components/story/ChapterListItem';
import { Ornament } from '@/components/ui/Ornament';
import { MonoBadge } from '@/components/ui/MonoBadge';
import { getStoryDetail } from '@/lib/fixtures/chapters';
import { track } from '@/lib/track';

export function StoryPageView({ id }: { id: string }) {
  const detail = getStoryDetail(id);

  useEffect(() => {
    if (detail) track('story_viewed', { story_id: detail.story.id, source: 'feed' });
  }, [detail]);

  if (!detail) notFound();

  const { story, chapters, progress, watchAvailable, saved } = detail;
  const continueChapter = progress?.lastChapterN ?? 1;
  const ctaLabel = progress ? `★ продолжить гл. ${continueChapter} ★` : '★ начать ★';

  return (
    <div className="min-h-screen bg-bg pb-24 text-ink">
      <header className="flex items-center justify-between px-4 py-3">
        <Link href="/" aria-label="back" className="font-mono text-base">
          ←
        </Link>
        <div className="flex gap-3 font-mono text-base">
          <button
            type="button"
            aria-label="save"
            onClick={() => track('story_save_toggle', { saved: !saved })}
          >
            ♡
          </button>
          <button type="button" aria-label="share" onClick={() => track('story_share')}>
            ↗
          </button>
          <button type="button" aria-label="more">
            ⋯
          </button>
        </div>
      </header>

      <StoryHero story={story} />

      <div className="flex flex-col gap-3 px-4 py-5">
        <MonoBadge tone="amber">
          vol.1 · {story.pair} · {story.chapters} ch
        </MonoBadge>
        <h1 className="font-display text-3xl text-balance">{story.title}</h1>
        <p className="font-body text-sm italic text-ink-dim">{story.tagline}</p>
      </div>

      <StoryMetaPanel story={story} />

      {watchAvailable ? (
        <div className="py-4">
          <WatchCtaCard story={story} />
        </div>
      ) : null}

      <div className="py-6">
        <Ornament />
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wider text-ink-dim">
          ★ главы ★
        </p>
      </div>

      <ul className="flex flex-col">
        {chapters.map((ch) => (
          <li key={ch.n}>
            <ChapterListItem storyId={story.id} chapter={ch} />
          </li>
        ))}
      </ul>

      <div className="fixed inset-x-0 bottom-0 border-t border-ink-faint/20 bg-bg/95 p-3 backdrop-blur lg:hidden">
        <Link
          href={`/reader/${story.id}/${continueChapter}` as Route}
          onClick={() => track('story_continue_tap', { last_n: continueChapter })}
          className="block w-full rounded-full bg-amber py-3 text-center font-mono text-xs uppercase tracking-wider text-bg"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
