import Link from 'next/link';

export function FeedHeaderMobile() {
  return (
    <header className="lg:hidden flex items-center justify-between px-4 pt-4 pb-3">
      <Link href="/" className="font-display text-[22px] leading-none">
        head<span className="italic text-amber">canon</span>
      </Link>
      <div className="flex items-center gap-4 font-mono text-base text-ink-dim">
        <button type="button" aria-label="search" className="text-[15px]">
          ✦
        </button>
        <button type="button" aria-label="saved" className="text-[15px]">
          ♡
        </button>
        <button type="button" aria-label="me" className="text-[15px]">
          ☾
        </button>
      </div>
    </header>
  );
}
