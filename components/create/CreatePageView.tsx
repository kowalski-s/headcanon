'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { GrainCover } from '@/components/ui/GrainCover';
import { ScotchTag } from '@/components/ui/ScotchTag';
import { BurstSticker } from '@/components/ui/BurstSticker';

const TROPES = [
  'enemies-to-lovers',
  'slow burn',
  'time travel',
  'coffee shop AU',
  'soulmate marks',
  'fake dating',
  'hurt/comfort',
  'modern AU',
];

const STEPS = ['fandom', 'ship', 'tropes', 'tone', 'preview'] as const;

export function CreatePageView() {
  const [step] = useState(2); // M1: статичный экран ship-этапа, шаги-навигация в M2
  const [selectedTropes, setSelectedTropes] = useState<Set<string>>(
    new Set(['enemies-to-lovers', 'slow burn']),
  );
  const [draftText, setDraftText] = useState(
    '«Enemies-to-lovers + slow burn — это 12+ глав. Я разложу напряжение медленно. Готова ждать?»',
  );

  const toggleTrope = (t: string) => {
    setSelectedTropes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const stepPadded = String(step).padStart(2, '0');
  const totalSteps = STEPS.length;
  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Mobile shell */}
      <div className="lg:hidden flex min-h-screen flex-col pb-28">
        <header className="flex items-center justify-between gap-3 px-4 py-3">
          <Link href={'/' as Route} aria-label="back" className="font-mono text-base text-ink-dim">
            ←
          </Link>
          <span className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
            ship · этап {step} / {totalSteps}
          </span>
          <button
            type="button"
            className="font-mono text-mono-s tracking-caps text-ink-dim uppercase"
          >
            save?
          </button>
        </header>

        <div className="px-4 pt-4">
          <span className="font-mono text-mono-s tracking-caps text-amber uppercase">
            ← step {stepPadded} — ship
          </span>
        </div>

        <h1 className="px-4 pt-3 font-display text-[34px] leading-[1.05] text-balance">
          Подбираем <span className="italic text-amber">пейринг</span>
          <span className="text-amber">.</span>
        </h1>

        <p className="px-4 pt-3 font-body text-body-s italic text-ink-dim">
          Ship — главный хук. От него зависят доступные тропы и тон главы. Никакого спойлера,
          обещаем.
        </p>

        {/* Ship confirmed card */}
        <div className="mx-4 mt-5 rounded-md border border-amber/30 bg-surface-raised p-3">
          <div className="font-mono text-mono-s tracking-caps text-amber uppercase">
            ★ ship confirmed
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="relative h-16 flex-1 overflow-hidden rounded-sm">
              <GrainCover from="#2d1432" to="#4a1d35" className="absolute inset-0" />
            </div>
            <span aria-hidden className="font-display text-2xl text-amber">
              ×
            </span>
            <div className="relative h-16 flex-1 overflow-hidden rounded-sm">
              <GrainCover from="#3a1a44" to="#1f1230" className="absolute inset-0" />
            </div>
          </div>
          <div className="mt-3 text-center font-display italic text-ink">Драко × Гермиона</div>
          <div className="mt-1 text-center font-mono text-mono-s tracking-caps text-ink-dim uppercase">
            dramione · hogwarts · year 7
          </div>
        </div>

        {/* Tropes */}
        <section className="mt-6 px-4">
          <div className="flex items-center justify-between font-mono text-mono-s tracking-caps text-ink-dim uppercase">
            <span>✦ тропы пакета</span>
            <span>{selectedTropes.size} / 3</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {TROPES.map((t) => {
              const active = selectedTropes.has(t);
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggleTrope(t)}
                  className={`rounded-full border px-3 py-1.5 font-mono text-mono-s tracking-caps uppercase transition-colors ${
                    active
                      ? 'border-amber/60 bg-amber-soft text-amber'
                      : 'border-ink-faint/30 text-ink-dim'
                  }`}
                >
                  {active ? '★ ' : ''}
                  {t}
                </button>
              );
            })}
          </div>
        </section>

        {/* AI editor */}
        <section className="mt-6 px-4">
          <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
            ai · редактор
          </div>
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            rows={4}
            className="mt-2 w-full resize-none rounded-md border border-ink-faint/25 bg-surface-raised px-3 py-3 font-body text-body-s italic text-ink placeholder:text-ink-faint focus:border-amber/40 focus:outline-none"
          />
        </section>

        {/* Sticky CTA */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-faint/20 bg-bg/95 p-3 backdrop-blur">
          <button
            type="button"
            className="block w-full rounded-full bg-amber py-3.5 text-center font-mono text-mono-s tracking-caps uppercase text-bg-deep shadow-amber-glow"
          >
            дальше · завязка ›
          </button>
        </div>
      </div>

      {/* Desktop shell */}
      <div className="hidden lg:flex min-h-screen flex-col">
        <FeedHeader />

        {/* Step header strip */}
        <div className="flex items-center justify-between border-b border-ink-faint/10 px-10 py-4">
          <span className="font-mono text-mono-s tracking-caps text-amber uppercase">
            ✦ step {stepPadded} - ship
          </span>
          <div className="flex flex-1 items-center gap-3 px-10">
            <div className="h-0.5 flex-1 bg-ink-faint/20">
              <div
                className="h-full bg-amber transition-[width]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
              stage {stepPadded} · {Math.round(progressPercent)}%
            </span>
          </div>
          <span className="font-mono text-mono-s tracking-caps text-ink-faint uppercase italic">
            draft saved
          </span>
        </div>

        {/* Main 2-col */}
        <div className="grid flex-1 grid-cols-[1fr_440px] gap-12 px-10 pt-8 pb-12">
          {/* Left: copy + tropes + ai */}
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="font-display text-[64px] leading-[0.95] tracking-tight text-balance">
                Подбираем <span className="italic text-amber">пейринг</span>
                <span className="text-amber">.</span>
              </h1>
              <p className="mt-4 max-w-[48ch] font-body text-body-l italic text-ink-dim">
                Ship — главный хук. От него зависят доступные тропы и тон главы. Никакого спойлера,
                обещаем.
              </p>
            </div>

            <section>
              <div className="flex items-center justify-between font-mono text-mono-s tracking-caps text-ink-dim uppercase">
                <span>✦ тропы пакета</span>
                <span>{selectedTropes.size} / 3</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {TROPES.map((t) => {
                  const active = selectedTropes.has(t);
                  return (
                    <button
                      type="button"
                      key={t}
                      onClick={() => toggleTrope(t)}
                      className={`rounded-full border px-4 py-1.5 font-mono text-mono-s tracking-caps uppercase transition-colors ${
                        active
                          ? 'border-amber/60 bg-amber-soft text-amber'
                          : 'border-ink-faint/30 text-ink-dim hover:text-ink'
                      }`}
                    >
                      {active ? '★ ' : ''}
                      {t}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-md border border-ink-faint/20 bg-surface-raised p-5">
              <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
                ai · редактор
              </div>
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                rows={3}
                className="mt-3 w-full resize-none bg-transparent font-body text-body-l italic text-ink focus:outline-none"
              />
              <span aria-hidden className="font-display text-amber">
                |
              </span>
            </section>

            <div className="mt-auto flex items-center gap-4">
              <button
                type="button"
                className="rounded-full border border-ink-faint/30 px-5 py-2.5 font-mono text-mono-s tracking-caps text-ink-dim uppercase"
              >
                ‹ назад
              </button>
              <button
                type="button"
                className="rounded-full bg-amber px-7 py-3 font-mono text-mono-m tracking-caps uppercase text-bg-deep shadow-amber-glow"
              >
                дальше · завязка ›
              </button>
              <span className="font-mono text-mono-s tracking-caps text-ink-faint uppercase">
                ↵ enter
              </span>
            </div>
          </div>

          {/* Right: ship card + preview cover */}
          <div className="flex flex-col gap-6">
            <div className="rounded-md border border-amber/30 bg-surface-raised p-4">
              <div className="font-mono text-mono-s tracking-caps text-amber uppercase">
                ★ ship confirmed
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="relative h-24 flex-1 overflow-hidden rounded-sm">
                  <GrainCover from="#2d1432" to="#4a1d35" className="absolute inset-0">
                    <ScotchTag className="absolute -top-1 left-3 origin-bottom-left" rotate={-3}>
                      Draco
                    </ScotchTag>
                  </GrainCover>
                </div>
                <span aria-hidden className="font-display text-3xl text-amber">
                  ×
                </span>
                <div className="relative h-24 flex-1 overflow-hidden rounded-sm">
                  <GrainCover from="#3a1a44" to="#1f1230" className="absolute inset-0">
                    <ScotchTag className="absolute -top-1 right-3 origin-bottom-right" rotate={3}>
                      Hermione
                    </ScotchTag>
                  </GrainCover>
                </div>
              </div>
              <div className="mt-3 text-center font-display italic text-ink">Драко × Гермиона</div>
              <div className="mt-1 text-center font-mono text-mono-s tracking-caps text-ink-dim uppercase">
                dramione · hogwarts · year 7
              </div>
            </div>

            <div className="rounded-md border border-ink-faint/15 bg-surface-raised p-4">
              <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
                предпросмотр обложки
              </div>
              <div className="relative mt-3 aspect-[3/4] overflow-hidden rounded-sm">
                <GrainCover from="#2d1432" to="#4a1d35" className="absolute inset-0">
                  <BurstSticker label="ai-draft" rotate={-6} className="absolute right-2 top-2" />
                  <div className="absolute left-3 bottom-3 font-mono text-mono-s tracking-caps text-amber/80 uppercase">
                    ai-draft · 2/4
                  </div>
                </GrainCover>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
