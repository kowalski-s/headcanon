'use client';
import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ornament } from '@/components/ui/Ornament';
import { ParagraphMenu, type ParagraphMenuMode } from './ParagraphMenu';
import { InlineRegenStream } from './InlineRegenStream';
import { AgeGateModal } from './AgeGateModal';
import { DEV_USER_ID } from '@/lib/auth/dev-user';
import type { RegenMode } from '@/lib/prompts/paragraph-regen';
import type { ReaderSettings } from '@/lib/reader/useReaderSettings';

interface Props {
  paragraphs: Array<{ id: string; text: string }>;
  settings: ReaderSettings;
  canEdit: boolean;
  bodyRef?: React.RefObject<HTMLElement | null>;
}

export function EditableReaderBody({ paragraphs, settings, canEdit, bodyRef }: Props) {
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [regen, setRegen] = useState<{ paragraphId: string; mode: RegenMode } | null>(null);
  const [ageGateFor, setAgeGateFor] = useState<string | null>(null);

  const fontFamilyClass =
    settings.font === 'bodoni'
      ? 'font-display'
      : settings.font === 'cormorant'
        ? 'font-display'
        : 'font-body';

  const onAction = async (paragraphId: string, mode: ParagraphMenuMode) => {
    if (mode === 'delete') {
      await fetch(`/api/paragraph/${paragraphId}`, {
        method: 'DELETE',
        headers: { 'x-test-user-id': DEV_USER_ID },
      });
      router.refresh();
      return;
    }
    setRegen({ paragraphId, mode });
  };

  return (
    <article
      ref={bodyRef as React.RefObject<HTMLElement>}
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
        const isRegen = regen?.paragraphId === p.id;
        return (
          <Fragment key={p.id}>
            {isRegen ? (
              <InlineRegenStream
                oldText={p.text}
                endpoint={`/api/paragraph/${p.id}/regen`}
                body={{ mode: regen.mode }}
                headers={{ 'x-test-user-id': DEV_USER_ID }}
                onFinish={() => {
                  setRegen(null);
                  router.refresh();
                }}
                onError={(e) => {
                  setRegen(null);
                  if (e.message === 'age_gate') setAgeGateFor(p.id);
                }}
              />
            ) : (
              <p
                className={`relative ${i === 0 ? 'reader-first-paragraph' : ''}`}
                style={{ marginBottom: '1em' }}
                onClick={() => canEdit && setOpenMenuId(p.id)}
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
                      {p.text.charAt(0)}
                    </span>
                    {p.text.slice(1)}
                  </>
                ) : (
                  p.text
                )}
                {canEdit && openMenuId === p.id ? (
                  <ParagraphMenu
                    open
                    onClose={() => setOpenMenuId(null)}
                    onAction={(m) => onAction(p.id, m)}
                  />
                ) : null}
              </p>
            )}
            {showOrnament ? (
              <div className="my-6">
                <Ornament size="sm" />
              </div>
            ) : null}
          </Fragment>
        );
      })}
      {ageGateFor ? (
        <AgeGateModal
          onClose={() => setAgeGateFor(null)}
          onConfirm={async () => {
            await fetch('/api/me/confirm-age', {
              method: 'POST',
              headers: { 'x-test-user-id': DEV_USER_ID },
            });
            setAgeGateFor(null);
            router.refresh();
          }}
        />
      ) : null}
    </article>
  );
}
