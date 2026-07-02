# Инструкции для AI-агентов

## О проекте

Headcanon — инструмент для авторов фанфиков с AI-помощником + two-sided market: автор пишет сам (AI ассистирует), читатели читают/слушают, генерация — вторичный виральный канал. См. [README](README.md), [docs/vision.md](docs/vision.md) и [Notion: Pivot v2](https://www.notion.so/36b2a47b0ca181669ea3ce37d9893091).

> **Пивот v2 (актуальная модель).** v1 был «AI генерит → юзер потребляет + видео-мини-сериалы». v2 инвертирует: **writer path — primary**, generator — secondary, видео — отложено (Phase 3, только оригинальные миры). Большая часть v1-кода (читалка, generator-мастер) построена и переразмечена, не удалена.

## Дизайн-handoff — источник правды

Полный дизайн-пакет лежит в `/handoff` (создан Claude Design). При любых вопросах по UI/UX, токенам, типографике, экранам — **handoff важнее моих случайных интерпретаций**.

- [handoff/README.md](handoff/README.md) — порядок чтения для агента
- [handoff/DESIGN.md](handoff/DESIGN.md) — дизайн-система (направление: **Editorial Y2K**, не Cozy Cinematic — последнее устарело, было в Notion-исследовании)
- [handoff/tokens.json](handoff/tokens.json) + [handoff/tokens.css](handoff/tokens.css) + [handoff/tailwind.preset.js](handoff/tailwind.preset.js) — токены
- [handoff/typography.md](handoff/typography.md) — Bodoni Moda + EB Garamond + DM Sans
- [handoff/screens/\*.md](handoff/screens/) — спеки экранов
- [handoff/TASKS.md](handoff/TASKS.md) — канонический implementation backlog M0–M5 (главный источник тикетов; `docs/roadmap.md` — высокоуровневые фазы)
- [handoff/prototypes/headcanon.html](handoff/prototypes/headcanon.html) — статичный референс, **не код для копирования** (React 18 без сборки + inline-стили; в репо переписывается на Next.js + Tailwind)

## Решённые технические выборы

Эти решения уже приняты — не предлагать альтернативы без явного запроса:

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind
- **БД и backend:** self-hosted Supabase на RU-VPS — Timeweb Cloud / Selectel (Postgres + Auth + Storage + Realtime). Не Pocketbase, не SQLite. ⚠️ Не Hetzner/OVH/DO — их диапазоны блокируются РКН с июня 2025 (решение 2026-07-02).
- **ORM:** Prisma. Не Drizzle.
- **Деплой:** Coolify на собственный VPS. Не Vercel, не Netlify (проблемы РФ-оплаты и периодические баны).
- **Платежи:** YooKassa. Не Stripe.
- **AI-провайдеры:** российские агрегаторы (AITunnel / VseGPT / ProxyAPI) для LLM — OpenRouter больше не primary (с мая 2026 блокирует frontier-модели для RU-биллинга); Replicate/fal.ai для картинок и видео, ElevenLabs для TTS.

Полное обоснование и альтернативы — [docs/tech-stack.md](docs/tech-stack.md).

## Решённые продуктовые принципы

- **Writer-first.** Primary-ценность — инструмент для письма (редактор + AI-ассистент + черновики + заметки), не генерация. Generator path — secondary канал. См. [vision.md](docs/vision.md).
- **Tool, not platform.** Юзер сам отвечает за контент (TOS), платформа не имеет ownership. DMCA safe harbor.
- **Tag-based video gating с первого дня.** `Tag.isCanonicalIp` → видео-генерация доступна только для оригинальных миров (`storyHasCanonicalIp === false`). Текст/аудио/иллюстрации — для всех.
- **Универсальные фандомы** — без ручной курации канонов командой. LLM использует знания из претрейна (модель character.ai / NovelAI).
- **Mobile-first, тёмная тема по умолчанию** (late-night reading).
- **Free tier для чтения и письма обязателен.** Лимиты — только на AI-вызовы, не на письмо в черновике. Платное: AI-генерации сверх лимита, аудио, скрытие AI-generated, видео для оригиналов.
- **РФ-first, ниша — русскоязычные авторы (Фикбук-сегмент).** Архитектура не запирает глобал позже.

## Архитектурные правила

1. **Структурированный JSON-выход у каждого ИИ-вызова** (strict schema). Никогда не парсить свободный текст regex-ом.
2. **Семантический кеш по структурированному входу**, не по сырому промпту.
3. **Версионирование промптов:** `template_id + version` сохраняется с каждым ассетом.
4. **Cost tracking** на каждом ИИ-вызове.
5. **Job queue для всего >5 секунд.** Картинки/видео — async, с push-уведомлением.
6. **Идемпотентность каждого шага** пайплайна.
7. **ИИ — только для творческих/интерпретационных задач, всё остальное — код.**

## Notion-воркспейс

Структура под Headcanon parent (`35b2a47b0ca180a38b17c1c83f4fb88d`):

- ✨ Vision · 🗺 Roadmap · 🏗 Architecture (+sub) · 📚 Prompt library (+sub) · 🧪 Test results · 🔍 User research (+sub) · 📊 Metrics · 💡 Ideas backlog — обычные страницы
- ✅ Tasks (kanban) · 📔 Daily journal · 🎯 Decision log — базы данных

Старые длинные брейнсторм-страницы (Vision и концепция, Killer features, Конкуренты, Технический стек, Pipeline, Экономика, Валидация, Дизайн и эстетика) сохранены как историческая база, новые страницы линкуют на них.

## Skill: dev-diary

В конце сессии со значимыми решениями автоматически записывать в Notion:

- **Daily journal** — что сделала / что поняла / что дальше (одна запись на день)
- **Decision log** — каждое X-vs-Y решение отдельной записью

См. [.claude/skills/dev-diary/SKILL.md](.claude/skills/dev-diary/SKILL.md) — там data source IDs и правила. Скилл активируется триггерами "запиши в дневник", "/diary", "сохрани в notion", или проактивно после архитектурных/дизайнерских/продуктовых решений и пиvotов.

## Коммуникация

- Язык — русский.
- Длинные стратегические обсуждения и исследования — в Notion.
- Технические решения и канонические доки — в этом репо.
- При изменении технических решений — обновлять [docs/tech-stack.md](docs/tech-stack.md) и при необходимости этот файл.

## Качество кода и безопасность (dev-харнес)

> Строим под рынок, не в стол — без дыр в коде и безопасности. Гейты автоматизированы, не «на честном слове».

**CI-гейты** ([.github/workflows/ci.yml](.github/workflows/ci.yml), на каждый PR и push в `main`/`claude/**`):

- `pnpm typecheck` · `pnpm lint` · `pnpm format:check` · `pnpm test` (Postgres-сервис + `migrate deploy` + `db:seed`).
- Локально перед коммитом — те же команды (или положись на CI). Stop-хук [.claude/hooks/format.mjs](.claude/hooks/format.mjs) держит формат чистым автоматически.

**Перед мержем:**

- `/code-review` на диффе (баги, упрощения, переиспользование).
- `/security-review` — **обязательно**, если PR трогает auth, доступ к данным, API-роуты, AI-вызовы или (позже) платежи.

**Инварианты безопасности (нарушение = блок PR):**

1. Каждый API-роут проверяет аутентификацию **И** ownership ресурса (существующие write-роуты — образец).
2. Вход с клиента всегда валидируется (zod). Не доверять сырым данным, не парсить regex-ом.
3. Секреты — только в `.env` (gitignored), никогда в коде/коммитах. Server-only ключи (`SUPABASE_SECRET_KEY` и т.п.) не утекают в клиент; в браузер уходит только `NEXT_PUBLIC_*`.
4. AI-вызовы: structured output (strict schema) + cost-tracking (`LlmCallLog`) + идемпотентность — см. «Архитектурные правила»; CI и ревью следят за соблюдением.
