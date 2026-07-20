'use client';

import { useState } from 'react';
import { Pill } from '@/components/ui/Pill';
import { useCreateStory } from '@/lib/write/use-create-story';

// Локальный список вместо реюза components/feed/FandomChips: его контракт —
// role="tablist"/"tab" + обязательный track('feed_chip_tap') — семантика ленты,
// не guided start. Здесь чипы — кнопки с aria-pressed; выбор пока чисто
// визуальный (передача фандома в создание истории — следующий цикл).
const FANDOMS = [
  'Гарри Поттер',
  'Наруто',
  'Магистр дьявольского культа',
  'Всё ради игры',
  'Свой мир',
];

export function EmptyDesk() {
  const [selected, setSelected] = useState<string | null>(null);
  const { create, pending } = useCreateStory();

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 py-16 text-center">
      {/* свечной ореол за заголовком (guided start, DESIGN-writer §6) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,var(--hc-glow),transparent_62%)]"
      />

      <div className="relative mb-7 max-w-md">
        <div className="font-display text-[15px] italic text-amber" aria-hidden>
          ✦
        </div>
        <h1 className="mt-3 font-display text-display-l font-medium text-balance text-ink">
          Твой стол пока <em className="not-italic text-amber">пуст</em>.
        </h1>
        <p className="mt-3 font-body text-base italic leading-relaxed text-ink-dim text-pretty">
          Но пустой лист — плохое начало. Выбери фандом, а сцену найдём вместе.
        </p>
      </div>

      <p className="relative mb-3 font-mono text-[9px] tracking-wide text-ink-dim">
        с чего начнём этой ночью
      </p>
      <div className="relative mb-7 flex max-w-md flex-wrap items-center justify-center gap-2">
        {FANDOMS.map((name) => {
          const active = selected === name;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={active}
              onClick={() => setSelected(name)}
              className={`rounded-full border px-4 py-2 font-display text-sm italic transition-colors ${
                active
                  ? 'border-amber bg-amber-soft text-amber'
                  : 'border-border text-ink-dim hover:border-amber/50'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      <Pill variant="hero" onClick={create} className={pending ? 'opacity-70' : ''}>
        + начать
      </Pill>

      <p className="absolute bottom-6 left-0 right-0 font-body text-xs italic text-ink-faint">
        ★ полночное чтиво для тех, кто не спит ★
      </p>
    </section>
  );
}
