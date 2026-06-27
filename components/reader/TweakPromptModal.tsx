'use client';
import { useState } from 'react';

interface Props {
  onSubmit: (hint: string) => void;
  onClose: () => void;
}

export function TweakPromptModal({ onSubmit, onClose }: Props) {
  const [hint, setHint] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-deep/85"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-md rounded-2xl bg-surface-raised p-6"
      >
        <h2 className="font-display text-2xl text-ink">подкрутить главу</h2>
        <p className="mt-2 font-body italic text-body text-ink-dim">
          один абзац или общая правка — модель пере-сгенерит главу с учётом подсказки.
        </p>
        <textarea
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="например: больше внутреннего монолога Драко"
          className="mt-4 w-full rounded-lg bg-bg-deep p-3 font-body italic text-body text-ink"
        />
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ink-faint/30 px-4 py-2 font-mono text-mono-s uppercase tracking-caps text-ink-dim"
          >
            отмена
          </button>
          <button
            type="button"
            onClick={() => onSubmit(hint)}
            disabled={!hint.trim()}
            className="rounded-full bg-amber px-4 py-2 font-mono text-mono-s uppercase tracking-caps text-bg-deep disabled:opacity-50"
          >
            пере-сгенерить
          </button>
        </div>
      </div>
    </div>
  );
}
