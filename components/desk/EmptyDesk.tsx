'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Pill } from '@/components/ui/Pill';
import { createStory } from '@/lib/write/create-story';

// Локальный список вместо реюза components/feed/FandomChips: его контракт —
// role="tablist"/"tab" + обязательный track('feed_chip_tap') — семантика ленты,
// не guided start. Здесь чипы — кнопки с aria-pressed; выбор пока чисто
// визуальный (передача фандома в создание истории — следующий цикл).
const FANDOMS = [
  'Гарри Поттер',
  'Наруто',
  'Магистр дьявольского культа',
  'Всё ради игры',
  'Оригинальный мир',
];

export function EmptyDesk() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const pendingRef = useRef(false);

  // Тот же механизм создания, что в DeskShelf: POST /api/write/story → редактор.
  // pendingRef гасит двойной клик — иначе создаются две «Без названия».
  async function handleStart() {
    if (pendingRef.current) return;
    pendingRef.current = true;
    const storyId = await createStory();
    if (!storyId) {
      pendingRef.current = false;
      return;
    }
    router.push(('/write/' + storyId) as Route);
  }

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="relative">
        {/* Свечной ореол за заголовком: квадратный контейнер, чтобы circle-градиент
            не обрезался в полосу на широком блоке */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,var(--hc-glow),transparent_62%)]"
        />
        <h1 className="relative font-display italic text-display-l text-ink">
          выбери фандом — и за стол
        </h1>
      </div>

      <div className="flex max-w-md flex-wrap items-center justify-center gap-2">
        {FANDOMS.map((name) => {
          const active = selected === name;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={active}
              onClick={() => setSelected(name)}
              className={`rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors ${
                active
                  ? 'border-amber bg-amber text-bg-deep'
                  : 'border-ink-faint/30 text-ink hover:border-amber/50'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      <Pill variant="hero" onClick={handleStart}>
        + начать
      </Pill>
    </section>
  );
}
