'use client';
import { useEffect, useRef } from 'react';
import type { RegenMode } from '@/lib/prompts/paragraph-regen';

export type ParagraphMenuMode = RegenMode | 'delete';

interface Props {
  open: boolean;
  onClose: () => void;
  onAction: (mode: ParagraphMenuMode) => void;
}

const ITEMS: Array<{ mode: ParagraphMenuMode; label: string }> = [
  { mode: 'regen', label: '▸ переписать' },
  { mode: 'continue', label: '▸ продолжить отсюда' },
  { mode: 'expand', label: '▸ развернуть' },
  { mode: 'compress', label: '▸ сжать' },
  { mode: 'delete', label: '▸ удалить' },
];

export function ParagraphMenu({ open, onClose, onAction }: Props) {
  const mobileRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (mobileRef.current?.contains(t)) return;
      if (desktopRef.current?.contains(t)) return;
      onClose();
    };
    window.addEventListener('mousedown', onMouseDown);
    return () => window.removeEventListener('mousedown', onMouseDown);
  }, [open, onClose]);

  if (!open) return null;

  const handle = (mode: ParagraphMenuMode) => {
    onAction(mode);
    onClose();
  };

  return (
    <>
      <div
        ref={mobileRef}
        className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl bg-surface-raised p-5 shadow-2xl lg:hidden"
      >
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-ink-faint" />
        {ITEMS.map((it) => (
          <button
            key={it.mode}
            type="button"
            data-testid={`paragraph-menu-${it.mode}`}
            onClick={() => handle(it.mode)}
            className="block w-full py-3 text-left font-mono text-mono-s uppercase tracking-caps text-ink"
          >
            {it.label}
          </button>
        ))}
      </div>
      <div
        ref={desktopRef}
        className="absolute right-0 top-full z-40 mt-2 hidden w-56 rounded-xl border border-ink-faint/20 bg-surface-raised p-2 shadow-xl lg:block"
      >
        {ITEMS.map((it) => (
          <button
            key={it.mode}
            type="button"
            data-testid={`paragraph-menu-${it.mode}`}
            onClick={() => handle(it.mode)}
            className="block w-full rounded px-3 py-2 text-left font-mono text-mono-s uppercase tracking-caps text-ink hover:bg-bg-deep"
          >
            {it.label}
          </button>
        ))}
      </div>
    </>
  );
}
