// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagInput } from './TagInput';

describe('TagInput', () => {
  it('adds tag on Enter', () => {
    const onChange = vi.fn();
    render(<TagInput values={[]} onChange={onChange} placeholder="+ свой" />);
    const input = screen.getByPlaceholderText('+ свой') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'мой троп' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['мой троп']);
  });

  it('removes tag on chip × click', () => {
    const onChange = vi.fn();
    render(<TagInput values={['a', 'b']} onChange={onChange} placeholder="x" />);
    const removeBtn = screen.getByRole('button', { name: /remove a/i });
    fireEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('ignores empty or duplicate input', () => {
    const onChange = vi.fn();
    render(<TagInput values={['a']} onChange={onChange} placeholder="x" />);
    const input = screen.getByPlaceholderText('x') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('enforces max if provided', () => {
    const onChange = vi.fn();
    render(<TagInput values={['a', 'b']} onChange={onChange} placeholder="x" max={2} />);
    const input = screen.getByPlaceholderText('x') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'c' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });
});
