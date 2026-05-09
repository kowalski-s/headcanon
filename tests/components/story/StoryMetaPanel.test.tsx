// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoryMetaPanel } from '@/components/story/StoryMetaPanel';
import { heroStory } from '@/lib/fixtures/stories';

describe('StoryMetaPanel', () => {
  it('renders author handle, chapter count, and likes', () => {
    render(<StoryMetaPanel story={heroStory} />);
    expect(screen.getByText(/palmetto/i)).toBeInTheDocument();
    expect(screen.getByText(/14/)).toBeInTheDocument();
    expect(screen.getByText(/24\.8k/)).toBeInTheDocument();
  });
});
