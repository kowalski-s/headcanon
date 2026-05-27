import { markdownToParagraphs } from '@/lib/markdown';

type ChapterLike = { text: string; paragraphs: { text: string }[] };

/**
 * Единый источник параграфов для читалки.
 * Если есть Paragraph-строки (generator path) — используем их.
 * Иначе (writer path) — разбиваем markdown `text` на параграфы.
 */
export function chapterToParagraphs(ch: ChapterLike): string[] {
  if (ch.paragraphs.length > 0) return ch.paragraphs.map((p) => p.text);
  return markdownToParagraphs(ch.text);
}
