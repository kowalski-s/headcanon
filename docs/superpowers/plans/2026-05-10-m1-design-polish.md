# M1 Design Polish — Next Session

## Контекст

M1 был сдан и тегнут `m1-read` на ветке `feat/m1-read`. Потом обнаружилось, что
цвета и часть экранов не соответствуют макетам. Прошлая сессия пофиксила
загрузку Tailwind preset (CJS `require` в ESM), заменила `bg-bg-deep` →
`bg-bg`, добавила амбер radial glow в `GrainCover`, застабила `/watch` и
`/create`. Но user всё ещё видит несоответствие — и Story/Reader Desktop
вообще не имеют десктопного layout'а. **Эта сессия: глазами пройти макеты,
сделать playwright-скрины, диффать и доводить экраны до соответствия.**

## Источник правды

- **Свежие PNG мокапы (приоритет):** `docs/mocaps/CleanShot 2026-05-10 at
12.1*.png` — 10 шт. Это уточнённая палитра/градиенты/композиция от user'а,
  вокруг которых будет идти полировка. Цвета здесь теплее и насыщеннее чем
  в первой партии.
- **Первая партия мокапов:** `handoff/screens/refs/01..08-*.png` — 8
  Mobile/Desktop для Feed/Story/Reader/Watch/Create. Использовать как
  layout-референс. При расхождении со свежей партией — приоритет у
  `docs/mocaps/`.
- Перед началом session'и: переименовать/перенести `docs/mocaps/*` в
  `handoff/screens/refs/` со смысловыми именами (по содержимому).
- `handoff/DESIGN.md`, `handoff/typography.md`, `handoff/tokens.css`,
  `handoff/screens/*.md` — токены, шкала, экранные спеки.
- Код на ветке `feat/m1-read`. M0 примитивы в `components/ui/`. Последний
  коммит `0b2b18e fix(M1): tailwind preset loading + page-bg color regression
  - missing route stubs`.

## Метод (петля диффа)

1. **Read** все PNG в `handoff/screens/refs/`. Внутрь головы: палитра,
   градиенты, layout, типографика, плотность.
2. Запустить dev: `pnpm dev`. Если `ENOENT: ...
_document.js` — `rm -rf .next && pnpm dev`. Порт 3000 — освободить:
   `lsof -i :3000 -t | xargs kill -9`.
3. **Снять скрины:** `npx tsx scripts/m1-screenshots.ts` →
   `tmp/m1-actual/*.png` (mobile 375 и desktop 1280 для всех роутов; добавить
   ещё viewport'ов при необходимости).
4. Открыть пары (mock vs actual) через `Read` tool — оба файла одной
   командой, рядом, диффать ГЛАЗАМИ.
5. Записать список расхождений (top-5 самых заметных).
6. Фикс → пересъёмка → дифф → повторить. **Не двигаться дальше, пока
   текущий дифф не схлопнется визуально.**

## Что точно надо доделать (минимум)

- **Story Desktop** — сейчас рендерит мобильный layout на 1280px. По
  `refs/06-desktop-story.png`: 2-колоночный — слева cover (с амбер glow,
  ScotchTag×2, BurstSticker), справа breadcrumbs / `MonoBadge` /
  `h1` / tagline / meta-strip / два CTA (`★ продолжить главу N ★` амбер +
  `▸ watch Nm` chrome).
- **Reader Desktop magazine-spread** — `refs/07-desktop-reader-spread.png`:
  2 колонки текста, диалог в правой колонке выделен амбером italic,
  стрелки навигации страниц по бокам, верхний breadcrumb с метой.
- **Story Mobile cover** — в макете внутри обложки маркировка `VOL.1 /
CH.7` (или аналог), у нас пусто. См. `refs/02-mobile-story-and-reader.png`.
- **Цвета covers** — насыщенность плам/бургунди в мокапах выше, чем наша.
  Возможно надо подтюнить hex'ы в `lib/fixtures/stories.ts` per-fandom
  (`color1`/`color2`).
- **Watch и Create stubs** — заменить на полноценные экраны по мокапам
  (`refs/03-mobile-watch.png`, `refs/05-desktop-create.png`,
  `refs/08-desktop-watch.png`, `refs/01-mobile-feed-and-create.png`
  правая часть). Это уже частично M2/M3 scope, но раз макеты есть — можно
  собрать UI без бэка (статичные fixtures для аудио/субтитров).

## Definition of done

- Каждый роут `app/` визуально близок к своему мокапу на desktop (1280)
  и mobile (375). `tmp/m1-actual/*.png` рядом с
  `handoff/screens/refs/*.png` — диффы тонкие.
- `pnpm test && pnpm typecheck && pnpm lint && pnpm format:check && pnpm
build` — clean. Те же 55 unit-тестов проходят.
- Один-несколько коммитов на `feat/m1-read` (или новая ветка
  `feat/m1-polish` поверх). НЕ на main.
- Если добавляешь токены в `handoff/tokens.css` — обоснование в commit
  message.

## Что НЕ делать

- Не писать тесты на визуальное (RTL не рендерит CSS). Дифф = тест.
- Не пересаживаться на другой стек/CSS-библиотеку.
- Не переводить русский copy.
- Не делать новых M0-примитивов без явной нужды.
- Не запускать `pnpm test:storybook` — он сломан pre-existing (vitest 4 +
  Storybook 10 harness). Это отдельный тикет.

## Метод работы

- Subagent-driven приветствуется. **Implementer = opus** для всех
  layout-задач (это дизайн). **Reviewer = opus всегда.** Sonnet — только
  для чисто-data правок (fixture hexes).
- После каждого батча правок: пересъёмка → новый Read мокапа+actual →
  отчёт о схождении.

## Файлы-якоря

- `handoff/screens/refs/*.png` — 8 мокапов
- `tmp/m1-actual/*.png` — текущее состояние (генерится скриптом)
- `scripts/m1-screenshots.ts` — playwright capture
- `app/page.tsx`, `app/(reader)/story/[id]/StoryPageView.tsx`,
  `app/(reader)/reader/[storyId]/[chapterN]/ReaderPageView.tsx`,
  `app/(reader)/watch/[storyId]/[chapterN]/page.tsx`, `app/create/page.tsx`
- `components/{feed,story,reader,ui}/`
- `handoff/tokens.css`, `handoff/tailwind.preset.js`,
  `tailwind.config.ts`
