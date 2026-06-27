# Writer MVP — design spec (Phase 1, пивот v2)

> Контекст пивота — [Notion: Pivot v2](https://www.notion.so/36b2a47b0ca181669ea3ce37d9893091), [docs/vision.md](../../vision.md), [docs/roadmap.md](../../roadmap.md). Backlog — [handoff/TASKS.md](../../../handoff/TASKS.md) → Phase 1 (W0-W4).

Writer path становится primary: человек пишет фанфик сам, AI ассистирует. Generator path (v1, построен) репозиционируется как secondary и в этой спеке **не меняется**. Обе модели живут на общих таблицах `Story`/`Chapter`.

---

## 1. Goals & non-goals

### Goals

- Автор создаёт историю, пишет главы в редакторе (TipTap), развивает **приватный черновик** без лимитов.
- Базовый инструментарий писателя: структура книга→главы, автосейв, заметки (idea inbox + по истории), character bible, world-building.
- AI-ассистент в чат-панели: следующая сцена / идея / редактирование / сократические вопросы / извлечение персонажей / консистентность мира.
- Публикация — явное действие; превью и публичное чтение через существующую читалку.
- Onboarding разводит три пути (writer / reader / lazy creator); generator становится вторичным входом.
- Tag-based video gating заложен в данные (видео не в MVP, но инвариант — с первого дня).

### Non-goals (этой фазы)

- ❌ Аудио (Phase 2), видео (Phase 3), платежи и tier-enforcement (Phase 5).
- ❌ Соревновательная механика и топы (Phase 4) — но трекинг `save`/`chapter_completed` закладываем.
- ❌ Изменение generator path (стриминг, мастер) — только репозиционирование в UI.
- ❌ Collaborative writing, версии-снапшоты глубже `updatedAt`, rich block-editor (только минимальный TipTap).

---

## 2. Архитектура: два пути на общей модели

`Story.source` — дискриминатор:

- `WRITTEN` — writer path. Текст приходит от автора. Generator-поля (`focusType`, `tones`, `pov`, `tense`, `genres`…) остаются `null`/пустыми.
- `GENERATED` — текущий v1 flow. Без изменений.

Читалка, лента, `Like`/`Save`/`Comment`/`Follow`, профили — общие, работают по `source`-agnostic запросам. Различие проявляется только в:

- редакторе (только для `WRITTEN`, владелец),
- бейдже источника в ленте,
- доступности AI-ассистента writer-mode (только `WRITTEN`),
- gating видео-кнопки (Phase 3) по `storyHasCanonicalIp`.

### Файловая раскладка (новое)

```
app/
  write/                         # writer workspace (authed)
    page.tsx                     # «Мои истории» — список черновиков+опубликованного
    [storyId]/
      page.tsx                   # редактор истории (главы + editor + AI-панель)
      settings/page.tsx          # title, premise, visibility, tags, characters, world
  api/
    write/
      story/route.ts             # POST create WRITTEN story
      story/[id]/route.ts        # PATCH (title/premise/visibility/tags), DELETE
      story/[id]/publish/route.ts# POST publish/unpublish
      chapter/route.ts           # POST create chapter
      chapter/[id]/route.ts      # PATCH autosave text/title/status, DELETE
      chapter/reorder/route.ts   # PATCH ordinals
    notes/route.ts               # GET list, POST create
    notes/[id]/route.ts          # PATCH, DELETE
    assistant/
      [storyId]/thread/route.ts  # GET thread+messages
      [storyId]/message/route.ts # POST user message → AI response (structured)
      [storyId]/extract/route.ts # POST extract characters from text
components/
  write/
    StoryList.tsx                # workspace list + status badges
    ChapterNav.tsx               # книга→главы, reorder, add/delete
    Editor.tsx                   # TipTap wrapper, markdown (de)serialization
    PublishToggle.tsx
    NotesPanel.tsx               # idea inbox + per-story
    CharacterBible.tsx           # list/add + AI-extract
    WorldPanel.tsx
    assistant/
      AssistantPanel.tsx         # slide-over chat
      AssistantActions.tsx       # «след. сцена» / «идея» / «редактировать» / «вопрос»
lib/
  markdown.ts                    # TipTap JSON ↔ markdown (стабильная сериализация)
  gating.ts                      # storyHasCanonicalIp(story)
  assistant/
    context.ts                   # сборка структурного контекста из БД
    prompts.ts                   # versioned шаблоны (template_id + version)
```

### Граница ИИ vs код (per architecture.md)

| Задача                                                     | ИИ / код                          |
| ---------------------------------------------------------- | --------------------------------- |
| Редактирование, автосейв, структура глав, заметки, publish | Код (CRUD)                        |
| Сборка контекста для ассистента                            | Код (структурно из БД)            |
| Предложение сцены/идеи, правки, сократические вопросы      | ИИ (structured output)            |
| Извлечение персонажей из текста                            | ИИ → код пишет в `Character`      |
| Консистентность мира                                       | ИИ сверяет с `WorldState`, флагит |
| Video gating                                               | Код (`storyHasCanonicalIp`)       |

---

## 3. Data model (дельта)

### Изменения существующих

```prisma
enum StorySource { WRITTEN  GENERATED }

model Story {
  // ...
  source  StorySource @default(WRITTEN)
}

model Tag {
  // ...
  isCanonicalIp Boolean @default(false)
}
```

**Миграция:** существующие `Story` → backfill `source = GENERATED` (всё построенное в v1 — генерация). Дефолт для новых — `WRITTEN`. Сид: проставить `isCanonicalIp = true` известным канонным фандомам (HP, Genshin, Marvel, Naruto, JJK, K-pop-группы и т.д.) через `prisma/seed.ts`.

### Новые таблицы

```prisma
model Note {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  storyId   String?  @db.Uuid          // null = глобальный idea inbox
  story     Story?   @relation(fields: [storyId], references: [id], onDelete: Cascade)
  title     String?
  body      String   @default("")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([userId, updatedAt])
  @@index([storyId])
}

model AiThread {
  id        String      @id @default(uuid()) @db.Uuid
  storyId   String      @unique @db.Uuid   // 1 тред на историю
  story     Story       @relation(fields: [storyId], references: [id], onDelete: Cascade)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  messages  AiMessage[]
}

model AiMessage {
  id         String   @id @default(uuid()) @db.Uuid
  threadId   String   @db.Uuid
  thread     AiThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  role       String   // "user" | "assistant"
  action     String?  // "next_scene" | "idea" | "edit" | "socratic" | "chat"
  content    String
  payloadJson Json?   // structured output (варианты, diff и т.п.)
  createdAt  DateTime @default(now())
  @@index([threadId, createdAt])
}
```

Связи на `User`/`Story` добавить обратными полями (`User.notes`, `Story.notes`, `Story.aiThread`).

### Переиспользуется без изменений

`Character`, `CharacterState`, `WorldState` (writer mode пишет туда же), `LlmCallLog`, `AiSuggestion`, `ChapterSummary`, социалка.

---

## 4. Writer editor (W1)

- **TipTap** минимальный конфиг: paragraph, heading (h2/h3), bold, italic, horizontal-rule как scene-break. Без таблиц/картинок/чеклистов (YAGNI).
- **Хранение:** `Chapter.text` в **markdown**. `lib/markdown.ts` детерминированно (de)сериализует TipTap JSON ↔ markdown. Читалка рендерит `text` как сейчас — без переделки.
  - ⚠️ Учесть [[feedback_streaming_text_wrap]]: проблема text-wrap была только для стриминга; в writer-режиме текст статичен, ограничение не применяется.
- **Автосейв:** debounce ~1.5 c → `PATCH /api/write/chapter/[id]` (text, title). Оптимистичный UI, индикатор «сохранено». `userEdited = true`.
- **Структура:** `ChapterNav` — книга→главы, add/delete, reorder через `chapter/reorder` (массив ordinals в транзакции; `@@unique([storyId, ordinal])` соблюдается пересчётом).
- **Workspace `/write`:** список историй автора (любой `visibility`), бейджи `PRIVATE/PUBLIC` + `DRAFT/PUBLISHED` глав.
- **Publish:** `PublishToggle` → `story.visibility = PUBLIC` + `chapter.status = PUBLISHED` (+ `publishedAt`). Превью — ссылка в существующую читалку.

---

## 5. Базовый инструментарий писателя (W2)

- **Заметки (`NotesPanel`):** глобальный inbox (`storyId = null`, доступен из `/write`) + заметки внутри истории (`storyId` задан, видны в workspace истории). Список + быстрое создание + inline-правка. Без вложенности/тегов.
- **Character bible (`CharacterBible`):** список персонажей истории; ручное добавление (name + description); кнопка **«AI: достать персонажей из текста»** → `assistant/[storyId]/extract` собирает текст глав, ИИ возвращает structured список `{name, description}`, код upsert-ит в `Character` (`@@unique([storyId, name])`, не перезатирая вручную отредактированное без подтверждения).
- **World-building (`WorldPanel`):** атрибуты мира в `WorldState.stateJson`; кнопка «AI: проверь консистентность» — ИИ сверяет последнюю главу с world state, возвращает флаги противоречий (не правит автоматически).

---

## 6. AI-ассистент (W3)

### Сборка контекста (`lib/assistant/context.ts`, код)

На каждый запрос собираем структурный объект (не сырой текст):

```
{
  premise, currentChapter: {ordinal, title, text|selection},
  previousSummaries: ChapterSummary[],   // для глав < current
  characters: Character[],               // bible
  world: WorldState.stateJson
}
```

Длинные истории: прошлые главы идут как `ChapterSummary`, не полным текстом (бюджет токенов). Текущая глава — целиком или выделение (для `edit`).

### Действия (`lib/assistant/prompts.ts`, versioned)

| action       | вход                        | structured output                                       |
| ------------ | --------------------------- | ------------------------------------------------------- |
| `next_scene` | контекст                    | `{ options: [{summary, text}] }` (2-3 варианта)         |
| `idea`       | контекст                    | `{ ideas: string[] }`                                   |
| `edit`       | контекст + selection        | `{ edits: [{original, suggested, reason}] }` (diff-вид) |
| `socratic`   | контекст                    | `{ questions: string[] }`                               |
| `chat`       | контекст + свободный вопрос | `{ reply }`                                             |

- Structured outputs через существующий `lib/llm.ts`. Учесть [[project_openai_structured_outputs]] (никаких `z.tuple`/union в `items`; `z.array(...).min/max`).
- Модель: prose-действия (`next_scene`, `edit`) → `PROSE_MODEL`; lookups (`socratic`, `idea`, extract) → mini. Per [[project_llm_model_split]].
- **Персист:** каждое сообщение (user + assistant) → `AiMessage`. Тред один на Story (`AiThread.storyId @unique`).
- **Cost & versioning:** каждый вызов → `LlmCallLog` (callType = `assistant_<action>`), `template_id + version` в `payloadJson`. Кеш детерминированных подсказок — `AiSuggestion`.
- **Лимиты:** письмо и автосейв — без лимитов. AI-запросы — счётчик free-tier (переиспользовать паттерн `DailyUsage`/квот; точные числа — Phase 5). Dev-bypass флаги с VITEST-guard per [[feedback_dev_env_flags_vitest]].

### UI (`AssistantPanel`)

Slide-over справа от редактора (mobile: полноэкранный sheet). История сообщений из треда, кнопки быстрых действий (`AssistantActions`), для `next_scene` — вставка выбранного варианта в редактор; для `edit` — применение конкретной правки.

---

## 7. Onboarding & paths (W4)

- **Onboarding** — 3 экрана: writer (пиши сам + AI) / reader (читай и сохраняй) / lazy creator (сгенерируй). Выбор ведёт в соответствующий первый экран; не блокирует доступ к остальным.
- **Generator path** — вторичный вход (не главный CTA на `/write`). Существующий мастер не трогаем.
- **Лента** — бейдж источника (`WRITTEN` vs AI-generated); AI-generated в отдельной категории, видны по умолчанию (скрытие — Phase 5 PRO).
- **Tracking** — события `save`, `chapter_completed` (IntersectionObserver на конце главы в читалке) — фундамент метрики топов (Phase 4).

---

## 8. Tag-based video gating (инвариант)

- `lib/gating.ts` → `storyHasCanonicalIp(story)`: в `story.tags` есть тег с `isCanonicalIp === true`.
- Видео-UI (Phase 3) рендерит кнопку только при `false`. В Phase 1 — только данные + хелпер + покрытие тестом, кнопки нет.
- Сид канонных фандомов в `prisma/seed.ts`.

---

## 9. Error handling

- **Автосейв:** при ошибке — toast «не сохранено, повтор…», retry с backoff; не терять локальный буфер редактора.
- **AI-вызов:** abort controller (отмена запроса), таймаут, понятная ошибка в панели; rate-limit (429) → «лимит AI на сегодня исчерпан» с указанием тарифа. Учесть [[project_streaming_test_timeouts]] для интеграционных тестов.
- **Reorder/publish:** транзакции; конфликт ordinal → пересчёт.
- **Extract персонажей:** не перезатирать `userEdited`-bible без подтверждения; показать предлагаемые добавления списком.

---

## 10. Testing

- **Unit:** `lib/markdown.ts` (round-trip TipTap↔markdown стабилен), `lib/gating.ts` (canonical/original кейсы), `lib/assistant/context.ts` (бюджет токенов, summaries vs full text).
- **Integration (live DB, per [[project_test_db_isolation]] — upsert для shared rows):**
  - create WRITTEN story → add chapters → autosave → publish → видно в читалке.
  - notes: global inbox + per-story CRUD.
  - assistant: message → AiMessage персист; extract → Character upsert без перезатирания.
- **Verify независимо** (per [[feedback_subagent_verify]]): гонять `pnpm test` + spot-check, не доверять STATUS:DONE имплементера.
- Тесты ассистента с `15_000ms` таймаутом (Supabase Cloud persist).

---

## 11. План реализации

Тикеты W0-W4 — [handoff/TASKS.md → Phase 1](../../../handoff/TASKS.md). Порядок: **W0 (schema) → W1 (editor) → W2 (toolkit) → W3 (assistant) → W4 (onboarding)**. W3 зависит от W0 (AiThread) и W1 (есть что ассистировать); W2/W4 параллелятся после W1.

Детальный implementation plan — следующий шаг (writing-plans), отдельный файл.
