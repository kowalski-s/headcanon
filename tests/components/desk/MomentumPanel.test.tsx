import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MomentumPanel } from '@/components/desk/MomentumPanel';

describe('MomentumPanel', () => {
  it('стрик, спарклайн-ярлык и прогресс серии', () => {
    render(
      <MomentumPanel
        streak={9}
        sparkline={[0, 0, 120, 300, 0, 45, 0, 0, 500, 200, 0, 80, 150, 220]}
        series={{ title: 'Пепел и мята', chapters: 7, targetChapters: 10 }}
      />,
    );
    expect(screen.getByText(/9/)).toBeInTheDocument();
    expect(screen.getByText(/ночей письма подряд/i)).toBeInTheDocument();
    expect(screen.getByText(/слов за 14 ночей/i)).toBeInTheDocument();
    // Прогресс серии до финала: N из ~M глав
    expect(screen.getByText(/«Пепел и мята» — до финала/)).toBeInTheDocument();
    expect(screen.getByText(/из ~10 глав/i)).toBeInTheDocument();
  });

  it('нулевой стрик — панель без карточки стрика, но со спарклайном', () => {
    const { container } = render(
      <MomentumPanel streak={0} sparkline={new Array(14).fill(0)} series={null} />,
    );
    expect(screen.queryByText(/подряд/)).not.toBeInTheDocument();
    // Спарклайн-столбики (по канве 05): по одному rect на ночь, пустые — «пеньки»
    expect(container.querySelectorAll('svg rect')).toHaveLength(14);
  });

  it('спарклайн из одной точки не ломает разметку (нет Infinity/NaN)', () => {
    const { container } = render(<MomentumPanel streak={1} sparkline={[300]} series={null} />);
    const bar = container.querySelector('svg rect');
    expect(bar).toBeInTheDocument();
    const attrs = ['x', 'y', 'width', 'height'].map((a) => bar?.getAttribute(a)).join(' ');
    expect(attrs).not.toMatch(/Infinity|NaN/);
  });
});
