# Типографика headcanon

## Стек шрифтов (Literary typeset)

| Роль | Семейство | Источник | Веса | Notes |
|---|---|---|---|---|
| Display | **Bodoni Moda** | Google Fonts | 400, 500, 600, 700 + italic | Cyrillic subset обязателен |
| Body | **EB Garamond** | Google Fonts | 400, 500, 600 + italic | Cyrillic subset обязателен |
| UI | **DM Sans** | Google Fonts | 400, 500, 600, 700 | Cyrillic subset обязателен |
| Mono | **JetBrains Mono** | Google Fonts | 400, 500 | таймкоды, mono-метки |

## Подключение в Next.js

```ts
// app/layout.tsx
import { Bodoni_Moda, EB_Garamond, DM_Sans, JetBrains_Mono } from 'next/font/google';

const display = Bodoni_Moda({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const body = EB_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
});

const ui = DM_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});
```

CSS-переменные подхватываются Tailwind preset (см. `tailwind.preset.js`):

```ts
fontFamily: {
  display: ['var(--font-display)', 'serif'],
  body: ['var(--font-body)', 'serif'],
  ui: ['var(--font-ui)', 'sans-serif'],
  mono: ['var(--font-mono)', 'monospace'],
}
```

---

## Шкала размеров

Mobile-first, рассчитана на 375–414px viewport. Desktop — увеличиваем display через breakpoint.

| Token | px | Tailwind | Где |
|---|---|---|---|
| `display.xxl` | 78 | `text-[78px]` | Hero на desktop feed |
| `display.xl` | 56 | `text-[56px]` | Hero mobile, story page title |
| `display.l` | 32 | `text-[32px]` | Reader chapter title, create stage заголовок |
| `display.m` | 22 | `text-[22px]` | Section heads на desktop |
| `display.s` | 16 | `text-[16px]` | Sticky-CTA, ep title now |
| `display.xs` | 14 | `text-[14px]` | Episode chip title, NEXT preview |
| `body.l` | 16 | `text-base` | Reader body **(жесткий минимум)** |
| `body.m` | 13 | `text-[13px]` | Story description, taglines |
| `body.s` | 12 | `text-xs` | Подписи постеров, caption |
| `ui.l` | 14 | `text-sm` | CTA, toggle |
| `ui.m` | 12 | `text-xs` | Чипы, tab bar |
| `mono.m` | 11 | `text-[11px]` | Mono лейблы (`EP 02 / 04`, `40%`) |
| `mono.s` | 9.5 | `text-[9.5px]` | Mono метки на постерах |

**Не уменьшать body ниже 16px** — пользователь читает по 30+ минут в кровати.

---

## Drop caps

Только в **ридере**, на первом параграфе главы.

```tsx
<p className="font-body text-base leading-[1.6] text-ink text-justify hyphens-auto">
  <span
    aria-hidden
    className="font-display italic float-left text-[64px] leading-[0.85] mr-2 mt-1.5 text-amber font-medium"
  >
    {firstLetter}
  </span>
  {restOfFirstParagraph}
</p>
```

**Никогда не использовать `::first-letter`** — ломается при динамической смене шрифта и при переводе.

---

## Italic как продуктовый голос

`<em>` в Bodoni-italic с амбер-цветом — фирменный приём. Используется:
- На акцентных словах в hero («`Письмо, которое нельзя было писать.`»)
- В диалогах watch-mode (`«я очень устал»`)
- В метках типа «★ полночное чтиво»

Не злоупотреблять. Один курсив-акцент на блок, не больше.

---

## Justified body + переносы

```css
.reader-body {
  text-align: justify;
  hyphens: auto;
  text-wrap: pretty;
}
.reader-body[lang="ru"] {
  /* русские переносы — критично для justified */
  hyphenate-character: "‐";
}
```

Установить `<html lang="ru">` глобально.

---

## Mono caps (ярлыки)

Все mono-надписи — uppercase + letterspacing.

```tsx
<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-dim">
  EP 02 / 04
</span>
```

Tailwind:
```js
// tailwind.preset.js
extend: {
  letterSpacing: {
    'caps': '0.18em',
  },
}
```

---

## Курсив-серифные UI-лейблы

Tab bar, sub-navigation — Bodoni italic 13px medium.

```tsx
<span className="font-display italic text-[13px] font-medium tracking-[0.01em]">лента</span>
```

Это умышленно «не-современно» — даёт продукту литературный голос. Не санс-сериф.
