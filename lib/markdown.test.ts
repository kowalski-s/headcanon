import { describe, it, expect } from 'vitest';
import { tiptapDocToMarkdown, markdownToParagraphs } from './markdown';

const doc = {
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Привет ' }, { type: 'text', marks: [{ type: 'italic' }], text: 'мир' }] },
    { type: 'horizontalRule' },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Глава' }] },
    { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'жирный' }] },
  ],
};

describe('tiptapDocToMarkdown', () => {
  it('serializes paragraphs, marks, hr, headings', () => {
    expect(tiptapDocToMarkdown(doc)).toBe('Привет *мир*\n\n---\n\n## Глава\n\n**жирный**');
  });
  it('empty doc → empty string', () => {
    expect(tiptapDocToMarkdown({ type: 'doc', content: [] })).toBe('');
  });
});

describe('markdownToParagraphs', () => {
  it('splits on blank lines, keeps hr as its own block', () => {
    expect(markdownToParagraphs('a\n\n---\n\nb')).toEqual(['a', '---', 'b']);
  });
  it('strips heading marker but keeps text as a paragraph', () => {
    expect(markdownToParagraphs('## Глава\n\nтекст')).toEqual(['Глава', 'текст']);
  });
});
