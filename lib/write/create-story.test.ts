import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('@/lib/api/client', () => ({ apiFetch: vi.fn() }));

import { createStory } from './create-story';
import { apiFetch } from '@/lib/api/client';

const apiFetchMock = vi.mocked(apiFetch);

describe('createStory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST-ит /api/write/story и возвращает storyId', async () => {
    apiFetchMock.mockResolvedValue(
      new Response(JSON.stringify({ storyId: 'story-1' }), { status: 200 }),
    );
    const storyId = await createStory();
    expect(storyId).toBe('story-1');
    expect(apiFetchMock).toHaveBeenCalledWith('/api/write/story', {
      method: 'POST',
      body: JSON.stringify({ title: 'Без названия' }),
    });
  });

  it('возвращает null при не-ok ответе', async () => {
    apiFetchMock.mockResolvedValue(new Response('nope', { status: 500 }));
    expect(await createStory()).toBeNull();
  });
});
