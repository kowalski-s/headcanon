export function QuotaModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-deep/80">
      <div className="max-w-sm rounded-2xl bg-surface-raised p-6 text-center">
        <h2 className="font-display text-3xl">лимит на сегодня</h2>
        <p className="mt-3 font-body text-body italic text-ink-dim">
          бесплатно — 3 истории в день. подписка снимает потолок.
        </p>
        <button
          onClick={onClose}
          className="mt-5 rounded-full bg-amber px-5 py-2 font-mono text-mono-s tracking-caps uppercase text-bg-deep"
        >
          понятно
        </button>
      </div>
    </div>
  );
}
