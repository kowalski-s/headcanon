import type { Story } from '@/lib/types/story';

export function StoryMetaPanel({ story }: { story: Story }) {
  return (
    <div className="grid grid-cols-3 gap-4 bg-amber-soft px-4 py-4 font-mono text-[10px] uppercase tracking-wider text-bg-deep">
      <div className="flex flex-col gap-1">
        <span className="opacity-60">author</span>
        <span>@{story.author.handle}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="opacity-60">chapters</span>
        <span>{story.chapters} / ∞</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="opacity-60">likes</span>
        <span>♡ {(story.likes / 1000).toFixed(1)}k</span>
      </div>
    </div>
  );
}
