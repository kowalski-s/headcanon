'use client';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { useEffect, useRef, useState } from 'react';
import { tiptapDocToMarkdown } from '@/lib/markdown';
import { countWords } from '@/lib/write/word-count';

export type EditorMode = 'write' | 'focus' | 'typewriter';

type Props = {
  initialMarkdown: string;
  onSave: (markdown: string) => void; // debounce внутри
  mode?: EditorMode;
  onWordCount?: (n: number) => void;
  onTyping?: () => void;
};

/**
 * Подсвечивает абзац с кареткой классом `hc-active-para` — на нём держатся режимы
 * фокус/машинка (остальные абзацы гаснут через CSS). Живёт декорацией ProseMirror,
 * document не мутирует.
 */
const ActiveParagraph = Extension.create({
  name: 'activeParagraph',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('activeParagraph'),
        props: {
          decorations(state) {
            const { $from } = state.selection;
            if ($from.depth < 1) return DecorationSet.empty;
            const before = $from.before(1);
            const node = state.doc.nodeAt(before);
            if (!node) return DecorationSet.empty;
            return DecorationSet.create(state.doc, [
              Decoration.node(before, before + node.nodeSize, { class: 'hc-active-para' }),
            ]);
          },
        },
      }),
    ];
  },
});

export function Editor({ initialMarkdown, onSave, mode = 'write', onWordCount, onTyping }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

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
      ActiveParagraph,
    ],
    // initialMarkdown — простой текст/markdown; StarterKit примет как параграфы.
    content: initialMarkdown,
    onCreate: ({ editor }) => {
      setIsEmpty(editor.isEmpty);
      onWordCount?.(countWords(tiptapDocToMarkdown(editor.getJSON() as never)));
    },
    onUpdate: ({ editor }) => {
      onTyping?.();
      setIsEmpty(editor.isEmpty);
      const md = tiptapDocToMarkdown(editor.getJSON() as never);
      onWordCount?.(countWords(md));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => onSave(md), 1500);
    },
  });

  // Печатная машинка: держим строку с кареткой по центру вертикали.
  useEffect(() => {
    if (!editor || mode !== 'typewriter') return;
    const center = () => {
      const container = scrollRef.current;
      if (!container) return;
      const { from } = editor.state.selection;
      const coords = editor.view.coordsAtPos(from);
      const box = container.getBoundingClientRect();
      const caretMid = coords.top - box.top + container.scrollTop;
      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      container.scrollTo({
        top: caretMid - container.clientHeight / 2,
        behavior: reduce ? 'auto' : 'smooth',
      });
    };
    center();
    editor.on('selectionUpdate', center);
    editor.on('update', center);
    return () => {
      editor.off('selectionUpdate', center);
      editor.off('update', center);
    };
  }, [editor, mode]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <div ref={scrollRef} data-mode={mode} className="hc-manuscript relative h-full overflow-y-auto">
      {editor && (
        <BubbleMenu
          editor={editor}
          className="flex items-center gap-1 rounded-full border border-strong bg-panel/95 px-1.5 py-1 shadow-poster backdrop-blur"
        >
          <button
            type="button"
            aria-label="Полужирный"
            aria-pressed={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded-full px-2.5 py-1 font-display text-[15px] font-bold leading-none transition-colors ${
              editor.isActive('bold') ? 'text-amber' : 'text-ink-dim hover:text-ink'
            }`}
          >
            Ж
          </button>
          <button
            type="button"
            aria-label="Курсив"
            aria-pressed={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded-full px-2.5 py-1 font-display text-[15px] italic leading-none transition-colors ${
              editor.isActive('italic') ? 'text-amber' : 'text-ink-dim hover:text-ink'
            }`}
          >
            К
          </button>
          <span className="mx-0.5 h-4 w-px bg-border" aria-hidden />
          <button
            type="button"
            aria-label="Заголовок сцены"
            aria-pressed={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`rounded-full px-2.5 py-1 font-mono text-mono-s tracking-caps uppercase leading-none transition-colors ${
              editor.isActive('heading', { level: 2 })
                ? 'text-amber'
                : 'text-ink-dim hover:text-ink'
            }`}
          >
            H
          </button>
        </BubbleMenu>
      )}

      {isEmpty && mode === 'write' && (
        <p
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 font-body text-[18px] italic leading-[1.62] text-ink-faint"
        >
          С чего начнём эту главу?
        </p>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
