# NovelCrafter — power-user novel workspace (Cluster A)

- **URL / дата:** novelcrafter.com · app.novelcrafter.com · 2026-06-27
- **Доступ:** вход юзера (свой email-аккаунт, OAuth-блок не мешал). Свежий аккаунт, создана тестовая новелла.
- **Скриншоты:** screens/novelcrafter/01–08 (desktop + mobile)
- **Токены:** tokens/novelcrafter-dashboard.json · tokens/novelcrafter-editor.json

> Разбор завершён. NovelCrafter = ближайший «прямой» конкурент по writing-suite, но философия
> противоположна Sudowrite: не «магия в один клик», а **прозрачность + власть над промптами/моделями**.

### Продукт в двух абзацах
NovelCrafter — структурный воркспейс для романов: автор управляет сюжетом (Acts→Chapters→Scenes),
AI наполняет прозу по командам. Позиционирование power-user / транспарентность: **bring-your-own-AI**
(свой API-ключ + выбор модели на каждый тип задачи), **полностью редактируемая библиотека промптов**,
**Codex** (вики мира). Сообщество (Discord, YouTube office hours) — заметная часть бренда.

Core loop: автор строит структуру в **Plan** (storyboard сцен), в **Write** пишет/вызывает AI через
**слэш-команды** (Scene Beat → AI разворачивает бит в прозу), ведёт **Codex** (персонажи/мир/лор),
в **Chat** обсуждает с AI-персонами (Developmental Editor и т.д.), в **Review** вычитывает. Это
ориентир для нашего W3 (AI-ассистент) и W2 (character bible/world).

### Онбординг
- Тёмный дашборд «Welcome to Novelcrafter!» с двумя входами: **Create a new novel** / **Import
  manuscript** (.docx/.md/.html). Прогресс-бейдж **0/5** (геймифицированный getting-started). →`01`.
- Создание новеллы — **один экран**: Title (+ **«Surprise me»** генератор), Author/Pen name, Series
  (+index, мультикнижность), Language (для спелл-чека/переносов). →`02`.
- При входе в новеллу — ротация **«Tip of the Day»** (обучающие подсказки на старте, можно выключить).
- Пустой проект → Storyboard «Nothing here yet → Create first Scene». →`03`.

### Архитектура воркспейса (≠ Sudowrite)
**Режимы-вкладки сверху: Plan · Write · Chat · Review.** Левый сайдбар постоянен: **Codex ·
Snippets · Chats**. Низ: онбординг-прогресс, Help, **Prompts**, **Export**, Saving-индикатор.
- **Plan:** storyboard сцен. Виды **Grid / Matrix / Outline**, фильтр/поиск сцен. Структура
  **Act → Chapter → Scene**; каждая сцена — карточка с summary + Label. Add Act / Create from Outline
  / Import. →`03`.
- **Write (манускрипт):** непрерывный скролл Act→Chapter→Scene в одном документе (Scrivener-style),
  справа — мета сцены (summary, Label, Actions). Скоуп-селектор «Everything / Full Manuscript»,
  счётчик слов/страниц/«Xm read», **Format** (типографика), **Focus** (фокус-режим). →`04`.

### Как вызывается AI — слэш-команды инлайн (КЛЮЧЕВОЕ отличие)
Плейсхолдер: **«Start writing, or type '/' for commands…»**. Меню `/` категоризировано: →`05`.
- **AI:** **Scene Beat** («впиши поворотный момент — AI развернёт в прозу») · **Continue Writing**
  («создаёт новый scene beat, продолжает писать»).
- **Codex:** **Codex Progression** («добавь инфу о мире/персонажах/событиях — трекать арки сюжета»).
- **Formatting:** стандартные блоки.

**Сигнатурная модель — «scene beat»:** автор пишет короткий бит (что происходит), AI пишет прозу.
Writer-first по духу: автор ведёт сюжет, AI исполняет. Это инлайн-команды (Notion-style), НЕ тулбар-
глаголы как у Sudowrite и НЕ только сайдбар-чат.

### Prompts / Presets — управление промптами и моделями (сигнатура)
Полноценный менеджер (`Open AI Prompt Manager`). Категории: →`07`.
- **Model Collections** (Default Chat / Summarization / Text Replacements / Writing **Models**) —
  **per-task model routing**: какая модель на какой тип задачи. BYO API-ключ.
- **Scene Beat Completions**, **Scene Summarizations** — пресеты генерации прозы/саммари.
- **Text Replacements:** **Expand / Rephrase / Shorten** (инлайн-операции по выделению).
- **Workshop Chats:** **Developmental Editor / General Chat / Scene Beats from Summary** — чат-персоны.
- **Prompt Components** — переиспользуемые блоки. Всё «System» = редактируемые дефолты + New для своих.
Правая панель: Recently Used / Last Modified / Change Your Defaults.

