'use client';

import Link from 'next/link';
import type { Route } from 'next';

export function FeedHeader({ authed = false }: { authed?: boolean }) {
  return (
    <header className="hidden lg:flex sticky top-0 z-30 items-center gap-8 border-b border-ink-faint/15 bg-bg/95 px-10 py-5 backdrop-blur">
      <Link href="/" className="font-display text-[26px] leading-none">
        head
        <span className="italic text-amber">canon</span>
      </Link>

      <nav className="flex gap-5 font-mono text-mono-s tracking-caps uppercase">
        <Link href="/" className="text-amber">
          ✦ лента
        </Link>
        <Link href={'/fandoms' as Route} className="text-ink-dim transition-colors hover:text-ink">
          фандомы
        </Link>
        <Link href={'/tropes' as Route} className="text-ink-dim transition-colors hover:text-ink">
          тропы
        </Link>
        <Link href={'/watch' as Route} className="text-ink-dim transition-colors hover:text-ink">
          watch ▸
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <input
          type="search"
          placeholder="✦ shape me up..."
          className="w-[180px] rounded-full border border-ink-faint/30 bg-transparent px-4 py-1.5 font-body text-sm italic placeholder:text-ink-faint placeholder:italic focus:border-amber/60 focus:outline-none"
        />
        <Link
          href={'/create' as Route}
          className="rounded-full bg-amber px-5 py-2 font-mono text-mono-s tracking-caps uppercase text-bg-deep shadow-amber-glow"
        >
          {authed ? '+ новая история' : '+ новая история'}
        </Link>
      </div>
    </header>
  );
}
