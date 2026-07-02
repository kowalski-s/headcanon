'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef } from 'react';
import { tiptapDocToMarkdown } from '@/lib/markdown';

type Props = {
  initialMarkdown: string;
  onSave: (markdown: string) => void; // debounced снаружи
};

export function Editor({ initialMarkdown, onSave }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editor = useEditor({
    immediatelyRender: false, // Next SSR
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        code: false,
        codeBlock: false,
        blockquote: false,
      }),
    ],
    // initialMarkdown — простой текст/markdown; StarterKit примет как параграфы.
    content: initialMarkdown,
    onUpdate: ({ editor }) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(
        () => onSave(tiptapDocToMarkdown(editor.getJSON() as never)),
        1500,
      );
    },
  });

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return <EditorContent editor={editor} className="prose-reader min-h-[300px] outline-none" />;
}
