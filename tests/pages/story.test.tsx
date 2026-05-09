// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoryPageView } from '@/app/(reader)/story/[id]/StoryPageView';

describe('Story page', () => {
  it('renders story title, meta panel, and chapter list when id matches', () => {
    render(<StoryPageView id="hero-1" />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/palmetto/i)).toBeInTheDocument();
    expect(screen.getByText('07')).toBeInTheDocument();
  });
});
