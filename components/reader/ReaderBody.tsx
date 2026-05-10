import { Fragment } from 'react';
import type { RefObject } from 'react';
import { Ornament } from '@/components/ui/Ornament';
import type { ReaderSettings } from '@/lib/reader/useReaderSettings';

type Props = {
  paragraphs: string[];
  settings: ReaderSettings;
  bodyRef?: RefObject<HTMLElement | null>;
};

export function ReaderBody({ paragraphs, settings, bodyRef }: Props) {
  const fontFamilyClass =
    settings.font === 'bodoni'
      ? 'font-display'
      : settings.font === 'cormorant'
      ? 'font-display' // M1: cormorant пока не подключён, используем display fallback
      : 'font-body';

  return (
    <article
      ref={bodyRef as RefObject<HTMLElement>}
      className={`mx-auto max-w-[660px] px-4 py-6 ${fontFamilyClass}`}
      style={{
        fontSize: `${settings.fontSize}px`,
        lineHeight: 1.6,
        textAlign: settings.justify ? 'justify' : 'left',
        hyphens: settings.hyphens ? 'auto' : 'manual',
      }}
    >
      {paragraphs.map((p, i) => {
        const showOrnament = (i + 1) % 4 === 0 && i !== paragraphs.length - 1;
        return (
          <Fragment key={i}>
            <p
              className={i === 0 ? 'reader-first-paragraph' : ''}
              style={{ marginBottom: '1em' }}
            >
              {i === 0 ? (
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
                    {p.charAt(0)}
                  </span>
                  {p.slice(1)}
                </>
              ) : (
                p
              )}
            </p>
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
