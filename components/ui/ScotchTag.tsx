import type { ReactNode } from 'react';

export function ScotchTag({
  children,
  rotate = -2,
  className = '',
}: {
  children: ReactNode;
  rotate?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-block bg-amber/30 px-2 py-0.5 font-mono text-mono-s tracking-caps text-ink uppercase ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}
