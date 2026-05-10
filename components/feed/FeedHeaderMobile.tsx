import Link from 'next/link';

export function FeedHeaderMobile() {
  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3">
      <Link href="/" className="font-display text-xl">
        head<span className="italic text-amber">canon</span>
      </Link>
      <div className="flex gap-3 font-mono text-base">
        <button type="button" aria-label="search">
          🔍
        </button>
        <button type="button" aria-label="saved">
          ♡
        </button>
      </div>
    </header>
  );
}
