# Headcanon — pre-development gap-closing spec

> **Дата:** 2026-05-09
> **Статус:** approved by founder
> **Назначение:** закрыть продуктовые и архитектурные пробелы в существующих доках (`docs/`, `handoff/`) ДО первого commit'а.

После apply этой спеки нужно обновить:
- [`docs/architecture.md`](../../architecture.md) — data model + character bible flow
- [`handoff/TASKS.md`](../../../handoff/TASKS.md) — новые тикеты в M0/M1/M2
- [`docs/roadmap.md`](../../roadmap.md) — Phase 0 cold-start сroке

---

## §1. Content policy

| Срез | Решение |
|---|---|
| Rating ceiling (fictional characters) | G / T / M / **E** разрешены |
| Rating ceiling (RPF) | G / T / M (E **запрещён**) |
| Visuals | suggestive max везде (поцелуи / обнажённые плечи / romantic poses; **без** explicit anatomy и обнажёнки) |
| Image model | **JuggernautXL** или **Pony Realism v6** через Replicate (NSFW-trained но контролируемые) |
| Hard prompt-banlist | underage explicit; deepfake faces; IRL russian-celebrity RPF + explicit |
| Mandatory disclaimers | RPF-stories: «Fictional. No claim made.» в подвале; всем M/E: 18+ confirmation на регистрации |
| Юр-структура для E-tier | **отложенный вопрос Phase 2** (см. §8) — не блокирует MVP |

**Rationale:** AO3-аудитория ~30% потребляет M/E. Без E теряется ядро. RPF M-only = разумный компромисс (k-pop/youtuber-вселенные открыты в будущем, но без юр-риска от explicit).

**Implication для провайдеров:**
- LLM: на mainstream Claude/GPT для G/T. Для M/E роутинг через OpenRouter на uncensored модели (DeepSeek V3, Mistral Large) — выбор по результатам тестов в M0.
- Картинки: один model на всё (JuggernautXL/Pony) с prompt-level фильтрами по rating.

---

## §2. Tagging system

Шесть типов тегов в едином `tags` table, разделены дискриминатором `type`:

| Тип | Кардинальность | UX в Create |
|---|---|---|
| `rating` | single (G / T / M / E) | radio, обязателен |
| `warnings` | multi (Major Character Death / Graphic Violence / Rape-Non-Con / Underage / Choose Not To Use Archive Warnings / No Archive Warnings Apply) | checkbox, обязателен (хотя бы один) |
| `category` | single (Gen / F-F / F-M / M-M / Multi / Other) | radio |
| `fandom` | multi (на старте: 4 фандома) | autocomplete |
| `relationships` (ships) | multi, free | autocomplete + AI suggestions |
| `characters` | multi, free | autocomplete |
| `freeform` (tropes / AUs / themes) | multi, free | autocomplete + popular |

### AI auto-tagging
После генерации главы — отдельный structured-output LLM-вызов выдаёт массив тегов с confidence-scores. Юзер видит pre-filled теги, может править. **Rating + warnings обязательно подтверждаются юзером** (юр-чувствительно — нельзя на AI полагаться).

### Tag canonicalization
«Drarry» = «Draco/Harry» = «Harry/Draco». Хранится `canonical_id` для merge. На MVP — manual cleanup в админке. Автоматический wrangler через embeddings — Phase 3.

### Filter UI
Include + exclude (как на AO3 — «Drarry but not Major Character Death»).

---

## §3. Generation loop / drift control

Решение: **Dynamic Character Bible JSON** + chapter summaries + last-2-chapters в контексте.

### Артефакты на каждую главу

```ts
// character_state — JSONB per character per story, обновляется после каждой save chapter
{
  emotional_state: "guarded but warming",
  recent_events: ["confronted father in ch3", "kissed Y in ch4"],
  relationships: {
    "Y": { closeness: 0.7, tension: 0.3, last_interaction: "ch4-truce" }
  },
  arc_progress: 0.45,           // 0..1, monotonically rising
  voice_traits_drift: ["more vulnerable than ch1"]
}

// world_state — JSONB per story
{
  current_location: "Hogwarts library",
  story_time: "Sept 1998, 3 weeks since ch1",
  active_plot_threads: ["Death Eater letters", "memory charm"],
  foreshadowing: ["Y's mother's locket"]
}

// chapter_summary — text per chapter (~200 words)
"Глава начинается с письма от X. Y возвращается в школу после ..."
```

### Prompt context для главы N

- **system:** world_state (current) + character_states (current, только релевантные участники) + canon-anchor (тон/сеттинг/фандом)
- **assistant context (truncated history):** summaries глав 1..N-3 + полные тексты глав N-2 и N-1
- **user:** continuation prompt (что юзер заказал)

### Update flow

