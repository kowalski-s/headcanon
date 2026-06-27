'use client';

import type { Rating, Category, Pov, Tense, Tone } from '@prisma/client';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { MultiChipGroup } from '@/components/ui/MultiChipGroup';
import { TagInput } from '@/components/ui/TagInput';
import { AccordionSection } from '@/components/ui/AccordionSection';
import { track } from '@/lib/track';
import {
  RATING_LABELS,
  CATEGORY_LABELS,
  POV_LABELS,
  TENSE_LABELS,
  TONE_LABELS,
  WARNING_LABELS,
  WARNING_KEYS,
  TIMELINE_LABELS,
  TIMELINE_KEYS,
  type WarningKey,
  type TimelineKey,
} from '@/lib/create/locale';

export interface StepDetailsValue {
  rating: Rating | null;
  category: Category | null;
  warnings: WarningKey[];
  pov: Pov | null;
  tense: Tense | null;
  tones: Tone[];
  timeline: TimelineKey | null;
  timelineNote: string | null;
  genres: string[];
  setting: string | null;
  premise: string | null;
}

export interface GenreSuggestion {
  slug: string;
  label_ru: string;
  popularity: number;
}

interface StepDetailsProps {
  value: StepDetailsValue;
  onChange: (patch: Partial<StepDetailsValue>) => void;
  genreSuggestions: GenreSuggestion[];
  genreSuggestionsLoading: boolean;
  onNext: () => void;
}

const RATING_OPTS = (['GENERAL', 'TEEN', 'MATURE', 'EXPLICIT'] as Rating[]).map((r) => ({
  value: r,
  label: RATING_LABELS[r],
}));
const CATEGORY_OPTS = (['SLASH', 'FEMSLASH', 'HET', 'GEN', 'MULTI'] as Category[]).map((c) => ({
  value: c,
  label: CATEGORY_LABELS[c],
}));
const POV_OPTS = (['FIRST', 'CLOSE_THIRD', 'OMNISCIENT'] as Pov[]).map((p) => ({
  value: p,
  label: POV_LABELS[p],
}));
const TENSE_OPTS = (['PAST', 'PRESENT'] as Tense[]).map((t) => ({
  value: t,
  label: TENSE_LABELS[t],
}));
const TONE_OPTS = (
  ['SLOW_BURN', 'SPICY', 'FLUFF', 'ANGST', 'HURT_COMFORT', 'CRACK', 'DARK'] as Tone[]
).map((t) => ({
  value: t,
  label: TONE_LABELS[t],
}));
const WARNING_OPTS = WARNING_KEYS.map((k) => ({ value: k, label: WARNING_LABELS[k] }));
const TIMELINE_OPTS = TIMELINE_KEYS.map((k) => ({ value: k, label: TIMELINE_LABELS[k] }));

