import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';

export type NavKey = 'desk' | 'feed' | 'cabinet';

// Навигация по канве 05 (PvDeskDesktop): мой стол · лента · кабинет.
// «кабинет» пока без маршрута — рендерится приглушённым span, не битой ссылкой.
const NAV: { key: NavKey; label: string; href: Route | null }[] = [
  { key: 'desk', label: 'мой стол', href: '/write' as Route },
  { key: 'feed', label: 'лента', href: '/' as Route },
  { key: 'cabinet', label: 'кабинет', href: null },
];

/**
 * Общая шапка writer-поверхностей (канва 05). Держим API простым, чтобы позже
 * смонтировать на ленту/кабинет: `active` подсвечивает пункт, `primaryAction` —
 * опциональный слот под primary-CTA (на столе это «+ новая история»).
 *
 * Презентационный компонент без хуков — монтируется и в server-, и в client-дереве;
 * вся клиентская логика (создание истории) живёт внутри переданного primaryAction.
 */
export function SiteHeader({
  active,
  primaryAction,
}: {
  active?: NavKey;
  primaryAction?: ReactNode;
}) {
  return (
    <header className="relative z-10 flex items-center justify-between border-b border-border px-5 py-3.5 sm:px-7">
      <div className="flex items-baseline gap-6 sm:gap-7">
        <Link href={'/' as Route} className="flex items-baseline gap-0.5" aria-label="headcanon">
          <span className="font-display text-[22px] italic text-ink">head</span>
          <span className="bg-chrome-gradient bg-clip-text font-display text-[22px] font-semibold text-transparent">
            canon
          </span>
        </Link>
        <nav className="hidden items-baseline gap-5 sm:flex">
          {NAV.map((item) => {
            const isActive = item.key === active;
            const cls = isActive
              ? 'font-display text-sm italic text-amber'
              : 'font-ui text-[13px] text-ink-dim transition-colors hover:text-ink';
            const content = isActive ? `✎ ${item.label}` : item.label;
            if (!item.href) {
              return (
                <span key={item.key} className="font-ui text-[13px] text-ink-faint">
                  {item.label}
                </span>
              );
            }
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cls}
              >
                {content}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3.5">
        {primaryAction}
        <div
          aria-hidden
          className="h-[34px] w-[34px] rounded-full border border-border-strong bg-[linear-gradient(135deg,var(--hc-amber),var(--hc-rose))]"
        />
      </div>
    </header>
  );
}
