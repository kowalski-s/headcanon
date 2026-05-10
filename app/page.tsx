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

  return (
    <div className="min-h-screen bg-bg text-ink pb-20 lg:pb-0">
      <FeedHeader />
      <FeedHeaderMobile />

      {/* Tagline italic centered — mobile sits above chips, desktop above marquee. */}
      <p className="px-4 pb-3 text-center font-body text-body-s italic text-ink-dim lg:px-8 lg:pb-2">
        полночное чтиво для тех, кто не спит
      </p>

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
