import { Fragment, type ReactNode } from 'react';

// Сначала **bold**, затем *italic*. Порядок важен (** до *).
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

/** Рендерит inline markdown (**bold**, *italic*) в React-узлы. Без маркеров — возвращает строку как есть. */
export function renderInline(text: string): ReactNode {
  const parts = text.split(TOKEN).filter((s) => s !== '');
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
