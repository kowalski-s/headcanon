# TASKS — Implementation Roadmap

Конкретные тикеты, упорядоченные по майлстоунам. Каждый тикет — самостоятельная единица для PR. Размеры: **S** ≤ 1 день, **M** 1-3 дня, **L** 3-7 дней.

---

## M0 — Foundation (1 неделя)

> Цель: голый Next.js проект с дизайн-системой, без бизнес-логики.

- **M0-01 [S]** Bootstrap Next.js 15 (app router) + TypeScript + Tailwind v4 + ESLint/Prettier.
- **M0-02 [S]** Подключить `tokens.css` из handoff в `app/globals.css`. Подключить `tailwind.preset.js` в `tailwind.config.ts`.
- **M0-03 [S]** Подключить шрифты через `next/font`: Bodoni Moda 400/700, EB Garamond 400/500/700/400i, JetBrains Mono 400/500.
- **M0-04 [S]** Базовый layout с late-night dark theme + Bodoni h1, EB Garamond body. Скриншот должен попадать в палитру из прототипа.
- **M0-05 [M]** Setup Supabase: auth (email + Google), `users`, `stories`, `chapters`, `tropes`, `fandoms` tables (см. DESIGN.md → Data model).
- **M0-06 [S]** Setup Supabase Storage buckets: `covers/`, `audio/`, `avatars/`. Public read, authed write.
- **M0-07 [M]** Reusable Primitives library в `components/ui/`:
  - `<BurstSticker>` — амбер-poly-clip-path, slot для текста, tilt prop
  - `<ScotchTag>` — тонкий амбер-полупрозрачный rectangle, абсолютное позиционирование
  - `<GrainCover>` — div с градиентом + grain-overlay + vignette, аcceptов 2 hex цвета
  - `<Marquee>` — horizontal infinite ticker, CSS keyframes
  - `<Ornament>` — `─ ✦ ─` divider в трёх размерах
  - `<MonoBadge>` — uppercase JetBrains, tracking, slots для цвета
- **M0-08 [S]** Storybook (или ladle) для primitives.

---

## M1 — Read (2 недели)

> Цель: можно прочитать статичную захардкоженную главу. Ridding text-experience приоритет №1.

- **M1-01 [M]** Screen `06 Feed Desktop` — статичные данные из JSON. Hero + 5-col grid. Бэк ещё не нужен.
- **M1-02 [M]** Screen `01 Feed Mobile` — то же на mobile, маркиза, фандом-чипы.
- **M1-03 [M]** Screen `03 Story page` — meta panel, watch CTA card, chapter list. Статичные данные.
- **M1-04 [L]** Screen `04 Reader` — drop cap, justified, settings sheet (Aa). Тестировать на 5 device-сайзах.
  - Sub-task: `useReaderSettings` hook → localStorage, default values.
  - Sub-task: Late-night dim таймер (idle > 30 min → smooth fade в bg-deep).
  - Sub-task: Reading progress → IntersectionObserver на параграфах.
- **M1-05 [S]** Tracking events (PostHog или Plausible) — все из spec'ов screens.
- **M1-06 [S]** Responsive QA: 320px / 375 / 414 / 768 / 1024 / 1280 / 1920.

---

## M2 — Generate (3 недели) ⭐ critical path

> Цель: пользователь создаёт историю и читает её, тексты приходят живым стримом.

- **M2-01 [M]** Bootstrap OpenRouter integration. Wrapper в `lib/llm.ts`, error handling, abort controllers.
- **M2-02 [M]** Prompts: build template для главы (system + character refs + last paragraphs context).
- **M2-03 [L]** Streaming в Reader. Server Action возвращает Stream → client `useChat`-стайл хук → постепенно проявляется текст. Drop cap появляется первым.
- **M2-04 [M]** Screen `02 Create — step 1` (выбор фандома).
- **M2-05 [M]** Screen `02 Create — step 2` (ship). С AI suggestions кэшем.
- **M2-06 [M]** Screen `02 Create — step 3` (тропы).
- **M2-07 [M]** Screen `02 Create — step 4-5` (setting + tone, опциональные).
- **M2-08 [S]** Draft persistence — auto-save в БД на каждом step change.
- **M2-09 [M]** Resume drafts — entry point с feed «у тебя есть незавершённая черновик ›».
- **M2-10 [S]** Rate limiting: free tier 3 истории / день, через `@upstash/ratelimit`.

