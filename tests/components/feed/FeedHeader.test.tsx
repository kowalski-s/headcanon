// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeedHeader } from '@/components/feed/FeedHeader';

describe('FeedHeader', () => {
  it('renders wordmark and primary nav links', () => {
    render(<FeedHeader />);
    expect(screen.getByText(/head/i)).toBeInTheDocument();
    expect(screen.getByText(/canon/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /лента/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /фандомы/i })).toBeInTheDocument();
  });

  it('renders + новая история CTA when authed prop is true', () => {
    render(<FeedHeader authed />);
    expect(screen.getByRole('link', { name: /новая история/i })).toBeInTheDocument();
  });

  it('renders + новая история CTA also when authed false (M1 single CTA)', () => {
    render(<FeedHeader authed={false} />);
    expect(screen.getByRole('link', { name: /новая история/i })).toBeInTheDocument();
  });

  it('не показывает watch-вход (видео заморожено — Phase 3)', () => {
    render(<FeedHeader />);
    expect(screen.queryByRole('link', { name: /watch/i })).toBeNull();
    const watchLinks = screen
      .queryAllByRole('link')
      .filter((a) => a.getAttribute('href')?.includes('/watch'));
    expect(watchLinks).toHaveLength(0);
  });
});
