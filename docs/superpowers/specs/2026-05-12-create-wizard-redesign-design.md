# Create Wizard Redesign — Design Spec

**Date:** 2026-05-12
**Status:** Approved by founder, ready for plan
**Scope:** Полная переработка визарда `/create` (M2 backbone). Убрать required-ship, дать свободный ввод, локализовать русский фандомный сленг, расширить AO3-стандартными полями.

## Контекст

M2 завершён: текущий визард `/create` — 5 шагов, hard-required ship выбирается из закрытого LLM-списка, лейблы tone/тропов на английском, кроме базовых полей ничего не настраивается.

**Проблемы:**
1. Юзер не может построить gen-историю (приключение, character study, дружба) — ship обязателен.
2. Ship закрыт списком LLM-сугестий: нет custom-ввода для редких пар/OC/poly-4+.
3. Тропы — то же, только LLM-сугестии без custom.
4. Локализация — английские `slow burn / spicy / fluff / angst`, английские слаги трупов.
5. Отсутствуют стандартные AO3-поля (рейтинг, категория, warnings, POV, жанр/AU, премиса) — критично для AO3-aware аудитории.

**Цель:** дать гибкость и широту настроек как у NovelAI/Sudowrite + AO3-стандарт + русский фандом-сленг, не сломав скорость «ship → глава < 60 сек».

## Решения, принятые в брейнсторме

- **Композиция:** essentials (3 шага) + advanced (single-page, accordion) + preview.
- **Шаг 2 переделан:** сначала выбор focus (Romance / Gen / Character study / Friendship), потом умный инпут под focus.
- **Свобода ввода:** ship-чипы + custom textarea; тропы-чипы + free input; жанр-чипы + free input.
- **Локализация:** идиоматичный русский фандом-сленг, не словарный (`enemies-to-lovers` → «от врагов к возлюбленным»; `slow burn` → «слоуберн»; `omegaverse` → «омегаверс»).
- **Кастомный фандом:** отложен (universal fandoms — отдельный scope M3+).
- **Длина главы:** не трогаем — управляется в reader settings.

## Архитектура

### Структура визарда

```
Step 1 · фандом         — закрытый список 4 (unchanged)
Step 2 · фокус + герои  — focus chips → conditional input
Step 3 · тропы          — AI chips + custom tag input
Step 4 · детали         — single page, 4 свёрнутых секции
Step 5 · preview        — summary + start
```

Скорость flow сохраняется: дефолтное прохождение «тык-тык-тык-старт» = 4 клика после фандома (focus, ship, ≥1 троп, start). Шаг 4 свёрнут, AI заполнит пропущенное.

### Шаг 2 — Focus + characters

**UI:**
1. Сверху — 4 chip focus-режима (обязательный выбор):
   - Романтика — для пейринг-историй
   - Джен — приключения/мистика без любовной линии
   - Character study — фокус на одном герое
   - Дружба — двое+ как друзья/семья

2. Под focus — conditional input:

| Focus | Input |
|---|---|
| Романтика | AI-чипы пейрингов + поле «свой пейринг» (текст: `имя × имя` или `имя/имя`). Auto-validate: ≥2 имени через разделитель. |
| Джен | Tag-input «главные герои» (1-N) + AI-чипы популярных групп («Мародёры», «Золотое трио»). |
| Character study | Tag-input одного героя + AI-чипы топ-героев фандома. |
| Дружба | Tag-input 2+ героев + AI-чипы дружеских пар. |

**API:**
- `GET /api/create/suggestions/ships?fandomId=...` → `GET /api/create/suggestions/characters?fandomId=...&focus=...`
  - `focus=romance` → возвращает пейринги (как сейчас, плюс label_ru).
  - `focus=gen` → возвращает популярные группы + сольных героев.
  - `focus=character_study` → топ-герои фандома, одиночные.
  - `focus=friendship` → дружеские пары/трио.

### Шаг 3 — Tropes (минимальный фикс)

**UI:** существующие AI-чипы (вверху) + tag-input «+ свой троп» (внизу). Кастомы появляются среди выбранных чипов с меткой `🏷 свой` (или просто без `★` префикса).

**API:** `GET /api/create/suggestions/tropes` — schema unchanged, только промпт обновлён.

**LLM промпт:** добавить инструкцию «Return labels in idiomatic Russian fanfic community slang (e.g. «слоуберн», «от врагов к возлюбленным», «омегаверс», «школьная AU», «хёрт/комфорт»). Mix transliterated terms with idiomatic Russian phrases. Never word-for-word translation.»

