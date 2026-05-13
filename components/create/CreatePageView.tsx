'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import type { FocusType } from '@prisma/client';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { MultiChipGroup } from '@/components/ui/MultiChipGroup';
import { TagInput } from '@/components/ui/TagInput';
import { SenseiTip } from '@/components/create/SenseiTip';
import {
  StepFocusCharacters,
  type CharacterSuggestion,
} from '@/components/create/StepFocusCharacters';
import { StepDetails, type StepDetailsValue, type GenreSuggestion } from '@/components/create/StepDetails';
import { QuotaModal } from '@/components/quota/QuotaModal';
import { FANDOMS, type FandomOption } from '@/lib/create/fandoms';
import { apiFetch } from '@/lib/api/client';
import { TONE_LABELS, RATING_LABELS, CATEGORY_LABELS, POV_LABELS, TIMELINE_LABELS } from '@/lib/create/locale';
import { track } from '@/lib/track';

interface TropeSuggestion {
  slug: string;
  label_ru: string;
  description_ru: string;
  popularity: number;
}

const STEPS = ['fandom', 'focus', 'tropes', 'details', 'preview'] as const;
type Step = 1 | 2 | 3 | 4 | 5;

export function CreatePageView() {
  const router = useRouter();

  // Draft
  const [draftId, setDraftId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [isInitializing, setIsInitializing] = useState(true);

  // Step 1
  const [selectedFandom, setSelectedFandom] = useState<FandomOption | null>(null);

  // Step 2
  const [focus, setFocus] = useState<FocusType | null>(null);
  const [characters, setCharacters] = useState<string[]>([]);
  const [characterSuggestions, setCharacterSuggestions] = useState<CharacterSuggestion[]>([]);
  const [characterSuggestionsLoading, setCharacterSuggestionsLoading] = useState(false);

  // Step 3
  const [tropes, setTropes] = useState<string[]>([]);
  const [tropeSuggestions, setTropeSuggestions] = useState<TropeSuggestion[]>([]);
  const [tropeSuggestionsLoading, setTropeSuggestionsLoading] = useState(false);
  const [senseiTip, setSenseiTip] = useState('');

  // Step 4
  const [details, setDetails] = useState<StepDetailsValue>({
    rating: null, category: null, warnings: [],
    pov: null, tense: null, tones: [],
    timeline: null, timelineNote: null, genres: [], setting: null,
    premise: null,
  });
  const [genreSuggestions, setGenreSuggestions] = useState<GenreSuggestion[]>([]);
  const [genreSuggestionsLoading, setGenreSuggestionsLoading] = useState(false);

  // UI
  const [isStarting, setIsStarting] = useState(false);
  const [showQuota, setShowQuota] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Debounce ref for PATCHes
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    async function createDraft() {
      try {
        const res = await apiFetch('/api/create/draft', { method: 'POST' });
        if (!res.ok) throw new Error('failed to create draft');
        const data = await res.json();
        setDraftId(data.id);
      } catch {
        setErrorMsg('не удалось создать черновик. перезагрузи страницу.');
      } finally {
        setIsInitializing(false);
      }
    }
    void createDraft();
  }, []);

  const patchDraft = useCallback(
    async (body: Record<string, unknown>) => {
      if (!draftId) return;
      try {
        await apiFetch(`/api/create/draft/${draftId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
      } catch {
        // silent autosave failure
      }
    },
    [draftId],
  );

  const debouncedPatch = useCallback(
    (body: Record<string, unknown>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => void patchDraft(body), 500);
    },
    [patchDraft],
  );

  // Step 1 → 2: pick fandom
  const pickFandom = useCallback(
    async (fandom: FandomOption) => {
      setSelectedFandom(fandom);
      setStep(2);
      await patchDraft({ fandomId: fandom.id, step: 2 });
    },
    [patchDraft],
  );

  // Step 2: pick focus → fetch character suggestions
  const handleFocusChange = useCallback(
    async (next: FocusType) => {
      setFocus(next);
      setCharacters([]);
      setCharacterSuggestionsLoading(true);
      track('create_focus_selected', { focus_type: next });
      await patchDraft({ focusType: next, characters: [] });
      if (!selectedFandom) return;
      try {
        const res = await apiFetch(
          `/api/create/suggestions/characters?fandomId=${encodeURIComponent(selectedFandom.id)}&focus=${next}`,
        );
        if (!res.ok) throw new Error('characters fetch failed');
        const data = await res.json();
        setCharacterSuggestions(data.suggestions ?? []);
      } catch {
        setErrorMsg('не удалось загрузить подсказки');
      } finally {
        setCharacterSuggestionsLoading(false);
      }
    },
    [patchDraft, selectedFandom],
  );

  const handleCharactersChange = useCallback(
    (next: string[]) => {
      setCharacters(next);
      debouncedPatch({ characters: next });
    },
    [debouncedPatch],
  );

  const confirmFocusCharacters = useCallback(async () => {
    setStep(3);
    setTropeSuggestionsLoading(true);
    await patchDraft({ step: 3 });
    if (!selectedFandom || !focus) return;
    try {
      const res = await apiFetch(
        `/api/create/suggestions/tropes?fandomId=${encodeURIComponent(selectedFandom.id)}&focus=${focus}&characters=${encodeURIComponent(characters.join(','))}`,
      );
      if (!res.ok) throw new Error('tropes fetch failed');
      const data = await res.json();
      setTropeSuggestions(data.tropes ?? []);
      setSenseiTip(data.sensei_tip ?? '');
    } catch {
      setErrorMsg('не удалось загрузить тропы');
    } finally {
      setTropeSuggestionsLoading(false);
    }
  }, [patchDraft, selectedFandom, focus, characters]);

  // Step 3
  const handleTropesChange = useCallback(
    (next: string[]) => {
      if (next.length > tropes.length) {
        const added = next.find((t) => !tropes.includes(t));
        const source = tropeSuggestions.some((s) => s.label_ru === added) ? 'suggestion' : 'custom';
        track('create_trope_added', { source });
      }
      setTropes(next);
      debouncedPatch({ tropes: next });
    },
    [debouncedPatch, tropes, tropeSuggestions],
  );

  const confirmTropes = useCallback(async () => {
    if (tropes.length === 0) return;
    setStep(4);
    setGenreSuggestionsLoading(true);
    await patchDraft({ tropes, step: 4 });
    if (!selectedFandom || !focus) return;
    try {
      const res = await apiFetch(
        `/api/create/suggestions/genres?fandomId=${encodeURIComponent(selectedFandom.id)}&focus=${focus}`,
      );
      if (!res.ok) throw new Error('genres fetch failed');
      const data = await res.json();
      setGenreSuggestions(data.genres ?? []);
    } catch {
      // non-blocking
    } finally {
      setGenreSuggestionsLoading(false);
    }
  }, [patchDraft, tropes, selectedFandom, focus]);

  // Step 4
  const handleDetailsChange = useCallback(
    (patch: Partial<StepDetailsValue>) => {
      setDetails((prev) => ({ ...prev, ...patch }));
      debouncedPatch(patch);
    },
    [debouncedPatch],
  );

  const confirmDetails = useCallback(async () => {
    setStep(5);
    await patchDraft({ step: 5 });
  }, [patchDraft]);

  // Step 5
  const startStory = useCallback(async () => {
    if (!draftId) return;
    setIsStarting(true);
    setErrorMsg('');
    const advancedFieldsFilled = countDetailsFilled(details);
    try {
      const res = await apiFetch(`/api/create/draft/${draftId}/start`, { method: 'POST' });
      if (res.status === 429) {
        setShowQuota(true);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? 'ошибка старта');
        return;
      }
      const { storyId } = await res.json();
      if (focus) {
        track('create_advanced_skipped', { fields_filled: advancedFieldsFilled });
        track('create_finished', {
          took_total_ms: Date.now() - startedAtRef.current,
          focus_type: focus,
          advanced_fields_filled: advancedFieldsFilled,
        });
      }
      router.push(`/reader/${storyId}/1` as Route);
    } catch {
      setErrorMsg('не удалось начать историю. попробуй ещё раз.');
    } finally {
      setIsStarting(false);
    }
  }, [draftId, router, details, focus]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const stepLabel = STEPS[step - 1];
  const stepPadded = String(step).padStart(2, '0');
  const totalSteps = STEPS.length;
  const progressPercent = (step / totalSteps) * 100;

  // ── Render helpers ───────────────────────────────────────────────────────────

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-ink">
        <span className="font-mono text-mono-s tracking-caps uppercase text-ink-dim animate-pulse">
          создаём черновик...
        </span>
      </div>
    );
  }

  // ── Step content ─────────────────────────────────────────────────────────────

  function renderStepContent() {
    switch (step) {
      case 1:
        return <StepFandom onPick={pickFandom} />;
      case 2:
        return (
          <StepFocusCharacters
            focus={focus}
            characters={characters}
            suggestions={characterSuggestions}
            suggestionsLoading={characterSuggestionsLoading}
            onFocusChange={handleFocusChange}
            onCharactersChange={handleCharactersChange}
            onNext={confirmFocusCharacters}
          />
        );
      case 3:
        return (
          <StepTropes
            suggestions={tropeSuggestions}
            loading={tropeSuggestionsLoading}
            selected={tropes}
            senseiTip={senseiTip}
            onChange={handleTropesChange}
            onNext={confirmTropes}
          />
        );
      case 4:
        return (
          <StepDetails
            value={details}
            onChange={handleDetailsChange}
            genreSuggestions={genreSuggestions}
            genreSuggestionsLoading={genreSuggestionsLoading}
            onNext={confirmDetails}
          />
        );
      case 5:
        return (
          <StepPreview
            fandom={selectedFandom}
            focus={focus}
            characters={characters}
            tropes={tropes}
            details={details}
            isStarting={isStarting}
            onStart={startStory}
          />
        );
    }
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      {showQuota && <QuotaModal onClose={() => setShowQuota(false)} />}

      {/* Mobile shell */}
      <div className="lg:hidden flex min-h-screen flex-col pb-28">
        <header className="flex items-center justify-between gap-3 px-4 py-3">
          <Link href={'/' as Route} aria-label="back" className="font-mono text-base text-ink-dim">
            ←
          </Link>
          <span className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
            {stepLabel} · этап {step} / {totalSteps}
          </span>
          <span className="font-mono text-mono-s tracking-caps text-ink-faint uppercase italic">
            {draftId ? 'draft saved' : ''}
          </span>
        </header>

        {/* Progress bar */}
        <div className="h-0.5 w-full bg-ink-faint/20">
          <div
            className="h-full bg-amber transition-[width] duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="px-4 pt-4">
          <span className="font-mono text-mono-s tracking-caps text-amber uppercase">
            ← step {stepPadded} — {stepLabel}
          </span>
        </div>

        {errorMsg && (
          <div className="mx-4 mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 font-body text-body-s text-red-400">
            {errorMsg}
          </div>
        )}

        <div className="flex-1 px-4 pt-3">{renderStepContent()}</div>
      </div>

      {/* Desktop shell */}
      <div className="hidden lg:flex min-h-screen flex-col">
        <FeedHeader />

        {/* Step header strip */}
        <div className="flex items-center justify-between border-b border-ink-faint/10 px-10 py-4">
          <span className="font-mono text-mono-s tracking-caps text-amber uppercase">
            ✦ step {stepPadded} - {stepLabel}
          </span>
          <div className="flex flex-1 items-center gap-3 px-10">
            <div className="h-0.5 flex-1 bg-ink-faint/20">
              <div
                className="h-full bg-amber transition-[width] duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
              stage {stepPadded} · {Math.round(progressPercent)}%
            </span>
          </div>
          <span className="font-mono text-mono-s tracking-caps text-ink-faint uppercase italic">
            {draftId ? 'draft saved' : ''}
          </span>
        </div>

        {errorMsg && (
          <div className="mx-10 mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 font-body text-body-s text-red-400">
            {errorMsg}
          </div>
        )}

        <div className="flex-1 px-10 pt-8 pb-12">{renderStepContent()}</div>
      </div>
    </div>
  );
}

// ── Step sub-components ───────────────────────────────────────────────────────

function StepFandom({ onPick }: { onPick: (f: FandomOption) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[34px] lg:text-[64px] leading-[1.05] lg:leading-[0.95] tracking-tight text-balance">
          Выбираем <span className="italic text-amber">фандом</span>
          <span className="text-amber">.</span>
        </h1>
        <p className="mt-3 max-w-[48ch] font-body text-body-s lg:text-body-l italic text-ink-dim">
          С чего начинаем? Выбери вселенную — остальное подберём вместе.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {FANDOMS.map((f) => (
          <button
            type="button"
            key={f.id}
            data-testid={`step-fandom-${f.slug}`}
            onClick={() => onPick(f)}
            className="group relative flex flex-col items-center justify-center rounded-md border border-ink-faint/25 bg-surface-raised p-5 transition-colors hover:border-amber/50 hover:bg-amber-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
          >
            <span className="font-display text-2xl italic text-amber group-hover:text-amber">
              {f.label}
            </span>
            <span className="mt-1 font-mono text-mono-s tracking-caps text-ink-dim uppercase">
              {f.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepTropes({
  suggestions, loading, selected, senseiTip, onChange, onNext,
}: {
  suggestions: TropeSuggestion[];
  loading: boolean;
  selected: string[];
  senseiTip: string;
  onChange: (next: string[]) => void;
  onNext: () => void;
}) {
  const suggestionOptions = suggestions.map((t) => ({ value: t.label_ru, label: t.label_ru, description: t.description_ru }));
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[34px] lg:text-[64px] leading-[1.05] lg:leading-[0.95] tracking-tight text-balance">
          выбираем <span className="italic text-amber">тропы</span><span className="text-amber">.</span>
        </h1>
        <p className="mt-3 max-w-[48ch] font-body text-body-s lg:text-body-l italic text-ink-dim">
          тропы — сердце сюжета. минимум один.
        </p>
      </div>

      {loading && (
        <div className="font-mono text-mono-s tracking-caps uppercase text-ink-dim animate-pulse">
          загружаем тропы...
        </div>
      )}

      {!loading && (
        <>
          <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
            ✦ {selected.length} выбрано
          </div>

          <MultiChipGroup
            options={suggestionOptions}
            values={selected}
            onChange={onChange}
            max={5}
            testIdPrefix="trope"
          />

          <TagInput
            values={selected.filter((s) => !suggestions.some((sug) => sug.label_ru === s))}
            onChange={(custom) => {
              const fromSuggestions = selected.filter((s) => suggestions.some((sug) => sug.label_ru === s));
              onChange([...fromSuggestions, ...custom]);
            }}
            placeholder="+ свой троп"
            max={5}
            testIdPrefix="custom-trope"
          />

          {senseiTip && (
            <div className="pt-4">
              <SenseiTip>{senseiTip}</SenseiTip>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              data-testid="step-next"
              onClick={onNext}
              disabled={selected.length === 0}
              className="rounded-full bg-amber px-7 py-3 font-mono text-mono-m tracking-caps uppercase text-bg-deep shadow-amber-glow disabled:opacity-40 disabled:cursor-not-allowed"
            >
              дальше · детали ›
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StepPreview({
  fandom, focus, characters, tropes, details, isStarting, onStart,
}: {
  fandom: FandomOption | null;
  focus: FocusType | null;
  characters: string[];
  tropes: string[];
  details: StepDetailsValue;
  isStarting: boolean;
  onStart: () => void;
}) {
  const placeholder = <span className="font-body text-body-s italic text-ink-faint">AI решит</span>;
  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="font-display text-[34px] lg:text-[64px] leading-[1.05] lg:leading-[0.95] tracking-tight text-balance">
          всё <span className="italic text-amber">готово</span><span className="text-amber">.</span>
        </h1>
        <p className="mt-3 font-body text-body-s lg:text-body-l italic text-ink-dim">
          проверь — и нажмём старт.
        </p>
      </div>

      <div className="rounded-md border border-ink-faint/20 bg-surface-raised p-5 flex flex-col gap-4">
        {fandom && <SummaryRow label="фандом" value={fandom.name} />}
        {focus && <SummaryRow label="фокус" value={focus.toLowerCase().replace('_', ' ')} />}
        {characters.length > 0 && <SummaryRow label="герои" value={characters.join(' × ')} />}
        {tropes.length > 0 && (
          <div>
            <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">тропы</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {tropes.map((t) => (
                <span key={t} className="rounded-full border border-amber/30 bg-amber-soft px-2 py-0.5 font-mono text-mono-s tracking-caps text-amber uppercase">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
        <SummaryRow label="рейтинг" value={details.rating ? RATING_LABELS[details.rating] : null} fallback={placeholder} />
        <SummaryRow label="категория" value={details.category ? CATEGORY_LABELS[details.category] : null} fallback={placeholder} />
        <SummaryRow label="POV" value={details.pov ? POV_LABELS[details.pov] : null} fallback={placeholder} />
        {details.tones.length > 0 && (
          <SummaryRow label="тон" value={details.tones.map((t) => TONE_LABELS[t]).join(', ')} />
        )}
        {details.timeline && (
          <SummaryRow label="когда" value={TIMELINE_LABELS[details.timeline] + (details.timelineNote ? ` — ${details.timelineNote}` : '')} />
        )}
        {details.genres.length > 0 && <SummaryRow label="жанр / AU" value={details.genres.join(', ')} />}
        {details.setting && <SummaryRow label="место" value={details.setting} />}
        {details.premise && <SummaryRow label="завязка" value={details.premise} />}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-faint/20 bg-bg/95 p-3 backdrop-blur lg:static lg:border-none lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <button
          type="button"
          data-testid="step-start"
          onClick={onStart}
          disabled={isStarting}
          className="block w-full lg:w-auto rounded-full bg-amber py-3.5 lg:py-3 lg:px-10 text-center font-mono text-mono-s tracking-caps uppercase text-bg-deep shadow-amber-glow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isStarting ? 'создаём историю...' : 'начать историю ›'}
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, fallback }: { label: string; value: string | null; fallback?: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">{label}</div>
      <div className="mt-1 font-display italic text-xl text-ink">{value ?? fallback ?? null}</div>
    </div>
  );
}

function countDetailsFilled(d: StepDetailsValue): number {
  let n = 0;
  if (d.rating) n++;
  if (d.category) n++;
  if (d.warnings.length) n++;
  if (d.pov) n++;
  if (d.tense) n++;
  if (d.tones.length) n++;
  if (d.timeline) n++;
  if (d.timelineNote) n++;
  if (d.genres.length) n++;
  if (d.setting) n++;
  if (d.premise) n++;
  return n;
}
