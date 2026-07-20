import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DeskCover, type DeskStory } from '@/components/desk/DeskCover';
import { DeskShelf } from '@/components/desk/DeskShelf';

const story: DeskStory = {
  id: 's1',
  title: 'Пепел и мята',
  ordinalCount: 7,
  words: 12480,
  visibility: 'PRIVATE',
};

// В mono-статусе группы разрядов нормализованы к U+00A0 (no-break space) —
// Node/ICU для ru-RU отдаёт U+202F (narrow no-break space), компонент заменяет.
const NBSP = ' ';

describe('DeskCover', () => {
  it('типографская обложка: лейбл сверху, титул, mono-статистика с ru-RU числом', () => {
    render(<DeskCover story={story} />);
    expect(screen.getByText('Пепел и мята')).toBeInTheDocument();
    // По канве 05: «ЧЕРНОВИК» — отдельный лейбл сверху, внизу короткая строка «ГЛ. · СЛ»
    expect(screen.getByText('ЧЕРНОВИК')).toBeInTheDocument();
    // Дефолтный normalizer testing-library схлопывает NBSP в обычный пробел —
    // находим по нормализованному тексту, а точный U+00A0 ассертим через textContent.
    const stats = screen.getByText(/ГЛ\. 7 · 12 480 СЛ/i);
    expect(stats.textContent).toBe(`ГЛ. 7 · 12${NBSP}480 СЛ`);
  });

  it('опубликованная — лейбл «опубликовано», без «черновик»', () => {
    render(<DeskCover story={{ ...story, visibility: 'PUBLIC' }} />);
    expect(screen.queryByText(/ЧЕРНОВИК/i)).not.toBeInTheDocument();
    expect(screen.getByText('ОПУБЛИКОВАНО')).toBeInTheDocument();
    expect(screen.getByText(/ГЛ\. 7/i)).toBeInTheDocument();
  });

  it('UNLISTED — отдельный лейбл «по ссылке», не схлопывается в «черновик»', () => {
    render(<DeskCover story={{ ...story, visibility: 'UNLISTED' }} />);
    expect(screen.queryByText(/ЧЕРНОВИК/i)).not.toBeInTheDocument();
    expect(screen.getByText('ПО ССЫЛКЕ')).toBeInTheDocument();
  });

  it('активная история — оверлей-бейдж «сейчас»', () => {
    render(<DeskCover story={{ ...story, isActive: true }} />);
    expect(screen.getByText(/сейчас/i)).toBeInTheDocument();
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
  it('рендерит обложки, заголовок полки и подвал «выбрать фандом» → /create', () => {
    render(<DeskShelf stories={[story, { ...story, id: 's2', title: 'Соль' }]} />);
    expect(screen.getByText('Пепел и мята')).toBeInTheDocument();
    expect(screen.getByText('Соль')).toBeInTheDocument();
    // Подвал полки (guided start) — ссылка в выбор фандома
    const fandom = screen.getByRole('link', { name: /выбрать фандом/i });
    expect(fandom).toHaveAttribute('href', '/create');
  });
});
