'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { notFound } from 'next/navigation';
import { StoryHero } from '@/components/story/StoryHero';
import { StoryMetaPanel } from '@/components/story/StoryMetaPanel';
import { ChapterListItem } from '@/components/story/ChapterListItem';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { Ornament } from '@/components/ui/Ornament';
import { MonoBadge } from '@/components/ui/MonoBadge';
import { getStoryDetail } from '@/lib/fixtures/chapters';
import { track } from '@/lib/track';

const HERO_GENRES = ['enemies-to-lovers', 'slow burn'];

export function StoryPageView({ id }: { id: string }) {
  const detail = getStoryDetail(id);

  useEffect(() => {
    if (detail) track('story_viewed', { story_id: detail.story.id, source: 'feed' });
  }, [detail]);

  if (!detail) notFound();

  const { story, chapters, progress, watchAvailable, saved } = detail;
  const continueChapter = progress?.lastChapterN ?? 1;
  const ctaLabel = progress ? `★ продолжить главу ${continueChapter}` : '★ начать ★';
  const watchLabel = `▸ watch · ${story.watchEpisodes ?? 0}m`;
  const headlineMain = story.title.replace(/\.$/, '');
  const headlineHasDot = story.title.endsWith('.');

  return (
    <div className="min-h-screen bg-bg pb-24 text-ink lg:pb-12">
      {/* Mobile topbar — sticky compact action row */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3">
        <Link href="/" aria-label="back" className="font-mono text-base text-ink-dim">
          ←
        </Link>
        <div className="flex gap-4 font-mono text-base text-ink-dim">
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

      {/* Desktop header — same wordmark/nav/CTA as feed */}
      <FeedHeader />

      {/* Desktop breadcrumb */}
      <nav
        aria-label="breadcrumb"
        className="hidden lg:flex items-center gap-2 px-10 pt-6 font-mono text-mono-s tracking-caps text-ink-dim uppercase"
      >
        <Link href="/" className="hover:text-ink">
          лента
        </Link>
        <span aria-hidden>/</span>
        <span>{story.fandom.name}</span>
        <span aria-hidden>/</span>
        <span>{story.pair.toLowerCase()}</span>
        <span aria-hidden>/</span>
        <span className="text-ink">эта история</span>
      </nav>

      {/* Mobile: cover + meta block stacked */}
      <div className="lg:hidden">
        <StoryHero story={story} continueChapter={continueChapter} variant="mobile" />

        <div className="px-4 pt-5">
          <MonoBadge tone="amber">{story.fandom.name.toLowerCase()} · 1997 · must read</MonoBadge>
        </div>

        <div className="flex flex-col gap-4 px-4 pt-3">
          <h1 className="font-display text-[34px] leading-[1.05] text-balance">
            {headlineMain}
            {headlineHasDot ? <span className="text-amber">.</span> : null}
          </h1>

          <p className="font-body text-body-l italic text-ink-dim">{story.tagline}</p>

          <StoryMetaPanel story={story} />

          {watchAvailable ? (
            <Link
              href={`/watch/${story.id}/${continueChapter}` as Route}
              onClick={() => track('story_watch_tap')}
              className="mt-1 flex items-center justify-between rounded-full border border-chrome-1/30 bg-surface-raised px-4 py-2.5 font-mono text-mono-s tracking-caps uppercase"
            >
              <span className="flex items-center gap-2 text-chrome-1">
                <span aria-hidden>▸</span>
                watch mode · {story.watchEpisodes}m
              </span>
              <span aria-hidden className="text-amber">
                ☀
              </span>
            </Link>
          ) : null}
        </div>
      </div>

      {/* Desktop: 2-col cover + text */}
      <section className="hidden lg:grid grid-cols-[1fr_1.05fr] items-start gap-12 px-10 pt-8 pb-12">
        <StoryHero story={story} continueChapter={continueChapter} variant="desktop" />

        <div className="flex flex-col gap-6 pt-6">
          <MonoBadge tone="amber">
            vol.1 · {story.pair.toLowerCase()} · {story.chapters} ch
          </MonoBadge>

          <h1 className="font-display text-[68px] leading-[0.95] tracking-tight text-balance">
            {headlineMain}
            {headlineHasDot ? <span className="text-amber">.</span> : null}
          </h1>

          <p className="max-w-[40ch] font-body text-body-l italic text-ink-dim">{story.tagline}</p>

          <StoryMetaPanel story={story} />

          <div className="mt-2 flex items-center gap-3">
            <Link
              href={`/reader/${story.id}/${continueChapter}` as Route}
              onClick={() => track('story_continue_tap', { last_n: continueChapter })}
              className="rounded-full bg-amber px-7 py-3.5 font-mono text-mono-m tracking-caps uppercase text-bg-deep shadow-amber-glow"
            >
              {ctaLabel}
            </Link>
            {watchAvailable ? (
              <Link
                href={`/watch/${story.id}/${continueChapter}` as Route}
                onClick={() => track('story_watch_tap')}
                className="rounded-full border border-chrome-1/40 bg-surface-raised px-5 py-3 font-mono text-mono-m tracking-caps uppercase text-chrome-1"
              >
                {watchLabel}
              </Link>
            ) : null}
          </div>

          <div className="mt-1 font-mono text-mono-s tracking-caps text-ink-faint uppercase">
            {HERO_GENRES.join(' · ')}
          </div>
        </div>
      </section>

      {/* Chapter list — shared layout, narrower on desktop */}
      <div className="mx-auto max-w-[760px] py-8 lg:py-10">
        <Ornament />
        <p className="mt-3 text-center font-mono text-mono-s tracking-caps uppercase text-ink-dim">
          ★ главы ★
        </p>
      </div>

      <ul className="mx-auto flex max-w-[760px] flex-col">
        {chapters.map((ch) => (
          <li key={ch.n}>
            <ChapterListItem storyId={story.id} chapter={ch} />
          </li>
        ))}
      </ul>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-faint/20 bg-bg/95 p-3 backdrop-blur lg:hidden">
        <Link
          href={`/reader/${story.id}/${continueChapter}` as Route}
          onClick={() => track('story_continue_tap', { last_n: continueChapter })}
          className="block w-full rounded-full bg-amber py-3.5 text-center font-mono text-mono-s tracking-caps uppercase text-bg-deep shadow-amber-glow"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
