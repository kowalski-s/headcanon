// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiChipGroup } from './MultiChipGroup';

const OPTIONS = [
  { value: 'a', label: 'один' },
  { value: 'b', label: 'два' },
  { value: 'c', label: 'три' },
];

describe('MultiChipGroup', () => {
  it('toggles values on click', () => {
    const onChange = vi.fn();
    render(<MultiChipGroup options={OPTIONS} values={['a']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /два/ }));
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('removes value on second click', () => {
    const onChange = vi.fn();
    render(<MultiChipGroup options={OPTIONS} values={['a', 'b']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /один/ }));
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('enforces max if provided', () => {
    const onChange = vi.fn();
    render(<MultiChipGroup options={OPTIONS} values={['a', 'b']} onChange={onChange} max={2} />);
    fireEvent.click(screen.getByRole('button', { name: /три/ }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
