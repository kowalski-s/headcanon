// @vitest-environment jsdom
/**
 * Task 22: CreatePageView — state machine + API call shape.
 *
 * Mocks fetch to simulate the full 5-step flow:
 * 1. POST /api/create/draft → returns { id: 'draft-1' }
 * 2. PATCH /api/create/draft/draft-1 (fandomId + step 2)
 * 3. GET /api/create/suggestions/ships
 * 4. PATCH (shipId + step 3)
 * 5. GET /api/create/suggestions/tropes
 * 6. PATCH (tropes + step 4, debounced)
 * 7. PATCH (tone + setting + step 5)
 * 8. POST /api/create/draft/draft-1/start → 200 { storyId, chapterId }
 *    OR → 429 → QuotaModal renders
 *
 * NOTE: mobile + desktop shells both render in JSDOM, so elements appear
 * twice. Tests use getAllByText[0] / getAllByRole to avoid ambiguity.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreatePageView } from '@/components/create/CreatePageView';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const DRAFT_ID = 'draft-1';
const STORY_ID = 'story-abc-123';

const MOCK_SHIPS = [
  { names: ['Neil', 'Andrew'], popularity: 0.9, rarity: 'top' as const },
  { names: ['Kevin', 'Jean'], popularity: 0.4, rarity: 'rare' as const },
];

const MOCK_TROPES = [
  { slug: 'enemies-to-lovers', label: 'Enemies to Lovers', description: 'e2l', popularity: 0.9 },
  { slug: 'slow-burn', label: 'Slow Burn', description: 'sb', popularity: 0.8 },
];

function buildFetchMock({ startStatus = 200 }: { startStatus?: number } = {}) {
  return vi.fn(async (url: string | Request | URL, init?: RequestInit) => {
    const urlStr = url.toString();
    const method = init?.method?.toUpperCase() ?? 'GET';

    // POST /api/create/draft (not /start)
    if (method === 'POST' && urlStr.includes('/api/create/draft') && !urlStr.includes('/start')) {
      return new Response(JSON.stringify({ id: DRAFT_ID, step: 1 }), { status: 200 });
    }

    // PATCH /api/create/draft/draft-1
    if (method === 'PATCH' && urlStr.includes(`/api/create/draft/${DRAFT_ID}`)) {
      return new Response(JSON.stringify({ id: DRAFT_ID }), { status: 200 });
    }

    // GET ships
    if (method === 'GET' && urlStr.includes('/api/create/suggestions/ships')) {
      return new Response(JSON.stringify({ ships: MOCK_SHIPS, cached: true }), { status: 200 });
    }

    // GET tropes
    if (method === 'GET' && urlStr.includes('/api/create/suggestions/tropes')) {
      return new Response(
        JSON.stringify({ tropes: MOCK_TROPES, sensei_tip: 'Slow burn это жизнь.', cached: true }),
        { status: 200 },
      );
    }

    // POST .../start
    if (method === 'POST' && urlStr.includes('/start')) {
      if (startStatus === 429) {
        return new Response(JSON.stringify({ error: 'quota_exceeded' }), { status: 429 });
      }
      return new Response(JSON.stringify({ storyId: STORY_ID, chapterId: 'ch-1' }), {
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: 'not mocked' }), { status: 404 });
  });
}

// Helper: find first button whose accessible name matches a pattern
function btn(name: RegExp) {
  return screen.getAllByRole('button', { name })[0];
}

beforeEach(() => {
  mockPush.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CreatePageView — full 5-step flow', () => {
  it('creates a draft on mount and shows step 1 (fandom picker)', async () => {
    const fetchMock = buildFetchMock();
    vi.stubGlobal('fetch', fetchMock);

    render(<CreatePageView />);

    // Wait for init to complete and fandom buttons to appear
    await waitFor(() => {
      expect(screen.getAllByText('AftG').length).toBeGreaterThanOrEqual(1);
    });

    // All 4 fandom labels present (×2 due to mobile+desktop, but at least 1 each)
    expect(screen.getAllByText('AftG').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('HP').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Naruto').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('JJK').length).toBeGreaterThanOrEqual(1);

    // POST /api/create/draft was called on mount
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/create/draft'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('moves to step 2 after picking a fandom and loads ships', async () => {
    const fetchMock = buildFetchMock();
    vi.stubGlobal('fetch', fetchMock);

    render(<CreatePageView />);
    await waitFor(() => expect(screen.getAllByText('AftG').length).toBeGreaterThanOrEqual(1));

    // Click the first AftG button
    fireEvent.click(screen.getAllByText('AftG')[0]);

    await waitFor(() => {
      expect(screen.getAllByText('Neil × Andrew').length).toBeGreaterThanOrEqual(1);
    });

    // PATCH was called with fandomId
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/api/create/draft/${DRAFT_ID}`),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('moves to step 3 after picking a ship and loads tropes', async () => {
    const fetchMock = buildFetchMock();
    vi.stubGlobal('fetch', fetchMock);

    render(<CreatePageView />);
    await waitFor(() => expect(screen.getAllByText('AftG').length).toBeGreaterThanOrEqual(1));
    fireEvent.click(screen.getAllByText('AftG')[0]);
    await waitFor(() =>
      expect(screen.getAllByText('Neil × Andrew').length).toBeGreaterThanOrEqual(1),
    );

    fireEvent.click(screen.getAllByText('Neil × Andrew')[0]);

    await waitFor(() => {
      expect(screen.getAllByText('Enemies to Lovers').length).toBeGreaterThanOrEqual(1);
    });

    // Sensei tip visible
    expect(screen.getAllByText('Slow burn это жизнь.').length).toBeGreaterThanOrEqual(1);
  });

  it('selects tropes and advances to step 4 (tone)', async () => {
    const fetchMock = buildFetchMock();
    vi.stubGlobal('fetch', fetchMock);

    render(<CreatePageView />);
    await waitFor(() => expect(screen.getAllByText('AftG').length).toBeGreaterThanOrEqual(1));
    fireEvent.click(screen.getAllByText('AftG')[0]);
    await waitFor(() =>
      expect(screen.getAllByText('Neil × Andrew').length).toBeGreaterThanOrEqual(1),
    );
    fireEvent.click(screen.getAllByText('Neil × Andrew')[0]);
    await waitFor(() =>
      expect(screen.getAllByText('Enemies to Lovers').length).toBeGreaterThanOrEqual(1),
    );

    // Toggle a trope (use first button with that text)
    fireEvent.click(screen.getAllByText('Enemies to Lovers')[0]);

    // Click "дальше · тон"
    fireEvent.click(btn(/дальше · тон/i));

    // Step 4: tone chips appear
    await waitFor(() => {
      expect(screen.getAllByText(/slow burn/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/fluff/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('reaches step 5 preview and calls POST /start → router.push on success', async () => {
    const fetchMock = buildFetchMock();
    vi.stubGlobal('fetch', fetchMock);

    render(<CreatePageView />);
    await waitFor(() => expect(screen.getAllByText('AftG').length).toBeGreaterThanOrEqual(1));

    // Step 1 → fandom
    fireEvent.click(screen.getAllByText('AftG')[0]);
    await waitFor(() =>
      expect(screen.getAllByText('Neil × Andrew').length).toBeGreaterThanOrEqual(1),
    );

    // Step 2 → ship
    fireEvent.click(screen.getAllByText('Neil × Andrew')[0]);
    await waitFor(() =>
      expect(screen.getAllByText('Enemies to Lovers').length).toBeGreaterThanOrEqual(1),
    );

    // Step 3 → tropes
    fireEvent.click(screen.getAllByText('Enemies to Lovers')[0]);
    fireEvent.click(btn(/дальше · тон/i));

    // Step 4 → tone
    await waitFor(() => expect(btn(/slow burn/i)).toBeInTheDocument());
    fireEvent.click(btn(/slow burn/i));
    fireEvent.click(btn(/дальше · превью/i));

    // Step 5 → preview with start button
    await waitFor(() => {
      expect(btn(/начать историю/i)).toBeInTheDocument();
    });

    // Click start
    fireEvent.click(btn(/начать историю/i));

    await waitFor(() => {
      // POST .../start was called
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining(`/api/create/draft/${DRAFT_ID}/start`),
        expect.objectContaining({ method: 'POST' }),
      );
    });

    // Router.push called with reader path
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(`/reader/${STORY_ID}/1`);
    });
  });

  it('shows QuotaModal on 429 from /start, dismisses on "понятно"', async () => {
    const fetchMock = buildFetchMock({ startStatus: 429 });
    vi.stubGlobal('fetch', fetchMock);

    render(<CreatePageView />);
    await waitFor(() => expect(screen.getAllByText('AftG').length).toBeGreaterThanOrEqual(1));

    // Fast-path through all steps
    fireEvent.click(screen.getAllByText('AftG')[0]);
    await waitFor(() =>
      expect(screen.getAllByText('Neil × Andrew').length).toBeGreaterThanOrEqual(1),
    );
    fireEvent.click(screen.getAllByText('Neil × Andrew')[0]);
    await waitFor(() =>
      expect(screen.getAllByText('Enemies to Lovers').length).toBeGreaterThanOrEqual(1),
    );
    fireEvent.click(screen.getAllByText('Enemies to Lovers')[0]);
    fireEvent.click(btn(/дальше · тон/i));
    await waitFor(() => expect(btn(/slow burn/i)).toBeInTheDocument());
    fireEvent.click(btn(/slow burn/i));
    fireEvent.click(btn(/дальше · превью/i));
    await waitFor(() => expect(btn(/начать историю/i)).toBeInTheDocument());

    fireEvent.click(btn(/начать историю/i));

    // QuotaModal should appear
    await waitFor(() => {
      expect(screen.getByText(/лимит на сегодня/i)).toBeInTheDocument();
    });

    // Dismiss modal
    fireEvent.click(screen.getByRole('button', { name: /понятно/i }));
    expect(screen.queryByText(/лимит на сегодня/i)).toBeNull();
  });
});