### Шаг 4 — Details (single page, 4 свёрнутых секций)

**UI каркас:**
```
[ глобальная кнопка «развернуть всё» / «свернуть всё» ]

▸ маркировка          ← collapsed
▸ голос истории
▸ вселенная
▸ завязка

[ дальше · preview › ]    ← всегда активна
```

Каждая секция auto-saves в draft на blur/change.

**Секция «маркировка»:**
- **Рейтинг** — 4 chip: `общий` / `16+` / `18+` / `explicit`. Дефолт пусто (LLM решит по контексту).
- **Категория** — 5 chip: `слэш` / `фемслэш` / `гет` / `джен` / `multi`. Auto-pre-select по focus (Gen → джен), можно поменять.
- **Предупреждения** — multi-chip: `смерть персонажа` / `жестокость` / `non-con` / `без предупреждений`. Дефолт: «без предупреждений».

**Секция «голос истории»:**
- **POV** — 3 chip: `от первого лица` / `третье близкое` (default visual highlight) / `всеведущее`.
- **Время** — 2 chip: `прошедшее` (default highlight) / `настоящее`.
- **Тон** — multi-chip: `слоуберн` / `спайси` / `флафф` / `ангст` / `хёрт/комфорт` / `крэк` / `дарк`. Можно несколько.

**Секция «вселенная»:**
- **Когда происходит** — 4 chip: `канон` / `pre-canon` / `post-canon` / `AU без канона` + textarea «уточни» (год/эпоха).
- **Жанр / AU-тип** — AI-чипы (генерятся под фандом+focus): «современная AU», «школьная AU», «coffee shop», «омегаверс», «соулмейты», «исторический», «фантастика»… + free-input.
- **Место и время** — textarea (то что сейчас `setting`).

**Секция «завязка»:**
- **Премиса** — textarea, опционально, placeholder: «что происходит в начале первой главы — фраза, сцена, идея».

### Шаг 5 — Preview

Summary card расширяется новыми полями. Незаполненные поля показываются плашкой «AI решит» (`text-ink-faint`, italic). Cover preview unchanged.

## Изменения данных

### Prisma schema

```prisma
enum FocusType {
  ROMANCE
  GEN
  CHARACTER_STUDY
  FRIENDSHIP
}

enum Rating {
  GENERAL
  TEEN
  MATURE
  EXPLICIT
}

enum Category {
  SLASH
  FEMSLASH
  HET
  GEN
  MULTI
  OTHER
}

enum Pov {
  FIRST
  CLOSE_THIRD
  OMNISCIENT
}

enum Tense {
  PAST
  PRESENT
}

model CreateDraft {
  id         String      @id @default(uuid()) @db.Uuid
  userId     String      @db.Uuid
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  fandomId   String?     @db.Uuid

  // Step 2
  focusType  FocusType?
  characters String[]    @default([])   // renamed from shipId

  // Step 3
  tropes     String[]    @default([])

  // Step 4 — маркировка
  rating     Rating?
  category   Category?
  warnings   String[]    @default([])   // ["death","violence","non_con","cntw"]

  // Step 4 — голос
  pov        Pov?
  tense      Tense?
  tones      Tone[]      @default([])   // было tone: Tone? (single)

  // Step 4 — вселенная
  timeline   String?                    // "canon" | "pre" | "post" | "au" | freeform
  timelineNote String?                  // textarea "уточни"
  genres     String[]    @default([])
  setting    String?

  // Step 4 — завязка
  premise    String?

  step       Int         @default(1)
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  @@index([userId, updatedAt])
}
```

**Story model** — добавить те же новые поля для генерации (`focusType`, `rating`, `category`, `warnings`, `pov`, `tense`, `tones`, `timeline`, `timelineNote`, `genres`, `premise`). Существующее `tone: Tone?` остаётся для обратной совместимости старых stories, но новый код пишет в `tones[]`.

**Миграция:** новая Prisma миграция добавляет колонки/энумы. Существующие drafts (если есть) — `focusType=ROMANCE`, `characters` берётся из `shipId` (split по `×`/`/`/`x`). Drop `shipId` после миграции данных.

### API изменения

| Endpoint | Изменение |
|---|---|
| `GET /api/create/suggestions/characters?fandomId=...&focus=...` | новый, заменяет `/ships` |
| `GET /api/create/suggestions/ships` | удалить после миграции |
| `GET /api/create/suggestions/genres?fandomId=...&focus=...` | новый (chips для жанра/AU) |
| `GET /api/create/suggestions/tropes` | без изменений schema, обновить промпт (focus + русские лейблы) |
| `PATCH /api/create/draft/:id` | расширить Zod-схему всеми новыми полями |
| `POST /api/create/draft/:id/start` | валидация: `focusType` обязательно, `characters.length ≥ 1` обязательно, ship больше не required |

