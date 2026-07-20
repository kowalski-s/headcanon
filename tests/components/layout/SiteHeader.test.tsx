import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { NewStoryButton } from '@/components/layout/NewStoryButton';
import { createStory } from '@/lib/write/create-story';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@/lib/write/create-story', () => ({
  createStory: vi.fn(),
}));

const mockedCreate = vi.mocked(createStory);

beforeEach(() => {
  push.mockReset();
  mockedCreate.mockReset();
});

describe('SiteHeader', () => {
  it('логотип ведёт на /, навигация — стол и лента, активный пункт помечен', () => {
    render(<SiteHeader active="desk" />);

    // Логотип headcanon → /
    expect(screen.getByRole('link', { name: /headcanon/i })).toHaveAttribute('href', '/');

    // Активный пункт «мой стол» → /write, aria-current
    const desk = screen.getByRole('link', { name: /мой стол/i });
    expect(desk).toHaveAttribute('href', '/write');
    expect(desk).toHaveAttribute('aria-current', 'page');

    // Лента → /
    expect(screen.getByRole('link', { name: /^лента$/i })).toHaveAttribute('href', '/');
  });

  it('рендерит переданный primaryAction', () => {
    render(<SiteHeader active="desk" primaryAction={<NewStoryButton />} />);
    expect(screen.getByRole('button', { name: /новая история/i })).toBeInTheDocument();
  });
});

describe('NewStoryButton — guard двойного клика', () => {
  it('двойной клик создаёт историю один раз и ведёт в редактор', async () => {
    mockedCreate.mockResolvedValue('new-story-id');
    render(<NewStoryButton />);

    const btn = screen.getByRole('button', { name: /новая история/i });
    fireEvent.click(btn);
    fireEvent.click(btn);

    await waitFor(() => expect(push).toHaveBeenCalledWith('/write/new-story-id'));
    // Guard: второй синхронный клик отсечён pendingRef → createStory ровно один вызов
    expect(mockedCreate).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledTimes(1);
  });
});
