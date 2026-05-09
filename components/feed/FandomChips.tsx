'use client';

import { track } from '@/lib/track';
import type { FandomChip } from '@/lib/types/story';

type Props = {
  chips: FandomChip[];
  onSelect: (id: string) => void;
};

export function FandomChips({ chips, onSelect }: Props) {
  return (
    <div
      className="flex gap-2 overflow-x-auto px-4 py-3 [scroll-snap-type:x_mandatory]"
      role="tablist"
    >
      {chips.map((c) => (
        <button
          key={c.id}
          type="button"
          role="tab"
          aria-selected={c.active ? true : false}
          onClick={() => {
            onSelect(c.id);
            track('feed_chip_tap', { fandom_id: c.id });
          }}
          className={`shrink-0 snap-start rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors ${
            c.active
              ? 'border-amber bg-amber text-bg-deep'
              : 'border-ink-faint/30 text-ink hover:border-amber/50'
          }`}
        >
          {c.active ? '★ ' : ''}
          {c.name}
          {c.sub ? <span className="ml-1 text-[10px] opacity-60">{c.sub}</span> : null}
        </button>
      ))}
    </div>
  );
}
