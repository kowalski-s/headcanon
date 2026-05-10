'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { notFound } from 'next/navigation';
import { getStoryDetail } from '@/lib/fixtures/chapters';
import { Ornament } from '@/components/ui/Ornament';

type Episode = {
  n: number;
  title: string;
  speaker: string;
  line: string;
  highlight: string;
  duration: string;
  state: 'done' | 'current' | 'upcoming';
};

// Hardcoded fixture for hero ch.7 — five episodes split across the chapter scenes.
const HERO_CH7_EPISODES: Episode[] = [
  {
    n: 1,
    title: 'Снег, четвёртый час',
    speaker: 'narrator',
    line: 'Снег падал четвёртый час подряд, и в подземельях пахло влажными книгами.',
    highlight: 'влажными книгами',
    duration: '4:08',
    state: 'done',
  },
  {
    n: 2,
    title: 'Драко у окна',
    speaker: 'драко',
    line: '«Грейнджер, если ты пришла ругаться, я очень устал».',
    highlight: 'устал',
    duration: '4:21',
    state: 'current',
  },
  {
    n: 3,
    title: 'Замок молчания',
    speaker: 'narrator',
    line: 'Минуту они смотрели друг на друга — это тоже разговор.',
    highlight: 'это тоже разговор',
    duration: '4:32',
    state: 'upcoming',
  },
  {
    n: 4,
    title: 'Письмо',
    speaker: 'гермиона',
    line: '«У меня к тебе письмо, — сказала Гермиона. — Но я не буду его отдавать».',
    highlight: 'не буду его отдавать',
    duration: '5:02',
    state: 'upcoming',
  },
  {
    n: 5,
    title: 'Прочитай',
    speaker: 'драко',
    line: '«Грейнджер, — сказал он. — Прочитай».',
    highlight: 'Прочитай',
    duration: '3:46',
    state: 'upcoming',
  },
];

