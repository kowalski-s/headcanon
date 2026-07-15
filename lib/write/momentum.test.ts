import { describe, expect, it } from 'vitest';
import { computeStreak, deskLead, nightsWord, sparklineDays } from './momentum';

const d = (s: string) => new Date(`${s}T00:00:00Z`);
const today = d('2026-07-15');

describe('computeStreak', () => {
  it('считает подряд идущие дни, заканчивая сегодня', () => {
    const stats = [
      { date: d('2026-07-15'), wordsAdded: 120 },
      { date: d('2026-07-14'), wordsAdded: 300 },
      { date: d('2026-07-13'), wordsAdded: 45 },
      { date: d('2026-07-10'), wordsAdded: 500 }, // разрыв — не в стрике
    ];
    expect(computeStreak(stats, today)).toBe(3);
  });
  it('стрик жив, если сегодня ещё не писала, но вчера писала', () => {
    expect(computeStreak([{ date: d('2026-07-14'), wordsAdded: 10 }], today)).toBe(1);
  });
  it('0 без записей за сегодня/вчера', () => {
    expect(computeStreak([{ date: d('2026-07-10'), wordsAdded: 10 }], today)).toBe(0);
  });
});

describe('sparklineDays', () => {
  it('14 значений, пропуски нулями, старые → новые', () => {
    const arr = sparklineDays([{ date: d('2026-07-15'), wordsAdded: 200 }], today, 14);
    expect(arr).toHaveLength(14);
    expect(arr[13]).toBe(200);
    expect(arr[0]).toBe(0);
  });
});

describe('deskLead', () => {
  it('шаблон с числом ночей и главой', () => {
    expect(
      deskLead({
        storyTitle: 'Пепел и мята',
        chapterOrdinal: 7,
        lastEditedAt: d('2026-07-12'),
        today,
      }),
    ).toBe('Три ночи назад ты оставила «Пепел и мята» — глава 7 ждёт.');
  });
  it('сегодняшняя правка — другой шаблон', () => {
    expect(
      deskLead({ storyTitle: 'X', chapterOrdinal: 2, lastEditedAt: today, today }),
    ).toBe('Сегодня ты уже была за столом — глава 2 ждёт продолжения.');
  });
});

describe('nightsWord', () => {
  it.each([
    [1, 'ночь'],
    [3, 'ночи'],
    [9, 'ночей'],
    [21, 'ночь'],
  ])('%i → %s', (n, w) => expect(nightsWord(n)).toBe(w));
});
