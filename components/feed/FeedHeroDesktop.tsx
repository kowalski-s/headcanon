import { GrainCover } from '@/components/ui/GrainCover';
import { BurstSticker } from '@/components/ui/BurstSticker';
import { ScotchTag } from '@/components/ui/ScotchTag';
import { MonoBadge } from '@/components/ui/MonoBadge';
import type { Story } from '@/lib/types/story';

export function FeedHeroDesktop({ story }: { story: Story }) {
  return (
    <section className="grid grid-cols-[1.1fr_1fr] items-center gap-12 px-8 py-12">
      <div className="flex flex-col gap-5">
        <MonoBadge tone="amber">
          vol.1 · {story.fandom.name.toLowerCase()} · {story.chapters} ch
        </MonoBadge>
        <h1 className="font-display text-7xl leading-tight text-balance">
          кто остаётся <span className="italic text-amber">в полночь</span>
        </h1>
        <p className="font-body text-base text-ink-dim italic">★ {story.tagline} ★</p>
        <div className="flex gap-4">
          <button
            type="button"
            className="rounded-full bg-amber px-6 py-3 font-mono text-sm uppercase tracking-wider text-bg-deep"
          >
            ★ читать
          </button>
          {story.hasWatch ? (
            <button
              type="button"
              className="rounded-full border border-chrome-1 px-6 py-3 font-mono text-sm uppercase tracking-wider text-chrome-1"
            >
              ▸ watch · {story.watchEpisodes} ep
            </button>
          ) : null}
        </div>
        <div className="flex gap-4 font-mono text-xs uppercase tracking-wide text-ink-dim">
          <span>♡ {(story.likes / 1000).toFixed(1)}k</span>
          <span>@{story.author.handle}</span>
          <span>{story.chapters} chapters</span>
        </div>
      </div>

      <div className="relative aspect-[4/3] -rotate-[1.5deg]">
        <GrainCover from={story.fandom.color1} to={story.fandom.color2} className="h-full w-full">
          <ScotchTag className="absolute left-4 top-4">{story.fandom.name}</ScotchTag>
          <ScotchTag className="absolute right-6 top-8" rotate={3}>
            {story.pair}
          </ScotchTag>
          <BurstSticker label="★ хит" rotate={-8} className="absolute -right-4 -top-4" />
        </GrainCover>
      </div>
    </section>
  );
}
