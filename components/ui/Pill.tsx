import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'hero';

// Кнопочный язык v2: пилюля, вес 500, узкие паддинги, без glow-теней.
const base =
  'inline-flex items-center justify-center gap-1.5 rounded-full font-ui font-medium transition-colors duration-200';
const variants: Record<Variant, string> = {
  primary: 'bg-amber text-bg-deep px-[15px] py-[7px] text-sm hover:brightness-110',
  ghost:
    'border border-border-strong text-ink px-[15px] py-[7px] text-sm hover:border-amber hover:text-amber',
  hero: 'bg-amber text-bg-deep px-5 py-[9px] text-base hover:brightness-110',
};

export function Pill({
  variant = 'primary',
  href,
  onClick,
  type = 'button',
  className = '',
  children,
}: {
  variant?: Variant;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  children: ReactNode;
}) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href as Route} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
