# V2 Этап A0+A1 — токены v2 + «Мой стол» — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести дизайн-фундамент на палитру handoff v2 (+ тема «бумага», пилюли-ревизия) и заменить workspace «Мои истории» на дашборд «Мой стол» с momentum-панелью (стрик, спарклайн, литературная подводка) и guided-start пустым состоянием.

**Architecture:** Токены остаются CSS-переменными в `handoff/tokens.css` + маппинг в `handoff/tailwind.preset.js`. Momentum строится на новой Prisma-модели `WritingStat` (дневная дельта слов на юзера), которую пополняет существующий autosave-роут `PATCH /api/write/chapter/[id]`. «Мой стол» — server component `app/write/page.tsx` + клиентские компоненты в `components/desk/`.

**Tech Stack:** Next.js 15 App Router, Tailwind 4 (preset), Prisma 7, Vitest, Storybook. Новых npm-зависимостей в этом плане НЕТ (d3-force — только в плане A4).

## Global Constraints

- Дизайн-источник: `docs/design_handoff_writer_v2/` (README §Design Tokens, §05 Мой стол; DESIGN-writer §1 дашборд). Палитра v2 точно: bg `#160B22`, surface `#1F1230`, panel `#1A0E29`, ink `#F5EFE0`, inkDim `#A89BB5`, inkFaint `#6E6478`, amber `#E5A95A`, rose `#D67890`, border `rgba(245,239,224,.10)`, borderStrong `rgba(245,239,224,.20)`, amberSoft `rgba(229,169,90,.14)`, glow `rgba(229,169,90,.22)`. Тема «бумага»: bg `#EDE4D4`, surface `#F7F1E4`, ink `#241830`, amber `#A8691F`.
- Пилюли: radius 999, font-weight **500** (не 600), паддинги primary ~7×15 / hero ~9×20, БЕЗ glow-теней, Bodoni-курсив в лейблах.
- Кнопочный запрет: никаких `--hc-shadow-amber-glow` на новых кнопках.
- Пустые состояния — guided start, не blank canvas. Ошибки — литературный голос.
- Все числа в mono-ярлыках — `toLocaleString('ru-RU')` (`12 480 СЛ`).
- API: auth + ownership по образцу существующих write-роутов, вход через zod.
- Гейты перед каждым коммитом: `pnpm typecheck && pnpm lint && pnpm test` (format держит Stop-хук).
- Git: solo-dev, коммит + push сразу в `main`; перед первым коммитом `git fetch && git pull --rebase`.
- Существующий генератор/читалку не трогаем; `components/write/StoryList.tsx` не удалять (используется в stories) — страница перестаёт его рендерить.

---

### Task 1: Токены v2 в tokens.css + tailwind preset

**Files:**
- Modify: `handoff/tokens.css`
- Modify: `handoff/tailwind.preset.js`
- Modify: `handoff/tokens.json` (значения синхронно)

**Interfaces:**
- Produces: CSS-переменные `--hc-bg: #160b22`, `--hc-surface-solid`, `--hc-panel`, ink-based `--hc-border`/`--hc-border-strong`, `--hc-glow`, блок `[data-theme='paper']`; Tailwind-классы `bg-surface-solid`, `bg-panel`.

- [ ] **Step 1: Обновить значения в `handoff/tokens.css`**

В блоке `:root` заменить/добавить (остальные переменные не трогать):

```css
  /* v2 (design_handoff_writer_v2, 2026-07): канон DESIGN.md — #160b22.
     Прежний тёплый #1a0e26 (bump 2026-05-10) отменён handoff-ом v2. */
  --hc-bg: #160b22;
  --hc-bg-alt: #1f1230;
  --hc-bg-deep: #08040f;

  --hc-surface: rgba(245, 239, 224, 0.04);
  --hc-surface-raised: rgba(245, 239, 224, 0.06);
  --hc-surface-solid: #1f1230; /* v2: карточки стола/библии */
  --hc-panel: #1a0e29; /* v2: панели и инпуты */

  --hc-amber-soft: rgba(229, 169, 90, 0.14);
  --hc-glow: rgba(229, 169, 90, 0.22);

  /* v2: линии — ink-based, не amber-based */
  --hc-border: rgba(245, 239, 224, 0.1);
  --hc-border-strong: rgba(245, 239, 224, 0.2);
```

