// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReaderProgressBar } from '@/components/reader/ReaderProgressBar';

describe('ReaderProgressBar', () => {
  it('renders progress and page label', () => {
    render(<ReaderProgressBar percent={33} pageLabel="стр 3 / 9" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '33');
    expect(screen.getByText('стр 3 / 9')).toBeInTheDocument();
  });

  it('clamps percent to [0, 100]', () => {
    render(<ReaderProgressBar percent={150} pageLabel="" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});
