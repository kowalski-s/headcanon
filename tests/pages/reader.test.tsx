// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReaderPageView } from '@/app/(reader)/reader/[storyId]/[chapterN]/ReaderPageView';

describe('Reader page', () => {
  it('renders chapter title and first paragraph for hero ch.7', () => {
    render(<ReaderPageView storyId="hero-1" chapterN="7" />);
    // Both mobile and desktop layouts render an h1 in the same DOM tree (CSS toggles visibility).
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.length).toBeGreaterThanOrEqual(1);
    expect(headings[0]).toHaveTextContent(/Письмо/i);
    expect(
      screen.getAllByText(
        (_, el) => el?.tagName === 'P' && /Снег падал четвёртый час/i.test(el?.textContent ?? ''),
      ).length,
    ).toBeGreaterThanOrEqual(1);
  });
});
