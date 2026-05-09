import type { ReactNode } from 'react';

type Tone = 'default' | 'amber' | 'rose';

const toneClasses: Record<Tone, string> = {
  default: 'text-ink-dim',
  amber: 'text-amber',
  rose: 'text-rose',
};

export function MonoBadge({
  children,
  tone = 'default',
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`font-mono text-mono-m uppercase tracking-caps ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