### LLM-промпты

**`lib/prompts/chapter.ts`** — расширить `ChapterInput` всеми новыми полями. System-prompt собирается из заполненных полей:

```ts
interface ChapterInput {
  fandomName: string;
  focusType: 'ROMANCE' | 'GEN' | 'CHARACTER_STUDY' | 'FRIENDSHIP';
  characters: string[];
  tropes: string[];
  rating?: 'GENERAL' | 'TEEN' | 'MATURE' | 'EXPLICIT';
  category?: 'SLASH' | 'FEMSLASH' | 'HET' | 'GEN' | 'MULTI' | 'OTHER';
  warnings?: string[];
  pov?: 'FIRST' | 'CLOSE_THIRD' | 'OMNISCIENT';
  tense?: 'PAST' | 'PRESENT';
  tones?: string[];
  timeline?: string;
  timelineNote?: string;
  genres?: string[];
  setting?: string;
  premise?: string;
  chapterLength: ChapterLength;
  chapterOrdinal: number;
  priorState?: PriorState;
}
```

Сборка системного промпта — каждое поле добавляет строку только если задано (`if (input.rating) lines.push(...)`). Дефолтное поведение там где skip: модель решает сама.

**`lib/prompts/ship-suggest.ts` → переименовать в `character-suggest.ts`:**
- Schema: `{ characters: [{ names: string[], label_ru: string, popularity, avatar_prompt, rarity, focus_compatible: ['romance','gen','friendship','character_study'] }] }`.
- Промпт условный по `focus`: для romance — ships как сейчас, для gen — main characters / групповые лейблы, для character_study — соло-герои, для friendship — friendship pairs.
- Все имена/лейблы — на русском, как пишутся в русфандоме.

**`lib/prompts/trope-suggest.ts`:**
- Schema: `{ tropes: [{ slug, label_ru, description_ru, popularity }], sensei_tip }`.
- Промпт: idiomatic Russian fanfic slang в `label_ru`.
- Контекст: `focus` + `characters` вместо только `ship`.

**`lib/prompts/genre-suggest.ts` (новый):**
- Schema: `{ genres: [{ slug, label_ru, popularity }] }`.
- Промпт: «Suggest 10 popular AU/genre tags for {fandom} + {focus} fanfic. Russian fandom slang. Mix mainstream («современная AU», «школьная AU») с поджанрами фандома.»

### Локализация — `lib/create/locale.ts` (новый файл)

```ts
export const FOCUS_LABELS: Record<FocusType, string> = {
  ROMANCE: 'романтика',
  GEN: 'джен',
  CHARACTER_STUDY: 'один герой',
  FRIENDSHIP: 'дружба',
};
export const FOCUS_DESCRIPTIONS: Record<FocusType, string> = {
  ROMANCE: 'пейринг в центре сюжета',
  GEN: 'приключения, мистика, без любовной линии',
  CHARACTER_STUDY: 'один герой, его рост и арка',
  FRIENDSHIP: 'двое или больше — друзья, семья, союз',
};

export const RATING_LABELS: Record<Rating, string> = {
  GENERAL: 'общий',
  TEEN: '16+',
  MATURE: '18+',
  EXPLICIT: 'explicit',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  SLASH: 'слэш',
  FEMSLASH: 'фемслэш',
  HET: 'гет',
  GEN: 'джен',
  MULTI: 'multi',
  OTHER: 'другое',
};

export const POV_LABELS: Record<Pov, string> = {
  FIRST: 'от первого лица',
  CLOSE_THIRD: 'третье близкое',
  OMNISCIENT: 'всеведущее',
};

export const TENSE_LABELS: Record<Tense, string> = {
  PAST: 'прошедшее',
  PRESENT: 'настоящее',
};

export const TONE_LABELS: Record<Tone, string> = {
  SLOW_BURN: 'слоуберн',
  SPICY: 'спайси',
  FLUFF: 'флафф',
  ANGST: 'ангст',
  HURT_COMFORT: 'хёрт/комфорт',
  CRACK: 'крэк',
  DARK: 'дарк',
};

export const WARNING_LABELS: Record<string, string> = {
  death: 'смерть персонажа',
  violence: 'жестокость',
  non_con: 'non-con',
  cntw: 'без предупреждений',
};

export const TIMELINE_LABELS: Record<string, string> = {
  canon: 'канон',
  pre: 'pre-canon',
  post: 'post-canon',
  au: 'AU без канона',
};
```

