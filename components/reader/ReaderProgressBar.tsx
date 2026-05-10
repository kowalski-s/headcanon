type Props = { percent: number; pageLabel: string };

export function ReaderProgressBar({ percent, pageLabel }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="sticky top-12 z-20 flex items-center gap-3 bg-bg-deep px-4 py-1">
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-0.5 flex-1 bg-ink-faint/20"
      >
        <div
          className="h-full bg-amber transition-[width]"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="font-mono text-[9px] uppercase tracking-wider text-ink-dim">
        {pageLabel}
      </span>
    </div>
  );
}
