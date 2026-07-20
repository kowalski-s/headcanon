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
  it('renders header, hero lead, shelf covers and momentum panel when stories exist', async () => {
    storyFindMany.mockResolvedValue(STORIES as never);
    statFindMany.mockResolvedValue(STATS as never);

    render(await DeskPage());

    // Доступный заголовок стола (визуально — в шапке/лиде, семантически — sr-only h1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/мой стол/i);

    // Полка: обложки обеих историй, ссылки в редактор
    const links = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(links).toContain('/write/story-1');
    expect(links).toContain('/write/story-2');
    expect(screen.getByText('Зимняя соната')).toBeInTheDocument();
    expect(screen.getByText('Полночный экспресс')).toBeInTheDocument();

    // Шапка смонтирована: primary «новая история» (POST-экшен, поэтому кнопка)
    expect(screen.getByRole('button', { name: /новая история/i })).toBeInTheDocument();
    // Подвал полки ведёт в выбор фандома
    expect(links).toContain('/create');

    // Hero-лид над полкой: подводка про последнюю историю + CTA продолжения
    expect(screen.getByText(/глава 2 ждёт/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /продолжить гл\. 2/i })).toHaveAttribute(
      'href',
      '/write/story-1?ch=2',
    );
    // Momentum-панель «ритм письма»: спарклайн-ярлык + стрик
    expect(screen.getByText(/слов за 14 ночей/i)).toBeInTheDocument();
    // Стрик: сегодня и вчера есть слова → 2 ночи письма подряд (число и лейбл — соседние span)
    expect(screen.getByText(/ночи письма подряд/i)).toBeInTheDocument();
  });

  it('renders EmptyDesk when there are no stories', async () => {
    storyFindMany.mockResolvedValue([] as never);
    statFindMany.mockResolvedValue([] as never);

    render(await DeskPage());

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/твой стол пока.*пуст/i);
    // Шапки/полки/панели нет — пустой стол это focused guided start без навигации
    expect(screen.queryByText(/мой стол/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/слов за 14 ночей/i)).not.toBeInTheDocument();
  });
});
