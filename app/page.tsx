import { FeedHeader } from '@/components/feed/FeedHeader';
import { FeedHeroDesktop } from '@/components/feed/FeedHeroDesktop';
import { FeedGrid } from '@/components/feed/FeedGrid';
import { FooterDesktop } from '@/components/feed/FooterDesktop';
import { Marquee } from '@/components/ui/Marquee';
import { Ornament } from '@/components/ui/Ornament';
import { heroStory, feedStories } from '@/lib/fixtures/stories';
import { trendingTropes } from '@/lib/fixtures/tropes';

export default function FeedPage() {
  const tickerItems = trendingTropes.map((t) => `★ ${t.toUpperCase()}`);
  return (
    <div className="min-h-screen bg-bg-deep text-ink">
      <FeedHeader />
      <Marquee items={tickerItems} className="hidden lg:block" />
      <FeedHeroDesktop story={heroStory} />
      <div className="hidden lg:block py-8 text-center">
        <Ornament />
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-ink-dim">
          ★ полночное чтиво для тех, кто не спит ★
        </p>
      </div>
      <FeedGrid stories={feedStories} columns={5} />
      <FooterDesktop />
    </div>
  );
}
