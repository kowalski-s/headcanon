'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { GrainCover } from '@/components/ui/GrainCover';
import { BurstSticker } from '@/components/ui/BurstSticker';
import { ScotchTag } from '@/components/ui/ScotchTag';
import { track } from '@/lib/track';
import type { Story } from '@/lib/types/story';

const HERO_GENRES = ['enemies-to-lovers', 'slow burn'];

export function FeedHeroDesktop({ story }: { story: Story }) {
  const continueChapter = 7;
  const readerHref = `/reader/${story.id}/${continueChapter}` as Route;
  const watchHref = `/watch/${story.id}/${continueChapter}` as Route;
  const storyHref = `/story/${story.id}` as Route;

  return (
    <section className="grid grid-cols-[1.05fr_1fr] items-center gap-12 px-10 pt-10 pb-14">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 font-mono text-mono-s tracking-caps text-amber uppercase">
          <span>★ today&apos;s main story</span>
          <span aria-hidden className="text-ink-faint">
            ·
          </span>
          <span className="text-ink-dim">dramione</span>
          <span aria-hidden className="text-ink-faint">
            ·
          </span>
          <span className="text-ink-dim">{story.chapters} ch</span>
          <span aria-hidden className="ml-auto text-amber/60">
            +
          </span>
        </div>

        <h1 className="font-display text-[80px] leading-[0.95] tracking-tight text-balance text-ink">
          {story.title.replace(/\.$/, '')}
          {story.title.endsWith('.') ? <span className="text-amber">.</span> : null}
        </h1>

        <p className="max-w-[34ch] font-body text-body-l italic text-ink-dim">
          <span aria-hidden className="mr-1 text-amber/70">
            «
          </span>
          {story.tagline}
        </p>

        <div className="mt-2 flex items-center gap-3">
          <Link
            href={readerHref}
            onClick={() => track('feed_hero_read_tap', { story_id: story.id })}
            className="rounded-full bg-amber px-6 py-3 font-mono text-mono-m tracking-caps uppercase text-bg-deep shadow-amber-glow"
          >
            ★ продолжить главу {continueChapter}
          </Link>
          {story.hasWatch ? (
            <Link
              href={watchHref}
              onClick={() => track('feed_hero_watch_tap', { story_id: story.id })}
              className="rounded-full border border-chrome-1/40 bg-surface-raised px-5 py-3 font-mono text-mono-m tracking-caps uppercase text-chrome-1"
            >
              ▸ watch · {story.watchEpisodes}m
            </Link>
          ) : null}
          <Link
            href={storyHref}
            className="ml-3 font-mono text-mono-s tracking-caps text-ink-dim uppercase hover:text-ink"
          >
            {(story.likes / 1000).toFixed(1)}k · @{story.author.handle}
          </Link>
        </div>

        <div className="mt-1 font-mono text-mono-s tracking-caps text-ink-faint uppercase">
          {HERO_GENRES.join(' · ')}
        </div>
      </div>

      <Link
        href={storyHref}
        onClick={() => track('feed_card_tap', { story_id: story.id, position: 0 })}
        className="group relative aspect-[4/5] block"
      >
        <GrainCover
          from={story.fandom.color1}
          to={story.fandom.color2}
          className="absolute inset-0 transition-transform duration-500 ease-cinematic group-hover:scale-[1.01]"
        >
          <ScotchTag className="absolute left-6 -top-2 z-10 origin-bottom-left" rotate={-2}>
            {story.fandom.name}
          </ScotchTag>
          <ScotchTag className="absolute right-10 -top-2 z-10 origin-bottom-right" rotate={3}>
            {story.pair}
          </ScotchTag>
          <BurstSticker label="★ хит" rotate={-8} className="absolute -right-4 -top-4 z-10" />

          <div className="absolute left-6 top-10 font-mono text-mono-s tracking-caps text-amber/85 uppercase">
            vol.1 / ch.{String(continueChapter).padStart(2, '0')}
          </div>
        </GrainCover>
      </Link>
    </section>
  );
}
