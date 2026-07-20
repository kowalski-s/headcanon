import { nightsWord } from '@/lib/write/momentum';

const ruNum = (n: number) => n.toLocaleString('ru-RU').replace(/\s/g, '\u00A0');

// Инлайновый амберный спарклайн-столбики (по канве 05) — никаких chart-библиотек.
function Sparkline({ values }: { values: number[] }) {
  const w = 200;
  const h = 38;
  if (values.length === 0) return <svg width="100%" height={h} aria-hidden className="block" />;
  const max = Math.max(...values, 1);
  const gap = 3;
  const barW = (w - gap * (values.length - 1)) / values.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} aria-hidden className="block">
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

export type MomentumSeries = {
  title: string;
  chapters: number;
  targetChapters: number;
};

/**
 * Панель «ритм письма» (канва 05, правая колонка PvDeskDesktop) — тихая приборная
 * панель писателя: стрик, спарклайн слов за 14 ночей, прогресс серии до финала.
 * Не геймификация-слот — mono-цифры, амбер-хэйрлайны (DESIGN-writer §1).
 */
export function MomentumPanel({
  streak,
  sparkline,
  goal = 1500,
  series,
}: {
  streak: number;
  sparkline: number[];
  goal?: number;
  series?: MomentumSeries | null;
}) {
  const total = sparkline.reduce((a, b) => a + b, 0);
  const average = sparkline.length ? Math.round(total / sparkline.length) : 0;
  const pct = series
    ? Math.min(100, Math.round((series.chapters / Math.max(series.targetChapters, 1)) * 100))
    : 0;

  return (
    // self-start: панель не растягивается на высоту полки; sticky держит её на виду
    <aside className="space-y-2.5 self-start lg:sticky lg:top-10">
      <h2 className="mb-3 font-display text-lg italic text-ink">◷ ритм письма</h2>

      {/* стрик */}
      {streak > 0 && (
        <div className="rounded-xl border border-amber/30 bg-[linear-gradient(150deg,var(--hc-amber-soft),transparent_70%)] px-4 py-3.5">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl leading-none text-amber">{streak}</span>
            <span className="font-display text-[15px] italic text-ink">
              {nightsWord(streak)} письма подряд
            </span>
          </div>
          <p className="mt-1.5 font-mono text-[8px] tracking-wide text-ink-faint">не рви цепочку</p>
        </div>
      )}

      {/* слова за 14 ночей */}
      <div className="rounded-xl border border-border bg-surface-solid px-4 py-3.5">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[9px] tracking-wide text-ink-dim">слов за 14 ночей</span>
          <span className="font-mono text-[9px] tracking-wide text-amber">{ruNum(total)}</span>
        </div>
        <div className="mt-2.5">
          <Sparkline values={sparkline} />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-mono text-[8px] tracking-wide text-ink-faint">
            цель {ruNum(goal)}/ночь
          </span>
          <span className="font-mono text-[8px] tracking-wide text-ink-faint">
            в среднем {ruNum(average)}
          </span>
        </div>
      </div>

      {/* прогресс серии до финала */}
      {series && (
        <div className="rounded-xl border border-border bg-surface-solid px-4 py-3.5">
          <p className="font-mono text-[9px] tracking-wide text-ink-dim">
            «{series.title}» — до финала
          </p>
          <div className="my-1.5 flex items-baseline gap-1.5">
            <span className="font-display text-xl text-ink">{series.chapters}</span>
            <span className="font-mono text-[9px] tracking-wide text-ink-faint">
              из ~{series.targetChapters} глав
            </span>
          </div>
          <div className="h-[5px] overflow-hidden rounded-[3px] bg-black/30">
            <div
              className="h-full rounded-[3px] bg-[linear-gradient(90deg,var(--hc-amber),var(--hc-rose))]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
