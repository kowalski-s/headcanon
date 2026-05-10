// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FandomChips } from '@/components/feed/FandomChips';
import { fandomChips } from '@/lib/fixtures/stories';

describe('FandomChips', () => {
  it('renders all chips and marks active one', () => {
    render(<FandomChips chips={fandomChips} onSelect={() => {}} />);
    expect(screen.getByText(/все/i)).toBeInTheDocument();
    expect(screen.getByText(/Хогвартс/i)).toBeInTheDocument();
  });

  it('fires onSelect with chip id when clicked', () => {
    const onSelect = vi.fn();
    render(<FandomChips chips={fandomChips} onSelect={onSelect} />);
    fireEvent.click(screen.getByText(/Хогвартс/i));
    expect(onSelect).toHaveBeenCalledWith('hp');
  });
});
