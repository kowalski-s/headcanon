// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeedPage from '@/app/page';

describe('Feed page', () => {
  it('renders hero title and at least 5 grid cards', () => {
    render(<FeedPage />);
    // Two h1 nodes are rendered — one in mobile hero, one in desktop hero — toggled by CSS
    // breakpoint at runtime. JSDOM ignores CSS, so the test asserts at least one is present.
    expect(screen.getAllByRole('heading', { level: 1 }).length).toBeGreaterThanOrEqual(1);
    const cards = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('/story/'));
    expect(cards.length).toBeGreaterThanOrEqual(5);
  });
});
