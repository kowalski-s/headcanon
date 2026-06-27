// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepDetails, type StepDetailsValue } from './StepDetails';

const EMPTY: StepDetailsValue = {
  rating: null,
  category: null,
  warnings: [],
  pov: null,
  tense: null,
  tones: [],
  timeline: null,
  timelineNote: null,
  genres: [],
  setting: null,
  premise: null,
};

describe('StepDetails', () => {
  it('renders 4 collapsed accordion sections', () => {
    render(
      <StepDetails
        value={EMPTY}
        onChange={() => {}}
        genreSuggestions={[]}
        genreSuggestionsLoading={false}
        onNext={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /маркировка/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /голос/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /вселенная/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /завязка/i })).toBeTruthy();
  });

  it('opening "маркировка" reveals rating chips', () => {
    render(
      <StepDetails
        value={EMPTY}
        onChange={() => {}}
        genreSuggestions={[]}
        genreSuggestionsLoading={false}
        onNext={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /маркировка/i }));
    expect(screen.getByRole('button', { name: /общий/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /16\+/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /18\+/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /explicit/i })).toBeTruthy();
  });

  it('clicking rating chip emits onChange patch', () => {
    const onChange = vi.fn();
    render(
      <StepDetails
        value={EMPTY}
        onChange={onChange}
        genreSuggestions={[]}
        genreSuggestionsLoading={false}
        onNext={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /маркировка/i }));
    fireEvent.click(screen.getByRole('button', { name: /18\+/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ rating: 'MATURE' }));
  });

  it('"дальше" is always enabled (all advanced fields optional)', () => {
    render(
      <StepDetails
        value={EMPTY}
        onChange={() => {}}
        genreSuggestions={[]}
        genreSuggestionsLoading={false}
        onNext={() => {}}
      />,
    );
    const next = screen.getByRole('button', { name: /дальше/i });
    expect((next as HTMLButtonElement).disabled).toBe(false);
  });
});
