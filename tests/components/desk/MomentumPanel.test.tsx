import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MomentumPanel } from '@/components/desk/MomentumPanel';

describe('MomentumPanel', () => {
  it('стрик, подводка и CTA', () => {
    render(
      <MomentumPanel
        streak={9}
        sparkline={[0, 0, 120, 300, 0, 45, 0, 0, 500, 200, 0, 80, 150, 220]}
        lead="Три ночи назад ты оставила «Пепел и мята» — глава 7 ждёт."
        continueHref="/write/s1"
        continueLabel="продолжить главу 7"
      />,
    );
    expect(screen.getByText(/9 ночей подряд/i)).toBeInTheDocument();
    expect(screen.getByText(/Три ночи назад/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /продолжить главу 7/ })).toHaveAttribute(
      'href',
      '/write/s1',
    );
  });

  it('нулевой стрик — панель без строки стрика, но со спарклайном', () => {
    const { container } = render(
      <MomentumPanel
        streak={0}
        sparkline={new Array(14).fill(0)}
        lead=""
        continueHref={null}
        continueLabel={null}
      />,
    );
    expect(screen.queryByText(/подряд/)).not.toBeInTheDocument();
    expect(container.querySelector('svg polyline')).toBeInTheDocument();
  });

  it('спарклайн из одной точки не ломает polyline (нет Infinity/NaN)', () => {
    const { container } = render(
      <MomentumPanel
        streak={1}
        sparkline={[300]}
        lead=""
        continueHref={null}
        continueLabel={null}
      />,
    );
    const points = container.querySelector('svg polyline')?.getAttribute('points') ?? '';
    expect(points).not.toMatch(/Infinity|NaN/);
    expect(points.length).toBeGreaterThan(0);
  });
});
