'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { GrainCover } from '@/components/ui/GrainCover';
import { ScotchTag } from '@/components/ui/ScotchTag';
import { BurstSticker } from '@/components/ui/BurstSticker';
import { SenseiTip } from '@/components/create/SenseiTip';
import { QuotaModal } from '@/components/quota/QuotaModal';
import { FANDOMS, type FandomOption } from '@/lib/create/fandoms';
import { apiFetch } from '@/lib/api/client';

// ── Types from API shapes ─────────────────────────────────────────────────────

interface ShipSuggestion {
  names: string[];
  popularity: number;
  avatar_prompt?: string;
  rarity: 'top' | 'rare';
}

interface TropeSuggestion {
  slug: string;
  label: string;
  description: string;
  popularity: number;
}

type ToneOption = 'SLOW_BURN' | 'SPICY' | 'FLUFF' | 'ANGST';

const TONE_LABELS: Record<ToneOption, string> = {
  SLOW_BURN: 'slow burn',
  SPICY: 'spicy',
  FLUFF: 'fluff',
  ANGST: 'angst',
};

const STEPS = ['fandom', 'ship', 'tropes', 'tone', 'preview'] as const;
type Step = 1 | 2 | 3 | 4 | 5;

// ── Component ─────────────────────────────────────────────────────────────────

