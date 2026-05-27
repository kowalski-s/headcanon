import { Fragment, memo } from 'react';
import type { RefObject } from 'react';
import { Ornament } from '@/components/ui/Ornament';
import type { ReaderSettings } from '@/lib/reader/useReaderSettings';
import { renderInline } from '@/lib/markdown-inline';

type Props = {
  paragraphs: string[];
  settings: ReaderSettings;
  bodyRef?: RefObject<HTMLElement | null>;
  /**
   * True while the chapter is actively streaming. Forces left-align + manual hyphens
   * so the growing last paragraph doesn't recompute word-spacing and shift earlier
   * characters horizontally on every token.
   */
  streaming?: boolean;
};

const ParagraphLine = memo(function ParagraphLine({ text, isFirst }: { text: string; isFirst: boolean }) {
  return (
    <p className={isFirst ? 'reader-first-paragraph' : ''} style={{ marginBottom: '1em' }}>
      {isFirst ? (
        <>
          <span
            style={{
              float: 'left',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: '4em',
              lineHeight: 0.85,
              color: 'var(--color-amber-default, #d97706)',
              paddingRight: '0.1em',
              marginTop: '0.05em',
            }}
          >
            {text.charAt(0)}
          </span>
          {renderInline(text.slice(1))}
        </>
      ) : (
        renderInline(text)
      )}
    </p>
  );
});

export function ReaderBody({ paragraphs, settings, bodyRef, streaming = false }: Props) {
  const fontFamilyClass =
    settings.font === 'bodoni'
      ? 'font-display'
      : settings.font === 'cormorant'
        ? 'font-display' // M1: cormorant пока не подключён, используем display fallback
        : 'font-body';

  return (
    <article
      ref={bodyRef as RefObject<HTMLElement>}
      className={`mx-auto max-w-[660px] px-4 py-6 ${fontFamilyClass}${streaming ? ' reader-streaming' : ''}`}
      style={{
        fontSize: `${settings.fontSize}px`,
        lineHeight: 1.6,
        textAlign: streaming ? 'left' : settings.justify ? 'justify' : 'left',
        hyphens: streaming || !settings.hyphens ? 'manual' : 'auto',
      }}
    >
      {paragraphs.map((p, i) => {
        const showOrnament = (i + 1) % 4 === 0 && i !== paragraphs.length - 1;
        return (
          <Fragment key={i}>
            <ParagraphLine text={p} isFirst={i === 0} />
            {showOrnament ? (
              <div className="my-6">
                <Ornament size="sm" />
              </div>
            ) : null}
          </Fragment>
        );
      })}
    </article>
  );
}
