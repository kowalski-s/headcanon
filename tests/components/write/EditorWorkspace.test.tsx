import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EditorWorkspace } from '@/components/write/EditorWorkspace';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

// Мокаем манускрипт-модуль — TipTap не нужен в jsdom; проверяем chrome/режимы/счётчики.
vi.mock('@/components/write/ChapterEditor', () => ({
  ChapterEditor: ({
    onWordCount,
    onStatusChange,
    mode,
  }: {
    onWordCount?: (n: number) => void;
    onStatusChange?: (s: string) => void;
    mode?: string;
  }) => {
    React.useEffect(() => {
      onWordCount?.(1124);
      onStatusChange?.('saved');
    }, [onWordCount, onStatusChange]);
    return <div data-testid="manuscript" data-mode={mode} />;
  },
}));

const active = { id: 'ch1', ordinal: 7, title: 'Письмо', text: 'Текст.' };
const chapters = [{ id: 'ch1', ordinal: 7, title: 'Письмо' }];

function renderWorkspace() {
  return render(
    <EditorWorkspace
      storyId="s1"
      storyTitle="Зимний свет"
      visibility="PRIVATE"
      chapters={chapters}
      active={active}
    />,
  );
}

describe('EditorWorkspace', () => {
  it('есть ссылка «назад на стол» на /write', () => {
    renderWorkspace();
    const back = screen.getByLabelText('Назад на стол');
    expect(back).toHaveAttribute('href', '/write');
  });

  it('показывает статус автосейва с ярлыком «сохранено» и счётчик слов', () => {
    renderWorkspace();
    expect(screen.getByText('сохранено')).toBeInTheDocument();
    expect(screen.getByText(/1\D?124 слов/)).toBeInTheDocument();
  });

  it('переключатель режимов помечает активный и прокидывает mode в манускрипт', () => {
    renderWorkspace();
    const focusBtn = screen.getByRole('button', { name: /фокус/i });
    expect(focusBtn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(focusBtn);
    expect(focusBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('manuscript')).toHaveAttribute('data-mode', 'focus');
  });

  it('AI-заглушка присутствует и задизейблена', () => {
    renderWorkspace();
    const ai = screen.getByRole('button', { name: 'AI-ассистент' });
    expect(ai).toBeDisabled();
  });

  it('кнопка «содержание» открывает выдвижную панель глав', () => {
    renderWorkspace();
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'содержание' }));
    expect(screen.getByRole('dialog', { name: 'Содержание' })).toBeInTheDocument();
  });
});
