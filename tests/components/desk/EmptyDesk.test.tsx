import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyDesk } from '@/components/desk/EmptyDesk';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('EmptyDesk', () => {
  it('guided start: заголовок, чипы, один CTA', () => {
    render(<EmptyDesk />);
    expect(screen.getByRole('heading')).toHaveTextContent(/выбери фандом/i);
    expect(
      screen.getAllByRole('button').length + screen.queryAllByRole('link').length,
    ).toBeGreaterThanOrEqual(4);
    expect(screen.getByText('+ начать')).toBeInTheDocument();
  });
});
