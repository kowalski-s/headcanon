# TASKS — Implementation Roadmap (v2)

Конкретные тикеты, упорядоченные по фазам. Каждый тикет — самостоятельная единица для PR. Размеры: **S** ≤ 1 день, **M** 1-3 дня, **L** 3-7 дней.

> **Пивот v2** ([Notion](https://www.notion.so/36b2a47b0ca181669ea3ce37d9893091)): writer path — primary. Фазы продукта — [docs/roadmap.md](../docs/roadmap.md). Дизайн writer-MVP — `docs/superpowers/specs/`.

---

## Legacy (v1) — статус

Построено в v1, переразмечено под v2. **Ничего не удаляем.**

- **M0 — Foundation** ✅ Next.js + Tailwind + дизайн-система + Supabase + primitives.
- **M1 — Read** ✅ Читалка, лента, story page. Используется для превью и публичного чтения — без изменений.
- **M2 — Generate** ✅ Generator-мастер + стриминг глав. **Репозиционируется как secondary path (Phase 2).** В Phase 1 не трогаем, в onboarding делаем вторичным входом.
- **M3 — Watch mode** ❄️ **Заморожено.** Переезжает в Phase 3, только для оригинальных миров. Код остаётся в репо, новых тикетов сейчас нет.

---

## Phase 1 — Writer MVP ⭐ critical path

> Цель: автор пишет историю с базовым инструментарием писателя + AI-помощником, развивает приватные черновики, публикует. Спека — `docs/superpowers/specs/`.

### W0 — Schema & gating foundation

- **W0-01 [S]** Prisma: `enum StorySource { WRITTEN GENERATED }`, `Story.source @default(WRITTEN)`. Миграция. Существующие истории — `GENERATED`.
- **W0-02 [S]** Prisma: `Tag.isCanonicalIp Boolean @default(false)`. Сид списка канонных фандомов (HP, Genshin, Marvel, K-pop, аниме…). Хелпер `storyHasCanonicalIp(story)` в `lib/`.
- **W0-03 [S]** Prisma: `Note` (user_id, story_id?, title?, body). Миграция.
- **W0-04 [S]** Prisma: `AiThread` (1 на Story) + `AiMessage`. Миграция.

### W1 — Writer editor

- **W1-01 [M]** TipTap editor (минимальный конфиг: абзацы, заголовки, bold/italic, scene-break). Сериализация в markdown, совместимая с читалкой (`Chapter.text`).
- **W1-02 [M]** Chapter CRUD + debounced autosave + версионирование (`updatedAt`, `userEdited`).
- **W1-03 [M]** Структура истории: книга → главы. Добавить / удалить / переупорядочить главу.
- **W1-04 [M]** Workspace «Мои истории»: приватные черновики + опубликованное, бейджи статуса (`PRIVATE`/`PUBLIC`, `DRAFT`/`PUBLISHED`).
- **W1-05 [S]** Publish toggle (story `visibility` + chapter `status`). Превью через существующую читалку.

### W2 — Базовый инструментарий писателя

- **W2-01 [S]** Заметки: глобальный inbox идей (`storyId = null`) + заметки по истории. Список + быстрое создание. Без вложенности/тегов.
- **W2-02 [M]** Character bible UI: список, добавление вручную, AI-извлечение упомянутых персонажей из текста → `Character`.
- **W2-03 [S]** World-building: атрибуты мира (reuse `WorldState`), AI флагит противоречия.
- **W2-04 [M]** Граф связей персонажей (Obsidian-style graph view): узлы — `Character`, рёбра — `CharacterRelation` (тип связи: романс / вражда / семья / дружба…). AI предлагает связи из текста глав с accept/reject (не ручной ввод как primary — «граф сам собирается, пока пишешь»), ручное добавление тоже есть. Рендер: `react-force-graph` или `sigma.js`. Виральный визуал для демо-видео. Добавлено 2026-07-02, в MVP-скоуп.

### W3 — AI-ассистент

- **W3-01 [M]** Чат-панель (slide-over рядом с редактором), персист `AiThread`/`AiMessage`.
- **W3-02 [M]** Сборка контекста (код): premise + текущая глава + summary прошлых глав + character bible + world state. Структурно, без парсинга свободного текста.
- **W3-03 [M]** Возможности: «следующая сцена» / «дай идею» / «отредактируй» (diff) / сократические вопросы. Structured output, версионирование промптов (`template_id + version`).
- **W3-04 [S]** Cost tracking через `LlmCallLog`. Лимит AI-запросов для free-tier (письмо без лимитов).

### W4 — Onboarding & paths

- **W4-01 [M]** Onboarding — 3 экрана (writer / reader / lazy creator).
- **W4-02 [S]** Generator path как secondary entry point (не главный CTA).
- **W4-03 [S]** Лента: бейдж источника (written vs AI-generated), AI-generated в отдельной категории.
- **W4-04 [S]** Tracking-события `save` + `chapter_completed` (метрика для будущих топов, Phase 4).

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