И в конец файла — тему «бумага» (scoped, применяется на контейнере редактора в A2, заводим сейчас):

```css
/* Светлая тема редактора «бумага» (v2). Вешается на контейнер: data-theme="paper" */
[data-theme='paper'] {
  --hc-bg: #ede4d4;
  --hc-surface-solid: #f7f1e4;
  --hc-panel: #f7f1e4;
  --hc-ink: #241830;
  --hc-ink-dim: #5c4f6e;
  --hc-ink-faint: #8a7f96;
  --hc-amber: #a8691f;
  --hc-amber-soft: rgba(168, 105, 31, 0.14);
  --hc-glow: rgba(168, 105, 31, 0.18);
  --hc-border: rgba(36, 24, 48, 0.12);
  --hc-border-strong: rgba(36, 24, 48, 0.24);
  background: var(--hc-bg);
  color: var(--hc-ink);
}
```

- [ ] **Step 2: Добавить маппинг в `handoff/tailwind.preset.js`**

В `theme.extend.colors`:

```js
        surface: {
          DEFAULT: 'var(--hc-surface)',
          raised: 'var(--hc-surface-raised)',
          solid: 'var(--hc-surface-solid)',
        },
        panel: 'var(--hc-panel)',
        glow: 'var(--hc-glow)',
```

(ключи `surface.solid`, `panel`, `glow` — новые; остальное без изменений.)

- [ ] **Step 3: Синхронизировать `handoff/tokens.json`** — те же значения в секции `colors` (bg, surface.solid, panel, border, glow, paper-блок).

- [ ] **Step 4: Верификация**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: зелёно (токены — значения переменных, существующие тесты на классы не завязаны на hex).

Run: `pnpm build`
Expected: сборка проходит.

- [ ] **Step 5: Commit**

```bash
git add handoff/tokens.css handoff/tailwind.preset.js handoff/tokens.json
git commit -m "feat(design): токены v2 — палитра handoff v2, surface-solid/panel, тема «бумага» (A0-01)"
```

---

### Task 2: Атом Pill (кнопочный язык v2)

**Files:**
- Create: `components/ui/Pill.tsx`
- Create: `components/ui/Pill.stories.tsx`
- Test: `components/ui/Pill.test.tsx`

**Interfaces:**
- Consumes: токены Task 1.
- Produces: `<Pill variant="primary" | "ghost" | "hero" href?={string} onClick?, children>` — рендерит `<a>` при href, иначе `<button>`. Используется в Task 6–8 и всех следующих планах.

- [ ] **Step 1: Написать failing-тест `components/ui/Pill.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Pill } from './Pill';

describe('Pill', () => {
  it('рендерит button по умолчанию и ссылку при href', () => {
    render(<Pill variant="primary">продолжить</Pill>);
    expect(screen.getByRole('button', { name: 'продолжить' })).toBeInTheDocument();
    render(
      <Pill variant="ghost" href="/write">
        назад
      </Pill>,
    );
    expect(screen.getByRole('link', { name: 'назад' })).toHaveAttribute('href', '/write');
  });

  it('primary — амбер-заливка, вес 500, без glow-тени', () => {
    render(<Pill variant="primary">начать</Pill>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('rounded-full');
    expect(btn.className).toContain('font-medium');
    expect(btn.className).not.toContain('shadow');
  });
});
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `pnpm test components/ui/Pill.test.tsx`
Expected: FAIL — `Cannot find module './Pill'`.

- [ ] **Step 3: Реализовать `components/ui/Pill.tsx`**

```tsx
import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'hero';

// Кнопочный язык v2: пилюля, вес 500, узкие паддинги, без glow-теней.
const base =
  'inline-flex items-center justify-center gap-1.5 rounded-full font-ui font-medium transition-colors duration-200';
const variants: Record<Variant, string> = {
  primary: 'bg-amber text-bg-deep px-[15px] py-[7px] text-sm hover:brightness-110',
  ghost:
    'border border-border-strong text-ink px-[15px] py-[7px] text-sm hover:border-amber hover:text-amber',
  hero: 'bg-amber text-bg-deep px-5 py-[9px] text-base hover:brightness-110',
};

