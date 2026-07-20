'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { ReaderTopBar } from '@/components/reader/ReaderTopBar';
import { ReaderProgressBar } from '@/components/reader/ReaderProgressBar';
import { ReaderBody } from '@/components/reader/ReaderBody';
import { EditableReaderBody } from '@/components/reader/EditableReaderBody';
import { ReaderSettingsSheet } from '@/components/reader/ReaderSettingsSheet';
import { NextChapterCard } from '@/components/reader/NextChapterCard';
import { ReaderSpreadDesktop } from '@/components/reader/ReaderSpreadDesktop';
import { Ornament } from '@/components/ui/Ornament';
import { useReaderSettings } from '@/lib/reader/useReaderSettings';
import { useReadingProgress } from '@/lib/reader/useReadingProgress';
import { useLateNightDim } from '@/lib/reader/useLateNightDim';
import { useChapterStream } from '@/lib/reader/useChapterStream';
import { getStoryDetail, getChapterContent } from '@/lib/fixtures/chapters';
import { track } from '@/lib/track';
import { DEV_USER_ID } from '@/lib/auth/dev-user';
import type { ChapterContent, ChapterState } from '@/lib/types/story';

/** Data pre-fetched server-side for real (UUID) story chapters. */
export type LiveChapterData = {
  chapterId: string;
  title: string;
  ordinal: number;
  authorId: string;
  initialParagraphs: Array<{ id: string; text: string }>;
};

type Props = {
  storyId: string;
  chapterN: string;
  /** Present only when page.tsx resolved a real UUID story from the DB. */
  live?: LiveChapterData;
};

// Dev-stub user ID — passed as x-test-user-id header.
// TODO: replace with real Supabase Auth session cookie once M3 auth lands.
// Sourced from lib/auth/dev-user.ts so all client-side fetch calls use the same constant.
const DEV_TEST_USER_ID = DEV_USER_ID;

export function ReaderPageView({ storyId, chapterN, live }: Props) {
  const n = Number(chapterN);
  const router = useRouter();
  const { settings, setSetting } = useReaderSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ── Live path (real DB chapter) ──────────────────────────────────────────
  if (live) {
    return (
      <LiveReader
        storyId={storyId}
        live={live}
        settings={settings}
        setSetting={setSetting}
        router={router}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        n={n}
      />
    );
  }

  // ── Fixture path (M1 preview URLs) ───────────────────────────────────────
  return (
    <FixtureReader
      storyId={storyId}
      n={n}
      chapterN={chapterN}
      settings={settings}
      setSetting={setSetting}
      settingsOpen={settingsOpen}
      setSettingsOpen={setSettingsOpen}
    />
  );
}

// ── FixtureReader (original M1 logic, unchanged) ─────────────────────────────

type FixtureReaderProps = {
  storyId: string;
  n: number;
  chapterN: string;
  settings: ReturnType<typeof useReaderSettings>['settings'];
  setSetting: ReturnType<typeof useReaderSettings>['setSetting'];
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
};

function FixtureReader({
  storyId,
  n,
  settings,
  setSetting,
  settingsOpen,
  setSettingsOpen,
}: FixtureReaderProps) {
  const detail = getStoryDetail(storyId);
  const content = getChapterContent(storyId, n);
  const { percent, containerRef } = useReadingProgress(content?.paragraphs.length ?? 0);
  const dimmed = useLateNightDim();
  const words = (content?.paragraphs ?? []).reduce(
    (s, p) => s + p.split(/\s+/).filter(Boolean).length,
    0,
  );
  const pagesTotal = Math.max(1, Math.ceil(words / 250));
  const currentPage = Math.max(1, Math.ceil((percent / 100) * pagesTotal) || 1);

  useEffect(() => {
    if (detail && content) {
      track('reader_opened', {
        story_id: storyId,
        chapter_n: n,
        has_progress: detail.progress !== null,
      });
    }
  }, [storyId, n, detail, content]);

  if (!detail || !content) notFound();

  const nextChapter = detail.chapters.find((c) => c.n === n + 1) ?? null;
  const prevChapter = detail.chapters.find((c) => c.n === n - 1) ?? null;

  return (
    <ReaderShell
      storyId={storyId}
      n={n}
      content={content}
      nextChapter={nextChapter}
      prevChapter={prevChapter}
      hasWatch={detail.watchAvailable}
      percent={percent}
      containerRef={containerRef}
      pagesTotal={pagesTotal}
      currentPage={currentPage}
      dimmed={dimmed}
      settings={settings}
      setSetting={setSetting}
      settingsOpen={settingsOpen}
      setSettingsOpen={setSettingsOpen}
    />
  );
}

