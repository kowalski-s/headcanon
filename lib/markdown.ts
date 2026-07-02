type Mark = { type: string };
type Node = {
  type: string;
  text?: string;
  marks?: Mark[];
  attrs?: { level?: number };
  content?: Node[];
};

function inline(nodes: Node[] = []): string {
  return nodes
    .map((n) => {
      let t = n.text ?? '';
      const marks = new Set((n.marks ?? []).map((m) => m.type));
      if (marks.has('bold')) t = `**${t}**`;
      if (marks.has('italic')) t = `*${t}*`;
      return t;
    })
    .join('');
}

/** TipTap JSON-документ → markdown. Поддержка: paragraph, heading(h2/h3), bold, italic, horizontalRule. */
export function tiptapDocToMarkdown(doc: Node): string {
  const blocks = (doc.content ?? []).map((node) => {
    switch (node.type) {
      case 'paragraph':
        return inline(node.content);
      case 'heading':
        return `${'#'.repeat(node.attrs?.level ?? 2)} ${inline(node.content)}`;
      case 'horizontalRule':
        return '---';
      default:
        return inline(node.content);
    }
  });
  return blocks.join('\n\n').trim();
}

/** markdown → массив параграфов для читалки. Заголовки → текст без маркера; hr остаётся как '---'. */
export function markdownToParagraphs(md: string): string[] {
  return md
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => b.replace(/^#{1,6}\s+/, ''));
}
