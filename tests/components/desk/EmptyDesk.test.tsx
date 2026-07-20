import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyDesk } from '@/components/desk/EmptyDesk';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('EmptyDesk', () => {
  it('guided start: заголовок «стол пуст», чипы фандомов, один CTA', () => {
    render(<EmptyDesk />);
    expect(screen.getByRole('heading')).toHaveTextContent(/твой стол пока.*пуст/i);
    // Чипы фандомов (кнопки) + CTA
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText('+ начать')).toBeInTheDocument();
  });
});
