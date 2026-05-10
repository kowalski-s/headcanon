// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoryPageView } from '@/app/(reader)/story/[id]/StoryPageView';

describe('Story page', () => {
  it('renders story title, meta panel, and chapter list when id matches', () => {
    render(<StoryPageView id="hero-1" />);
    // Two h1 nodes are rendered — mobile and desktop layouts toggle by CSS, JSDOM keeps both.
    expect(screen.getAllByRole('heading', { level: 1 }).length).toBeGreaterThanOrEqual(1);
    // @LunaHalf appears in both mobile and desktop meta strips.
    expect(screen.getAllByText(/lunahalf/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('07')).toBeInTheDocument();
  });
});
