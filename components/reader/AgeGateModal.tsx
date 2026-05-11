'use client';

interface Props {
  onConfirm: () => void;
  onClose: () => void;
}

export function AgeGateModal({ onConfirm, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-deep/85" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-w-sm rounded-2xl bg-surface-raised p-6">
        <h2 className="font-display text-2xl text-ink">тебе 18+?</h2>
        <p className="mt-3 font-body italic text-body text-ink-dim">
          для контента с пометкой M/E нужно подтвердить возраст. это одноразовый шаг.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-ink-faint/30 px-4 py-2 font-mono text-mono-s uppercase tracking-caps text-ink-dim"
          >
            нет
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-full bg-amber px-4 py-2 font-mono text-mono-s uppercase tracking-caps text-bg-deep"
          >
            да, мне 18+
          </button>
        </div>
      </div>
    </div>
  );
}
