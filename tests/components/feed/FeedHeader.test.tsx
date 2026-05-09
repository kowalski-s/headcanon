// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeedHeader } from '@/components/feed/FeedHeader';

describe('FeedHeader', () => {
  it('renders wordmark and primary nav links', () => {
    render(<FeedHeader />);
    expect(screen.getByText(/head/i)).toBeInTheDocument();
    expect(screen.getByText(/canon/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /feed/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /fandoms/i })).toBeInTheDocument();
  });

  it('renders + NEW CTA when authed prop is true', () => {
    render(<FeedHeader authed />);
    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument();
  });

  it('renders ВОЙТИ when authed false', () => {
    render(<FeedHeader authed={false} />);
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });
});
