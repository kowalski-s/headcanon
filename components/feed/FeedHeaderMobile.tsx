import Link from 'next/link';
import type { Route } from 'next';

export function FeedHeaderMobile() {
  return (
    <header className="lg:hidden flex items-center justify-between gap-3 px-4 pt-4 pb-3">
      <Link href="/" className="flex items-baseline font-display text-[22px] leading-none">
        <span className="italic text-ink">head</span>
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: 'var(--hc-chrome-gradient)' }}
        >
          canon
        </span>
        <span aria-hidden className="ml-1.5 text-[11px] font-normal text-amber">
          ✦
        </span>
      </Link>
      <div className="flex items-center gap-3 font-mono text-base text-ink-dim">
        <button type="button" aria-label="saved" className="text-[15px]">
          ♡
        </button>
        <button type="button" aria-label="me" className="text-[15px]">
          ☾
        </button>
        <Link
          href={'/create' as Route}
          aria-label="новая история"
          className="rounded-full bg-amber px-3 py-1.5 font-mono text-[10px] tracking-caps uppercase text-bg-deep shadow-amber-glow"
        >
          + новая
        </Link>
      </div>
    </header>
  );
}
