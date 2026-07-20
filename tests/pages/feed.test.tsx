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

  it('несёт общую шапку SiteHeader: логотип → /, навигация «мой стол» → /write', () => {
    render(<FeedPage />);
    expect(screen.getByRole('link', { name: /headcanon/i })).toHaveAttribute('href', '/');
    // «мой стол» ведёт в /write и с десктоп-навигации (SiteHeader), и с мобильного TabBar.
    const deskLinks = screen.getAllByRole('link', { name: /мой стол/i });
    expect(deskLinks.length).toBeGreaterThanOrEqual(1);
    for (const link of deskLinks) expect(link).toHaveAttribute('href', '/write');
  });

  it('не содержит watch-входов (видео заморожено — Phase 3)', () => {
    render(<FeedPage />);
    const watchLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.includes('/watch'));
    expect(watchLinks).toHaveLength(0);
  });
});
