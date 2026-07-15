// @vitest-environment jsdom
/**
 * «Мой стол» (/write) — async server component. Соседние тесты в tests/pages/
 * рендерят синхронные View-компоненты; здесь страница сама ходит в prisma,
 * поэтому мокаем @/lib/prisma и рендерим `await DeskPage()`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DeskPage from '@/app/write/page';
import { prisma } from '@/lib/prisma';

// DeskShelf / EmptyDesk — client-компоненты с useRouter().
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    story: { findMany: vi.fn() },
    writingStat: { findMany: vi.fn() },
  },
}));

const storyFindMany = vi.mocked(prisma.story.findMany);
const statFindMany = vi.mocked(prisma.writingStat.findMany);

const DAY = 86_400_000;
const today = new Date();
const daysAgo = (n: number) => new Date(today.getTime() - n * DAY);

// Формат — как в select страницы: chapters по ordinal asc.
const STORIES = [
  {
    id: 'story-1',
    title: 'Зимняя соната',
    visibility: 'PRIVATE',
    updatedAt: daysAgo(2),
    chapters: [
      { text: 'раз два три', ordinal: 1, updatedAt: daysAgo(5) },
      { text: 'четыре пять', ordinal: 2, updatedAt: daysAgo(2) },
    ],
  },
  {
    id: 'story-2',
    title: 'Полночный экспресс',
    visibility: 'PUBLIC',
    updatedAt: daysAgo(10),
    chapters: [{ text: 'шесть семь восемь девять', ordinal: 1, updatedAt: daysAgo(10) }],
  },
];

const STATS = [
  { date: daysAgo(0), wordsAdded: 120 },
  { date: daysAgo(1), wordsAdded: 300 },
];

beforeEach(() => {
  storyFindMany.mockReset();
  statFindMany.mockReset();
});

describe('Desk page (/write)', () => {
  it('renders shelf with covers, create tile and momentum panel when stories exist', async () => {
    storyFindMany.mockResolvedValue(STORIES as never);
    statFindMany.mockResolvedValue(STATS as never);

    render(await DeskPage());

    // Заголовок стола
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/мой стол/i);

    // Полка: обложки обеих историй, ссылки в редактор
    const links = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(links).toContain('/write/story-1');
    expect(links).toContain('/write/story-2');
    expect(screen.getByText('Зимняя соната')).toBeInTheDocument();
    expect(screen.getByText('Полночный экспресс')).toBeInTheDocument();

    // Плитка создания — внутри DeskShelf
    expect(screen.getByRole('button', { name: /новая история/i })).toBeInTheDocument();

    // Momentum-панель: лид про последнюю историю, спарклайн-ярлык, кнопка продолжения
    expect(screen.getByText(/глава 2 ждёт/i)).toBeInTheDocument();
    expect(screen.getByText(/слова · 14 ночей/i)).toBeInTheDocument();
    expect(screen.getByText(/продолжить главу 2/i)).toBeInTheDocument();
    // Стрик: сегодня и вчера есть слова → «2 ночи подряд»
    expect(screen.getByText(/2 ночи подряд/i)).toBeInTheDocument();
  });

  it('renders EmptyDesk when there are no stories', async () => {
    storyFindMany.mockResolvedValue([] as never);
    statFindMany.mockResolvedValue([] as never);

    render(await DeskPage());

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /выбери фандом — и за стол/i,
    );
    // Полки и панели нет
    expect(screen.queryByText(/мой стол/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/слова · 14 ночей/i)).not.toBeInTheDocument();
  });
});
