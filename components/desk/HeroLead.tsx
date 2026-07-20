import { Pill } from '@/components/ui/Pill';

// Название истории в лиде приходит в «ёлочках» — подсвечиваем его амбером,
// как <em> в канве 05 (PvDeskDesktop). Свободный текст не парсим regex-ом ради
// логики — это чисто презентационное выделение уже готовой строки.
function renderLead(lead: string) {
  const m = lead.match(/^(.*?)(«[^»]*»)(.*)$/);
  if (!m) return lead;
  return (
    <>
      {m[1]}
      <em className="not-italic text-amber">{m[2]}</em>
      {m[3]}
    </>
  );
}

/**
 * Hero-лид над полкой (канва 05, PvDeskDesktop) — крупная momentum-подводка:
 * атмосферный mono-кикер, Bodoni-строка «N ночей назад ты оставила „…“» и
 * CTA «продолжить гл. N». Тон — тихий соавтор, а не геймификация.
 */
export function HeroLead({
  kicker,
  lead,
  continueHref,
  continueLabel,
}: {
  kicker?: string;
  lead: string;
  continueHref: string | null;
  continueLabel: string | null;
}) {
  return (
    <section className="mb-8 max-w-2xl">
      {kicker && <p className="font-mono text-[9px] tracking-wide text-ink-faint">{kicker}</p>}
      <p className="mt-2 font-display text-3xl font-medium leading-[1.05] text-balance text-ink sm:text-[33px]">
        {renderLead(lead)}
      </p>
      {continueHref && continueLabel && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Pill variant="primary" href={continueHref}>
            {continueLabel} →
          </Pill>
          <span className="font-mono text-[9px] tracking-wide text-ink-faint">
            откроется там, где ты остановилась
          </span>
        </div>
      )}
    </section>
  );
}
