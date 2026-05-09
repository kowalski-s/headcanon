import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Ornament } from '@/components/ui/Ornament';

describe('<Ornament>', () => {
  it('renders default size with star symbol', () => {
    render(<Ornament />);
    expect(screen.getByRole('separator', { hidden: true })).toHaveTextContent('─ ✦ ─');
  });

  it('respects size prop sm|md|lg', () => {
    const { rerender } = render(<Ornament size="sm" />);
    expect(screen.getByRole('separator', { hidden: true })).toHaveClass('text-mono-s');
    rerender(<Ornament size="md" />);
    expect(screen.getByRole('separator', { hidden: true })).toHaveClass('text-mono-m');
    rerender(<Ornament size="lg" />);
    expect(screen.getByRole('separator', { hidden: true })).toHaveClass('text-display-s');
  });

  it('is hidden from screen readers', () => {
    render(<Ornament />);
    expect(screen.getByRole('separator', { hidden: true })).toHaveAttribute('aria-hidden', 'true');
  });
});
