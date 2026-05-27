import { describe, it, expect } from 'vitest';
import { chapterToParagraphs } from './written-paragraphs';

describe('chapterToParagraphs', () => {
  it('GENERATED: joins Paragraph rows', () => {
    const ch = { text: '', paragraphs: [{ text: 'a' }, { text: 'b' }] };
    expect(chapterToParagraphs(ch)).toEqual(['a', 'b']);
  });
  it('WRITTEN: splits markdown text on blank lines, strips heading markers', () => {
    const ch = { text: '## Заголовок\n\nПервый.\n\nВторой.', paragraphs: [] };
    expect(chapterToParagraphs(ch)).toEqual(['Заголовок', 'Первый.', 'Второй.']);
  });
});
