# NovelAI — AI co-writer & generation engine (Cluster A)

- **URL / дата:** novelai.net · 2026-06-27
- **Доступ:** вход юзера (свой email-аккаунт). Free Trial (Not Subscribed), 50/50 генераций, Scroll-tier контекст 12288 токенов.
- **Скриншоты:** screens/novelai/01–07 (desktop + mobile)
- **Токены:** tokens/novelai-dashboard.json · tokens/novelai-editor.json

> Разбор завершён. NovelAI — другой жанр, чем Sudowrite/NovelCrafter: не «редактор с AI-ассистентом»,
> а **движок генерации/co-writing** (prompt → Send → продолжение). Ближе к AI Dungeon, чем к writing-suite.

### Продукт в двух абзацах
NovelAI — генеративная платформа: текст (Storyteller / Text Adventure) + **Image Generation** (anime/furry,
своя SOTA-модель) + Director Tools. Текст-режим — **co-writing**: ты пишешь промпт, AI продолжает прозу,
ты правишь/дописываешь, снова Send. Это не структурный манускрипт-редактор, а бесконечный «тред» прозы
с глубоким контролем контекста. Аудитория — power-users генерации, anime/ролевой фандом, приватность.

Для нас NovelAI важен как **референс secondary generation-path** (наш Generator), а не writer-path: его
prompt→generate-loop и контекст-система (Memory/Author's Note/Lorebook) — это «как делать генерацию
по-взрослому». UI-философия — приватность (шифрованное хранилище), token-budget-прозрачность, контроль.

### Онбординг
- Дашборд «Welcome back, Author», News-карусель (5 лет NovelAI), «Start your first Story», блок
  Image Generator / Director Tools. → `01`.
- Welcome-модал: выбор туториала **Storyteller** («пустой холст», Recommended) vs **Text Adventure**
  («AI ведёт квест по словам/действиям», WIP) или «No thanks, let me in!». → `01`.
- Start-экран «Let's start writing! What kind of experience…»: Storyteller / Text Adventure +
  **готовые сценарии** (карточки с POV-тегами 1st/2nd/3rd person, жанр, автор; **Shuffle**, View All
  Scenarios) — посев контентом от комьюнити/курации. → `02`.

### Редактор (Storyteller) — генеративный холст
- **Минималистичный full-bleed тёмный холст:** «Enter your prompt here…», без хрома. Title +
  «Generate a random title». → `03`.
- Низ: **Send ▸** (жёлтый CTA), Undo/Redo, retry, счётчик, иконка **Lorebook**. Модель —
  **prompt → Send → AI продолжает inline → пишешь дальше → Send**. Один сплошной текст истории.
- Правый сайдбар (Story / Advanced / Settings): **AI Model** (GLM 4.6, выбираемая), **Config Preset**
  (температура/сэмплинг), **Editor Token Probabilities** (показывать альтернативные токены и их
  вероятности прямо в редакторе — выбирай слово вручную!), **Memory** (постоянный контекст),
  **Author's Note** (сильное влияние, инжектится близко к концу контекста), **Lorebook Quick Access**,
  View Story Stats, **Remote Storage** (шифрованное хранение на сервере), Export to File. → `03`.

### Контекст-система (= наш character bible + world + сборка контекста, W2/W3-02)
Три слоя, все token-aware:
- **Memory** — общая память истории.
- **Author's Note** — стиль/директива, сильное влияние.
- **Lorebook** — записи мира с **Activation Keys**: «впиши инфу в Entry Text + укажи ключи; когда ключ
  встречается в недавнем тексте → запись подмешивается в контекст AI». Опция **Always On**. **Generator**
  (AI пишет текст записи). **Advanced Conditions** (сложная логика активации). Категории, токен-счётчик
  на каждом поле. Import/Export, **Embed Lorebook in PNG**, community `.lorebook` файлы. → `05,06`.

### Состояния
- **Empty:** иллюстрированные пустые состояния (Lorebook — созвездия/звёзды, on-brand «полночь»).
- **Onboarding hints:** ротация баннеров-подсказок (Lorebook Keys / Lorebook Generation / Import).
- **Error (поймано):** на Send из автоматизированного браузера — модал **«reCAPTCHA Check Failed»**
  («failed the bot detection for free trial… try different browser/disable VPN… or subscribe»). →`04`.
  ⇒ Живую генерацию/стриминг на free-trial в авто-браузере прогнать нельзя (бот-детект).
- **Mobile (375px):** **полностью адаптивен и удобен** — холст на весь экран, крупная Send, чистый
  нижний тулбар. Самый mobile-friendly из трёх (модель prompt→Send чат-подобна). → `07`.

### Дизайн-система (из токенов)
- **Палитра:** глубокий **navy** — bg `#13152C` / `#0E0F21` / `#191B31`, surface `#22253F`. Текст
  белый. Акцент — фирменный **бледно-тёплый жёлтый `#F5F3C2` / `#E1DFAE`** (CTA, заголовки, glow).
  Error `#FF7878`.
- **Шрифты:** body/UI — **Source Sans Pro**; дисплей/заголовки — сериф **Eczar** («Welcome to the
  Lorebook!», титулы). Story-шрифт настраивается.
- Радиусы мелкие (3/5px) — острее Sudowrite/NovelCrafter, «инструментальнее». Плоско (без теней).
- Темпер: «полночь/созвездия», приватный мощный движок. Тёмно-синий + свечной жёлтый — **ближе всего
  к нашему Editorial-Y2K по настроению** (тёмный + тёплый акцент), хотя у нас баклажан+амбер, не navy+жёлтый.

### 🎯 Что крадём (подход, не код)
- **Prompt→Send→continue loop для secondary generator-path** — чат-подобная генерация, mobile-native.
  Наш Generator (W4-02) на мобиле может работать так, а не как desktop-мастер.
- **Author's Note как «сильная директива»** — отдельное поле, влияющее на тон/стиль вывода: дешёвый
  мощный контроль; ложится на наш «target word count / стиль» в reader/writer-настройках.
- **Token-budget прозрачность** (счётчики токенов на полях, «X tokens of context») — честно показывать
  бюджет; у нас cost-tracking есть в архитектуре (W3-04), но визуализация лимита — хорошая идея.
- **Готовые сценарии с POV-тегами + Shuffle** на старте — снимают «чистый лист» в generator-path;
  для нас — стартовые промпты по фандому/тропу (виральный onboarding, W4).
- **Тёмный navy + свечной жёлтый, серифные заголовки (Eczar), full-bleed холст** — резонирует с нашим
  тёмным late-night направлением; подтверждает, что «тёмный + тёплый glow» — рабочая ниша.

### 🚫 Чего избегаем
- **Lorebook с ручными Activation Keys** — мощно, но это power-user-труд (ведёшь ключи руками, иначе AI
  «не видит» запись). Наш writer-first: контекст собираем **кодом структурно** (W3-02), а не вешаем на
  юзера управление ключами. Берём идею «база мира → контекст», но без ручных ключей.
- **Выбор модели/пресетов/температуры/token-probabilities в UI** — анти-writer-first; модель прячем.
- **Бесконечный «тред прозы» без структуры глав** — не наш формат (у нас главы/книги, читалка). Это
  generation-engine паттерн, годится для secondary-path, не для primary-редактора.
- navy+жёлтый и Source Sans/Eczar — не наша палитра/типографика (баклажан+амбер, Bodoni/Garamond/DM Sans).

### ❓ Открытые / не проверили
- Живой стриминг генерации + как красится AI-текст vs user-текст (бот-детект на free-trial заблокировал).
- Config Preset изнутри (сэмплеры/температура), Editor Token Probabilities в действии.
- Text Adventure режим, Image Generation, Director Tools.
- Pricing/тарифы (Scroll/Opus и т.д.).

> Cleanup: создана тестовая история «New Story» в аккаунте юзера (1 неотправленный промпт). Удалить при желании (Settings → Delete Story).
