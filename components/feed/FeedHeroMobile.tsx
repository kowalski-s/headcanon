import { GrainCover } from '@/components/ui/GrainCover';
import { BurstSticker } from '@/components/ui/BurstSticker';
import { Ornament } from '@/components/ui/Ornament';
import type { Story } from '@/lib/types/story';

export function FeedHeroMobile({ story }: { story: Story }) {
  return (
    <section className="px-4">
      <div className="relative aspect-[4/3]">
        <GrainCover from={story.fandom.color1} to={story.fandom.color2} className="h-full w-full">
          <BurstSticker label="★ хит" rotate={-8} className="absolute right-3 top-3" />
          <div className="absolute inset-x-0 bottom-0 bg-bg-deep/70 px-3 py-2 backdrop-blur">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wide">
              <span>
                {story.fandom.name} · {story.pair}
              </span>
              {story.hasWatch ? (
                <span className="rounded-full border border-chrome-1 px-2 py-0.5 text-chrome-1">
                  ▸ watch · {story.watchEpisodes} эп
                </span>
              ) : null}
            </div>
          </div>
        </GrainCover>
      </div>
      <div className="py-4 text-center">
        <Ornament size="sm" />
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-dim">
          ★ полночное чтиво для тех, кто не спит ★
        </p>
      </div>
    </section>
  );
}