### Codex (= наш character bible + world state, W2)
Левый таб, «stores information about the world your story takes place in, its inhabitants and more».
New Entry (типы: персонажи/локации/лор/…), поиск, фильтр. Привязка к сценам через `Codex Progression`
(состояние сущности меняется по ходу сюжета — версионируемый контекст). Пустой: «YOUR CODEX IS EMPTY».

### Типографика письма (Format-панель — writer-grade)
Глубокий контроль ощущения письма: →`06`.
- **Font family** — выбор из набора (BespokeSerif деф.; в CSS-переменных: Literata, Zilla Slab,
  Roboto Serif, Bespoke; sans: Barlow, Exo 2, **Atkinson Hyperlegible** = дружелюбный к дислексии;
  mono: iA Writer Duospace, Recursive, Courier Prime). **Автор выбирает шрифт письма.**
- Text size / Line height / Text indent (+ **Chicago Style**) / Paragraph spacing / Page width.
- Alignment **Left / Justify**, **Scene divider** (Boxes/…).
- CURSOR: Jump position, «Remember where I left off», **Typewriter mode** (курсор по центру).

### Состояния
- **Empty:** обучающие пустые состояния везде (Codex, Storyboard, Prompts «No recent prompts»).
- **Onboarding:** прогресс 0/5 → 1/5, Tip-of-the-Day, contextual hints.
- **Mobile (375px):** **адаптивен** — панели стекаются, показывается одна (Codex), между ней и
  манускриптом переключаешься. Работает, но тесно/по-одной-панели. НЕ блок как у Sudowrite, но и не
  mobile-first. →`08`.

### Дизайн-система (из токенов)
- **Тёмная тема по умолчанию.** Палитра Tailwind **zinc/stone:** bg `#18181B`/`#27272A`/`#09090B`,
  текст `#D6D3D1`, мута `#A8A29E`. Акцент — **лаймовый/шартрез `#BEF264`/`#A3E635`** (фирменный поп).
- **Шрифты:** UI — **Inter (Variable)**; манускрипт — сериф **BespokeSerif** (line-height ~1.7).
  FontAwesome Pro иконки.
- Радиусы мелкие (4/6px) + pills (9999px). Тени мягкие. Плотный, «приложенческий», профессиональный.
- Темпер: «серьёзный инструмент для авторов», не игривый. Тёмная литературная атмосфера (фон-библиотека
  на дашборде).

### 🎯 Что крадём (подход, не код)
- **Слэш-команды инлайн для AI** (`/` → Scene Beat / Continue / Expand / Rephrase / Shorten) — ровно
  ложится на наш редактор (W1) + AI-действия (W3-03): вызов в потоке письма, без ухода в сайдбар.
- **«Scene Beat» как writer-first модель**: автор пишет бит → AI разворачивает в прозу. Сохраняет
  авторский контроль сюжета. → наш «следующая сцена» (W3-03), но через бит, а не слепой автокомплит.
- **Codex Progression** (состояние сущности по позиции в сюжете) — умнее статичного bible; для
  консистентности мира (W2-03) и сборки контекста (W3-02).
- **Чат-персоны** (Developmental Editor / etc.) — пресеты роли AI; наш «сократические вопросы» (W3-03)
  = персона-редактор.
- **Тёмная литературная тема + выбор шрифта письма + typewriter mode + justify** — прямо в духе нашего
  late-night/тёмного направления и reader-settings (длина главы / шрифт уже у нас в Aa-sheet).
- **Atkinson Hyperlegible как опция** — дешёвый a11y-жест, который любит комьюнити.

### 🚫 Чего избегаем
- **Власть над промптами/моделями + BYO-ключ + менеджер из 6 категорий** — мощно для power-users, но
  это анти-MVP и анти-«writer-first простота». Мы прячем модель, не выставляем её. Не клонировать.
- **Режимы Plan/Write/Chat/Review как 4 вкладки** — для романов ок, для нашего фанфик-автора
  (главы, не Acts/Matrix) избыточно. Берём идею Plan→Write, но без screenwriting-структуры Acts/Matrix.
- Плотный «приложенческий» UI на Inter — не наш Editorial-Y2K. Берём тёмную атмосферу, не плотность.
- Lime-акцент — не наша палитра (амбер/роза). Контраст-цвет другой.

### ❓ Открытые / не проверили
- Реальная генерация Scene Beat (стриминг прозы) — не запускала (нет модели/ключа на free).
- Codex entry内部 (поля типа Character) — видела только пустое состояние + типы в New Entry.
- Chat-режим и Review-режим изнутри.
- Snippets-таб, Export-wizard, Series-управление.
- Pricing/лимиты.
