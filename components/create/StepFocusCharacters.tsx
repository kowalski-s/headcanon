'use client';

import { ChipGroup } from '@/components/ui/ChipGroup';
import { TagInput } from '@/components/ui/TagInput';
import { FOCUS_LABELS, FOCUS_DESCRIPTIONS } from '@/lib/create/locale';
import type { FocusType } from '@prisma/client';

export interface CharacterSuggestion {
  names: string[];
  label_ru: string;
  popularity: number;
  avatar_prompt?: string;
  rarity: 'top' | 'rare';
  focus_compatible: Array<'romance' | 'gen' | 'character_study' | 'friendship'>;
}

interface StepFocusCharactersProps {
  focus: FocusType | null;
  characters: string[];
  suggestions: CharacterSuggestion[];
  suggestionsLoading: boolean;
  onFocusChange: (f: FocusType) => void;
  onCharactersChange: (next: string[]) => void;
  onNext: () => void;
}

const FOCUS_OPTIONS: Array<{ value: FocusType; label: string; description: string }> = (
  ['ROMANCE', 'GEN', 'CHARACTER_STUDY', 'FRIENDSHIP'] as FocusType[]
).map((f) => ({ value: f, label: FOCUS_LABELS[f], description: FOCUS_DESCRIPTIONS[f] }));

function minCharactersFor(focus: FocusType): number {
  if (focus === 'CHARACTER_STUDY') return 1;
  if (focus === 'ROMANCE' || focus === 'FRIENDSHIP') return 2;
  return 1;
}

function placeholderFor(focus: FocusType): string {
  if (focus === 'ROMANCE') return '+ свой пейринг (например, «Снейп × Гермиона»)';
  if (focus === 'CHARACTER_STUDY') return '+ свой герой';
  return '+ свой герой';
}

export function StepFocusCharacters({
  focus,
  characters,
  suggestions,
  suggestionsLoading,
  onFocusChange,
  onCharactersChange,
  onNext,
}: StepFocusCharactersProps) {
  const canNext = focus !== null && characters.length >= minCharactersFor(focus);
  const maxChars = focus === 'CHARACTER_STUDY' ? 1 : 6;

  const addFromSuggestion = (s: CharacterSuggestion) => {
    if (focus === 'CHARACTER_STUDY') {
      onCharactersChange([s.names[0]]);
    } else {
      const merged = Array.from(new Set([...characters, ...s.names])).slice(0, maxChars);
      onCharactersChange(merged);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[34px] lg:text-[64px] leading-[1.05] lg:leading-[0.95] tracking-tight text-balance">
          <span className="italic text-amber">фокус</span> истории<span className="text-amber">.</span>
        </h1>
        <p className="mt-3 max-w-[48ch] font-body text-body-s lg:text-body-l italic text-ink-dim">
          С чего строим сюжет — пейринг, приключение, один герой или дружба.
        </p>
      </div>

      <ChipGroup
        options={FOCUS_OPTIONS}
        value={focus}
        onChange={onFocusChange}
        testIdPrefix="step-focus"
      />

      {focus && (
        <div className="flex flex-col gap-4">
          <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
            ✦ {focus === 'ROMANCE' ? 'пейринг' : focus === 'CHARACTER_STUDY' ? 'главный герой' : 'главные герои'}
          </div>

          {suggestionsLoading && (
            <div className="font-mono text-mono-s tracking-caps uppercase text-ink-dim animate-pulse">
              загружаем подсказки...
            </div>
          )}

          {!suggestionsLoading && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  type="button"
                  key={s.label_ru}
                  data-testid="character-suggestion"
                  onClick={() => addFromSuggestion(s)}
                  className="rounded-full border border-ink-faint/30 px-3 py-1.5 font-mono text-mono-s tracking-caps text-ink-dim uppercase hover:border-amber/50 hover:text-amber transition-colors"
                >
                  {s.rarity === 'top' ? '★ ' : ''}
                  {s.label_ru}
                </button>
              ))}
            </div>
          )}

          <TagInput
            values={characters}
            onChange={onCharactersChange}
            placeholder={placeholderFor(focus)}
            max={maxChars}
            testIdPrefix="character"
          />
        </div>
      )}

      <div className="pt-2">
        <button
          type="button"
          data-testid="step-next"
          onClick={onNext}
          disabled={!canNext}
          className="rounded-full bg-amber px-7 py-3 font-mono text-mono-m tracking-caps uppercase text-bg-deep shadow-amber-glow disabled:opacity-40 disabled:cursor-not-allowed"
        >
          дальше · тропы ›
        </button>
      </div>
    </div>
  );
}