---

## M3 — Watch mode (2 недели)

> Цель: ушами тоже можно. ElevenLabs + cinematic still.

- **M3-01 [M]** ElevenLabs integration. `lib/tts.ts`, voice mapping per character.
- **M3-02 [M]** Audio generation pipeline: chapter text → split into episodes (~4 min each) → TTS → upload to Supabase Storage → save URLs in DB.
- **M3-03 [M]** Subtitles generation — alignment диалогов с тайминги аудио. Можно через ElevenLabs API или локально через whisper-style alignment.
- **M3-04 [L]** Screen `05 Watch mode` (full player).
  - Cinematic still: 16:9 frame с амбер-glow дыхальными точками.
  - Subtitle card с amber-italic emphasis на ключевых словах.
  - Custom scrubber с амбер-glow handle.
  - Episode chips horizontal.
- **M3-05 [M]** Mini-player — collapsed state (Spotify-like), persists across navigation.
- **M3-06 [S]** Lock-screen / control-center media metadata (`MediaSession API`).
- **M3-07 [S]** Auto-advance + crossfade между эпизодами.
- **M3-08 [M]** Generation state — «✦ озвучиваем... 3/4» с реальным прогрессом.

---

## M4 — Polish (1 неделя)

> Цель: продукт ощущается «настоящим».

- **M4-01 [M]** Авторские профили `/u/[handle]`.
- **M4-02 [M]** Saved bookshelf `/me/saved`.
- **M4-03 [S]** Share — открытый граф с обложкой главы, OG-images генерируются on-demand через `@vercel/og`.
- **M4-04 [M]** Onboarding flow — first-time → выбор 2-3 фандомов → персонализированный feed.
- **M4-05 [S]** Empty / error / offline states по всем экранам.
- **M4-06 [S]** Animations pass — все амбер-pulse / fade / crossfade выверены, `prefers-reduced-motion` respect.
- **M4-07 [S]** Accessibility audit — focus states, screen reader labels, keyboard nav.

---

## M5 — Monetization (1 неделя)

> Цель: можно платить.

- **M5-01 [M]** YooKassa integration, RU-payments.
- **M5-02 [S]** Pricing screen.
- **M5-03 [M]** Paywall на главе 4+, blocking modal с ясным CTA.
- **M5-04 [S]** Subscription management (отмена, изменение, история).
- **M5-05 [XS]** Re-enable quotas before public launch — убрать `DISABLE_QUOTAS=1` из dev .env, проверить free-tier `debitDaily(stories, 3)` и chapter `regens=5 / continues=1 / promptTweaks=2`, поднять лимиты для премиум-tier через YooKassa subscription check.

---

## Backlog (после launch)

- Push-уведомления «новая глава вышла»
- Collaborative ships — двое юзеров пишут историю по очереди
- Custom characters — ОС (original characters), не только canon
- Audio-only mode (без UI, full-screen «player»)
- Telegram Mini App — упрощённая версия из feed + reader

---

## Definition of Done (для каждого тикета)

- [ ] Реализовано по spec из `screens/`
- [ ] Tracking events отправляются
- [ ] Responsive проверено на 320 / 375 / 768 / 1024 / 1280
- [ ] Edge cases из spec покрыты (loading / empty / error)
- [ ] Тесты: компонент-уровневые для primitives, integration для критичных flow (create → reader)
- [ ] Lighthouse Performance ≥ 85 на mobile
- [ ] Storybook story добавлена (для UI компонентов)
- [ ] PR review от 1 человека
