# Screen 01 — Feed (Mobile)

**Path:** `/`
**Layout:** `app/(reader)/page.tsx`
**Prototype reference:** `prototypes/headcanon.html` → артборд `mix-feed`
**Function in code:** `MixFeedMobile()` в `screens-mix.jsx`

---

## Интент

Первое, что видит пользователь после входа. Цель — за 5 секунд показать, что сегодня почитать. Ставит мотивацию: ты уже был внутри истории, продолжай.

---

## Структура (сверху вниз)

1. **Status bar** — нативный, не рисовать.
2. **Header (logo + actions)**
   - Wordmark `head` + `canon` (canon — italic Bodoni). Вдох-выдох амбер-точка справа.
   - Иконки: `🔍` поиск, `♡` сохранённое.
3. **Маркиза-тикер** — тонкая полоска (амбер фон, dark текст), бесконечная горизонтальная анимация. Контент: «★ ENEMIES-TO-LOVERS ★ SLOW BURN ★ TIME TRAVEL ★ ...» — топ-тропы недели. Реальный список из БД (`SELECT trope FROM trending_tropes LIMIT 8`).
4. **Фандом-чипы** — горизонтальный скролл. Активный чип — амбер-fill + ★ префикс. Остальные — outline.
5. **Hero — главная история дня**
   - Постер 4:3, градиент-фон, плёночное зерно, виньетка
   - Burst-стикер «★ хит» (поворот -8°, амбер)
   - Полупрозрачный нижний слой с metaданными: фандом · ship · `▸ watch · 4 эп` (chrome CTA)
   - Tagline в ironic-italic «★ полночное чтиво для тех, кто не спит ★»
6. **Lazy grid** — 2 колонки постеров 2:3, чередуя со scotch-tag-теги слева сверху. Бесконечный скролл.
7. **Tab bar** — fixed bottom, 4 пункта (лента / создать / полка / я), active = амбер.

---

## Состояния

| State                | Что показываем                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| `loading`            | Skeleton: 1 hero placeholder + 4 grid skeletons. Амбер-shimmer на surface.                            |
| `empty` (новый юзер) | Bodoni-italic «выбери первый фандом → ст», CTA `+ начать` (amber pill). Маркизу всё равно показываем. |
| `error`              | Тостер сверху: `глава застряла в подземельях. retry?`                                                 |
| `offline`            | Кэшированный контент + sticky badge `mono` «✦ оффлайн».                                               |

---

## Данные с бэка

```ts
GET /api/feed
→ {
  hero: Story;                    // story of the day, выбирается алгоритмом
  trendingTropes: string[];       // топ-8
  fandomChips: { id, name, sub }[]; // в т.ч. фавориты пользователя
  feed: Story[];                  // лента, paginated cursor-based
}

type Story = {
  id: string;
  title: string;
  fandom: { id, name, color1, color2 };  // gradient seeds
  pair: string;                          // 'Драко × Гермиона'
  tagline: string;                       // 1-line hook
  cover: string | null;                  // R2/Storage URL, может быть null → fallback gradient
  likes: number;
  chapters: number;
  hasWatch: boolean;
  watchEpisodes?: number;
  author: { id, handle };
}
```

---

## Edge cases

- Cover нет → используем градиент `from-fandom.color1 to-fandom.color2` + плёночное зерно. Не показывать пустую карточку.
- Tagline > 80 символов → trim с `…`.
- Watch недоступен (false) → не показывать chrome chip, только likes/chapters.
- Фандом-чипы > 6 → горизонтальный скролл с `scroll-snap-type: x mandatory`.
- Маркиза останавливается при `prefers-reduced-motion`, fade в обе стороны убираем (пусть просто статика).
- Pull-to-refresh → амбер свечной круг проявляется в центре, отпуск → один новый постер въезжает с амбер-flash 600ms cinematic ease.

---

## Performance

- Hero — `priority` для Next/Image. WebP/AVIF.
- Grid — lazy, IntersectionObserver, чанки по 8.
- Маркиза — `transform: translateX`, `will-change: transform` только пока в viewport.
- Skeleton не блокирует hero, hero может прийти раньше.

---

## Tracking events

- `feed_viewed` — при scroll past hero
- `feed_hero_tap` → story page
- `feed_chip_tap { fandom_id }`
- `feed_card_tap { story_id, position }`
- `feed_watch_chip_tap { story_id }` — отдельно от tap по карточке
- `feed_pull_refresh`

---

## Что отличается от прототипа

- В прототипе маркиза только на desktop. **В коде нужна и на mobile** (по виду как на desktop, но узкая, fontSize 11px).
- В прототипе лента на mobile упрощённая (4 постера), реально — бесконечная.
- Hero в прототипе один и захардкожен — в коде ротируется по `feed.hero` от бэка.