// ── LiveReader (streams or renders from DB) ───────────────────────────────────

type RouterLike = { refresh: () => void };

type LiveReaderProps = {
  storyId: string;
  live: LiveChapterData;
  settings: ReturnType<typeof useReaderSettings>['settings'];
  setSetting: ReturnType<typeof useReaderSettings>['setSetting'];
  router: RouterLike;
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
  n: number;
};

function LiveReader({
  storyId,
  live,
  settings,
  setSetting,
  router,
  settingsOpen,
  setSettingsOpen,
  n,
}: LiveReaderProps) {
  const dimmed = useLateNightDim();

  const hasDbParagraphs = live.initialParagraphs.length > 0;

  const canEdit = live.authorId === DEV_TEST_USER_ID;

  const handleStreamFinish = useCallback(
    async (fullText: string) => {
      try {
        await fetch(`/api/chapter/${live.chapterId}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-test-user-id': DEV_TEST_USER_ID,
          },
          body: JSON.stringify({ fullText }),
        });
        // Refresh server component data so next visit renders from DB.
        router.refresh();
      } catch {
        // non-fatal — chapter is still rendered from stream output
      }
    },
    [live.chapterId, router],
  );

  const {
    paragraphs: streamParagraphs,
    status,
    error,
    start,
  } = useChapterStream({
    chapterId: live.chapterId,
    chapterLength: settings.chapterLength,
    onFinish: handleStreamFinish,
    testUserId: DEV_TEST_USER_ID,
  });

  // Auto-start streaming when there are no DB paragraphs.
  useEffect(() => {
    if (!hasDbParagraphs && status === 'idle') {
      void start();
    }
  }, [hasDbParagraphs, status, start]);

  useEffect(() => {
    track('reader_opened', {
      story_id: storyId,
      chapter_n: n,
      has_progress: false,
      source: 'live',
    });
  }, [storyId, n]);

  // Desktop spread needs string[]; mobile editable path uses {id, text}[].
  const desktopParagraphs: string[] = hasDbParagraphs
    ? live.initialParagraphs.map((p) => p.text)
    : streamParagraphs;

  const { percent, containerRef } = useReadingProgress(desktopParagraphs.length);
  const words = desktopParagraphs.reduce((s, p) => s + p.split(/\s+/).filter(Boolean).length, 0);
  const pagesTotal = Math.max(1, Math.ceil(words / 250));
  const currentPage = Math.max(1, Math.ceil((percent / 100) * pagesTotal) || 1);

  // TODO(M2-C+): re-wire ReaderSpreadDesktop magazine layout on live path with edit hooks; for now single-column on all sizes.
  return (
    <div
      className={`min-h-screen text-ink transition-colors duration-[2000ms] ${dimmed ? 'bg-black' : 'bg-bg'}`}
    >
      {status === 'error' && error ? (
        <div className="mx-auto max-w-[660px] px-4 pt-20 text-center text-amber/80">
          <p className="font-mono text-sm">ошибка генерации: {error.message}</p>
          <button
            type="button"
            onClick={() => void start()}
            className="mt-4 rounded-full border border-amber/40 px-4 py-1.5 font-mono text-mono-s tracking-caps text-amber uppercase"
          >
            попробовать снова
          </button>
        </div>
      ) : null}

      {/* Reader — mobile + desktop share EditableReaderBody on live path (magazine spread used only on fixture preview path). */}
      <ReaderTopBar
        storyId={storyId}
        chapterN={n}
        chapterTitle={live.title}
        onOpenSettings={() => setSettingsOpen(true)}
        // Writer-path: живая история открыта из редактора; колофона /story/[uuid]
        // для неё нет → «назад» ведёт в редактор, а не в 404.
        backHref={`/write/${storyId}` as Route}
      />
      <ReaderProgressBar percent={percent} pageLabel={`стр ${currentPage} / ${pagesTotal}`} />
      <div className="mx-auto max-w-[860px] px-4 pt-6">
        <span className="font-display text-sm italic text-amber">глава {live.ordinal}</span>
        <h1 className="mt-2 font-display text-3xl text-balance">{live.title}</h1>
        <div className="my-4">
          <Ornament size="sm" />
        </div>
      </div>
      {status === 'streaming' && desktopParagraphs.length === 0 ? (
        <div className="mx-auto max-w-[860px] px-4 py-6 font-mono text-sm text-ink-dim animate-pulse">
          генерируем главу…
        </div>
      ) : hasDbParagraphs ? (
        <EditableReaderBody
          paragraphs={live.initialParagraphs}
          settings={settings}
          canEdit={canEdit}
          bodyRef={containerRef}
        />
      ) : (
        <ReaderBody
          paragraphs={streamParagraphs}
          settings={settings}
          bodyRef={containerRef}
          streaming={status === 'streaming'}
        />
      )}

      <ReaderSettingsSheet
        open={settingsOpen}
        settings={settings}
        onChange={(k, v) => {
          setSetting(k, v);
          track('reader_settings_changed', { key: k, value: v });
        }}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

// ── ReaderShell — shared layout for fixture path ──────────────────────────────

type ReaderShellProps = {
  storyId: string;
  n: number;
  content: ChapterContent;
  nextChapter: { n: number; title: string; minutes: number; state: ChapterState } | null;
  prevChapter: { n: number; title: string; minutes: number; state: ChapterState } | null;
  hasWatch: boolean;
  percent: number;
  containerRef: React.RefObject<HTMLElement | null>;
  pagesTotal: number;
  currentPage: number;
  dimmed: boolean;
  settings: ReturnType<typeof useReaderSettings>['settings'];
  setSetting: ReturnType<typeof useReaderSettings>['setSetting'];
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
};

function ReaderShell({
  storyId,
  n,
  content,
  nextChapter,
  prevChapter,
  hasWatch,
  percent,
  containerRef,
  pagesTotal,
  currentPage,
  dimmed,
  settings,
  setSetting,
  settingsOpen,
  setSettingsOpen,
}: ReaderShellProps) {
  return (
    <div
      className={`min-h-screen text-ink transition-colors duration-[2000ms] ${dimmed ? 'bg-black' : 'bg-bg'}`}
    >
      {/* Mobile reader — sticky topbar + single column body */}
      <div className="lg:hidden">
        <ReaderTopBar
          storyId={storyId}
          chapterN={n}
          chapterTitle={content.title}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <ReaderProgressBar percent={percent} pageLabel={`стр ${currentPage} / ${pagesTotal}`} />
        <div className="mx-auto max-w-[660px] px-4 pt-6">
          <span className="font-display text-sm italic text-amber">
            глава {n === 7 ? 'седьмая' : n}
          </span>
          <h1 className="mt-2 font-display text-3xl text-balance">
            {content.section ?? content.title}
          </h1>
          <div className="my-4">
            <Ornament size="sm" />
          </div>
        </div>
        <ReaderBody paragraphs={content.paragraphs} settings={settings} bodyRef={containerRef} />
        <NextChapterCard storyId={storyId} nextChapter={nextChapter} hasWatch={hasWatch} />
      </div>

      {/* Desktop reader — magazine spread, side arrows, inline next card */}
      <ReaderSpreadDesktop
        storyId={storyId}
        chapter={n}
        pagesTotal={pagesTotal}
        currentPage={currentPage}
        content={content}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
        hasWatch={hasWatch}
        settings={settings}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <ReaderSettingsSheet
        open={settingsOpen}
        settings={settings}
        onChange={(k, v) => {
          setSetting(k, v);
          track('reader_settings_changed', { key: k, value: v });
        }}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
