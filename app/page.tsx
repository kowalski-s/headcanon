'use client';

import { useEffect } from 'react';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { FeedHeaderMobile } from '@/components/feed/FeedHeaderMobile';
import { FeedHeroDesktop } from '@/components/feed/FeedHeroDesktop';
import { FeedHeroMobile } from '@/components/feed/FeedHeroMobile';
import { FeedGrid } from '@/components/feed/FeedGrid';
import { FooterDesktop } from '@/components/feed/FooterDesktop';
import { TabBarMobile } from '@/components/feed/TabBarMobile';
import { FandomChips } from '@/components/feed/FandomChips';
import { Marquee } from '@/components/ui/Marquee';
import { Ornament } from '@/components/ui/Ornament';
import { heroStory, feedStories, fandomChips } from '@/lib/fixtures/stories';
import { trendingTropes } from '@/lib/fixtures/tropes';
import { track } from '@/lib/track';

export default function FeedPage() {
  const tickerItems = trendingTropes.map((t) => `★ ${t.toUpperCase()}`);

  useEffect(() => {
    track('feed_viewed');
  }, []);

  return (
    <div className="min-h-screen bg-bg-deep text-ink pb-16 lg:pb-0">
      <FeedHeader />
      <FeedHeaderMobile />
      <Marquee items={tickerItems} />
      <div className="lg:hidden">
        <FandomChips chips={fandomChips} onSelect={() => {}} />
      </div>
      <div className="hidden lg:block">
        <FeedHeroDesktop story={heroStory} />
      </div>
      <div className="lg:hidden">
        <FeedHeroMobile story={heroStory} />
      </div>
      <div className="hidden lg:block py-8 text-center">
        <Ornament />
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-ink-dim">
          ★ полночное чтиво для тех, кто не спит ★
        </p>
      </div>
      <FeedGrid stories={feedStories} />
      <FooterDesktop />
      <TabBarMobile active="feed" />
    </div>
  );
}
