import { MonoBadge } from '@/components/ui/MonoBadge';
import { Pill } from '@/components/ui/Pill';
import { nightsWord } from '@/lib/write/momentum';

// Инлайновый амберный спарклайн — никаких chart-библиотек (тихий центр).
function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const w = 140;
  const h = 36;
  // Одна точка: step w/(1-1) даёт Infinity и ломает polyline — рисуем точку в начале.
  const step = values.length > 1 ? w / (values.length - 1) : 0;
  const points = values.map((v, i) => `${i * step},${h - (v / max) * (h - 2) - 1}`).join(' ');
  return (
    <svg width={w} height={h} aria-hidden className="block">
      <polyline
        points={points}
        fill="none"
        stroke="var(--hc-amber)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MomentumPanel({
  streak,
  sparkline,
  lead,
  continueHref,
  continueLabel,
}: {
  streak: number;
  sparkline: number[];
  lead: string;
  continueHref: string | null;
  continueLabel: string | null;
}) {
  return (
    <aside className="space-y-4 rounded-lg border border-border bg-surface-solid p-5">
      {streak > 0 && (
        <p className="font-mono text-xs uppercase tracking-caps text-amber">
          {streak} {nightsWord(streak)} подряд
        </p>
      )}
      {lead && <p className="font-display text-display-s italic text-ink">{lead}</p>}
      <div className="space-y-1">
        <MonoBadge>слова · 14 ночей</MonoBadge>
        <Sparkline values={sparkline} />
      </div>
      {continueHref && continueLabel && (
        <Pill variant="primary" href={continueHref}>
          {continueLabel}
        </Pill>
      )}
    </aside>
  );
}
