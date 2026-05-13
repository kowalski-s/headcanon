// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreatePageView } from '@/components/create/CreatePageView';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const DRAFT_ID = 'draft-1';
const STORY_ID = 'story-abc-123';

const MOCK_CHARACTERS = [
  { names: ['Гарри', 'Драко'], label_ru: 'Гарри × Драко', popularity: 0.9, rarity: 'top', focus_compatible: ['romance'] },
];
const MOCK_TROPES = [
  { slug: 'enemies-to-lovers', label_ru: 'от врагов к возлюбленным', description_ru: 'враждуют, потом любят', popularity: 0.9 },
];
const MOCK_GENRES = [
  { slug: 'modern-au', label_ru: 'современная AU', popularity: 0.8 },
];

function buildFetchMock({ startStatus = 200 } = {}) {
  return vi.fn(async (url: string | Request | URL, init?: RequestInit) => {
    const u = url.toString();
    const m = init?.method?.toUpperCase() ?? 'GET';
    if (m === 'POST' && u.includes('/api/create/draft') && !u.includes('/start')) {
      return new Response(JSON.stringify({ id: DRAFT_ID }), { status: 200 });
    }
    if (m === 'PATCH' && u.includes(`/api/create/draft/${DRAFT_ID}`)) {
      return new Response(JSON.stringify({ id: DRAFT_ID }), { status: 200 });
    }
    if (m === 'GET' && u.includes('/api/create/suggestions/characters')) {
      return new Response(JSON.stringify({ suggestions: MOCK_CHARACTERS }), { status: 200 });
    }
    if (m === 'GET' && u.includes('/api/create/suggestions/tropes')) {
      return new Response(JSON.stringify({ tropes: MOCK_TROPES, sensei_tip: 'удачи' }), { status: 200 });
    }
    if (m === 'GET' && u.includes('/api/create/suggestions/genres')) {
      return new Response(JSON.stringify({ genres: MOCK_GENRES }), { status: 200 });
    }
    if (m === 'POST' && u.includes('/start')) {
      if (startStatus === 429) return new Response(JSON.stringify({ error: 'quota_exceeded' }), { status: 429 });
      return new Response(JSON.stringify({ storyId: STORY_ID, chapterId: 'ch-1' }), { status: 200 });
    }
    return new Response(JSON.stringify({ error: 'not mocked' }), { status: 404 });
  });
}

beforeEach(() => mockPush.mockClear());
afterEach(() => vi.restoreAllMocks());

describe('CreatePageView — wizard flow', () => {
  it('walks through fandom → focus → characters → tropes → details (skipped) → start', async () => {
    global.fetch = buildFetchMock();
    render(<CreatePageView />);

    await waitFor(() => expect(screen.getAllByText(/AftG|HP|Naruto|JJK/i).length).toBeGreaterThan(0));

    // Step 1: pick HP
    fireEvent.click(screen.getAllByText('HP')[0]);

    // Step 2: pick Romance focus
    await waitFor(() => expect(screen.getAllByRole('button', { name: /романтика/i }).length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByRole('button', { name: /романтика/i })[0]);
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: /Гарри × Драко/i }).length).toBeGreaterThan(0),
    );
    fireEvent.click(screen.getAllByRole('button', { name: /Гарри × Драко/i })[0]);
    fireEvent.click(screen.getAllByTestId('step-next')[0]);

    // Step 3: pick a trope
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: /от врагов к возлюбленным/i }).length).toBeGreaterThan(0),
    );
    fireEvent.click(screen.getAllByRole('button', { name: /от врагов к возлюбленным/i })[0]);
    fireEvent.click(screen.getAllByTestId('step-next')[0]);

    // Step 4: skip details
    await waitFor(() => expect(screen.getAllByRole('button', { name: /маркировка/i }).length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByTestId('step-next')[0]);

    // Step 5: start
    await waitFor(() => expect(screen.getAllByTestId('step-start').length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByTestId('step-start')[0]);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(`/reader/${STORY_ID}/1`));
  });

  it('Gen focus accepts single character via TagInput', async () => {
    global.fetch = buildFetchMock();
    render(<CreatePageView />);
    await waitFor(() => expect(screen.getAllByText('HP').length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByText('HP')[0]);
    fireEvent.click(screen.getAllByRole('button', { name: /^джен$/i })[0]);

    const inputs = await screen.findAllByPlaceholderText(/свой герой/i);
    fireEvent.change(inputs[0], { target: { value: 'Юдзи Итадори' } });
    fireEvent.keyDown(inputs[0], { key: 'Enter' });

    const next = screen.getAllByTestId('step-next')[0] as HTMLButtonElement;
    await waitFor(() => expect(next.disabled).toBe(false));
  });

  it('shows quota modal on 429 from start', async () => {
    global.fetch = buildFetchMock({ startStatus: 429 });
    render(<CreatePageView />);
    await waitFor(() => expect(screen.getAllByText('HP').length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByText('HP')[0]);
    fireEvent.click(screen.getAllByRole('button', { name: /романтика/i })[0]);
    await waitFor(() => screen.getAllByRole('button', { name: /Гарри × Драко/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /Гарри × Драко/i })[0]);
    fireEvent.click(screen.getAllByTestId('step-next')[0]);
    await waitFor(() => screen.getAllByRole('button', { name: /от врагов к возлюбленным/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /от врагов к возлюбленным/i })[0]);
    fireEvent.click(screen.getAllByTestId('step-next')[0]);
    fireEvent.click(screen.getAllByTestId('step-next')[0]);
    fireEvent.click(screen.getAllByTestId('step-start')[0]);
    await waitFor(() => expect(screen.getAllByText(/лимит/i).length).toBeGreaterThan(0));
  });
});
