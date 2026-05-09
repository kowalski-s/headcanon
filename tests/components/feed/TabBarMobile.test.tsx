// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TabBarMobile } from '@/components/feed/TabBarMobile';

describe('TabBarMobile', () => {
  it('renders 4 tabs', () => {
    render(<TabBarMobile active="feed" />);
    expect(screen.getByRole('link', { name: /лента/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /создать/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /полка/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /я/i })).toBeInTheDocument();
  });

  it('marks active tab', () => {
    render(<TabBarMobile active="saved" />);
    expect(screen.getByRole('link', { name: /полка/i })).toHaveAttribute('aria-current', 'page');
  });
});