export function Pill({
  variant = 'primary',
  href,
  onClick,
  type = 'button',
  className = '',
  children,
}: {
  variant?: Variant;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  children: ReactNode;
}) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Тест зелёный**

Run: `pnpm test components/ui/Pill.test.tsx`
Expected: PASS.

- [ ] **Step 5: Storybook story `components/ui/Pill.stories.tsx`** — три варианта рядом, включая Bodoni-курсив лейбл (`<span className="font-display italic">за стол →</span>` внутри hero).

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Pill } from './Pill';

const meta: Meta<typeof Pill> = { component: Pill, title: 'ui/Pill' };
export default meta;
type S = StoryObj<typeof Pill>;

export const Primary: S = { args: { variant: 'primary', children: 'продолжить гл. 7' } };
export const Ghost: S = { args: { variant: 'ghost', children: '☾ просто читать' } };
export const Hero: S = {
  args: {
    variant: 'hero',
    children: <span className="font-display italic">за стол →</span>,
  },
};
```

- [ ] **Step 6: Гейты + commit**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS.

```bash
git add components/ui/Pill.tsx components/ui/Pill.test.tsx components/ui/Pill.stories.tsx
git commit -m "feat(ui): атом Pill — кнопочный язык v2 (A0-02)"
```

---

### Task 3: Подсчёт слов — `lib/write/word-count.ts`

**Files:**
- Create: `lib/write/word-count.ts`
- Test: `lib/write/word-count.test.ts`

**Interfaces:**
- Produces: `countWords(markdown: string): number` — слова видимого текста markdown-главы. Используется в Task 4 (роут) и Task 5 (стол).

- [ ] **Step 1: Failing-тест `lib/write/word-count.test.ts`**

```ts
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
```

- [ ] **Step 2: Run** `pnpm test lib/write/word-count.test.ts` → FAIL (module not found).

- [ ] **Step 3: Реализация `lib/write/word-count.ts`**

```ts
/** Слова видимого текста markdown-главы: разметка (#, *, _, ---, >) не считается словами. */
export function countWords(markdown: string): number {
  const visible = markdown
    .replace(/^---+\s*$/gm, ' ') // сцена-брейки
    .replace(/[#>*_`~\[\]()]/g, ' ');
  const words = visible.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  return words.length;
}
```

- [ ] **Step 4: Run** тест → PASS. Если ассерты расходятся на 1 из-за трактовки «Глава 1» — правь ожидание в тесте осознанно (числа — слова), не реализацию под тест вслепую.

- [ ] **Step 5: Commit**

```bash
git add lib/write/word-count.ts lib/write/word-count.test.ts
git commit -m "feat(write): countWords для momentum и статусов обложек (A1-01)"
```

---

### Task 4: Модель `WritingStat` + дельта слов в autosave

**Files:**
- Modify: `prisma/schema.prisma`
- Create: миграция `pnpm prisma migrate dev --name writing_stat`
- Modify: `app/api/write/chapter/[id]/route.ts`
- Test: `app/api/write/chapter/[id]/route.test.ts` (расширить существующий)

**Interfaces:**
- Consumes: `countWords` (Task 3), существующий `ownChapterOr404`.
- Produces: модель `WritingStat { userId, date (Date @db.Date), wordsAdded Int }`, уникальность `[userId, date]`; PATCH с `text` инкрементит дневную дельту.

- [ ] **Step 1: Prisma-модель** — добавить в `prisma/schema.prisma` рядом с `DailyUsage`:

```prisma
/// Дневная дельта написанных слов — топливо momentum-панели «Моего стола».
model WritingStat {
  id         String   @id @default(cuid())
  userId     String
  date       DateTime @db.Date
  wordsAdded Int      @default(0)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@map("writing_stats")
}
```

(+ обратное поле `writingStats WritingStat[]` в `model User`.)

- [ ] **Step 2: Миграция**

Run: `pnpm prisma migrate dev --name writing_stat`
Expected: миграция создана и применена, `prisma generate` прошёл.

- [ ] **Step 3: Failing-тест** — в существующий `app/api/write/chapter/[id]/route.test.ts` добавить кейс (паттерн запроса/фикстур взять из соседних кейсов файла; помнить: shared-строки — upsert, live-DB):

```ts
it('PATCH text пишет положительную дельту слов в WritingStat', async () => {
  // глава с текстом «раз два» (2 слова) → PATCH текстом из 5 слов → дельта 3
  const ch = await createChapterFixture({ text: 'раз два' });
  await callPatch(ch.id, { text: 'раз два три четыре пять' });
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const stat = await prisma.writingStat.findUnique({
    where: { userId_date: { userId: TEST_USER_ID, date: today } },
  });
  expect(stat?.wordsAdded).toBe(3);
});

it('PATCH с удалением текста не уменьшает WritingStat', async () => {
  const ch = await createChapterFixture({ text: 'раз два три четыре пять' });
  await callPatch(ch.id, { text: 'раз два' });
  // стат не создан или не ушёл в минус
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const stat = await prisma.writingStat.findUnique({
    where: { userId_date: { userId: TEST_USER_ID, date: today } },
  });
  expect(stat?.wordsAdded ?? 0).toBeGreaterThanOrEqual(0);
});
```

(`createChapterFixture`/`callPatch`/`TEST_USER_ID` — использовать реальные хелперы этого файла; если их нет — писать запрос так же, как соседние тесты файла.)

- [ ] **Step 4: Run** → FAIL (`writingStat` не пополняется).

- [ ] **Step 5: Реализация в PATCH** (`app/api/write/chapter/[id]/route.ts`):

```ts
import { countWords } from '@/lib/write/word-count';

// внутри PATCH, после prisma.chapter.update:
if (parsed.data.text !== undefined) {
  const delta = countWords(parsed.data.text) - countWords(ch.text ?? '');
  if (delta > 0) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    await prisma.writingStat.upsert({
      where: { userId_date: { userId: ch.story.authorId, date } },
      create: { userId: ch.story.authorId, date, wordsAdded: delta },
      update: { wordsAdded: { increment: delta } },
    });
  }
}
```

- [ ] **Step 6: Run** тесты файла → PASS (таймаут 15_000ms, если кейс ходит в Supabase Cloud).

- [ ] **Step 7: Гейты + commit**

```bash
git add prisma/ app/api/write/chapter/
git commit -m "feat(write): WritingStat — дневная дельта слов из autosave (A1-01)"
```

---

### Task 5: Momentum-хелперы — стрик, спарклайн, подводка

**Files:**
- Create: `lib/write/momentum.ts`
- Test: `lib/write/momentum.test.ts`

**Interfaces:**
- Consumes: строки `WritingStat` (`{ date: Date; wordsAdded: number }[]`).
- Produces:
  - `computeStreak(stats, today: Date): number` — подряд «ночей» с wordsAdded>0, заканчивая сегодня или вчера;
  - `sparklineDays(stats, today: Date, days = 14): number[]` — массив wordsAdded по дням, старые → новые, пропуски = 0;
  - `deskLead(input: { storyTitle: string; chapterOrdinal: number; lastEditedAt: Date; today: Date }): string` — литературная подводка-шаблон;
  - `nightsWord(n: number): string` — «ночь / ночи / ночей».

- [ ] **Step 1: Failing-тесты `lib/write/momentum.test.ts`**

```ts
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
```

- [ ] **Step 2: Run** → FAIL (module not found).

- [ ] **Step 3: Реализация `lib/write/momentum.ts`**

```ts
const DAY = 86_400_000;
const utcDay = (d: Date) => Math.floor(d.getTime() / DAY);

export function computeStreak(
  stats: { date: Date; wordsAdded: number }[],
  today: Date,
): number {
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

const NIGHT_NUMERALS = ['', 'Одну ночь', 'Две ночи', 'Три ночи', 'Четыре ночи', 'Пять ночей', 'Шесть ночей'];

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
  if (nights <= 0) return `Сегодня ты уже была за столом — глава ${chapterOrdinal} ждёт продолжения.`;
  const lead =
    nights < NIGHT_NUMERALS.length ? NIGHT_NUMERALS[nights] : `${nights} ${nightsWord(nights)}`;
  return `${lead} назад ты оставила «${storyTitle}» — глава ${chapterOrdinal} ждёт.`;
}
```

- [ ] **Step 4: Run** → PASS (тест «Три ночи назад…»: 15−12 = 3 → `NIGHT_NUMERALS[3]`).

- [ ] **Step 5: Commit**

```bash
git add lib/write/momentum.ts lib/write/momentum.test.ts
git commit -m "feat(write): momentum-хелперы — стрик, спарклайн, литературная подводка (A1-03)"
```

---

### Task 6: Типографская обложка и полка стола

**Files:**
- Create: `components/desk/DeskCover.tsx` (+ `DeskCover.stories.tsx`)
- Create: `components/desk/DeskShelf.tsx` (+ `DeskShelf.stories.tsx`)
- Test: `tests/components/desk/DeskCover.test.tsx`

**Interfaces:**
- Consumes: `MonoBadge` (`components/ui/MonoBadge.tsx`), `GrainCover` (зерно поверх градиента), токены Task 1.
- Produces:
  - `<DeskCover story={{ id, title, ordinalCount, words, isPublished, gradientClass? }} />` — обложка 2:3: при `gradientClass` — градиент+зерно, иначе **типографская** (Bodoni-титул на `surface-solid`, амбер-хэйрлайн, mono-статус);
  - `<DeskShelf stories={DeskStory[]} />` — грид полки + пунктирная плитка «+ новая история» (ссылка на создание — тот же экшен, что в текущем `StoryList`).
  - Тип `DeskStory = { id: string; title: string; ordinalCount: number; words: number; isPublished: boolean; gradientClass?: string }` — экспортировать из `DeskCover.tsx`.

- [ ] **Step 1: Failing-тест `tests/components/desk/DeskCover.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DeskCover } from '@/components/desk/DeskCover';

