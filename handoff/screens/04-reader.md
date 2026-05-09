# Screen 04 — Reader (Mobile)

**Path:** `/reader/[storyId]/[chapterN]`
**Prototype:** артборд `mix-reader`, функция `MixReaderMobile()`

---

## Интент

Час главного использования продукта. Ничего не должно отвлекать, но фирменный стиль обязан проявляться. Ridding text — 16px **минимум** Garamond, justified, drop cap на первый абзац.

---

## Структура

1. **Status bar** — нативный.
2. **Top bar** — `←`, по центру: VOL.1 · CH.07 (mono caps) + Bodoni-italic 13px название главы амбером, справа `Aa` + `⚙`.
3. **Reading progress** — тончайшая (2px) полоса с амбер-fill + mono-метка `стр 3 / 9`.
4. **Chapter title block**
   - Bodoni-italic 13px «глава седьмая» амбером
   - Bodoni 28px заголовок главы, акцент-italic амбером на одном слове
   - Орнамент-разделитель `─ ✦ ─`
5. **Body** — Garamond 16px, line-height 1.6, justified, hyphens auto, **drop cap первой буквы** (Bodoni-italic 64px float-left, амбером).
6. **Inter-paragraph orneраment** — после каждой 3-4 параграфа `─ ✦ ─` для дыхания.
7. **Sticky bottom NEXT card** — превью следующей главы + chrome `▸ watch` chip справа.

---

## Settings sheet (Aa)

Bottom sheet с настройками шрифта:

```
Шрифт:    [○ Bodoni Moda]  [● EB Garamond]  [○ Cormorant]
Размер:   [—  ●●●●●●  +]
Тема:     [Late night]  [Sepia]  [True dark]
Justify:  [✓]  Hyphens: [✓]
```

Сохраняется в `localStorage` + sync с user prefs в БД при логине.

---

## Streaming (важно)

При первом открытии главы текста ещё **нет** — он стримится с OpenRouter:

1. Ставим Bodoni-italic placeholder «глава пишется… ✦» (амбер pulse 2s ease-in-out).
2. Как только приходит первый chunk — drop cap появляется первой (fade-in 240ms).
3. Дальше текст ткётся по символам, амбер-курсор `|` мерцает в конце потока.
4. Когда стрим закончен — курсор исчезает, проявляется sticky NEXT card.
5. Reading progress обновляется по позиции скролла, не по символам.

```ts
// app/reader/[id]/[n]/page.tsx — server component
const stream = openrouter.chat.completions.create({
  model: 'anthropic/claude-sonnet-4.5',
  stream: true,
  messages: buildPrompt(story, chapter),
});
// клиент рендерит через React Server Components / Server Actions + useOptimistic
```

---

## Edge cases

- Стрим оборвался на середине → красный mono-toaster «соединение прервалось» + Bodoni `продолжить` button — повторный запрос с last-cursor.
- Reader открыт > 30 мин без скролла → late-night dim: фон уходит в `bg-deep` через 2s ease.
- Юзер закрыл и вернулся → читает с `progress.lastParagraph`, сериф-маркер «✦ продолжаем» в месте остановки 2s, потом исчезает.
- История locked → редирект на pricing после ch.3.
- iPad / wide viewport → max-width 660px, отцентровать. Не растягивать читалку на 1200px.

---

## Tracking

- `reader_opened { story_id, chapter_n, has_progress }`
- `reader_progress_milestone { percent: 25 | 50 | 75 | 100 }`
- `reader_settings_changed { key, value }`
- `reader_watch_chip_tap` — конверсия в Watch
- `reader_chapter_completed { took_ms, idle_ms }`
- `reader_stream_error`

---

## Что отличается от прототипа

- В прототипе текст захардкожен (3 параграфа). Реально — стрим, без верхнего предела.
- В прототипе нет settings sheet — нужен.
- В прототипе нет late-night dim таймера — обязателен (это в визионе продукта).
