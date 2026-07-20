import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ChapterNav } from '@/components/write/ChapterNav';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, push: vi.fn() }),
}));

const apiFetch = vi.fn(
  (..._args: unknown[]) => Promise.resolve({ ok: true }) as unknown as Promise<Response>,
);
vi.mock('@/lib/api/client', () => ({
  apiFetch: (...args: unknown[]) => apiFetch(...args),
}));

const chapters = [
  { id: 'a', ordinal: 1, title: 'Первая' },
  { id: 'b', ordinal: 2, title: 'Вторая' },
  { id: 'c', ordinal: 3, title: 'Третья' },
];

describe('ChapterNav', () => {
  beforeEach(() => {
    apiFetch.mockClear();
    refresh.mockClear();
  });

  it('рендерит главы и кнопку добавления', () => {
    render(<ChapterNav storyId="s1" chapters={chapters} activeOrdinal={1} />);
    expect(screen.getByText('Первая')).toBeInTheDocument();
    expect(screen.getByText('+ Глава')).toBeInTheDocument();
  });

  it('перестановка вниз меняет локальный порядок и шлёт новый order в API', async () => {
    render(<ChapterNav storyId="s1" chapters={chapters} activeOrdinal={1} />);
    const downButtons = screen.getAllByLabelText('Переместить вниз');
    fireEvent.click(downButtons[0]); // сдвигаем «Первую» вниз

    // Локальный порядок обновился оптимистично: Вторая, Первая, Третья
    const labels = screen.getAllByRole('link').map((el) => el.textContent);
    expect(labels).toEqual(['Вторая', 'Первая', 'Третья']);

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    const call = apiFetch.mock.calls.find((c) => String(c[0]).includes('reorder'));
    expect(call).toBeTruthy();
    expect(JSON.parse((call![1] as RequestInit).body as string).order).toEqual(['b', 'a', 'c']);
  });

  it('крайние кнопки перестановки задизейблены', () => {
    render(<ChapterNav storyId="s1" chapters={chapters} activeOrdinal={1} />);
    expect(screen.getAllByLabelText('Переместить вверх')[0]).toBeDisabled();
    expect(screen.getAllByLabelText('Переместить вниз')[2]).toBeDisabled();
  });

  it('удаление спрашивает подтверждение и вызывает DELETE', async () => {
    vi.stubGlobal('confirm', () => true);
    render(<ChapterNav storyId="s1" chapters={chapters} activeOrdinal={1} />);
    fireEvent.click(screen.getAllByLabelText('Удалить главу')[0]);
    await waitFor(() => {
      const del = apiFetch.mock.calls.find((c) => (c[1] as RequestInit)?.method === 'DELETE');
      expect(del).toBeTruthy();
    });
    vi.unstubAllGlobals();
  });
});
