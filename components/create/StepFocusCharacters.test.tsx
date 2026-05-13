// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepFocusCharacters } from './StepFocusCharacters';

const SUGGESTIONS = [
  { names: ['Гарри', 'Драко'], label_ru: 'Гарри × Драко', popularity: 0.9, rarity: 'top' as const, focus_compatible: ['romance' as const] },
  { names: ['Снейп', 'Гермиона'], label_ru: 'Снейп × Гермиона', popularity: 0.3, rarity: 'rare' as const, focus_compatible: ['romance' as const] },
];

describe('StepFocusCharacters', () => {
  it('does not render character input until focus is chosen', () => {
    render(
      <StepFocusCharacters
        focus={null}
        characters={[]}
        suggestions={[]}
        suggestionsLoading={false}
        onFocusChange={() => {}}
        onCharactersChange={() => {}}
        onNext={() => {}}
      />,
    );
    expect(screen.queryByPlaceholderText(/свой пейринг|свой герой/i)).toBeNull();
  });

  it('shows ship-input after picking Romance', () => {
    const onFocusChange = vi.fn();
    render(
      <StepFocusCharacters
        focus={null}
        characters={[]}
        suggestions={[]}
        suggestionsLoading={false}
        onFocusChange={onFocusChange}
        onCharactersChange={() => {}}
        onNext={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /романтика/i }));
    expect(onFocusChange).toHaveBeenCalledWith('ROMANCE');
  });

  it('clicking a suggestion adds names to characters', () => {
    const onCharactersChange = vi.fn();
    render(
      <StepFocusCharacters
        focus="ROMANCE"
        characters={[]}
        suggestions={SUGGESTIONS}
        suggestionsLoading={false}
        onFocusChange={() => {}}
        onCharactersChange={onCharactersChange}
        onNext={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Гарри × Драко/i }));
    expect(onCharactersChange).toHaveBeenCalledWith(['Гарри', 'Драко']);
  });

  it('Romance requires ≥2 characters before onNext is enabled', () => {
    const onNext = vi.fn();
    render(
      <StepFocusCharacters
        focus="ROMANCE"
        characters={['Гарри']}
        suggestions={[]}
        suggestionsLoading={false}
        onFocusChange={() => {}}
        onCharactersChange={() => {}}
        onNext={onNext}
      />,
    );
    const next = screen.getByRole('button', { name: /дальше/i });
    expect((next as HTMLButtonElement).disabled).toBe(true);
  });

  it('Gen requires ≥1 character', () => {
    render(
      <StepFocusCharacters
        focus="GEN"
        characters={['Гарри']}
        suggestions={[]}
        suggestionsLoading={false}
        onFocusChange={() => {}}
        onCharactersChange={() => {}}
        onNext={() => {}}
      />,
    );
    const next = screen.getByRole('button', { name: /дальше/i });
    expect((next as HTMLButtonElement).disabled).toBe(false);
  });
});
