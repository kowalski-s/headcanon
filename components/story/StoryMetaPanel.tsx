import type { Story } from '@/lib/types/story';

// Meta strip rendered inline below story title.
// Per v2 mocaps it shows: handle, chapter count, avg minutes, total reads, rating.
export function StoryMetaPanel({ story }: { story: Story }) {
  const reads = story.likes;
  // Russian locale uses NBSP (U+00A0) by default — swap to comma to match mocap "24,827".
  const formattedReads = reads.toLocaleString('ru-RU').replace(/ /g, ',');

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-mono-s tracking-caps text-ink-dim uppercase">
      <span>
        by <span className="text-ink">@{story.author.handle}</span>
      </span>
      <Sep />
      <span>
        <span className="text-ink">{story.chapters}</span> / глав
      </span>
      <Sep />
      <span>9 мин/гл</span>
      <Sep />
      <span className="text-ink">{formattedReads}</span>
      <Sep />
      <span className="text-amber">★★★★ 4.92</span>
    </div>
  );
}

function Sep() {
  return (
    <span aria-hidden className="text-amber/40">
      ·
    </span>
  );
}
