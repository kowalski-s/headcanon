import Link from 'next/link';
import type { Route } from 'next';

type TabKey = 'feed' | 'create' | 'saved' | 'me';

const tabs: Array<{ key: TabKey; label: string; href: string }> = [
  { key: 'feed', label: 'лента', href: '/' },
  { key: 'create', label: 'создать', href: '/create' },
  { key: 'saved', label: 'полка', href: '/me/saved' },
  { key: 'me', label: 'я', href: '/me' },
];

export function TabBarMobile({ active }: { active: TabKey }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-ink-faint/20 bg-bg/95 backdrop-blur">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href as Route}
          aria-current={t.key === active ? 'page' : undefined}
          className={`flex items-center justify-center py-3 font-mono text-xs uppercase tracking-wider ${
            t.key === active ? 'text-amber' : 'text-ink-dim'
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
