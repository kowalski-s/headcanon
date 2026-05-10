// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReaderPageView } from '@/app/(reader)/reader/[storyId]/[chapterN]/ReaderPageView';

describe('Reader page', () => {
  it('renders chapter title and first paragraph for hero ch.7', () => {
    render(<ReaderPageView storyId="hero-1" chapterN="7" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/полночное чтиво/i);
    expect(
      screen.getByText(
        (_, el) => el?.tagName === 'P' && /Крыша всё ещё держала/i.test(el?.textContent ?? ''),
      ),
    ).toBeInTheDocument();
  });
});