const story = { id: 's1', title: 'Пепел и мята', ordinalCount: 7, words: 12480, isPublished: false };

describe('DeskCover', () => {
  it('типографская обложка: титул + mono-статус с ru-RU числом', () => {
    render(<DeskCover story={story} />);
    expect(screen.getByText('Пепел и мята')).toBeInTheDocument();
    expect(screen.getByText(/ЧЕРНОВИК · ГЛ\. 7 · 12 480 СЛ/i)).toBeInTheDocument();
  });
  it('опубликованная — статус без «черновик»', () => {
    render(<DeskCover story={{ ...story, isPublished: true }} />);
    expect(screen.queryByText(/ЧЕРНОВИК/i)).not.toBeInTheDocument();
    expect(screen.getByText(/ГЛ\. 7/i)).toBeInTheDocument();
  });
  it('ведёт в редактор истории', () => {
    render(<DeskCover story={story} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/write/s1');
  });
});
```

Примечание: `toLocaleString('ru-RU')` даёт narrow no-break space ` ` в Node ≥ 18 для групп — если ассерт упадёт, проверить фактический разделитель через `console.log(JSON.stringify((12480).toLocaleString('ru-RU')))` и зафиксировать его в тесте И в компоненте через явную замену на ` `.

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Реализовать `components/desk/DeskCover.tsx`**

```tsx
import Link from 'next/link';
import { GrainCover } from '@/components/ui/GrainCover';
import { MonoBadge } from '@/components/ui/MonoBadge';

export type DeskStory = {
  id: string;
  title: string;
  ordinalCount: number;
  words: number;
  isPublished: boolean;
  gradientClass?: string;
};

const ruNum = (n: number) => n.toLocaleString('ru-RU').replace(/[ \s]/g, ' ');

export function DeskCover({ story }: { story: DeskStory }) {
  const status = [story.isPublished ? null : 'ЧЕРНОВИК', `ГЛ. ${story.ordinalCount}`, `${ruNum(story.words)} СЛ`]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link href={`/write/${story.id}`} className="block aspect-[2/3] w-full group">
      {story.gradientClass ? (
        <GrainCover className={`h-full rounded-lg ${story.gradientClass}`}>
          <div className="flex h-full flex-col justify-end p-3">
            <span className="font-display text-display-s text-ink">{story.title}</span>
            <MonoBadge className="mt-1">{status}</MonoBadge>
          </div>
        </GrainCover>
      ) : (
        /* Типографская обложка черновика: Bodoni-титул на surface-solid + амбер-хэйрлайн */
        <div className="flex h-full flex-col justify-between rounded-lg bg-surface-solid border border-border p-4 transition-colors group-hover:border-strong">
          <span className="font-display italic text-display-m leading-tight text-ink">
            {story.title}
          </span>
          <div>
            <div className="h-px w-8 bg-amber mb-2" aria-hidden />
            <MonoBadge>{status}</MonoBadge>
          </div>
        </div>
      )}
    </Link>
  );
}
```

(если у `GrainCover` другой контракт props — адаптировать вызов под фактический, компонент не менять.)

- [ ] **Step 4: `components/desk/DeskShelf.tsx`**

```tsx
import { DeskCover, type DeskStory } from './DeskCover';
import Link from 'next/link';

