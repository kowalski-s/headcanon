import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeskCover } from '@/components/desk/DeskCover';
import { DeskShelf } from '@/components/desk/DeskShelf';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const story = {
  id: 's1',
  title: 'Пепел и мята',
  ordinalCount: 7,
  words: 12480,
  isPublished: false,
};

// В mono-статусе группы разрядов нормализованы к U+00A0 (no-break space) —
// Node/ICU для ru-RU отдаёт U+202F (narrow no-break space), компонент заменяет.
const NBSP = '\u00A0';

describe('DeskCover', () => {
  it('типографская обложка: титул + mono-статус с ru-RU числом', () => {
    render(<DeskCover story={story} />);
    expect(screen.getByText('Пепел и мята')).toBeInTheDocument();
    // Дефолтный normalizer testing-library схлопывает NBSP в обычный пробел —
    // находим по нормализованному тексту, а точный U+00A0 ассертим через textContent.
    const status = screen.getByText(/ЧЕРНОВИК · ГЛ\. 7 · 12 480 СЛ/i);
    expect(status.textContent).toBe(`ЧЕРНОВИК · ГЛ. 7 · 12${NBSP}480 СЛ`);
  });

  it('опубликованная — статус без «черновик»', () => {
    render(<DeskCover story={{ ...story, isPublished: true }} />);
    expect(screen.queryByText(/ЧЕРНОВИК/i)).not.toBeInTheDocument();
    expect(screen.getByText(/ГЛ\. 7/i)).toBeInTheDocument();
  });

  it('ведёт в редактор истории', () => {
    render(<DeskCover story={story} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/write/s1');
  });

  it('градиентная обложка рендерит титул поверх GrainCover', () => {
    render(
      <DeskCover story={{ ...story, gradientClass: 'bg-gradient-to-br from-rose to-amber' }} />,
    );
    expect(screen.getByText('Пепел и мята')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/write/s1');
  });
});

describe('DeskShelf', () => {
  it('рендерит обложки и кнопку создания (тот же экшен, что в StoryList)', () => {
    render(<DeskShelf stories={[story, { ...story, id: 's2', title: 'Соль' }]} />);
    expect(screen.getByText('Пепел и мята')).toBeInTheDocument();
    expect(screen.getByText('Соль')).toBeInTheDocument();
    // Создание истории — POST-экшен (как в StoryList), поэтому плитка — кнопка, не ссылка
    expect(screen.getByRole('button', { name: /новая история/i })).toBeInTheDocument();
  });
});
