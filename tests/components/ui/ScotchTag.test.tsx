import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScotchTag } from '@/components/ui/ScotchTag';

describe('<ScotchTag>', () => {
  it('renders text content', () => {
    render(<ScotchTag>★ slow burn</ScotchTag>);
    expect(screen.getByText('★ slow burn')).toBeInTheDocument();
  });

  it('applies amber-translucent background by default', () => {
    const { container } = render(<ScotchTag>x</ScotchTag>);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('bg-amber/30');
  });

  it('respects rotate prop', () => {
    const { container } = render(<ScotchTag rotate={3}>x</ScotchTag>);
    const root = container.firstChild as HTMLElement;
    expect(root.style.transform).toContain('rotate(3deg)');
  });
});
