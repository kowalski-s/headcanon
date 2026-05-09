import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Marquee } from '@/components/ui/Marquee';

describe('<Marquee>', () => {
  it('renders items joined by separator', () => {
    render(<Marquee items={['ab', 'cd', 'ef']} />);
    expect(screen.getAllByText('ab', { exact: false })).toHaveLength(2);
  });

  it('uses marquee animation class', () => {
    const { container } = render(<Marquee items={['x']} />);
    const track = container.querySelector('[data-track]');
    expect(track).toHaveClass('animate-marquee');
  });

  it('respects prefers-reduced-motion (no animation)', () => {
    const { container } = render(<Marquee items={['x']} />);
    const track = container.querySelector('[data-track]');
    expect(track?.className).toContain('motion-reduce:animate-none');
  });
});
