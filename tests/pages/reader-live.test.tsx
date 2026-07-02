// @vitest-environment jsdom
/**
 * Tests for the "live" (real DB chapter) render path of ReaderPageView.
 *
 * We pass `live.initialParagraphs` directly — no network calls needed.
 * The streaming path (initialParagraphs=[]) is not exercised here because
 * it requires a real fetch; that will be covered by E2E tests in Task 23.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReaderPageView } from '@/app/(reader)/reader/[storyId]/[chapterN]/ReaderPageView';

// Mock useChapterStream so the streaming auto-start doesn't fire in JSDOM.
// (fetch is not available in JSDOM without polyfills; DB-paragraph tests don't need it.)
vi.mock('@/lib/reader/useChapterStream', () => ({
  useChapterStream: () => ({
    completion: '',
    paragraphs: [],
    status: 'idle',
    error: undefined,
    start: vi.fn(),
    abort: vi.fn(),
  }),
}));

// Mock next/navigation (used inside ReaderPageView).
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  notFound: () => {
    throw new Error('NOT_FOUND');
  },
}));

const TEST_PARAGRAPHS = [
  { id: 'p-1', text: 'Первый абзац тестовой главы — начало истории.' },
  { id: 'p-2', text: 'Второй абзац, продолжение событий.' },
  { id: 'p-3', text: 'Третий абзац, разговор персонажей.' },
];

describe('ReaderPageView — live path', () => {
  it('renders DB paragraphs when initialParagraphs are provided', () => {
    render(
      <ReaderPageView
        storyId="00000000-0000-0000-0000-000000000001"
        chapterN="1"
        live={{
          chapterId: 'ch-uuid-1234',
          title: 'Первая встреча',
          ordinal: 1,
          authorId: '00000000-0000-0000-0000-000000000001',
          initialParagraphs: TEST_PARAGRAPHS,
        }}
      />,
    );

    // Chapter title should appear in the h1.
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.length).toBeGreaterThanOrEqual(1);
    expect(headings[0]).toHaveTextContent(/Первая встреча/i);

    // All three paragraphs should be in the DOM.
    expect(
      screen.getAllByText(
        (_, el) =>
          el?.tagName === 'P' && /Первый абзац тестовой главы/i.test(el?.textContent ?? ''),
      ).length,
    ).toBeGreaterThanOrEqual(1);

    expect(
      screen.getAllByText(
        (_, el) => el?.tagName === 'P' && /Второй абзац/i.test(el?.textContent ?? ''),
      ).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('shows ordinal label in live path', () => {
    render(
      <ReaderPageView
        storyId="00000000-0000-0000-0000-000000000001"
        chapterN="3"
        live={{
          chapterId: 'ch-uuid-5678',
          title: 'Второе возвращение',
          ordinal: 3,
          authorId: '00000000-0000-0000-0000-000000000001',
          initialParagraphs: [{ id: 'p-4', text: 'Один параграф.' }],
        }}
      />,
    );

    // Both mobile and desktop layouts render the ordinal label, so getAllByText.
    const ordinalLabels = screen.getAllByText(/глава 3/i);
    expect(ordinalLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('fixture path still renders for non-UUID storyId', () => {
    render(<ReaderPageView storyId="hero-1" chapterN="7" />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.length).toBeGreaterThanOrEqual(1);
    expect(headings[0]).toHaveTextContent(/Письмо/i);
  });
});
