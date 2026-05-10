'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { Chapter, ChapterContent } from '@/lib/types/story';
import type { ReaderSettings } from '@/lib/reader/useReaderSettings';
import { track } from '@/lib/track';

type Props = {
  storyId: string;
  chapter: number;
  pagesTotal: number;
  currentPage: number;
  content: ChapterContent;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
  hasWatch: boolean;
  settings: ReaderSettings;
  onOpenSettings: () => void;
};

// Magazine-spread reader for desktop. Hidden on mobile (mobile uses ReaderBody + topbar).
// 2-col flow via CSS columns: title sits in left col, drop cap on the first paragraph,
// dialog paragraphs (« or — at start) get amber-italic styling.
export function ReaderSpreadDesktop({
  storyId,
  chapter,
  pagesTotal,
  currentPage,
  content,
  prevChapter,
  nextChapter,
  hasWatch,
  settings,
  onOpenSettings,
}: Props) {
  const padded = String(chapter).padStart(2, '0');
  // Mirror ReaderBody font mapping — bodoni/cormorant fall back to display, garamond is body.
  const fontFamilyClass = settings.font === 'garamond' ? 'font-body' : 'font-display';

  return (
    <div className="hidden lg:block">
      {/* Editorial topbar */}
      <header className="sticky top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-6 border-b border-ink-faint/15 bg-bg/95 px-10 py-3 backdrop-blur">
        <div className="flex items-center gap-3 font-mono text-mono-s tracking-caps text-ink-dim uppercase">
          <Link
            href={`/story/${storyId}` as Route}
            aria-label="back to story"
            className="text-ink-dim hover:text-ink"
          >
            ←
          </Link>
          <span>vol.1 · ch.{padded}</span>
          <span aria-hidden className="text-amber/40">
            ✦
          </span>
          <span className="font-display italic text-amber">{content.title}</span>
        </div>

        <div className="flex items-center gap-4 font-mono text-mono-s tracking-caps text-ink-dim uppercase">
          <button
            type="button"
            aria-label="prev page"
            className="text-ink-dim hover:text-ink"
            disabled={currentPage <= 1}
          >
            ←
          </button>
          <span className="text-ink">
            {currentPage} of {pagesTotal}
          </span>
          <button
            type="button"
            aria-label="next page"
            className="text-ink-dim hover:text-ink"
            disabled={currentPage >= pagesTotal}
          >
            →
          </button>
        </div>

        <div className="flex items-center justify-end gap-4 font-mono text-mono-s tracking-caps text-ink-dim uppercase">
          <span className="text-ink-faint">из {pagesTotal * 20} страниц</span>
          <span aria-hidden className="text-ink-faint">
            ★
          </span>
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="settings"
            className="font-display text-base text-ink hover:text-amber"
          >
            Aa
          </button>
          <span className="text-ink-faint">+</span>
          <span className="text-ink-faint">#{chapter}</span>
        </div>
      </header>

      {/* Side arrows for chapter navigation */}
      {prevChapter ? (
        <Link
          href={`/reader/${storyId}/${prevChapter.n}` as Route}
          aria-label={`prev chapter: ${prevChapter.title}`}
          className="fixed left-4 top-1/2 z-20 -translate-y-1/2 font-mono text-display-s text-ink-faint transition-colors hover:text-amber"
        >
          ‹
        </Link>
      ) : null}
      {nextChapter ? (
        <Link
          href={`/reader/${storyId}/${nextChapter.n}` as Route}
          aria-label={`next chapter: ${nextChapter.title}`}
          className="fixed right-4 top-1/2 z-20 -translate-y-1/2 font-mono text-display-s text-ink-faint transition-colors hover:text-amber"
        >
          ›
        </Link>
      ) : null}

      {/* Body — 2-col magazine flow */}
      <article
        className={`mx-auto max-w-[1100px] px-12 pt-10 pb-12 columns-2 gap-12 [column-fill:balance] reader-spread ${fontFamilyClass}`}
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: 1.65,
          textAlign: settings.justify ? 'justify' : 'left',
          hyphens: settings.hyphens ? 'auto' : 'manual',
        }}
      >
        <h1 className="mb-6 font-display text-[40px] leading-[1.05] text-balance break-after-avoid">
          {content.section ?? content.title}
        </h1>

        {content.paragraphs.map((p, i) => {
          const isDialog = p.startsWith('«') || p.startsWith('—');
          const className = [
            i === 0 ? 'reader-first-paragraph' : '',
            isDialog && i !== 0 ? 'italic text-ink/95' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <p
              key={i}
              className={className}
              style={{
                marginBottom: '1em',
                breakInside: 'avoid-column',
              }}
            >
              {i === 0 ? (
                <>
                  <span
                    aria-hidden
                    style={{
                      float: 'left',
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontSize: '4em',
                      lineHeight: 0.85,
                      color: 'var(--hc-amber)',
                      paddingRight: '0.1em',
                      marginTop: '0.05em',
                    }}
                  >
                    {p.charAt(0)}
                  </span>
                  {p.slice(1)}
                </>
              ) : (
                renderDialogText(p)
              )}
            </p>
          );
        })}

        {/* Inline NEXT card at end of column flow */}
        {nextChapter ? (
          <div
            className="mt-6 break-inside-avoid rounded-md border border-ink-faint/20 bg-surface-raised p-5"
            style={{ breakInside: 'avoid-column' }}
          >
            <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">next</div>
            <div className="mt-1 font-display italic text-ink">
              ch.{nextChapter.n} · {nextChapter.title}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                aria-label="night mode"
                className="rounded-full border border-chrome-1/40 px-3 py-1.5 font-mono text-mono-s tracking-caps text-chrome-1 uppercase"
              >
                ☾ night
              </button>
              <Link
                href={`/reader/${storyId}/${nextChapter.n}` as Route}
                onClick={() => track('reader_next_tap', { next_n: nextChapter.n })}
                className="rounded-full bg-amber px-4 py-1.5 font-mono text-mono-s tracking-caps text-bg-deep uppercase shadow-amber-glow"
              >
                запомнить · ch.{chapter} ▸
              </Link>
              {hasWatch ? (
                <Link
                  href={`/watch/${storyId}/${nextChapter.n}` as Route}
                  className="ml-auto rounded-full border border-chrome-2/40 px-3 py-1.5 font-mono text-mono-s tracking-caps text-chrome-2 uppercase"
                >
                  ▸ watch
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </article>
    </div>
  );
}

// Highlight dialog quote « ... » in amber italic, leave the rest as-is.
// Russian em-dash dialogue (— ...) is already amber via the paragraph-level italic class.
function renderDialogText(p: string) {
  const out: (string | { quoted: string; key: number })[] = [];
  let last = 0;
  const re = /«[^»]+»/g;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(p)) !== null) {
    if (m.index > last) out.push(p.slice(last, m.index));
    out.push({ quoted: m[0], key: key++ });
    last = m.index + m[0].length;
  }
  if (last < p.length) out.push(p.slice(last));
  if (out.length === 0) return p;
  return out.map((piece, i) =>
    typeof piece === 'string' ? (
      <span key={`t-${i}`}>{piece}</span>
    ) : (
      <span key={`q-${piece.key}`} className="italic text-amber/95">
        {piece.quoted}
      </span>
    ),
  );
}