export function DeskShelf({ stories }: { stories: DeskStory[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {stories.map((s) => (
        <DeskCover key={s.id} story={s} />
      ))}
      <Link
        href="/write/new"
        className="flex aspect-[2/3] items-center justify-center rounded-lg border border-dashed border-border-strong text-ink-dim hover:text-amber hover:border-amber transition-colors"
      >
        <span className="font-display italic">+ новая история</span>
      </Link>
    </div>
  );
}
```

⚠️ `/write/new` — проверить фактический механизм создания истории в `components/write/StoryList.tsx` (кнопка/роут) и использовать ЕГО. Если создание — POST-экшен, `DeskShelf` принимает проп `onCreate` или серверный `<form action=…>` по тому же паттерну.

- [ ] **Step 5: Run** тесты → PASS. Stories для Storybook: `DeskCover` (typographic + gradient), `DeskShelf` (3 истории + плитка).

- [ ] **Step 6: Гейты + commit**

```bash
git add components/desk tests/components/desk
git commit -m "feat(desk): полка обложек — типографская обложка черновика, грид, плитка создания (A1-02)"
```

---

### Task 7: Momentum-панель

**Files:**
- Create: `components/desk/MomentumPanel.tsx` (+ `.stories.tsx`)
- Test: `tests/components/desk/MomentumPanel.test.tsx`

**Interfaces:**
- Consumes: `nightsWord` (Task 5), `Pill` (Task 2), `MonoBadge`.
- Produces: `<MomentumPanel streak={number} sparkline={number[]} lead={string} continueHref={string|null} continueLabel={string|null} />`. Спарклайн — инлайновый SVG (никаких chart-библиотек).

- [ ] **Step 1: Failing-тест**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MomentumPanel } from '@/components/desk/MomentumPanel';

describe('MomentumPanel', () => {
  it('стрик, подводка и CTA', () => {
    render(
      <MomentumPanel
        streak={9}
        sparkline={[0, 0, 120, 300, 0, 45, 0, 0, 500, 200, 0, 80, 150, 220]}
        lead="Три ночи назад ты оставила «Пепел и мята» — глава 7 ждёт."
        continueHref="/write/s1"
        continueLabel="продолжить главу 7"
      />,
    );
    expect(screen.getByText(/9 ночей подряд/i)).toBeInTheDocument();
    expect(screen.getByText(/Три ночи назад/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /продолжить главу 7/ })).toHaveAttribute(
      'href',
      '/write/s1',
    );
  });
  it('нулевой стрик — панель без строки стрика, но со спарклайном', () => {
    render(<MomentumPanel streak={0} sparkline={new Array(14).fill(0)} lead="" continueHref={null} continueLabel={null} />);
    expect(screen.queryByText(/подряд/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Реализация**

```tsx
import { Pill } from '@/components/ui/Pill';
import { MonoBadge } from '@/components/ui/MonoBadge';
import { nightsWord } from '@/lib/write/momentum';

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const w = 140;
  const h = 36;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${h - (v / max) * (h - 2) - 1}`).join(' ');
  return (
    <svg width={w} height={h} aria-hidden className="block">
      <polyline points={points} fill="none" stroke="var(--hc-amber)" strokeWidth="1.5" />
    </svg>
  );
}

export function MomentumPanel({
  streak,
  sparkline,
  lead,
  continueHref,
  continueLabel,
}: {
  streak: number;
  sparkline: number[];
  lead: string;
  continueHref: string | null;
  continueLabel: string | null;
}) {
  return (
    <aside className="rounded-lg bg-surface-solid border border-border p-5 space-y-4">
      {streak > 0 && (
        <p className="font-mono text-xs uppercase tracking-caps text-amber">
          {streak} {nightsWord(streak)} подряд
        </p>
      )}
      {lead && <p className="font-display italic text-display-s text-ink">{lead}</p>}
      <div>
        <MonoBadge>слова · 14 ночей</MonoBadge>
        <Sparkline values={sparkline} />
      </div>
      {continueHref && continueLabel && (
        <Pill variant="primary" href={continueHref}>
          {continueLabel}
        </Pill>
      )}
    </aside>
  );
}
```

- [ ] **Step 4: Run** → PASS. Story: заполненный и пустой варианты.

- [ ] **Step 5: Гейты + commit**

```bash
git add components/desk/MomentumPanel.tsx components/desk/MomentumPanel.stories.tsx tests/components/desk/MomentumPanel.test.tsx
git commit -m "feat(desk): momentum-панель — стрик, SVG-спарклайн, подводка, CTA (A1-03)"
```

---

### Task 8: Пустой стол — guided start

**Files:**
- Create: `components/desk/EmptyDesk.tsx` (+ `.stories.tsx`)
- Test: `tests/components/desk/EmptyDesk.test.tsx`

**Interfaces:**
- Consumes: `Pill`, фандом-чипы — реюз `components/feed/FandomChips.tsx` если его контракт позволяет (проверить props; иначе локальный список чипов из beachhead-фандомов: Гарри Поттер, Наруто, Магистр дьявольского культа, Всё ради игры, Оригинальный мир).
- Produces: `<EmptyDesk />` — крупный Bodoni-заголовок, чипы, один CTA «+ начать» (создание истории тем же механизмом, что в Task 6).

- [ ] **Step 1: Failing-тест** — рендер: заголовок с Bodoni-фразой «выбери фандом — и за стол», ≥3 чипов, ровно одна CTA-кнопка/ссылка.

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyDesk } from '@/components/desk/EmptyDesk';

