import { GrainCover } from '@/components/ui/GrainCover';
import { BurstSticker } from '@/components/ui/BurstSticker';
import type { Story } from '@/lib/types/story';

export function StoryHero({ story }: { story: Story }) {
  return (
    <div className="relative aspect-[4/3]">
      <GrainCover from={story.fandom.color1} to={story.fandom.color2} className="h-full w-full">
        <BurstSticker label="★ хит" rotate={8} className="absolute right-4 top-4" />
      </GrainCover>
    </div>
  );
}