Промпты импортируют локали для построения user-facing описаний; БД хранит enum-keys.

## Frontend компоненты

`components/create/CreatePageView.tsx` рефакторится:
- `StepShip` → `StepFocusCharacters` (focus chips + conditional input).
- `StepTropes` дополняется `CustomTropeInput`.
- `StepTone` (текущий) превращается в `StepDetails` с 4 секциями-аккордеонами.
- `StepPreview` расширяется новыми полями summary.

Новые UI-примитивы:
- `ChipGroup` (single-select chip row) — для focus, rating, category, pov, tense, timeline.
- `MultiChipGroup` (multi-select) — для warnings, tones, genres, tropes, characters (как тэг-input).
- `TagInput` (свободный ввод + чипы выбранного) — для custom characters/tropes/genres.
- `AccordionSection` — складная секция с заголовком + контент.

## Edge cases

| Случай | Поведение |
|---|---|
| Юзер вернулся к черновику | Восстанавливаем все поля включая focus; открываем последний step. |
| Focus=Gen, юзер вписал «Гарри × Драко» в characters | Не разворачиваем в ship; передаём LLM как «main characters: Гарри, Драко». Категория auto-set в GEN. |
| Focus=Romance, юзер вписал одного героя | Валидация: ≥2 имени; иначе — toast «нужно минимум 2 героя для романтики». |
| Custom troп `«авторская драма»` | Сохраняется как FREEFORM tag (как сейчас), нормальный flow. |
| Юзер skip всю Step 4 | LLM получает только focus/characters/tropes/fandom; решает остальное сам. |
| Rating=EXPLICIT + warnings=cntw | Норм, передаётся как есть. LLM пишет 18+ контент. |
| Категория конфликтует с characters (Het + Гарри × Драко) | UI не блокирует — юзер прав; LLM получает оба сигнала, отдаёт приоритет characters. |
| Премиса с инжектом «ignore previous» | Уже обёрнуто в `wrapUserInput` injection-guard (как сейчас). |

## Tracking events

Расширить существующие:
- `create_focus_selected { focus_type }`
- `create_character_added { source: 'suggestion' | 'custom' }`
- `create_trope_added { source: 'suggestion' | 'custom' }`
- `create_section_expanded { section: 'marking' | 'voice' | 'universe' | 'opening' }`
- `create_advanced_skipped { fields_filled: number }` — на старте: сколько Advanced-полей юзер фактически заполнил
- `create_finished { took_total_ms, focus_type, advanced_fields_filled }`

## Что explicitly не делаем

- **Кастомный фандом** — отдельный scope M3+ (universal fandoms vision).
- **Polyship UI** (3+ персонажей с попарными отношениями) — текстовый ввод работает, специализированного UX нет.
- **Длина главы в визарде** — остаётся в reader settings.
- **OC support** — custom-имена в characters работают как FREEFORM, но bible/canon-extraction для них — отдельный scope.
- **i18n инфраструктура** (next-intl и пр.) — нет, статичный русский в коде; англоязычная версия — будущее.

## Открытые вопросы (для плана)

- Миграция существующих drafts: split `shipId` по `×`/`/`/`x` в `characters[]` — насколько надёжно? Можно тёплый старт: если split не сработал — оставить весь shipId как один character.
- `Story.tone: Tone?` → `tones: Tone[]`: оставить старое поле и дублировать или мигрировать данные? Думаю — мигрировать (UPDATE с array_agg по non-null).
- `lib/fixtures/tropes.ts` — нужны ли русские лейблы для unit-тестов, или хватит slug.

## Definition of Done

- [ ] `pnpm test` зелёный (включая обновлённые tests для suggestions API и draft schema).
- [ ] Prisma миграция применена локально + на dev Supabase.
- [ ] Прохождение «фандом → focus=ROMANCE → 1 ship из сугестий → 1 троп из сугестий → skip details → start» работает и выдаёт глаuvu на русском < 60 сек.
- [ ] Прохождение «фандом → focus=GEN → 3 героя свободным вводом → 2 кастомных трупа → rating=MATURE, warnings=[death] → premise → start» работает и LLM учитывает all hints.
- [ ] LLM возвращает русские лейблы тропов и пейрингов в сугестиях.
- [ ] Tracking events стреляют по новым именам.