export function WatchPageView({ storyId, chapterN }: { storyId: string; chapterN: string }) {
  const detail = getStoryDetail(storyId);
  const n = Number(chapterN);

  const [activeEp, setActiveEp] = useState(2);
  const [playing, setPlaying] = useState(true);

  if (!detail) notFound();
  const ep = HERO_CH7_EPISODES.find((e) => e.n === activeEp) ?? HERO_CH7_EPISODES[1];
  const totalSeconds = parseDuration(ep.duration);
  const elapsed = '03:42';
  const remaining = `-${formatDuration(totalSeconds - parseDuration(elapsed))}`;
  const progressPercent = (parseDuration(elapsed) / totalSeconds) * 100;

  const nextChapter = detail.chapters.find((c) => c.n === n + 1);
  const padded = String(n).padStart(2, '0');
  const epPadded = String(activeEp).padStart(2, '0');

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Mobile shell */}
      <div className="lg:hidden flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-3 px-4 py-3">
          <Link
            href={`/reader/${storyId}/${chapterN}` as Route}
            aria-label="close watch"
            className="font-mono text-base text-ink-dim"
          >
            ×
          </Link>
          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
              watch
            </span>
            <span className="font-display text-xs italic text-amber">
              {detail.story.title.replace(/\.$/, '')}
            </span>
          </div>
          <button type="button" aria-label="collapse" className="font-mono text-base text-ink-dim">
            ▾
          </button>
        </header>

        {/* Subtitle card */}
        <div className="mx-4 mt-2 overflow-hidden rounded-md border border-amber/20 bg-gradient-to-br from-bg-alt to-bg-deep">
          <div className="flex items-center justify-between px-4 pt-3 font-mono text-mono-s tracking-caps text-ink-dim uppercase">
            <span aria-hidden className="text-amber/70">
              ✦
            </span>
            <span>
              {elapsed} / {ep.duration}
            </span>
          </div>
          <div className="flex flex-col gap-2 px-5 pb-6 pt-3">
            <span className="font-mono text-mono-s tracking-caps text-amber/90 uppercase">
              {ep.speaker}
            </span>
            <p className="font-display text-[18px] italic leading-snug text-ink">
              {renderHighlight(ep.line, ep.highlight)}
            </p>
          </div>
        </div>

        {/* Scrub bar */}
        <div className="mx-4 mt-5 flex items-center gap-3 font-mono text-mono-s tracking-caps text-ink-dim uppercase">
          <span>{elapsed}</span>
          <div
            role="progressbar"
            aria-valuenow={Math.round(progressPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="relative h-0.5 flex-1 bg-ink-faint/25"
          >
            <div
              className="absolute inset-y-0 left-0 bg-amber"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-amber shadow-amber-glow"
              style={{ left: `calc(${progressPercent}% - 6px)` }}
            />
          </div>
          <span>{remaining}</span>
        </div>

        {/* Player controls */}
        <div className="mt-6 flex items-center justify-center gap-8">
          <button
            type="button"
            aria-label="back 10 seconds"
            className="font-mono text-mono-m tracking-caps text-ink-dim uppercase"
          >
            « 10
          </button>
          <button
            type="button"
            aria-label={playing ? 'pause' : 'play'}
            onClick={() => setPlaying((p) => !p)}
            className="flex size-16 items-center justify-center rounded-full bg-amber text-2xl text-bg-deep shadow-amber-glow"
          >
            {playing ? '❘❘' : '▶'}
          </button>
          <button
            type="button"
            aria-label="forward 10 seconds"
            className="font-mono text-mono-m tracking-caps text-ink-dim uppercase"
          >
            10 »
          </button>
        </div>

        {/* Episodes */}
        <section className="mt-8 px-4">
          <h2 className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
            ✦ эпизоды главы {n}
          </h2>
          <ul className="mt-3 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:hidden">
            {HERO_CH7_EPISODES.map((e) => {
              const active = e.n === activeEp;
              return (
                <li key={e.n} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveEp(e.n)}
                    className={`flex flex-col gap-1 rounded-md border px-4 py-3 text-left transition-colors ${
                      active
                        ? 'border-amber/60 bg-amber-soft'
                        : 'border-ink-faint/20 bg-surface-raised'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 font-mono text-mono-s tracking-caps uppercase">
                      <span className={active ? 'text-amber' : 'text-ink-dim'}>
                        ep {String(e.n).padStart(2, '0')}{' '}
                        {e.state === 'done' ? '✓' : e.state === 'current' ? '●' : ''}
                      </span>
                      <span className="text-ink-faint">{e.duration}</span>
                    </div>
                    <span className="font-display text-sm italic text-ink/90 line-clamp-1">
                      {e.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Bottom hint */}
        <div className="mt-auto flex items-center justify-center gap-2 px-4 py-6 font-body text-body-s italic text-ink-dim">
          <span>предпочитаешь буквы?</span>
          <Link
            href={`/reader/${storyId}/${chapterN}` as Route}
            className="text-amber underline-offset-2 hover:underline"
          >
            читать главу →
          </Link>
        </div>
      </div>

      {/* Desktop shell */}
      <div className="hidden lg:grid min-h-screen grid-cols-[1fr_360px]">
        <main className="relative flex flex-col">
          {/* Header strip */}
          <header className="flex items-center justify-between border-b border-ink-faint/15 px-10 py-4">
            <div className="flex items-center gap-4 font-mono text-mono-s tracking-caps text-ink-dim uppercase">
              <Link
                href={`/reader/${storyId}/${chapterN}` as Route}
                aria-label="close watch"
                className="text-ink-dim hover:text-ink"
              >
                ×
              </Link>
              <span className="text-ink">watch mode</span>
              <span aria-hidden className="text-amber/40">
                ·
              </span>
              <span>
                ch.{padded} / {epPadded}
              </span>
              <span className="font-display italic text-amber">
                {detail.story.title.replace(/\.$/, '')}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-mono-s tracking-caps text-ink-dim uppercase">
              <span>cc</span>
              <span>ru</span>
              <span>hd</span>
            </div>
          </header>

          {/* Player surface */}
          <div className="relative flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-bg-alt via-bg to-bg-deep px-10 py-10">
            <div className="absolute inset-x-10 top-10 flex items-center justify-between font-mono text-mono-s tracking-caps text-ink-dim uppercase">
              <span>
                ep {epPadded} · {ep.speaker}
              </span>
              <span>
                {elapsed} / {ep.duration}
              </span>
            </div>

            <div className="mx-auto flex max-w-[640px] flex-col items-center gap-6 text-center">
              <span aria-hidden className="text-2xl text-amber/70">
                ✦
              </span>
              <span className="font-mono text-mono-s tracking-caps text-amber/90 uppercase">
                {ep.speaker}
              </span>
              <p className="font-display text-[26px] italic leading-snug text-ink">
                {renderHighlight(ep.line, ep.highlight)}
              </p>
            </div>

            {/* Scrub + controls */}
            <div className="mt-auto flex w-full max-w-[760px] flex-col items-center gap-5 pt-10">
              <div className="flex w-full items-center gap-4 font-mono text-mono-s tracking-caps text-ink-dim uppercase">
                <span>{elapsed}</span>
                <div
                  role="progressbar"
                  aria-valuenow={Math.round(progressPercent)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="relative h-0.5 flex-1 bg-ink-faint/25"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-amber"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span>{remaining}</span>
              </div>
              <div className="flex items-center justify-center gap-10">
                <button
                  type="button"
                  aria-label="back 10 seconds"
                  className="font-mono text-mono-m tracking-caps text-ink-dim uppercase"
                >
                  ‹ 10s
                </button>
                <button
                  type="button"
                  aria-label={playing ? 'pause' : 'play'}
                  onClick={() => setPlaying((p) => !p)}
                  className="flex size-14 items-center justify-center rounded-full bg-amber text-xl text-bg-deep shadow-amber-glow"
                >
                  {playing ? '❘❘' : '▶'}
                </button>
                <button
                  type="button"
                  aria-label="forward 10 seconds"
                  className="font-mono text-mono-m tracking-caps text-ink-dim uppercase"
                >
                  10s ›
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="flex flex-col border-l border-ink-faint/15 bg-surface-raised px-6 py-6">
          <h2 className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
            ✦ эпизоды главы {n}
          </h2>
          <ul className="mt-4 flex flex-col gap-1">
            {HERO_CH7_EPISODES.map((e) => {
              const active = e.n === activeEp;
              return (
                <li key={e.n}>
                  <button
                    type="button"
                    onClick={() => setActiveEp(e.n)}
                    className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors ${
                      active
                        ? 'border-amber/60 bg-amber-soft'
                        : 'border-transparent hover:border-ink-faint/20'
                    }`}
                  >
                    <span className="flex items-center gap-3 font-mono text-mono-s tracking-caps uppercase">
                      <span className={active ? 'text-amber' : 'text-ink-faint'}>
                        ep {String(e.n).padStart(2, '0')}
                      </span>
                      <span className="font-display text-sm italic text-ink/90">{e.title}</span>
                    </span>
                    <span className="font-mono text-mono-s tracking-caps text-ink-faint uppercase">
                      {e.duration}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex flex-col gap-2 rounded-md border border-ink-faint/20 bg-bg/60 px-4 py-4">
            <span className="font-body text-body-s italic text-ink-dim">предпочитаешь буквы?</span>
            <Link
              href={`/reader/${storyId}/${chapterN}` as Route}
              className="font-mono text-mono-s tracking-caps text-amber uppercase"
            >
              ★ читать главу {n} →
            </Link>
          </div>

          {nextChapter ? (
            <div className="mt-4 flex flex-col gap-3 rounded-md border border-ink-faint/15 bg-bg/40 px-4 py-4">
              <span className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
                next
              </span>
              <span className="font-display italic text-ink">
                ch.{nextChapter.n} · {nextChapter.title}
              </span>
              <span className="font-mono text-mono-s tracking-caps text-ink-faint uppercase">
                автозапуск через 12с · отменить
              </span>
            </div>
          ) : null}

          <div className="mt-auto pt-6 text-center">
            <Ornament size="sm" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function renderHighlight(line: string, highlight: string) {
  const idx = line.indexOf(highlight);
  if (idx === -1) return line;
  return (
    <>
      {line.slice(0, idx)}
      <span className="text-amber not-italic font-display italic">{highlight}</span>
      {line.slice(idx + highlight.length)}
    </>
  );
}

function parseDuration(d: string) {
  const [m, s] = d.split(':').map(Number);
  return m * 60 + s;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
