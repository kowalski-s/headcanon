'use client';

import { useState, ReactNode } from 'react';

interface AccordionSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
  children: ReactNode;
}

export function AccordionSection({ title, subtitle, defaultOpen = false, onToggle, children }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-t border-ink-faint/15 pt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            onToggle?.(next);
            return next;
          });
        }}
        className="flex w-full items-baseline justify-between text-left"
      >
        <span className="flex items-baseline gap-3">
          <span className="font-mono text-mono-s tracking-caps text-amber uppercase">
            {open ? '▾' : '▸'} {title}
          </span>
          {subtitle && (
            <span className="font-body text-body-s italic text-ink-dim">{subtitle}</span>
          )}
        </span>
      </button>
      {open && <div className="pt-4 pb-2">{children}</div>}
    </section>
  );
}