export function CreatePageView() {
  const router = useRouter();

  // Draft state
  const [draftId, setDraftId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [isInitializing, setIsInitializing] = useState(true);

  // Step data
  const [selectedFandom, setSelectedFandom] = useState<FandomOption | null>(null);
  const [ships, setShips] = useState<ShipSuggestion[]>([]);
  const [shipsLoading, setShipsLoading] = useState(false);
  const [selectedShip, setSelectedShip] = useState<ShipSuggestion | null>(null);
  const [tropes, setTropes] = useState<TropeSuggestion[]>([]);
  const [tropesLoading, setTropesLoading] = useState(false);
  const [senseiTip, setSenseiTip] = useState('');
  const [selectedTropeslugs, setSelectedTropeSlugs] = useState<Set<string>>(new Set());
  const [selectedTone, setSelectedTone] = useState<ToneOption | null>(null);
  const [setting, setSetting] = useState('');

  // UI state
  const [isStarting, setIsStarting] = useState(false);
  const [showQuota, setShowQuota] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Debounce timer ref for trope PATCH
  const tropeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── On mount: create draft ──────────────────────────────────────────────────
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

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const patchDraft = useCallback(
    async (body: Record<string, unknown>) => {
      if (!draftId) return;
      try {
        await apiFetch(`/api/create/draft/${draftId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
      } catch {
        // silent autosave failure — don't block UX
      }
    },
    [draftId],
  );

  // ── Step 1 → 2: pick fandom ─────────────────────────────────────────────────
  const pickFandom = useCallback(
    async (fandom: FandomOption) => {
      setSelectedFandom(fandom);
      setShipsLoading(true);
      setStep(2);
      await patchDraft({ fandomId: fandom.id, step: 2 });

      try {
        const res = await apiFetch(
          `/api/create/suggestions/ships?fandomId=${encodeURIComponent(fandom.id)}`,
        );
        if (!res.ok) throw new Error('ships fetch failed');
        const data = await res.json();
        setShips(data.ships ?? []);
      } catch {
        setErrorMsg('не удалось загрузить пейринги');
      } finally {
        setShipsLoading(false);
      }
    },
    [patchDraft],
  );

  // ── Step 2 → 3: pick ship ───────────────────────────────────────────────────
  const pickShip = useCallback(
    async (ship: ShipSuggestion) => {
      setSelectedShip(ship);
      setTropesLoading(true);
      setStep(3);
      const shipId = ship.names.join(' × ');
      await patchDraft({ shipId, step: 3 });

      if (!selectedFandom) return;
      try {
        const res = await apiFetch(
          `/api/create/suggestions/tropes?fandomId=${encodeURIComponent(selectedFandom.id)}&shipId=${encodeURIComponent(shipId)}`,
        );
        if (!res.ok) throw new Error('tropes fetch failed');
        const data = await res.json();
        setTropes(data.tropes ?? []);
        setSenseiTip(data.sensei_tip ?? '');
      } catch {
        setErrorMsg('не удалось загрузить тропы');
      } finally {
        setTropesLoading(false);
      }
    },
    [patchDraft, selectedFandom],
  );

  // ── Step 3: toggle trope (debounced PATCH) ──────────────────────────────────
  const toggleTrope = useCallback(
    (slug: string) => {
      setSelectedTropeSlugs((prev) => {
        const next = new Set(prev);
        if (next.has(slug)) next.delete(slug);
        else next.add(slug);

        // Debounce PATCH
        if (tropeDebounceRef.current) clearTimeout(tropeDebounceRef.current);
        tropeDebounceRef.current = setTimeout(() => {
          void patchDraft({ tropes: Array.from(next) });
        }, 500);

        return next;
      });
    },
    [patchDraft],
  );

  // ── Step 3 → 4: confirm tropes ──────────────────────────────────────────────
  const confirmTropes = useCallback(async () => {
    if (selectedTropeslugs.size === 0) return;
    await patchDraft({ tropes: Array.from(selectedTropeslugs), step: 4 });
    setStep(4);
  }, [patchDraft, selectedTropeslugs]);

  // ── Step 4 → 5: confirm tone ────────────────────────────────────────────────
  const confirmTone = useCallback(async () => {
    if (!selectedTone) return;
    await patchDraft({ tone: selectedTone, setting: setting || null, step: 5 });
    setStep(5);
  }, [patchDraft, selectedTone, setting]);

  // ── Step 5: start ───────────────────────────────────────────────────────────
  const startStory = useCallback(async () => {
    if (!draftId) return;
    setIsStarting(true);
    setErrorMsg('');
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
      router.push(`/reader/${storyId}/1` as Route);
    } catch {
      setErrorMsg('не удалось начать историю. попробуй ещё раз.');
    } finally {
      setIsStarting(false);
    }
  }, [draftId, router]);

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
          <StepShip
            fandom={selectedFandom}
            ships={ships}
            loading={shipsLoading}
            onPick={pickShip}
          />
        );
      case 3:
        return (
          <StepTropes
            tropes={tropes}
            loading={tropesLoading}
            selected={selectedTropeslugs}
            senseiTip={senseiTip}
            onToggle={toggleTrope}
            onNext={confirmTropes}
          />
        );
      case 4:
        return (
          <StepTone
            selectedTone={selectedTone}
            setting={setting}
            onPickTone={setSelectedTone}
            onChangeSetting={setSetting}
            onNext={confirmTone}
          />
        );
      case 5:
        return (
          <StepPreview
            fandom={selectedFandom}
            ship={selectedShip}
            tropes={Array.from(selectedTropeslugs)}
            tone={selectedTone}
            setting={setting}
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

function StepShip({
  fandom,
  ships,
  loading,
  onPick,
}: {
  fandom: FandomOption | null;
  ships: ShipSuggestion[];
  loading: boolean;
  onPick: (s: ShipSuggestion) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[34px] lg:text-[64px] leading-[1.05] lg:leading-[0.95] tracking-tight text-balance">
          Подбираем <span className="italic text-amber">пейринг</span>
          <span className="text-amber">.</span>
        </h1>
        <p className="mt-3 max-w-[48ch] font-body text-body-s lg:text-body-l italic text-ink-dim">
          Ship — главный хук. Выбери пару персонажей для твоей истории.
          {fandom && (
            <span className="ml-2 font-mono text-mono-s tracking-caps text-amber uppercase">
              {fandom.label}
            </span>
          )}
        </p>
      </div>

      {loading && (
        <div className="font-mono text-mono-s tracking-caps uppercase text-ink-dim animate-pulse">
          загружаем пейринги...
        </div>
      )}

      {!loading && ships.length === 0 && (
        <div className="font-body text-body-s italic text-ink-dim">
          нет предложений — попробуй позже
        </div>
      )}

      {!loading && ships.length > 0 && (
        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-4">
          {ships.map((ship) => {
            const shipId = ship.names.join(' × ');
            return (
              <button
                type="button"
                key={shipId}
                data-testid="step-ship-card"
                onClick={() => onPick(ship)}
                className="group rounded-md border border-ink-faint/25 bg-surface-raised p-4 text-left transition-colors hover:border-amber/50 hover:bg-amber-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              >
                <div className="flex items-center gap-3">
                  {ship.rarity === 'top' && (
                    <span className="font-mono text-mono-s tracking-caps text-amber uppercase">
                      ★
                    </span>
                  )}
                  <span className="font-display italic text-ink text-xl group-hover:text-amber transition-colors">
                    {ship.names.join(' × ')}
                  </span>
                  <span className="ml-auto font-mono text-mono-s tracking-caps text-ink-dim uppercase">
                    {ship.rarity}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepTropes({
  tropes,
  loading,
  selected,
  senseiTip,
  onToggle,
  onNext,
}: {
  tropes: TropeSuggestion[];
  loading: boolean;
  selected: Set<string>;
  senseiTip: string;
  onToggle: (slug: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[34px] lg:text-[64px] leading-[1.05] lg:leading-[0.95] tracking-tight text-balance">
          Выбираем <span className="italic text-amber">тропы</span>
          <span className="text-amber">.</span>
        </h1>
        <p className="mt-3 max-w-[48ch] font-body text-body-s lg:text-body-l italic text-ink-dim">
          Тропы — сердце сюжета. Выбери хотя бы один.
        </p>
      </div>

      {loading && (
        <div className="font-mono text-mono-s tracking-caps uppercase text-ink-dim animate-pulse">
          загружаем тропы...
        </div>
      )}

      {!loading && (
        <>
          <div className="flex items-center justify-between font-mono text-mono-s tracking-caps text-ink-dim uppercase">
            <span>✦ тропы</span>
            <span>{selected.size} выбрано</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tropes.map((t) => {
              const active = selected.has(t.slug);
              return (
                <button
                  type="button"
                  key={t.slug}
                  data-testid="step-trope-chip"
                  onClick={() => onToggle(t.slug)}
                  title={t.description}
                  className={`rounded-full border px-3 py-1.5 font-mono text-mono-s tracking-caps uppercase transition-colors ${
                    active
                      ? 'border-amber/60 bg-amber-soft text-amber'
                      : 'border-ink-faint/30 text-ink-dim hover:text-ink'
                  }`}
                >
                  {active ? '★ ' : ''}
                  {t.label}
                </button>
              );
            })}
          </div>

          {senseiTip && (
            <div className="pt-6">
              <SenseiTip>{senseiTip}</SenseiTip>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              data-testid="step-next"
              onClick={onNext}
              disabled={selected.size === 0}
              className="rounded-full bg-amber px-7 py-3 font-mono text-mono-m tracking-caps uppercase text-bg-deep shadow-amber-glow disabled:opacity-40 disabled:cursor-not-allowed"
            >
              дальше · тон ›
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StepTone({
  selectedTone,
  setting,
  onPickTone,
  onChangeSetting,
  onNext,
}: {
  selectedTone: ToneOption | null;
  setting: string;
  onPickTone: (t: ToneOption) => void;
  onChangeSetting: (s: string) => void;
  onNext: () => void;
}) {
  const tones = Object.entries(TONE_LABELS) as [ToneOption, string][];
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[34px] lg:text-[64px] leading-[1.05] lg:leading-[0.95] tracking-tight text-balance">
          Задаём <span className="italic text-amber">тон</span>
          <span className="text-amber">.</span>
        </h1>
        <p className="mt-3 max-w-[48ch] font-body text-body-s lg:text-body-l italic text-ink-dim">
          Какое настроение у истории?
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {tones.map(([tone, label]) => {
          const active = selectedTone === tone;
          return (
            <button
              type="button"
              key={tone}
              data-testid="step-tone-chip"
              onClick={() => onPickTone(tone)}
              className={`rounded-full border px-5 py-2.5 font-mono text-mono-s tracking-caps uppercase transition-colors ${
                active
                  ? 'border-amber/60 bg-amber-soft text-amber'
                  : 'border-ink-faint/30 text-ink-dim hover:text-ink'
              }`}
            >
              {active ? '★ ' : ''}
              {label}
            </button>
          );
        })}
      </div>

      <div>
        <label className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
          место действия <span className="text-ink-faint">(опционально)</span>
        </label>
        <textarea
          value={setting}
          onChange={(e) => onChangeSetting(e.target.value)}
          rows={3}
          placeholder="напр. «кофейня», «Хогвартс, зима», «современный Токио»"
          className="mt-2 w-full resize-none rounded-md border border-ink-faint/25 bg-surface-raised px-3 py-3 font-body text-body-s italic text-ink placeholder:text-ink-faint focus:border-amber/40 focus:outline-none"
        />
      </div>

      <div>
        <button
          type="button"
          data-testid="step-next"
          onClick={onNext}
          disabled={!selectedTone}
          className="rounded-full bg-amber px-7 py-3 font-mono text-mono-m tracking-caps uppercase text-bg-deep shadow-amber-glow disabled:opacity-40 disabled:cursor-not-allowed"
        >
          дальше · превью ›
        </button>
      </div>
    </div>
  );
}

function StepPreview({
  fandom,
  ship,
  tropes,
  tone,
  setting,
  isStarting,
  onStart,
}: {
  fandom: FandomOption | null;
  ship: ShipSuggestion | null;
  tropes: string[];
  tone: ToneOption | null;
  setting: string;
  isStarting: boolean;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="font-display text-[34px] lg:text-[64px] leading-[1.05] lg:leading-[0.95] tracking-tight text-balance">
          Всё <span className="italic text-amber">готово</span>
          <span className="text-amber">.</span>
        </h1>
        <p className="mt-3 font-body text-body-s lg:text-body-l italic text-ink-dim">
          Проверь — и нажмём старт.
        </p>
      </div>

      {/* Summary card */}
      <div className="rounded-md border border-ink-faint/20 bg-surface-raised p-5 flex flex-col gap-4">
        {fandom && (
          <div>
            <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">фандом</div>
            <div className="mt-1 font-display italic text-xl text-ink">{fandom.name}</div>
          </div>
        )}
        {ship && (
          <div>
            <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">пейринг</div>
            <div className="mt-1 font-display italic text-xl text-amber">
              {ship.names.join(' × ')}
            </div>
          </div>
        )}
        {tropes.length > 0 && (
          <div>
            <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">тропы</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {tropes.map((slug) => (
                <span
                  key={slug}
                  className="rounded-full border border-amber/30 bg-amber-soft px-2 py-0.5 font-mono text-mono-s tracking-caps text-amber uppercase"
                >
                  {slug}
                </span>
              ))}
            </div>
          </div>
        )}
        {tone && (
          <div>
            <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">тон</div>
            <div className="mt-1 font-mono text-mono-s tracking-caps text-ink uppercase">
              {TONE_LABELS[tone]}
            </div>
          </div>
        )}
        {setting && (
          <div>
            <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">сеттинг</div>
            <div className="mt-1 font-body text-body-s italic text-ink">{setting}</div>
          </div>
        )}
      </div>

      {/* Cover preview placeholder */}
      <div className="rounded-md border border-ink-faint/15 bg-surface-raised p-4">
        <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
          предпросмотр обложки
        </div>
        <div className="relative mt-3 aspect-[3/4] max-w-[180px] overflow-hidden rounded-sm">
          <GrainCover from="#2d1432" to="#4a1d35" className="absolute inset-0">
            <BurstSticker label="ai-draft" rotate={-6} className="absolute right-2 top-2" />
            <div className="absolute left-3 bottom-3 font-mono text-mono-s tracking-caps text-amber/80 uppercase">
              глава 1
            </div>
            {ship && (
              <div className="absolute inset-x-3 bottom-10 font-display italic text-sm text-ink/80 text-center">
                {ship.names.join(' × ')}
              </div>
            )}
          </GrainCover>
          {ship && (
            <>
              <ScotchTag className="absolute -top-1 left-3 origin-bottom-left z-10" rotate={-3}>
                {ship.names[0] ?? '?'}
              </ScotchTag>
              <ScotchTag className="absolute -top-1 right-3 origin-bottom-right z-10" rotate={3}>
                {ship.names[1] ?? '?'}
              </ScotchTag>
            </>
          )}
        </div>
      </div>

      {/* Start CTA */}
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
