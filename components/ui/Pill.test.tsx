import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Pill } from './Pill';

describe('Pill', () => {
  it('рендерит button по умолчанию и ссылку при href', () => {
    render(<Pill variant="primary">продолжить</Pill>);
    expect(screen.getByRole('button', { name: 'продолжить' })).toBeInTheDocument();
    render(
      <Pill variant="ghost" href="/write">
        назад
      </Pill>,
    );
    expect(screen.getByRole('link', { name: 'назад' })).toHaveAttribute('href', '/write');
  });

  it('primary — амбер-заливка, вес 500, без glow-тени', () => {
    render(<Pill variant="primary">начать</Pill>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('rounded-full');
    expect(btn.className).toContain('font-medium');
    expect(btn.className).not.toContain('shadow');
  });
});
