import { GrainCover } from '@/components/ui/GrainCover';
import { ScotchTag } from '@/components/ui/ScotchTag';
import type { Story } from '@/lib/types/story';

type Props = {
  story: Story;
  continueChapter: number;
  variant?: 'mobile' | 'desktop';
};

export function StoryHero({ story, continueChapter, variant = 'mobile' }: Props) {
  const padded = String(continueChapter).padStart(2, '0');

  if (variant === 'desktop') {
    return (
      <div className="relative aspect-[4/5]">
        <GrainCover
          from={story.fandom.color1}
          to={story.fandom.color2}
          className="absolute inset-0"
        >
          <ScotchTag className="absolute left-6 -top-2 z-20 origin-bottom-left" rotate={-2}>
            {story.fandom.name}
          </ScotchTag>
          <ScotchTag className="absolute right-10 -top-2 z-20 origin-bottom-right" rotate={3}>
            {story.pair}
          </ScotchTag>
          <div className="absolute left-6 top-12 z-10 font-mono text-mono-s tracking-caps text-amber/85 uppercase">
            vol.1 / ch.{padded}
          </div>
        </GrainCover>
      </div>
    );
  }

  return (
    <div className="relative mx-4 aspect-[3/4]">
      <GrainCover from={story.fandom.color1} to={story.fandom.color2} className="absolute inset-0">
        <div className="absolute left-4 top-4 z-10 font-mono text-mono-s tracking-caps text-amber/80 uppercase">
          vol.1 / ch.{padded}
        </div>
      </GrainCover>
    </div>
  );
}
