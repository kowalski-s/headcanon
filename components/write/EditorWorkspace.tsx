'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChapterEditor, type SaveStatus } from './ChapterEditor';
import { ChapterNav } from './ChapterNav';
import { PublishToggle } from './PublishToggle';
import type { EditorMode } from './Editor';

type Chapter = { id: string; ordinal: number; title: string | null };
type Visibility = 'PRIVATE' | 'UNLISTED' | 'PUBLIC';

type Props = {
  storyId: string;
  storyTitle: string;
  visibility: Visibility;
  chapters: Chapter[];
  active: { id: string; ordinal: number; title: string | null; text: string };
};

const MODES: { value: EditorMode; label: string }[] = [
  { value: 'write', label: '✎ письмо' },
  { value: 'focus', label: '◐ фокус' },
  { value: 'typewriter', label: '⌶ машинка' },
];

export function EditorWorkspace({ storyId, storyTitle, visibility, chapters, active }: Props) {
  const [mode, setMode] = useState<EditorMode>('write');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [wordCount, setWordCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const [chromeHover, setChromeHover] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTyping = useCallback(() => {
    setTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 2500);
  }, []);

  // Движение мыши проявляет chrome (A2-01).
  useEffect(() => {
    const wake = () => setTyping(false);
    window.addEventListener('mousemove', wake);
    return () => {
      window.removeEventListener('mousemove', wake);
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  const chromeVisible = chromeHover || (mode === 'write' && !typing);
  const dim = mode === 'focus' || mode === 'typewriter';

  const vignette = dim
    ? `radial-gradient(120% 70% at 50% ${mode === 'typewriter' ? '46%' : '40%'}, transparent 42%, color-mix(in srgb, var(--hc-bg) 80%, transparent) 100%)`
    : 'none';

  const statusLabel: Record<SaveStatus, string | null> = {
    idle: null,
    saving: 'сохранение…',
    saved: 'сохранено',
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-bg text-ink">
      {/* Свет свечи — только тонкая амбер-виньетка по краям (+ радиальное затемнение в режимах) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] transition-[background] duration-500"
        style={{
          boxShadow: 'inset 0 0 220px color-mix(in srgb, var(--hc-amber) 9%, transparent)',
          background: vignette,
        }}
      />

      {/* ── chrome-шапка (тает при печати / в режимах, проявляется по мыши и фокусу) ── */}
      <header
        onMouseEnter={() => setChromeHover(true)}
        onMouseLeave={() => setChromeHover(false)}
        onFocusCapture={() => setChromeHover(true)}
        onBlurCapture={() => setChromeHover(false)}
        className="relative z-[6] flex items-center justify-between gap-4 px-6 py-3.5 transition-opacity duration-[450ms]"
        style={{
          opacity: chromeVisible ? 1 : 0.16,
          borderBottom: `1px solid ${chromeVisible ? 'var(--hc-border)' : 'transparent'}`,
        }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/write"
            aria-label="Назад на стол"
            className="shrink-0 text-lg text-ink-dim transition-colors hover:text-ink"
          >
            ←
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="shrink-0 font-mono text-mono-s tracking-caps uppercase text-ink-faint transition-colors hover:text-ink-dim"
          >
            содержание
          </button>
          <span className="truncate font-display text-sm italic text-ink-dim">{storyTitle}</span>
          <span className="text-ink-faint" aria-hidden>
            ·
          </span>
          <span className="shrink-0 font-mono text-mono-s tracking-caps uppercase text-ink-faint">
            гл. {active.ordinal} черновик
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {status !== 'idle' && (
            <span className="flex items-center gap-1.5 font-mono text-mono-s tracking-caps uppercase text-ink-dim">
              {status === 'saved' && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber" aria-hidden />
              )}
              {statusLabel[status]}
            </span>
          )}
          <span className="font-mono text-mono-s tracking-caps uppercase text-ink-faint">
            {wordCount.toLocaleString('ru-RU')} слов
          </span>
          <PublishToggle storyId={storyId} visibility={visibility} />
        </div>
      </header>

      {/* ── manuscript column ── */}
      <main className="relative z-[3] flex-1 overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-[620px] flex-col px-11 pt-11">
          {mode === 'write' && (
            <div className="mb-6 shrink-0">
              <p className="font-mono text-mono-s tracking-caps uppercase text-amber">
                глава {active.ordinal}
              </p>
              {active.title && (
                <h2 className="mt-2 font-display text-[30px] font-medium leading-[1.05] text-ink">
                  {active.title}
                </h2>
              )}
            </div>
          )}
          <div className="min-h-0 flex-1">
            <ChapterEditor
              key={active.id}
              chapterId={active.id}
              initialMarkdown={active.text}
              mode={mode}
              onStatusChange={setStatus}
              onWordCount={setWordCount}
              onTyping={handleTyping}
            />
          </div>
        </div>

        {/* тихий индикатор активного режима */}
        {dim && (
          <div className="absolute right-6 top-5 z-[8] flex items-center gap-2 rounded-full border border-amber/30 bg-panel/70 px-3 py-1.5 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-candle-breath rounded-full bg-amber" aria-hidden />
            <span className="font-mono text-mono-s tracking-caps uppercase text-ink-dim">
              {mode === 'typewriter' ? 'машинка' : 'фокус'}
            </span>
          </div>
        )}
      </main>

      {/* ── нижняя строка: AI-заглушка + переключатель режимов ── */}
      <footer className="relative z-[6] flex items-center justify-between gap-4 border-t border-DEFAULT bg-panel/80 px-6 py-2.5 backdrop-blur">
        {/* AI assistant placeholder — W3 (заменит задача AI-соавтора) */}
        <button
          disabled
          title="Скоро"
          className="mt-6 rounded-full border border-chrome-1/20 px-5 py-2.5 font-mono text-mono-m tracking-caps uppercase text-ink-dim opacity-40 cursor-not-allowed"
        >
          AI-ассистент
        </button>

        <div
          role="group"
          aria-label="Режим письма"
          className="inline-flex gap-0.5 rounded-full border border-DEFAULT p-[3px]"
        >
          {MODES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={`rounded-full px-3 py-1.5 font-ui text-[11px] transition-colors ${
                mode === value ? 'bg-amber text-bg' : 'text-ink-dim hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </footer>

      {/* ── выдвижная панель содержания ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-20 flex" role="dialog" aria-label="Содержание">
          <div
            className="absolute inset-0 bg-bg-deep/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside className="relative z-10 h-full w-72 max-w-[80vw] animate-[hcDrawerIn_.35s_cubic-bezier(0.2,0.8,0.2,1)] overflow-y-auto border-r border-DEFAULT bg-panel px-4 py-6 shadow-poster">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-mono-s tracking-caps uppercase text-ink-faint">
                содержание
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Закрыть содержание"
                className="font-mono text-mono-s text-ink-dim hover:text-ink"
              >
                ×
              </button>
            </div>
            <ChapterNav
              storyId={storyId}
              chapters={chapters}
              activeOrdinal={active.ordinal}
              onNavigate={() => setDrawerOpen(false)}
            />
          </aside>
          <style>{`@keyframes hcDrawerIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
        </div>
      )}
    </div>
  );
}