1. Юзер тапает «save chapter» (готов с редактурой / опубликовал)
2. Background job через очередь: **один** structured-output LLM-вызов, который получает на вход старый character_state + старый world_state + текст главы, возвращает: `{ chapter_summary, updated_character_states[], updated_world_state }`
3. Persist в БД одним транзакционным апдейтом
4. Если юзер потом отредактировал параграф inline → re-trigger step 2 (re-extract from scratch, не diff'ом — потому что edit мог изменить любую логическую часть главы)

### Cost
+1 LLM-вызов на save (~$0.05–0.08 в зависимости от размера state JSON). Не критично.

### Architectural decision
Bible пишется **после** save chapter, **не во время** stream'а. Иначе stream занимает в 2 раза дольше и ухудшает первое впечатление.

---

## §4. Edit / regen UX (расширение Reader spec)

В Reader-режиме **своей** истории (на чужих — read-only):

### Paragraph context-menu
Tap на параграф → bottom-sheet menu (mobile) / popover (desktop):
- `▸ переписать` — regenerate этого параграфа inline-streaming, fades-out старый + ткётся новый drop-by-letter
- `▸ продолжить отсюда` — truncate всё ниже, сгенерировать новое продолжение
- `▸ развернуть` — вставить 1-2 параграфа details
- `▸ сжать` — объединить с соседним
- `▸ удалить`

### Top bar actions
- `regenerate chapter` — целиком
- `tweak prompt` — открывает textarea для уточнения

### Streaming эффект
При regen — параграф fades, новый ткётся drop-by-letter с амбер-cursor (тот же эффект что у первой генерации). Соответствует визуальному языку Editorial Y2K.

### Undo/redo
В рамках сессии (не persistent), Ctrl+Z / swipe-left.

### Free tier лимиты

| Действие | Лимит |
|---|---|
| Создание новой истории | 3 / день |
| Regenerate paragraph | 5 / chapter |
| «Продолжить отсюда» | 1 / chapter (это дороже — генерит >1 параграфа) |
| Tweak chapter prompt | 2 / chapter |

### Эффект на bible
Все edit-actions помечают chapter как `user_edited=true`. При следующем save — bible пере-экстрактится с нуля (не diff'ом).

### Cost protection
Rate-limit на regens хранится в `chapter_meta.regens_count`, проверяется ДО LLM-вызова. На превышение — модалка «лимит regens исчерпан, апгрейд тарифа?».

---

## §5. Beachhead + cold start

### Фандомы (4)
1. **Всё ради игры** (All for the Game / Foxhole Court by Nora Sakavic)
2. **Harry Potter**
3. **Наруто**
4. **Магическая битва** (JJK)

> BTS изначально рассматривался (RPF, k-pop, большая RU-аудитория), но **исключён**: founder не имеет domain knowledge → не сможет выверить demo-истории и общаться с k-pop комьюнити. RPF-policy (§1) сохраняется в spec'е для будущего расширения когда appear domain-эксперт.

### Special handling для AftG
LLM плохо знают canon (трилогия — нишевый western YA-romance с m/m fox/raven dynamics). Решение — **founder-written character bible seed**:
- Founder один раз пишет bible 6 главных героев (Neil Josten, Andrew Minyard, Kevin Day, Aaron Minyard, Nicky Hemmick, Matt Boyd) в JSON
- Хранится в `fandom_canon_seeds` table (см. §6)
- При генерации первой главы AftG-истории — seed автоматически подмешивается в system prompt

Для остальных 3 фандомов (HP/Naruto/JJK) — Claude/GPT знают canon из претрейна, seed не нужен.

### Cold start timeline

| Период | Действие | Definition of Done |
|---|---|---|
| День 7 | Деплой на прод-домен (но invite-only) | работает end-to-end на 1 истории |
| День 7-9 | Founder генерит 12-16 историй (по 3-4 на фандом) — выверяет, доводит | 12+ историй с обложками, тегами, минимум 2 главы каждая |
| День 9-14 | Beta — 10-20 fic-readers из Discord/tg/twitter | 50+ историй, фандом-срезы дают результат |
| День 14-21 | Расширение beta на waitlist | 100+ историй, метрики читаемы |
| День 21+ | Public launch | TikTok-кампания запускается с реальной лентой |

### Системные требования cold start
- Invite-codes table + redemption flow (см. §6)
- Feed имеет вкладки: **«Свежее»** / **«Curated»** / **«Trending»**
- Curated — admin-помеченные истории, всегда непустая
- Empty state каждого фандомного среза: «пока тут пусто. начни первой ↘» с CTA в Create

---

## §6. Data model deltas (vs текущая `architecture.md`)

### NEW tables

```
tags
  id              uuid pk
  type            enum (rating | warning | category | fandom | relationship | character | freeform)
  name            text
  slug            text unique
  count           int    -- денормализованный счётчик использований
  canonical_id    uuid?  -- self-FK для merge

story_tags
  story_id        uuid fk
  tag_id          uuid fk
  pk (story_id, tag_id)

character_states
  character_id    uuid fk
  story_id        uuid fk
  state_json      jsonb
  updated_at_chapter int  -- номер главы после которой state валиден
  pk (character_id, story_id)

world_states
  story_id        uuid pk
  state_json      jsonb
  updated_at_chapter int

chapter_summaries
  chapter_id      uuid pk
  summary         text
  updated_at      timestamptz

fandom_canon_seeds
  id              uuid pk
  fandom_id       uuid fk
  character_name  text
  bible_json      jsonb
  unique (fandom_id, character_name)

invites
  code            text pk          -- 8-char human-readable
  generated_by    uuid fk users
  used_by         uuid? fk users
  used_at         timestamptz?
  expires_at      timestamptz?
```

### EXTEND tables

```
chapters
  + status              enum (draft | published)
  + user_edited         bool default false
  + regens_count        int default 0
  + token_cost          numeric default 0

characters
  + age_canonical       int?       -- из canon, для banlist-проверки
  + description_seed    text?      -- из canon seed или из первой главы

users
  + beta_invite_id      uuid? fk invites    -- NULL = self-signup, NOT NULL = via invite
  + age_confirmed_at    timestamptz?        -- 18+ подтверждение для M/E
```

---

## §7. TASKS.md deltas

### M0 (изменения)
- **M0-05** теперь **M (1.5 дня)** вместо S — добавить tag-таблицы, state-таблицы, canon_seeds, invites
- **M0-NEW [S]** AftG canon seed: ручной bible 6 героев в SQL seed-файле — пишется founder'ом параллельно с разработкой

### M1 (новые)
- **M1-NEW [M]** Invite landing-page + code redemption flow
- **M1-NEW [M]** Tag filter UI с include/exclude
- **M1-NEW [S]** Curated tab + admin-flag «mark as curated»
- **M1-NEW [S]** 18+ confirmation gate перед M/E контентом

### M2 (новые/расширенные)
- **M2-02 → M** prompt template с character_state + world_state + summaries
- **M2-NEW [M]** Background job pipeline: extract bible + summary + world_state после save chapter
- **M2-NEW [M]** Reader paragraph context-menu (mobile bottom sheet + desktop popover)
- **M2-NEW [M]** Inline regen streaming
- **M2-NEW [S]** AI auto-tagging при save story (отдельный structured-output вызов)
- **M2-10 → S** rate-limit для regens (в дополнение к stories/day)

### M3 (Watch mode) — open question
- **M3-NEW [S, до начала Phase 3]** TTS-validation: записать 30-сек samples на 5 русских диалогах через ElevenLabs. Если качество слабое — переоценить Phase 3 (либо отложить, либо искать альтернативу — Yandex SpeechKit / Silero TTS).

### Календарный итог
- M0: 8 дней (было 7) — slip 1 день
- M1: 16 дней (было 14) — slip 2 дня
- M2: 25 дней (было 21) — slip 4 дня
- **Total slip ~7 дней.** Принимается как корректный скоп.

---

## §8. Open questions для Phase 2 (зафиксированы, не блокируют MVP)

1. **Юр-структура & платежи E-tier.** YooKassa может банить за adult content. Fallback: Boosty / Lava.top / crypto. Решается до Phase 5 (M5 ticket-set).
2. **Engagement loops.** Push notifications «новая глава», follow-author, reading streaks. Phase 4.
3. **Watch mode реальность.** Audio drama vs «мини-сериал» — что мы продаём в маркетинге? Решается после M3-NEW (TTS validation).
4. **Comments & moderation.** Threading, спам-фильтр, modération-tools. Phase 4.
5. **Anti-abuse.** Prompt-injection защита, abuse-flagging, IP-rate-limits. Phase 2.
6. **Tag canonicalization automation.** AO3 имеет «tag wranglers» — людей. У нас сначала ручной cleanup, потом — embedding-based suggester. Phase 3.

---

## §9. Cut-priority (если придётся резать)

### Нельзя резать без потери продукта
- Tags (§2) — ядро AO3-аудитории
- Character bible (§3) — без него slow-burn 12+ глав не работают
- Closed beta seeding (§5) — без этого retention=0 на день 8

### Можно отложить до Phase 2 без значительной боли
- Inline edit (§4): на MVP оставить только regen + tweak-prompt; paragraph-menu — Phase 2 (-3..5 дней M2 в зависимости от полноты undo/redo)
- AftG canon seed (§5): на MVP взять только 3 фандома (HP/Naruto/JJK); AftG добавить когда seed готов (-1 день M0, плюс founder-time на seed)

Total cut potential: ~4-6 дней M2, ~1 день M0.

---

## §10. Acceptance criteria для этой спеки

- [ ] `docs/architecture.md` обновлён: data model deltas из §6, character bible flow из §3
- [ ] `handoff/TASKS.md` обновлён: новые/изменённые тикеты из §7
- [ ] `docs/roadmap.md` обновлён: Phase 0 теперь включает cold start timeline из §5
- [ ] `CLAUDE.md` обновлён: продуктовые принципы дополнены rating policy и tag-first navigation
- [ ] Founder написала AftG canon seed (parallel track)
- [ ] Open questions §8 зафиксированы как Linear/Notion-issues с владельцем = founder

После apply — переход в writing-plans для генерации implementation plan по обновлённому TASKS.md.
