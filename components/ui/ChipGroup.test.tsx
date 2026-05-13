// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChipGroup } from './ChipGroup';

const OPTIONS = [
  { value: 'a', label: 'один' },
  { value: 'b', label: 'два' },
];

describe('ChipGroup', () => {
  it('renders all options as buttons', () => {
    render(<ChipGroup options={OPTIONS} value={null} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /один/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /два/ })).toBeTruthy();
  });

  it('calls onChange with value on click', () => {
    const onChange = vi.fn();
    render(<ChipGroup options={OPTIONS} value={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /два/ }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('marks selected chip with aria-pressed', () => {
    render(<ChipGroup options={OPTIONS} value="a" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /один/ }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: /два/ }).getAttribute('aria-pressed')).toBe('false');
  });
});
