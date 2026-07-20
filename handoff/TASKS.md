# TASKS — Implementation Roadmap (v2)

Конкретные тикеты, упорядоченные по фазам. Каждый тикет — самостоятельная единица для PR. Размеры: **S** ≤ 1 день, **M** 1-3 дня, **L** 3-7 дней.

> **Пивот v2** ([Notion](https://www.notion.so/36b2a47b0ca181669ea3ce37d9893091)): writer path — primary. Фазы продукта — [docs/roadmap.md](../docs/roadmap.md). Спека цикла — [docs/superpowers/specs/2026-07-15-writer-v2-mvp-design.md](../docs/superpowers/specs/2026-07-15-writer-v2-mvp-design.md). Дизайн writer-поверхностей — [docs/design_handoff_writer_v2](../docs/design_handoff_writer_v2/README.md) (источник правды v2; этот каталог `handoff/` остаётся каноном по токенам-инфраструктуре и legacy v1-экранам).

---

## Legacy (v1) — статус

Построено в v1, переразмечено под v2. **Ничего не удаляем.**

- **M0 — Foundation** ✅ Next.js + Tailwind + дизайн-система + Supabase + primitives.
- **M1 — Read** ✅ Читалка, лента, story page. Используется для превью и публичного чтения — без изменений.
- **M2 — Generate** ✅ Generator-мастер + стриминг глав. **Репозиционируется как secondary path (Phase 2).** В Phase 1 не трогаем, в onboarding делаем вторичным входом.
- **M3 — Watch mode** ❄️ **Заморожено.** Переезжает в Phase 3, только для оригинальных миров. Код остаётся в репо, новых тикетов сейчас нет.

---

## Phase 1 — Writer MVP ⭐ critical path

> Цель ближайшего цикла: MVP для **фокус-группы ≤15 авторов** — редактор + персонажи + граф + momentum **+ AI-соавтор с первого дня теста** (решение 2026-07-15); запуск фокус-группы — после этапа B. Спека — [2026-07-15-writer-v2-mvp-design.md](../docs/superpowers/specs/2026-07-15-writer-v2-mvp-design.md). Экраны — `docs/design_handoff_writer_v2`.

### W0 — Schema & gating foundation ✅ (2026-05-27)

- **W0-01 … W0-04** ✅ `Story.source`, `Tag.isCanonicalIp` + сид, `Note`, `AiThread`/`AiMessage` — в схеме и мигрированы. (`Note`/`AiThread` пока без UI — используются в A-этапах и B.)

### W1 — Writer editor ✅ (2026-05-27)

- **W1-01 … W1-05** ✅ TipTap (минимальный конфиг, markdown-совместимость с читалкой), chapter CRUD + debounced autosave, структура книга→главы + reorder, workspace «Мои истории», publish toggle. Workspace и редактор рестайлятся в A1/A2.

### Этап A — writer-core (заменяет старые W2/W4; дизайн — handoff v2)

- **A0-01 [S]** Токены v2: обновить `handoff/tokens.css` + `tailwind.preset.js` (bg `#160B22`, solid `surface #1F1230`, `panel #1A0E29`, ink-based borders, `amberSoft`, `glow`), светлая тема редактора «бумага» (`data-theme="paper"`, scoped-переменные).
- **A0-02 [S]** Ревизия кнопочного языка: пилюли weight 500, узкие паддинги (primary ~7×15, hero ~9×20), без glow-теней, Bodoni-курсив в лейблах. Обновить `AmberPill`/`GhostPill`, добавить атом `MonoLabel` (caps, letter-spacing .14–.18em).
- **A1-01 [S]** Prisma: `WritingStat` (`userId`, `date`, `wordsAdded`, unique по паре) + запись положительной дельты слов в autosave-роуте.
- **A1-02 [M]** «Мой стол» (desktop+mobile, `PvDesk*`): полка обложек 2:3 (реюз `StoryPoster`), типографская обложка для черновиков (Bodoni-титул + mono-статус `ЧЕРНОВИК · ГЛ. 7 · 12 480 СЛ`), пунктирная рамка пустого черновика.
- **A1-03 [M]** Momentum-панель: стрик «N ночей подряд», спарклайн слов за 14 дней, шаблонная литературная подводка + CTA «продолжить гл. N». Без LLM.
- **A1-04 [S]** Пустой стол = guided start (фандом-чипы + один CTA), не blank canvas.
- **A2-01 [M]** Тихий редактор: колонка Garamond max-620px 17–18px/1.62, ragged-right, минимальный chrome (тает до opacity .16), автосейв — mono-ярлык «сохранено» с амбер-точкой.
- **A2-02 [M]** Режимы **фокус** (неактивные абзацы op .3 + радиальное затемнение) и **печатная машинка** (активный абзац по центру вертикали), переключатель внизу, transitions .45–.5s, `prefers-reduced-motion`.
- **A2-03 [S]** Светлая тема «бумага» в редакторе (переключатель, персист в настройках юзера).
- **A3-01 [M]** Character bible UI (`PvBibleDesktop`): CRUD поверх `Character`, карточка = обложка-градиент + Bodoni-имя + mono-теги роли; структурные поля (имя/роль/затравка/описание). API `api/write/story/[id]/characters` (auth+ownership+zod).
- **A3-02 [M]** «✦ найдено в тексте»: AI-извлечённые факты (реюз/расширение `bible_extract`) с accept/reject «в библию ✓ / мимо».
- **A4-01 [S]** Prisma: `CharacterRelation` (`kind` enum, `label`, `isPast`, `source` MANUAL/AI, `status` SUGGESTED/ACCEPTED/REJECTED) + CRUD API.
- **A4-02 [M]** Граф связей (`PvGraphCore`): **d3-force + SVG**, узлы-портреты с дышащим glow, rose = чувство / amber = сюжет, пунктир = прошлое, выделение по клику + подписи Bodoni-курсивом, легенда, переключатель «граф / карточки», mobile-раскладка.
- **A4-03 [M]** AI-предложение связей из текста глав: callType `relation_suggest`, pg-boss job по образцу `bible_extract`, structured output, accept/reject в UI графа.
- **A5-01 [M]** Прод-инфра: RU-VPS (Timeweb/Selectel) + Coolify + self-hosted Supabase + домен/SSL; RU LLM-агрегатор (AITunnel primary) вместо OpenAI-директа в prod env.
- **A6-01 [S]** First-run: сразу к guided-start-столу (без развилки 3 путей — фокус-группа только авторы).
- **A6-02 [S]** Empty/loading/error в литературном голосе по всем writer-поверхностям; mobile-проход 320–1280; e2e smoke.

#### A1 — записанный долг (whole-branch review 2026-07-15, чинить попутно)

- ✅ A0-01, A0-02 (Pill), A1-01..04 выполнены (коммиты 15811ba..f57d3a7); `MonoLabel` уже существовал как `MonoBadge`.
- **[к A5-01]** ~~`/write` статический пререндер~~ — закрыто `force-dynamic` (в приёмке A1).
- **[к A2+]** `DeskStory.isPublished: boolean` схлопывает `UNLISTED` в «ЧЕРНОВИК» — при следующем касании прокинуть `visibility` целиком.
- **[к A1-02 v2]** денормализовать `Chapter.wordCount` — уберёт вытягивание текста всех глав на рендер стола и 30-дневный потолок стрика.
- Мелочь: Pill (onClick+href, tailwind-merge), countWords (URL в ссылках), тосты/литературные ошибки создания истории (дом — A6-02), increment-ветка WritingStat без теста, tokens.json `bg.deep` рассинхрон + `paper.description` не token-shape.

#### P0-цикл 2026-07-20 (видео-ревью) — записанный долг

- ✅ P0 x4 выполнены: стол→канва05 (шапка/hero/подвал), редактор→канва06 (тихий центр/режимы/BubbleMenu/drawer), AI-соавтор→канва07 (панель+шит, стриминг, квота `DailyUsage.assists`), сквозная навигация (SiteHeader на ленте, watch скрыт, 404 вылечены — корень был в конфликте слагов `[id]`/`[storyId]`).
- **[к B1]** `AiThread`/`AiMessage`-персист чата соавтора не делали — чат живёт в памяти вкладки (B1 как в плане).
- **[nav]** `FeedHeader` (рендерится на колофоне/в мастере) несёт мёртвые «фандомы»/«тропы» → 404; `FeedHeaderMobile` осиротел. Решить при P1-переработке ленты.
- **[reader]** `LiveReader` backHref всегда `/write/<id>` — для читателя чужой опубликованной истории это 404; нужен колофон UUID-историй, тогда back — по роли зрителя.
- **[ux]** «+ новая история»: на ленте → `/create` (мастер), на столе → мгновенное создание. Осознанно, но перепроверить на фокус-группе.
- **[test-hygiene]** Live-тесты оставляют истории под `DEV_USER_ID` («test»/«t») — полка дева захламляется; чистить в afterAll или увести на отдельного тест-юзера.
- Мелочь: «машинка» кириллицей падает на системный monospace (JetBrains Mono без кириллицы); ordinals глав транзиентно stale после оптимистичного reorder до refresh; save() редактора без catch (статус может застрять в «сохранение…» при сетевой ошибке).

### Этап B — AI-соавтор (бывший W3, по гибридной модели 2026-06-27 + экран 07) — **до запуска фокус-группы**

- **B1 [M]** Чат-панель 340px / bottom-sheet, персист `AiThread`/`AiMessage`, ожидание «перечитываю твою сцену…» с дышащей точкой (не спиннер).
- **B2 [M]** Сборка контекста кодом: premise + глава + `ChapterSummary` + библия + связи графа + world state. Без парсинга свободного текста.
- **B3 [M]** Способности (≤4, человеческим языком): консистентность по главам (чипы «да, исправь / так задумано»), свободные вопросы о рукописи, «что дальше» — 3 варианта хода (♡ «оставить» / «→ в текст»).
- **B4 [M]** Inline slash-развёртка (scene beat): затравка → прогресс-повествование → amber-pending вставка (стриминг) → «в текст ✓ / иначе ↻ / мимо» + бейдж «человек · AI-ассистировано».
- **B5 [S]** Квота «N / M разворотов сегодня» (единственная прозрачность модели), cost-tracking `LlmCallLog`, версии промптов. Модель/температуры в UI запрещены.
- **B6 [S]** Заметки (бывш. W2-01): глобальный inbox + per-story, быстрое создание. W2-03 world-building-противоречия — влились в B3-консистентность.
- **B7 [S]** Запуск фокус-группы ≤15: инвайт-поток (модель `Invite` есть), бонусы участникам (топ при массовом запуске, 2 месяца подписки), канал сбора фидбека. Квоты AI (re-enable M5-05) включить здесь — письмо остаётся без лимитов.

### Этап C — публичная оболочка (бывший W4, после валидации фокус-группой)

- **C1 [M]** Лендинг (hero «Полночное чтиво, которое пишешь ты», веер обложек, CTA «начать писать — бесплатно» + «☾ просто читать»).
- **C2 [M]** Первый вход: развилка 3 путей (пишу сама ★ / сгенерируй мне / просто читать) + фандом-чипы.
- **C3 [M]** Главная залогинена: writer-блок с momentum primary, generator secondary, лента «этой ночью читают».
- **C4 [M]** Кабинеты читатель/автор (переключатель ролей, спарклайны, фан-статы, мостик «✎ написать свою»).
- **C5 [S]** Бейдж источника «человек · AI-ассистировано» в ленте/читалке; AI-generated — отдельная категория (бывш. W4-03).
- **C6 [S]** Tracking-события `save` + `chapter_completed` (бывш. W4-04, метрика для топов Phase 4).

---

## Backlog (по фазам roadmap)

**Phase 2 — Generation + Audio:** repositioning generator path · TTS-аудио для обоих типов · несколько голосов · скачивание как подкаст.

**Phase 3 — Video (original worlds):** разморозка watch-режима с tag-gating · moments 5-15 сек · motion stills / parallax · async-очереди с push.

**Phase 4 — Competitive + virality:** топы (фандом/тип/объём/время/оригиналы) · награды генерациями/PRO/бейджами · «что если» branching · remix · reader cameos.

**Phase 5 — Monetization:** YooKassa · FREE/PRO/STUDIO/WHALE · paywall на аудио/видео/скрытие AI-generated · subscription management.

---

## Definition of Done (для каждого тикета)

- [ ] Реализовано по спеке (`docs/superpowers/specs/` или `screens/`)
- [ ] Tracking events отправляются
- [ ] Responsive проверено на 320 / 375 / 768 / 1024 / 1280
- [ ] Edge cases покрыты (loading / empty / error)
- [ ] Тесты: компонент-уровневые для primitives, integration для критичных flow (editor → AI-ассистент → publish → reader)
- [ ] Lighthouse Performance ≥ 85 на mobile
- [ ] Storybook story добавлена (для UI компонентов)
- [ ] PR review от 1 человека
