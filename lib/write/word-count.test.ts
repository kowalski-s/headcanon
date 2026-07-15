import { describe, expect, it } from 'vitest';
import { countWords } from './word-count';

describe('countWords', () => {
  it('считает слова обычного текста', () => {
    expect(countWords('Драко всё ещё стоял у окна.')).toBe(6);
  });
  it('не считает markdown-разметку и пустоту', () => {
    expect(countWords('# Глава 1\n\n**Тьма** сгущалась --- быстро.')).toBe(5); // Глава 1 Тьма сгущалась быстро
    expect(countWords('')).toBe(0);
    expect(countWords('   \n\n  ')).toBe(0);
  });
});