export function StepDetails({
  value,
  onChange,
  genreSuggestions,
  genreSuggestionsLoading,
  onNext,
}: StepDetailsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[34px] lg:text-[64px] leading-[1.05] lg:leading-[0.95] tracking-tight text-balance">
          <span className="italic text-amber">детали</span>
          <span className="text-amber">.</span>
        </h1>
        <p className="mt-3 max-w-[48ch] font-body text-body-s lg:text-body-l italic text-ink-dim">
          всё опционально — пропусти, и AI заполнит сам.
        </p>
      </div>

      <div className="flex flex-col">
        <AccordionSection
          title="маркировка"
          subtitle="рейтинг · категория · предупреждения"
          onToggle={(open) => open && track('create_section_expanded', { section: 'marking' })}
        >
          <div className="flex flex-col gap-4">
            <Field label="рейтинг">
              <ChipGroup
                options={RATING_OPTS}
                value={value.rating}
                onChange={(v) => onChange({ rating: v })}
                testIdPrefix="detail-rating"
              />
            </Field>
            <Field label="категория">
              <ChipGroup
                options={CATEGORY_OPTS}
                value={value.category}
                onChange={(v) => onChange({ category: v })}
                testIdPrefix="detail-category"
              />
            </Field>
            <Field label="предупреждения">
              <MultiChipGroup
                options={WARNING_OPTS}
                values={value.warnings}
                onChange={(v) => onChange({ warnings: v })}
                testIdPrefix="detail-warnings"
              />
            </Field>
          </div>
        </AccordionSection>

        <AccordionSection
          title="голос истории"
          subtitle="POV · время · тон"
          onToggle={(open) => open && track('create_section_expanded', { section: 'voice' })}
        >
          <div className="flex flex-col gap-4">
            <Field label="POV">
              <ChipGroup
                options={POV_OPTS}
                value={value.pov}
                onChange={(v) => onChange({ pov: v })}
                testIdPrefix="detail-pov"
              />
            </Field>
            <Field label="время">
              <ChipGroup
                options={TENSE_OPTS}
                value={value.tense}
                onChange={(v) => onChange({ tense: v })}
                testIdPrefix="detail-tense"
              />
            </Field>
            <Field label="тон">
              <MultiChipGroup
                options={TONE_OPTS}
                values={value.tones}
                onChange={(v) => onChange({ tones: v })}
                testIdPrefix="detail-tones"
              />
            </Field>
          </div>
        </AccordionSection>

        <AccordionSection
          title="вселенная"
          subtitle="канон или AU · жанр · место"
          onToggle={(open) => open && track('create_section_expanded', { section: 'universe' })}
        >
          <div className="flex flex-col gap-4">
            <Field label="когда происходит">
              <ChipGroup
                options={TIMELINE_OPTS}
                value={value.timeline}
                onChange={(v) => onChange({ timeline: v })}
                testIdPrefix="detail-timeline"
              />
              <textarea
                value={value.timelineNote ?? ''}
                onChange={(e) => onChange({ timelineNote: e.target.value || null })}
                rows={2}
                placeholder="уточни (год, эпоха) — опционально"
                className="mt-2 w-full resize-none rounded-md border border-ink-faint/25 bg-surface-raised px-3 py-2 font-body text-body-s italic text-ink placeholder:text-ink-faint focus:border-amber/40 focus:outline-none"
              />
            </Field>
            <Field label="жанр / AU-тип">
              {genreSuggestionsLoading && (
                <div className="font-mono text-mono-s tracking-caps uppercase text-ink-dim animate-pulse">
                  загружаем жанры...
                </div>
              )}
              {!genreSuggestionsLoading && genreSuggestions.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {genreSuggestions.map((g) => (
                    <button
                      type="button"
                      key={g.slug}
                      onClick={() => {
                        if (!value.genres.includes(g.label_ru)) {
                          onChange({ genres: [...value.genres, g.label_ru] });
                        }
                      }}
                      className="rounded-full border border-ink-faint/30 px-3 py-1 font-mono text-mono-s tracking-caps text-ink-dim uppercase hover:border-amber/50 hover:text-amber"
                    >
                      {g.label_ru}
                    </button>
                  ))}
                </div>
              )}
              <TagInput
                values={value.genres}
                onChange={(v) => onChange({ genres: v })}
                placeholder="+ свой жанр / AU"
                max={6}
                testIdPrefix="detail-genres"
              />
            </Field>
            <Field label="место и время">
              <textarea
                value={value.setting ?? ''}
                onChange={(e) => onChange({ setting: e.target.value || null })}
                rows={2}
                placeholder="напр. «Хогвартс, зима», «Лондон, 2042»"
                className="w-full resize-none rounded-md border border-ink-faint/25 bg-surface-raised px-3 py-2 font-body text-body-s italic text-ink placeholder:text-ink-faint focus:border-amber/40 focus:outline-none"
              />
            </Field>
          </div>
        </AccordionSection>

        <AccordionSection
          title="завязка"
          subtitle="с чего начнётся первая глава"
          onToggle={(open) => open && track('create_section_expanded', { section: 'opening' })}
        >
          <textarea
            value={value.premise ?? ''}
            onChange={(e) => onChange({ premise: e.target.value || null })}
            rows={4}
            placeholder="что происходит в начале — фраза, сцена, идея"
            data-testid="detail-premise"
            className="w-full resize-none rounded-md border border-ink-faint/25 bg-surface-raised px-3 py-3 font-body text-body-s italic text-ink placeholder:text-ink-faint focus:border-amber/40 focus:outline-none"
          />
        </AccordionSection>
      </div>

      <div className="pt-2">
        <button
          type="button"
          data-testid="step-next"
          onClick={onNext}
          className="rounded-full bg-amber px-7 py-3 font-mono text-mono-m tracking-caps uppercase text-bg-deep shadow-amber-glow"
        >
          дальше · превью ›
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">{label}</div>
      {children}
    </div>
  );
}
