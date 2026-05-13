'use client';

import { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  max?: number;
  testIdPrefix?: string;
}

export function TagInput({ values, onChange, placeholder, max, testIdPrefix }: TagInputProps) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) return;
    if (max !== undefined && values.length >= max) return;
    onChange([...values, trimmed]);
    setDraft('');
  };
  const remove = (v: string) => {
    onChange(values.filter((x) => x !== v));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && draft === '' && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-ink-faint/25 bg-surface-raised px-2 py-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber-soft px-2 py-0.5 font-mono text-mono-s tracking-caps text-amber uppercase"
            data-testid={testIdPrefix ? `${testIdPrefix}-chip` : undefined}
          >
            {v}
            <button
              type="button"
              aria-label={`remove ${v}`}
              onClick={() => remove(v)}
              className="text-amber/70 hover:text-amber"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={add}
          placeholder={placeholder}
          className="flex-1 min-w-[120px] bg-transparent font-body text-body-s italic text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>
    </div>
  );
}
