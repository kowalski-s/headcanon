// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TabBarMobile } from '@/components/feed/TabBarMobile';

describe('TabBarMobile', () => {
  it('renders 5 tabs including мой стол → /write', () => {
    render(<TabBarMobile active="feed" />);
    expect(screen.getByRole('link', { name: /лента/i })).toBeInTheDocument();
    const desk = screen.getByRole('link', { name: /мой стол/i });
    expect(desk).toBeInTheDocument();
    expect(desk).toHaveAttribute('href', '/write');
    expect(screen.getByRole('link', { name: /создать/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /полка/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^я$/i })).toBeInTheDocument();
  });

  it('marks active tab', () => {
    render(<TabBarMobile active="saved" />);
    expect(screen.getByRole('link', { name: /полка/i })).toHaveAttribute('aria-current', 'page');
  });
});
