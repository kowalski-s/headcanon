import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MonoBadge } from '@/components/ui/MonoBadge';

describe('<MonoBadge>', () => {
  it('renders children with mono caps styling', () => {
    render(<MonoBadge>EP 02 / 04</MonoBadge>);
    const el = screen.getByText('EP 02 / 04');
    expect(el).toHaveClass('font-mono');
    expect(el).toHaveClass('uppercase');
    expect(el).toHaveClass('tracking-caps');
  });

  it('respects tone prop (default | amber | rose)', () => {
    const { rerender } = render(<MonoBadge>x</MonoBadge>);
    expect(screen.getByText('x')).toHaveClass('text-ink-dim');
    rerender(<MonoBadge tone="amber">x</MonoBadge>);
    expect(screen.getByText('x')).toHaveClass('text-amber');
    rerender(<MonoBadge tone="rose">x</MonoBadge>);
    expect(screen.getByText('x')).toHaveClass('text-rose');
  });
});
