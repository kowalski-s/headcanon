const DAY = 86_400_000;
const utcDay = (d: Date) => Math.floor(d.getTime() / DAY);

export function computeStreak(stats: { date: Date; wordsAdded: number }[], today: Date): number {
  const days = new Set(stats.filter((s) => s.wordsAdded > 0).map((s) => utcDay(s.date)));
  const t = utcDay(today);
  let cursor = days.has(t) ? t : days.has(t - 1) ? t - 1 : null;
  if (cursor === null) return 0;
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
}

export function sparklineDays(
  stats: { date: Date; wordsAdded: number }[],
  today: Date,
  days = 14,
): number[] {
  const byDay = new Map(stats.map((s) => [utcDay(s.date), s.wordsAdded]));
  const t = utcDay(today);
  return Array.from({ length: days }, (_, i) => byDay.get(t - (days - 1 - i)) ?? 0);
}

export function nightsWord(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'ночей';
  if (mod10 === 1) return 'ночь';
  if (mod10 >= 2 && mod10 <= 4) return 'ночи';
  return 'ночей';
}

const NIGHT_NUMERALS = [
  '',
  'Одну ночь',
  'Две ночи',
  'Три ночи',
  'Четыре ночи',
  'Пять ночей',
  'Шесть ночей',
];

export function deskLead({
  storyTitle,
  chapterOrdinal,
  lastEditedAt,
  today,
}: {
  storyTitle: string;
  chapterOrdinal: number;
  lastEditedAt: Date;
  today: Date;
}): string {
  const nights = utcDay(today) - utcDay(lastEditedAt);
  if (nights <= 0)
    return `Сегодня ты уже была за столом — глава ${chapterOrdinal} ждёт продолжения.`;
  const lead =
    nights < NIGHT_NUMERALS.length ? NIGHT_NUMERALS[nights] : `${nights} ${nightsWord(nights)}`;
  return `${lead} назад ты оставила «${storyTitle}» — глава ${chapterOrdinal} ждёт.`;
}
