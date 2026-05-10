// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChapterListItem } from '@/components/story/ChapterListItem';

describe('ChapterListItem', () => {
  it('renders chapter number, title, and minutes', () => {
    render(
      <ChapterListItem
        storyId="s1"
        chapter={{ n: 7, title: 'полночное чтиво', minutes: 4, state: 'reading' }}
      />,
    );
    expect(screen.getByText('07')).toBeInTheDocument();
    expect(screen.getByText(/полночное чтиво/i)).toBeInTheDocument();
    expect(screen.getByText(/4m/i)).toBeInTheDocument();
  });

  it('shows continue marker when state=reading', () => {
    render(
      <ChapterListItem storyId="s1" chapter={{ n: 7, title: 'a', minutes: 4, state: 'reading' }} />,
    );
    expect(screen.getByText(/продолжить/i)).toBeInTheDocument();
  });

  it('shows read marker when state=read', () => {
    render(
      <ChapterListItem storyId="s1" chapter={{ n: 1, title: 'a', minutes: 4, state: 'read' }} />,
    );
    expect(screen.getByText(/прочитано/i)).toBeInTheDocument();
  });

  it('renders a non-clickable link when locked', () => {
    render(
      <ChapterListItem storyId="s1" chapter={{ n: 14, title: 'a', minutes: 8, state: 'locked' }} />,
    );
    const link = screen.queryByRole('link');
    expect(link).toBeNull();
  });
});
