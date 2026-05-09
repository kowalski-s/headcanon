# Screen 06 — Feed (Desktop)

**Path:** `/` (responsive, breakpoint `lg:` ≥ 1024px)
**Prototype:** артборд `mix-desktop`, функция `MixFeedDesktop()`

---

## Интент

Desktop — **второстепенный** target. Большинство юзеров на mobile. Desktop — это «когда подружка кинула ссылку, открыла на работе». Нужен, чтобы не казаться «сырым мобильным проектом», но не перегружать.

---

## Структура

1. **Top bar** — wordmark logo + nav links (FEED active амбер, FANDOMS, TROPES, WATCH ▸), search input, `+ NEW ☆` amber button, avatar.
2. **Маркиза-тикер** — горизонтальная амбер-полоса, full-width, dark текст. Те же тропы что mobile, но fontSize крупнее (14px).
3. **Hero split layout** (2 колонки grid):
   - Left: Bodoni 78px заголовок с акцент-italic амбером на одном слове + Garamond 15px description + 2 CTA (amber `★ ЧИТАТЬ` + chrome `▸ WATCH · 4 EP`) + mono-meta likes/author/chapters.
   - Right: 4:3 cover frame, **наклон карточки -1.5deg**, скотч-теги, burst-стикер с поворотом, дикий film grain.
4. **Section divider** — Bodoni-italic «★ полночное чтиво для тех, кто не спит ★» по центру с тонкими линиями по бокам.
5. **Grid 5 колонок** — постеры 2:3 с скотч-тегом fandom + Bodoni 14px title + mono mета.
6. **Footer** — pinned, тонкий, mono caps: COPYRIGHT · TELEGRAM · POLICIES.

---

## Responsive behavior

- ≥ 1280px — full layout (5 col grid, hero 1.1fr / 1fr)
- 1024–1279 — hero stays 2col, grid drops to 4 col, nav может ужиматься в иконки
- 768–1023 — переключаемся на mobile layout полностью (single column hero, grid 2 col)
- <768 — mobile

---

## Edge cases

- Hover на постере → scale(1.02) + tilt(-1deg) + амбер-glow shadow.
- Hero может ротироваться (если juzер уже видел эту story — выводим следующую кандидатку).
- Длинные заголовки в Bodoni 78px → принудительный `text-wrap: balance` + max 2 строки.
- Маркиза слева/справа fade-mask (linear-gradient transparent) чтобы не обрываться резко.

---

## Что отличается от прототипа

- В прототипе footer не нарисован — нужен в коде.
- Avatar в правом углу top bar — placeholder в прототипе, в коде → реальный avatar или dropdown menu (settings, sign out).
- Auth-aware: если юзер не залогинен → `+ NEW ☆` подменяется на `★ ВОЙТИ` амбером.

---

## Performance

- Hero cover — `priority` + AVIF.
- Grid — все остальные `loading="lazy"`.
- Маркиза CSS-only animation, не requestAnimationFrame.
