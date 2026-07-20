'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { FeedHeroDesktop } from '@/components/feed/FeedHeroDesktop';
import { FeedHeroMobile } from '@/components/feed/FeedHeroMobile';
import { FeedGrid } from '@/components/feed/FeedGrid';
import { FooterDesktop } from '@/components/feed/FooterDesktop';
import { TabBarMobile } from '@/components/feed/TabBarMobile';
import { FandomChips } from '@/components/feed/FandomChips';
import { Marquee } from '@/components/ui/Marquee';
import { Ornament } from '@/components/ui/Ornament';
import { heroStory, feedStories, fandomChips } from '@/lib/fixtures/stories';
import { track } from '@/lib/track';

export default function FeedPage() {
  // Genre marquee per v2-mocaps: leads with NOW READING, then story-specific tropes.
  const tickerItems = [
    '★ now reading ★',
    'enemies-to-lovers',
    'slow burn',
    'time travel',
    'hurt/comfort',
    'fake dating',
    'modern AU',
  ].map((t) => t.toUpperCase());

  useEffect(() => {
    track('feed_viewed');
  }, []);

  // Общая шапка (канва 05): лого · мой стол · лента · кабинет + primary «+ новая история».
  // На ленте primary ведёт в мастер обложки (/create) — тот же вход, что был у FeedHeader.
  const newStoryAction = (
    <Link
      href={'/create' as Route}
      className="rounded-full bg-amber px-[13px] py-[5px] font-display text-[12.5px] font-medium italic text-bg-deep transition-[filter] hover:brightness-110"
    >
      + новая история
    </Link>
  );

  return (
    <div className="min-h-screen bg-bg text-ink pb-20 lg:pb-0">
      <SiteHeader active="feed" primaryAction={newStoryAction} />

      <div className="lg:hidden">
        <FandomChips chips={fandomChips} onSelect={() => {}} />
      </div>

      {/* Marquee is desktop-only per v2 mocaps — mobile keeps a tighter vertical rhythm. */}
      <div className="hidden lg:block">
        <Marquee items={tickerItems} />
      </div>

      <div className="hidden lg:block">
        <FeedHeroDesktop story={heroStory} />
      </div>
      <div className="lg:hidden">
        <FeedHeroMobile story={heroStory} />
      </div>

      <div className="hidden lg:block py-10 text-center">
        <Ornament />
        <p className="mt-3 font-mono text-mono-s tracking-caps uppercase text-ink-dim">
          ★ полночное чтиво для тех, кто не спит ★
        </p>
      </div>

      <FeedGrid stories={feedStories} />
      <FooterDesktop />
      <TabBarMobile active="feed" />
    </div>
  );
}
