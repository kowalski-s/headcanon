import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BurstSticker } from '@/components/ui/BurstSticker';

describe('<BurstSticker>', () => {
  it('renders label inside star-shaped clip', () => {
    render(<BurstSticker label="★ хит" />);
    expect(screen.getByText('★ хит')).toBeInTheDocument();
  });

  it('applies rotation via inline style', () => {
    const { container } = render(<BurstSticker label="★ хит" rotate={-8} />);
    const root = container.firstChild as HTMLElement;
    expect(root.style.transform).toContain('rotate(-8deg)');
  });

  it('defaults rotation to -8 deg if not provided', () => {
    const { container } = render(<BurstSticker label="★ хит" />);
    const root = container.firstChild as HTMLElement;
    expect(root.style.transform).toContain('rotate(-8deg)');
  });
});
