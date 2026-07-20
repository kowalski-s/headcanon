'use client';

import { useEffect, useState } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/react';
import { Editor, type EditorMode } from './Editor';
import { apiFetch } from '@/lib/api/client';

export type SaveStatus = 'idle' | 'saving' | 'saved';

type Props = {
  chapterId: string;
  initialMarkdown: string;
  mode?: EditorMode;
  /** Поднимаем статус автосейва и счётчик слов в chrome-шапку. */
  onStatusChange?: (status: SaveStatus) => void;
  onWordCount?: (n: number) => void;
  onTyping?: () => void;
  onEditorReady?: (editor: TiptapEditor | null) => void;
};

export function ChapterEditor({
  chapterId,
  initialMarkdown,
  mode = 'write',
  onStatusChange,
  onWordCount,
  onTyping,
  onEditorReady,
}: Props) {
  const [status, setStatus] = useState<SaveStatus>('idle');

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  async function save(markdown: string) {
    setStatus('saving');
    await apiFetch('/api/write/chapter/' + chapterId, {
      method: 'PATCH',
      body: JSON.stringify({ text: markdown }),
    });
    setStatus('saved');
  }

  return (
    <Editor
      initialMarkdown={initialMarkdown}
      onSave={save}
      mode={mode}
      onWordCount={onWordCount}
      onTyping={onTyping}
      onEditorReady={onEditorReady}
    />
  );
}
