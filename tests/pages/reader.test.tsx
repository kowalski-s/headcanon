// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReaderPageView } from '@/app/(reader)/reader/[storyId]/[chapterN]/ReaderPageView';

// Mock next/navigation — ReaderPageView calls useRouter() at the top level.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  notFound: () => {
    throw new Error('NOT_FOUND');
  },
}));

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

  it('открывает любую фикстур-историю без 404 (сквозной reader-path)', () => {
    // До фикса контент был только у hero-1/7 → все прочие главы падали в notFound().
    // Теперь карточка ленты → колофон → «читать» открывает главу с плейсхолдер-прозой.
    expect(() => render(<ReaderPageView storyId="s1" chapterN="1" />)).not.toThrow();
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it('в ридере нет watch-входов (видео заморожено — Phase 3)', () => {
    render(<ReaderPageView storyId="hero-1" chapterN="7" />);
    const watchLinks = screen
      .queryAllByRole('link')
      .filter((a) => a.getAttribute('href')?.includes('/watch'));
    expect(watchLinks).toHaveLength(0);
  });
});
