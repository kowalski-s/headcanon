import Link from 'next/link';
import type { Route } from 'next';

type Props = {
  storyId: string;
  chapterN: number;
  chapterTitle: string;
  onOpenSettings: () => void;
  /**
   * Куда ведёт «←». По умолчанию — колофон истории `/story/[id]` (reader-path,
   * фикстуры). На writer-path (живая история, открытая из редактора) колофона для
   * UUID-истории нет — там передаётся `/write/[id]`, чтобы «назад» не упирался в 404.
   */
  backHref?: Route;
};

export function ReaderTopBar({ storyId, chapterN, chapterTitle, onOpenSettings, backHref }: Props) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-ink-faint/10 bg-bg/95 px-4 py-2 backdrop-blur">
      <Link
        href={backHref ?? (`/story/${storyId}` as Route)}
        aria-label="back"
        className="font-mono text-base"
      >
        ←
      </Link>
      <div className="flex flex-col items-center text-center">
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-dim">
          vol.1 · ch.{String(chapterN).padStart(2, '0')}
        </span>
        <span className="font-display text-xs italic text-amber">{chapterTitle}</span>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="settings"
          className="font-display text-base"
        >
          Aa
        </button>
        <button type="button" aria-label="more" className="font-mono text-base">
          ⚙
        </button>
      </div>
    </header>
  );
}