describe('EmptyDesk', () => {
  it('guided start: заголовок, чипы, один CTA', () => {
    render(<EmptyDesk />);
    expect(screen.getByRole('heading')).toHaveTextContent(/выбери фандом/i);
    expect(screen.getAllByRole('button').length + screen.getAllByRole('link').length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText('+ начать')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run** → FAIL. **Step 3:** реализация (стек: заголовок `font-display italic text-display-l`, чипы, `<Pill variant="hero">+ начать</Pill>`, свечной glow фоном `bg-[radial-gradient(circle,var(--hc-glow),transparent_65%)]` позади заголовка — край, здесь можно). **Step 4:** PASS + story. 

- [ ] **Step 5: Гейты + commit**

```bash
git add components/desk/EmptyDesk.tsx components/desk/EmptyDesk.stories.tsx tests/components/desk/EmptyDesk.test.tsx
git commit -m "feat(desk): пустой стол — guided start вместо blank canvas (A1-04)"
```

---

### Task 9: Страница «Мой стол» — сборка

**Files:**
- Modify: `app/write/page.tsx` (полная замена содержимого)
- Test: `tests/pages/desk.test.tsx` (паттерн Page+View — как соседние в `tests/pages/`)

**Interfaces:**
- Consumes: всё из Task 3–8; `prisma`, `DEV_USER_ID` (как в текущем `app/write/page.tsx`).
- Produces: `/write` рендерит: заголовок-подводку, `DeskShelf`, `MomentumPanel` (desktop — правая колонка, mobile — под полкой), `EmptyDesk` при нуле историй.

- [ ] **Step 1: Failing-тест `tests/pages/desk.test.tsx`** — по соседнему паттерну (`tests/pages/*`): моки prisma-запросов; кейсы: (а) с историями — полка+панель, (б) без историй — EmptyDesk.

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Реализация `app/write/page.tsx`**

```tsx
import { DEV_USER_ID } from '@/lib/auth/dev-user';
import { prisma } from '@/lib/prisma';
import { DeskShelf } from '@/components/desk/DeskShelf';
import { MomentumPanel } from '@/components/desk/MomentumPanel';
import { EmptyDesk } from '@/components/desk/EmptyDesk';
import { countWords } from '@/lib/write/word-count';
import { computeStreak, deskLead, sparklineDays } from '@/lib/write/momentum';

export default async function DeskPage() {
  const [stories, stats] = await Promise.all([
    prisma.story.findMany({
      where: { authorId: DEV_USER_ID, source: 'WRITTEN' },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        visibility: true,
        updatedAt: true,
        chapters: { select: { text: true, ordinal: true, updatedAt: true }, orderBy: { ordinal: 'asc' } },
      },
    }),
    prisma.writingStat.findMany({
      where: { userId: DEV_USER_ID, date: { gte: new Date(Date.now() - 30 * 86_400_000) } },
      select: { date: true, wordsAdded: true },
    }),
  ]);

  if (stories.length === 0) {
    return (
      <main className="min-h-screen bg-bg text-ink px-4 py-10">
        <EmptyDesk />
      </main>
    );
  }

  const today = new Date();
  const deskStories = stories.map((s) => ({
    id: s.id,
    title: s.title,
    ordinalCount: s.chapters.length,
    words: s.chapters.reduce((sum, c) => sum + countWords(c.text ?? ''), 0),
    isPublished: s.visibility === 'PUBLIC',
  }));

  const last = stories[0];
  const lastChapter = last.chapters.at(-1);
  const lead = lastChapter
    ? deskLead({
        storyTitle: last.title,
        chapterOrdinal: lastChapter.ordinal,
        lastEditedAt: last.updatedAt,
        today,
      })
    : '';

  return (
    <main className="min-h-screen bg-bg text-ink px-4 py-10 max-w-5xl mx-auto">
      <h1 className="font-display text-display-l mb-8">Мой стол</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <DeskShelf stories={deskStories} />
        <MomentumPanel
          streak={computeStreak(stats, today)}
          sparkline={sparklineDays(stats, today)}
          lead={lead}
          continueHref={lastChapter ? `/write/${last.id}` : null}
          continueLabel={lastChapter ? `продолжить главу ${lastChapter.ordinal}` : null}
        />
      </div>
    </main>
  );
}
```

⚠️ Поле `ordinal` у `Chapter` — проверить фактическое имя в `prisma/schema.prisma` (может быть `index`/`number`) и использовать его везде в Task 9.

- [ ] **Step 4: Run** тесты страницы → PASS.

- [ ] **Step 5: Гейты + commit**

```bash
git add app/write/page.tsx tests/pages/desk.test.tsx
git commit -m "feat(desk): «Мой стол» — полка + momentum вместо списка историй (A1-02..04)"
```

---

### Task 10: Визуальная верификация и приёмка

**Files:** — (проверка, без новых файлов; фиксы — точечные)

- [ ] **Step 1:** `pnpm typecheck && pnpm lint && pnpm test` — всё зелёное.
- [ ] **Step 2:** `pnpm dev` + Chrome DevTools MCP: пройти `/write` глазами на 375 / 768 / 1280 — полка 2:3, типографская обложка, спарклайн, пустое состояние (временно удалить/скрыть истории dev-юзера или зайти вторым юзером). Сверить с канвой `docs/design_handoff_writer_v2/prototypes/headcanon.html` секция 05.
- [ ] **Step 3:** Регресс-взгляд на v1-поверхности (лента `/`, читалка) — токены поменялись (bg чуть холоднее, борта ink-based): убедиться, что ничего не развалилось визуально. Расхождения записать, чинить только сломанное (рестайл v1 — Этап C).
- [ ] **Step 4:** Итоговый коммит фиксов + push: `git fetch && git pull --rebase && git push`.

---

## Self-Review (выполнен при написании)

- Скоуп A0-01/02, A1-01..04 из TASKS.md покрыт задачами 1–9; A2+ сознательно вне плана.
- Типы согласованы: `DeskStory` (Task 6) ↔ маппинг в Task 9; `countWords` (Task 3) ↔ Task 4/9; сигнатуры momentum (Task 5) ↔ Task 7/9.
- Известные точки неопределённости помечены ⚠️ прямо в задачах (механизм создания истории, имя поля ordinal, разделитель `toLocaleString`) — исполнитель проверяет по коду, не гадает.
