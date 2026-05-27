'use client';

import { useState } from 'react';
import { Editor } from './Editor';
import { apiFetch } from '@/lib/api/client';

type Props = {
  chapterId: string;
  initialMarkdown: string;
};

type SaveStatus = 'idle' | 'saving' | 'saved';

export function ChapterEditor({ chapterId, initialMarkdown }: Props) {
  const [status, setStatus] = useState<SaveStatus>('idle');

  async function save(markdown: string) {
    setStatus('saving');
    await apiFetch('/api/write/chapter/' + chapterId, {
      method: 'PATCH',
      body: JSON.stringify({ text: markdown }),
    });
    setStatus('saved');
  }

  const statusLabel: Record<SaveStatus, string | null> = {
    idle: null,
    saving: 'Сохранение…',
    saved: 'Сохранено',
  };

  return (
    <div className="flex flex-col gap-2">
      <Editor initialMarkdown={initialMarkdown} onSave={save} />
      {status !== 'idle' && (
        <p className="font-mono text-mono-s tracking-caps uppercase text-ink-faint">
          {statusLabel[status]}
        </p>
      )}
    </div>
  );
}
