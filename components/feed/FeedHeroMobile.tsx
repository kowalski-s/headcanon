'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { GrainCover } from '@/components/ui/GrainCover';
import { BurstSticker } from '@/components/ui/BurstSticker';
import { track } from '@/lib/track';
import type { Story } from '@/lib/types/story';

const HERO_GENRES = ['enemies-to-lovers', 'slow burn'];

export function FeedHeroMobile({ story }: { story: Story }) {
  const continueChapter = 7;
  const storyHref = `/story/${story.id}` as Route;

  return (
    <section className="px-4 pt-2 pb-6">
      <div className="mb-3 flex items-center justify-between font-mono text-mono-s tracking-caps text-ink-dim uppercase">
        <span>★ свет в подземельях ★</span>
        <span>1 / 7</span>
      </div>

      <Link
        href={storyHref}
        onClick={() => track('feed_card_tap', { story_id: story.id, position: 0 })}
        className="block"
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-[2px]">
          <GrainCover
            from={story.fandom.color1}
            to={story.fandom.color2}
            className="absolute inset-0"
          >
            <BurstSticker
              label="★ хит"
              rotate={-8}
              className="absolute -right-2 -top-2 z-20 size-16 [&_span]:text-mono-s"
            />

            <div className="absolute left-4 top-4 z-10 font-mono text-mono-s tracking-caps text-amber/80 uppercase">
              vol.1 / ch.{String(continueChapter).padStart(2, '0')}
            </div>

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-5 pb-5 pt-16">
              <div className="font-mono text-mono-s tracking-caps text-amber uppercase">
                {HERO_GENRES.join(' · ')}
              </div>
              <h1 className="font-display text-[28px] leading-[1.05] text-ink text-balance">
                {story.title.replace(/\.$/, '')}
                {story.title.endsWith('.') ? '.' : ''}
              </h1>
              <p className="font-body text-body-s italic text-ink/85 line-clamp-3">
                {story.tagline}
              </p>
              <div className="mt-1 flex items-center justify-between font-mono text-mono-s tracking-caps uppercase">
                <span className="text-ink-dim">@{story.author.handle} · 14h</span>
                <span className="rounded-full bg-amber/95 px-3 py-1 text-bg-deep">
                  ★ глава {continueChapter}
                </span>
              </div>
            </div>
          </GrainCover>
        </div>
      </Link>
    </section>
  );
}
