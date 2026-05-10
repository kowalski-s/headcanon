'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { ReaderTopBar } from '@/components/reader/ReaderTopBar';
import { ReaderProgressBar } from '@/components/reader/ReaderProgressBar';
import { ReaderBody } from '@/components/reader/ReaderBody';
import { ReaderSettingsSheet } from '@/components/reader/ReaderSettingsSheet';
import { NextChapterCard } from '@/components/reader/NextChapterCard';
import { Ornament } from '@/components/ui/Ornament';
import { useReaderSettings } from '@/lib/reader/useReaderSettings';
import { useReadingProgress } from '@/lib/reader/useReadingProgress';
import { useLateNightDim } from '@/lib/reader/useLateNightDim';
import { getStoryDetail, getChapterContent } from '@/lib/fixtures/chapters';
import { track } from '@/lib/track';

type Props = { storyId: string; chapterN: string };

export function ReaderPageView({ storyId, chapterN }: Props) {
  const n = Number(chapterN);
  const detail = getStoryDetail(storyId);
  const content = getChapterContent(storyId, n);
  const { settings, setSetting } = useReaderSettings();
  const { percent, containerRef } = useReadingProgress(content?.paragraphs.length ?? 0);
  const dimmed = useLateNightDim();
  const pagesTotal = Math.max(1, Math.ceil((content?.paragraphs.length ?? 0) / 2));
  const currentPage = Math.max(1, Math.ceil((percent / 100) * pagesTotal) || 1);
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  return (
    <div
      className={`min-h-screen text-ink transition-colors duration-[2000ms] ${dimmed ? 'bg-black' : 'bg-bg-deep'}`}
    >
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
        <h1 className="mt-2 font-display text-3xl text-balance">{content.title}</h1>
        <div className="my-4">
          <Ornament size="sm" />
        </div>
      </div>
      <ReaderBody paragraphs={content.paragraphs} settings={settings} bodyRef={containerRef} />
      <NextChapterCard
        storyId={storyId}
        nextChapter={nextChapter}
        hasWatch={detail.watchAvailable}
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
