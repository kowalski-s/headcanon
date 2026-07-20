import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeroLead } from '@/components/desk/HeroLead';

describe('HeroLead', () => {
  it('кикер, лид с подсветкой названия и CTA продолжения с ?ch=', () => {
    render(
      <HeroLead
        kicker="вт · поздняя ночь · свеча горит"
        lead="Три ночи назад ты оставила «Пепел и мята» — глава 7 ждёт."
        continueHref="/write/s1?ch=7"
        continueLabel="продолжить гл. 7"
      />,
    );
    expect(screen.getByText(/поздняя ночь/i)).toBeInTheDocument();
    // Название вынесено в <em>-подсветку — ассертим отдельным узлом
    expect(screen.getByText('«Пепел и мята»')).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /продолжить гл\. 7/i });
    expect(cta).toHaveAttribute('href', '/write/s1?ch=7');
  });

  it('без CTA (нет глав) — рендерит лид, но не рисует кнопку продолжения', () => {
    render(
      <HeroLead
        lead="Сегодня ты уже была за столом — глава 7 ждёт продолжения."
        continueHref={null}
        continueLabel={null}
      />,
    );
    expect(screen.getByText(/уже была за столом/i)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
