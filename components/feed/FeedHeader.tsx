'use client';

import Link from 'next/link';
import type { Route } from 'next';

export function FeedHeader({ authed = false }: { authed?: boolean }) {
  return (
    <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between gap-6 border-b border-ink-faint/20 bg-bg/95 px-8 py-4 backdrop-blur">
      <Link href="/" className="font-display text-2xl">
        head<span className="italic text-amber">canon</span>
      </Link>

      <nav className="flex gap-6 font-mono text-xs uppercase tracking-wide">
        <Link href="/" className="text-amber">
          feed
        </Link>
        <Link href={'/fandoms' as Route} className="text-ink-dim hover:text-ink">
          fandoms
        </Link>
        <Link href={'/tropes' as Route} className="text-ink-dim hover:text-ink">
          tropes
        </Link>
        <Link href={'/watch' as Route} className="text-ink-dim hover:text-ink">
          watch ▸
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="искать..."
          className="rounded-full border border-ink-faint/30 bg-transparent px-4 py-1.5 font-body text-sm placeholder:text-ink-dim"
        />
        <button
          type="button"
          className="rounded-full bg-amber px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-bg"
        >
          {authed ? '+ new ☆' : '★ войти'}
        </button>
      </div>
    </header>
  );
}
