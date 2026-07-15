import { MonoBadge } from '@/components/ui/MonoBadge';
import { Pill } from '@/components/ui/Pill';
import { nightsWord } from '@/lib/write/momentum';

// Инлайновый амберный спарклайн-столбики (по канве 05) — никаких chart-библиотек.
function Sparkline({ values }: { values: number[] }) {
  const w = 140;
  const h = 36;
  if (values.length === 0) return <svg width={w} height={h} aria-hidden className="block" />;
  const max = Math.max(...values, 1);
  const gap = 3;
  const barW = (w - gap * (values.length - 1)) / values.length;
  return (
    <svg width={w} height={h} aria-hidden className="block">
      {values.map((v, i) => {
        // Пустые ночи — низкие «пеньки», как в прототипе; текущая ночь — ярче.
        const barH = Math.max((v / max) * (h - 4), 2);
        return (
          <rect
            key={i}
            x={i * (barW + gap)}
            y={h - barH}
            width={barW}
            height={barH}
            rx={1}
            fill="var(--hc-amber)"
            opacity={i === values.length - 1 ? 1 : 0.45}
          />
        );
      })}
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
    // self-start: в гриде стола панель не растягивается на высоту полки; sticky держит её на виду
    <aside className="space-y-4 self-start rounded-lg border border-border bg-surface-solid p-5 lg:sticky lg:top-10">
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
