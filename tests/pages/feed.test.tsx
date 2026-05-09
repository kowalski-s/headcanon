// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeedPage from '@/app/page';

describe('Feed page', () => {
  it('renders hero title and at least 5 grid cards', () => {
    render(<FeedPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    const cards = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('/story/'));
    expect(cards.length).toBeGreaterThanOrEqual(5);
  });
});
