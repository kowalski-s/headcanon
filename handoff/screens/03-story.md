# Screen 03 — Story page (Mobile)

**Path:** `/story/[id]`
**Prototype:** артборд `mix-story`, функция `MixStoryMobile()`

---

## Интент

«Trailer» истории. Пользователь либо начинает читать с первой главы, либо продолжает с последней прочитанной, либо запускает Watch mode. Это hub.

---

## Структура

1. **Top bar** — `←`, иконки справа: `♡` (rose-fill если saved), `↗` share, `⋯` more.
2. **Hero cover** — постер 4:3, градиент + зерно + виньетка, burst-стикер «★ хит» в углу (поворот 8°).
3. **Title block**
   - Mono-mета: `VOL.1 · DRAMIONE · 14 CH` (амбер-rose-амбер чередование)
   - Bodoni 32px, justified, текст-wrap balance, акцент-italic амбером на ключевом слове
   - Garamond 12px tagline, ink-dim
4. **Meta panel** — 3 колонки на amber-soft фоне, mono: AUTHOR @handle / CHAPTERS 14 / ∞ / LIKES ♡ 24.8k
5. **Watch CTA card** — chrome-gradient панель, плотно-чёрная, амбер-glow точкой play
6. **Chapter list** — каждый чаптер:
   - Big Bodoni number 01-14 (амбер если current, ink-dim если read, faint если locked)
   - Bodoni-italic title, Garamond 11 mono mета (4m · прочитано ✓ / продолжить → / дальше)
   - Long-press → highlight + actions
7. **Sticky bottom CTA** — `★ ПРОДОЛЖИТЬ ГЛ. 7 ★` (если есть прогресс) или `★ НАЧАТЬ ★`.

---

## Данные

```ts
GET /api/story/:id
→ {
  story: Story;
  chapters: Chapter[];
  progress: { lastChapterN: number, lastParagraph: number } | null;
  related: Story[];          // 4 шт., тот же фандом или ship
  watchAvailable: boolean;
  saved: boolean;
}

type Chapter = {
  n: number;
  title: string;
  minutes: number;
  state: 'read' | 'reading' | 'unread' | 'locked';
}
```

---

## Edge cases

- История «в работе» (AI ещё не сгенерил все главы) → последний chapter в state `generating` с амбер-pulse + текстом «глава пишется… ~30 сек».
- История deleted автором → 404 redirect на feed.
- Watch недоступен (фича выключена / у автора нет TTS-credits) → CTA-карточку не показываем.
- Юзер первый раз → progress = null → sticky-CTA «★ НАЧАТЬ ★» вместо «продолжить».
- История locked за paywall → главы 4+ показываем locked, на сlick → YooKassa modal.

---

## Tracking

- `story_viewed { story_id, source }`
- `story_save_toggle { saved }`
- `story_share`
- `story_chapter_tap { n, state }`
- `story_continue_tap { last_n }`
- `story_watch_tap`

---

## Что отличается от прототипа

- В прототипе chapter list = 4 шт. В коде — все 14, virtualized если >50.
- Related stories ниже chapter list — в прототипе их нет, но есть в спеке. 1 ряд, horizontal scroll, маленькие постеры 2:3.
