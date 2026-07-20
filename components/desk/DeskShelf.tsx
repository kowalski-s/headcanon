import Link from 'next/link';
import type { Route } from 'next';
import { DeskCover, type DeskStory } from './DeskCover';

// «истории» — родительный/именительный по правилам ru: 1 история, 2–4 истории, 5+ историй.
function storiesWord(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'историй';
  if (mod10 === 1) return 'история';
  if (mod10 >= 2 && mod10 <= 4) return 'истории';
  return 'историй';
}

export function DeskShelf({ stories }: { stories: DeskStory[] }) {
  const published = stories.filter((s) => s.visibility === 'PUBLIC').length;
  const meta = `${stories.length} ${storiesWord(stories.length)} · ${published} ${
    published === 1 ? 'опубликована' : 'опубликовано'
  }`;

  return (
    <section>
      {/* заголовок полки — «✦ на столе · N историй · M опубликовано» (канва 05) */}
      <div className="mb-3.5 flex items-baseline gap-3">
        <h2 className="font-display text-lg italic text-ink">✦ на столе</h2>
        <span className="font-mono text-[9px] tracking-wide text-ink-faint">{meta}</span>
        <div className="h-px flex-1 bg-border" aria-hidden />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stories.map((s) => (
          <DeskCover key={s.id} story={s} />
        ))}
      </div>

      {/* подвал полки — guided start, не blank canvas (DESIGN-writer §6) */}
      <Link
        href={'/create' as Route}
        className="mt-3.5 flex items-center gap-3 rounded-xl border border-dashed border-border-strong px-4 py-3 transition-colors hover:border-amber"
      >
        <span className="text-base text-amber" aria-hidden>
          ✎
        </span>
        <span className="flex-1 font-body text-[13px] italic text-ink-dim">
          новая история начинается с фандома и одной сцены — не с чистого листа
        </span>
        <span className="whitespace-nowrap font-mono text-[9px] tracking-wide text-amber">
          выбрать фандом →
        </span>
      </Link>
    </section>
  );
}
