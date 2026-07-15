---
name: dev-diary
description: Запись развития проекта Headcanon в Notion — Daily journal и Decision log. Use в конце сессии где приняты значимые архитектурные/продуктовые/дизайнерские решения, поворты, новые фичи. Триггеры — "запиши в дневник", "log this decision", "сохрани в notion", "/diary", или проактивно после значимых событий.
---

# dev-diary

Скилл фиксирует развитие проекта Headcanon в Notion. Использует две базы под `Headcanon` parent page (id `35b2a47b0ca180a38b17c1c83f4fb88d`):

- **Daily journal** — что сделано сегодня, что понято, что дальше. Одна запись на сессию/день.
  - Page URL: https://www.notion.so/797495b50cdd498499b51a7adc63ef00
  - Data source ID для create_pages: `0bc941b4-8e8b-429f-8124-8e5e18d6541c`
- **Decision log** — почему выбрали X вместо Y. Одна запись на каждое решение.
  - Page URL: https://www.notion.so/521041c359f245f6b79ed114573c362a
  - Data source ID для create_pages: `a1585acc-21b6-41be-96cd-bdd61dfcedb6`

## Когда срабатывать (проактивно)

Триггеры — без явного запроса юзера, в конце сессии или после следующих событий:

- **Архитектурный выбор сделан** (БД, ORM, фреймворк, провайдер) → Decision log
- **Дизайн-направление выбрано/изменено** → Decision log
- **Pivot стратегии или фокуса** → Decision log + Daily journal
- **Новая фича добавлена в roadmap или TASKS.md** → Daily journal
- **Эксперимент с измеримым результатом** → Daily journal + добавление в Test results
- **Конец длинной сессии где было >1 значимого изменения** → Daily journal обзор
- **Юзер явно просит** ("запиши", "сохрани", "/diary") → пиши

НЕ срабатывать на: чисто чтение/исследование, мелкие правки кода, переименования, форматирование, debugging без архитектурных выводов.

## Что писать

### Daily journal entry (одна запись на день)

Загрузить tool: `mcp__claude_ai_Notion__notion-create-pages` с `parent: {"type": "data_source_id", "data_source_id": "0bc941b4-8e8b-429f-8124-8e5e18d6541c"}`.

Properties:

- **Date** (TITLE, формат `YYYY-MM-DD`) — сегодняшняя дата
- **Что сделала** (rich_text) — конкретные изменения, ссылки на файлы/PR/Notion
- **Что поняла** (rich_text) — инсайты, "оказалось что", открытия
- **Что дальше** (rich_text) — что приоритет на следующую сессию
- **Mood** (select) — опционально: `🔥 flow` / `😊 ok` / `😐 meh` / `😩 stuck`
- **Session links** (rich_text) — список ссылок

**Дедуп:** если запись за сегодня уже есть — найти через `notion-search` по дате и обновить через `notion-update-page` (append к полям), не создавать дубль.

### Decision log entry (одна запись на решение)

Загрузить tool: `mcp__claude_ai_Notion__notion-create-pages` с `parent: {"type": "data_source_id", "data_source_id": "a1585acc-21b6-41be-96cd-bdd61dfcedb6"}`.

Properties:

- **Decision** (TITLE) — короткое название, формат "X instead of Y" или "Chose X for Z"
- **date:Date:start** — ISO-дата (используй expanded form именно так)
- **Type** (select) — `🏗 Architecture` / `🎨 Design` / `📦 Product` / `⚙️ Process` / `💰 Business`
- **Context** (rich_text) — был выбор между чем, какие альтернативы рассматривались
- **Choice** (rich_text) — что выбрали (одна-две фразы)
- **Why** (rich_text) — главные аргументы (буллеты через `•`)
- **Tradeoffs** (rich_text) — что отдали взамен
- **Reversibility** (select) — `Easy` / `Medium` / `Hard`
- **Status** (select) — обычно `Active`
- **Related links** (rich_text) — ссылки на коммиты, обсуждения, файлы

## Поведение в конце сессии

1. Просканируй контекст разговора: были ли значимые решения / поворты / новые фичи?
2. Если ничего значимого не было — **не пиши** (не создавай шум в дневнике).
3. Если что-то было:
   a. Собери список того, что попадает в Decision log (по одной записи на решение).
   b. Собери summary для Daily journal (одна запись на день).
   c. Кратко покажи юзеру что собираешься записать (1–2 строки на каждое).
   d. После согласия (или если ясно и юзер не возражает в auto-mode) — пиши.
4. Если в этой же сессии уже сделали `dev-diary` запись — обновляй (append), не дублируй.

## Целевая структура воркспейса

Под `Headcanon` parent page (`35b2a47b0ca180a38b17c1c83f4fb88d`):

| Раздел            | ID                                                 | Тип               |
| ----------------- | -------------------------------------------------- | ----------------- |
| ✨ Vision         | `35b2a47b-0ca1-81b4-9ffc-f663a4aa93ad`             | page              |
| 🗺 Roadmap        | `35b2a47b-0ca1-8185-8c64-d061dedddce2`             | page              |
| ✅ Tasks          | data source `67c16ce4-270e-470f-8d62-ef0b95c1c45c` | database (kanban) |
| 📔 Daily journal  | data source `0bc941b4-8e8b-429f-8124-8e5e18d6541c` | database          |
| 🎯 Decision log   | data source `a1585acc-21b6-41be-96cd-bdd61dfcedb6` | database          |
| 🏗 Architecture   | `35b2a47b-0ca1-81a9-ac07-df855e97e325`             | page (+ sub)      |
| 📚 Prompt library | `35b2a47b-0ca1-8161-a965-d1455cb0875f`             | page (+ sub)      |
| 🧪 Test results   | `35b2a47b-0ca1-8155-b850-e0683950f444`             | page              |
| 🔍 User research  | `35b2a47b-0ca1-81a1-97c8-ffd5269b2166`             | page (+ sub)      |
| 📊 Metrics        | `35b2a47b-0ca1-8184-98e8-f21e68637663`             | page              |
| 💡 Ideas backlog  | `35b2a47b-0ca1-81ed-bb03-d60c8cbffe9f`             | page              |

Если решение/событие явно относится к одной из тематических страниц:

- Новый эксперимент с моделью → также добавить строку в **Test results**
- Новый production-промпт → также обновить **Prompt library**
- Новый user-инсайт → также добавить в **User research**
- Новая идея «не сейчас» → также добавить в **Ideas backlog**

После Daily/Decision записи кратко упомянуть юзеру что добавлено в тематическую страницу.

## Язык

Записи в Notion — на русском, как разговор с юзером.

## Tool loading

Перед использованием — загрузить через ToolSearch:

- `mcp__claude_ai_Notion__notion-create-pages`
- `mcp__claude_ai_Notion__notion-update-page` (для дедупа Daily journal)
- `mcp__claude_ai_Notion__notion-search` (для поиска существующих entries)
