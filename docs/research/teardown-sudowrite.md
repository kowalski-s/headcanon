# Sudowrite — AI writing partner for fiction (Cluster A)

- **URL / дата:** sudowrite.com · editor.sudowrite.com · 2026-06-27
- **Доступ:** лендинг/pricing публично; редактор — вход по email magic-link (OAuth-стена не проходит в авто-браузере)
- **Скриншоты:** screens/sudowrite/01–12 (desktop + mobile)
- **Токены:** tokens/sudowrite-landing.json · tokens/sudowrite-editor.json

> Разбор завершён. Глубокий — Sudowrite приоритетный конкурент (редактор + AI-ассистент = ядро нашего продукта).

### Продукт в двух абзацах
Sudowrite — AI-инструмент для **художественной прозы**, позиционируется как «писательский партнёр»
и прямо противопоставляет себя инженерным AI-чатам: *«Chat built with novelists in mind (sorry
engineers)»*. Ценность — побороть чистый лист и ускорить черновик, не теряя авторский голос. Засветка
в Vanity Fair / The New Yorker / The Atlantic — литературная легитимность.

Core loop: автор пишет в редакторе → выделяет кусок или ставит курсор → жмёт глагол на верхнем
тулбаре (Write / Rewrite / Describe / Brainstorm) → получает варианты-карточки → принимает в текст.
Параллельно ведёт **Story Bible** (структурная база истории) и опционально **Canvas** (визуальное
планирование). Это прямой ориентир для нашего writer-path (W1/W3).

### Онбординг
- Редактор за OAuth-стеной. Модалка: **«Love writing again»**, *«Try Sudowrite completely
  risk-free»*, кнопки Google / Facebook / Apple / Email. Микрокопи TOS тёплый: *«They're both pretty
  reasonable, though.»* Email = passwordless magic-link («Hey, welcome back! Click here to sign in…»
  + шутка про fan-fiction writers — голос бренда даже в служебном письме).
- Первый вход: дашборд с **«My First Project»** + **онбординг-тур** (жёлтые sticky-заметки
  рукописным шрифтом Mansalva, стрелка к проекту, «Exit Tour», пошаговый «Next»). Тур ведёт:
  открой проект → познакомься с редактором → Story Bible → Chat. → `screens/03,04`.
- Пустой проект сразу содержит главу и активный Story Bible — «заполни по шагам, превратим идею в
  первый draft». Онбординг = guided tour поверх реального воркспейса, не отдельные экраны.

### Редактор — layout (3 колонки)
- **Лево:** вверху — панель AI-глаголов (Write ▾, Rewrite ▾, Feedback +PRO ▾, Describe ▾, Brainstorm,
  Visualize, First Draft, More Tools ▾). Ниже — список документов (главы, drag-reorder, импорт
  .docx/.txt/.rtf/.odt), навигация по секциям Story Bible, Trash, тумблер «Story Bible on/off».
- **Центр:** редактор. Тулбар форматирования (Find&Replace, Spellcheck, Undo/Redo, B/I/U/S,
  highlight, list, Paragraph/H1/H2/H3, Comments, Open Draft, Open History). Заголовок главы,
  affordance «Add Scenes», «link an Outline». Проза — сериф **Quattro**, ~16–20px, line-height 1.6.
- **Право:** двойная панель. Верх — **Story Bible** (см. ниже). Низ — **Chat** с табами History/Chat,
  стартовые чипы (Personalize chat / Create my outline / Discuss story ideas / Brainstorm a character
  arc), инпут «Ask a question about your project» с тумблером **«Allow edits»** (агентный режим —
  AI правит проект) и **`#`-mention** сущностей Story Bible. → `screens/04`.

### Каталог AI-действий (карта для нашего W3-03)
- **Write** ▾ → **Auto** («Autocomplete plus magic»), **Guided** («Follows your instructions»),
  **Tone Shift** («Changes the style of your writing»), Write settings. Продолжает с курсора. →`05`.
- **Rewrite** ▾ → по выделению: *rephrase / add description / mimic a famous style / transform*.
  Настройка **«Number of cards»** (=2) — сколько вариантов сгенерить. → `06`.
- **Describe** ▾ → тумблеры по **пяти чувствам + метафора**: Sight / Smell / Taste / Sound / Touch /
  Metaphor. Доменно-точно: автор выбирает сенсорные каналы описания. → `08`.
- **Brainstorm** → модал «What do you want to brainstorm?» (dialogue / characters / world building /
  plot points / names / places / objects / descriptions / article ideas / tweets / something else) →
  форма *что брейнштормим + Context + **Examples (few-shot)** + Randomize example* → результат:
  список карточек, у каждой **👎/👍**, лайки уходят в колонку **KEEPERS**, *«Vote to get new ones»*
  (Tinder-for-ideas + обучение вкусу), regenerate / edit-prompt / Save & Exit. → `09,10,11`.
- **Feedback** — гейтед `+PRO`, обратная связь «как от агента/издателя».
- **Visualize** / **First Draft** — заблокированы (тариф/пустой проект).
- **More Tools** → **Explore Plugins / Create Plugin** (мини-маркетплейс пользовательских AI-промптов!),
  **Reorder this Menu** (кастомизация тулбара), **Canvas** (визуальное планирование). → `07`.

**Модель вызова AI:** верхний **тулбар глаголов, работающий по выделению/курсору** + отдельный
**Chat-панель** справа (агентный, с mention-ами). НЕ слэш-команды инлайн. Сгенерированное вставляется
**инлайн в редактор фиолетовым** (pending) или приходит карточками в History.

### Story Bible (= наш character bible + world state + outline, W2/W3-02)
Структурная база, «заполни по шагам → first draft». Секции по порядку:
**Braindump → Genre → Style → Synopsis → Characters → Worldbuilding → Outline.**
- **Style:** Featured Styles / **Match My Style** («Sounds like you» — учится по твоим текстам) /
  Custom. Контроль голоса генерации.
- **Characters:** карточки с Name / Type / role; **«Hide element from Sudowrite»** (ручной контроль
  что идёт в контекст!), History, Copy, drag-reorder. Add Character вручную или AI.
- **Worldbuilding:** Locations / Lore / Magic / more.
- **Outline:** генерация с выбором POV / tense / chapters. Каждое поле — Show History (версии).
- Тумблер **Deactivate Story Bible** — целиком вкл/выкл подмешивание в контекст.

### Состояния
- **Empty/onboarding:** дашборд с одним проектом + sticky-tour, контекстные подсказки-пузыри
  («Select a word… click Describe», «Let's use Story Bible to take you from idea to first draft»).
- **Generating:** Brainstorm — мгновенный список карточек (стриминг быстрый); «думающий» маскот.
- **Accept/reject:** карточки 👍/👎 → KEEPERS; в прозе — pending-текст фиолетовым.
- **Версионирование:** «Show History» у каждого поля Story Bible + «Open History»/«Open Draft» в
  редакторе — везде undo/история генераций.
- **Mobile (375px):** ⚠️ **редактора НЕТ** — заглушка *«Sudowrite works best on browsers at least
  900px wide»*. Полностью desktop-only. → `screens/12`.

### Дизайн-система (из токенов)
- **Лендинг:** тёплая «бумага» — крем `#F5F1D3`, коричневые чернила `#423521`; дисплей **GT Super
  Text** (сериф) + **Inter**; зелёный `#26AD5F` glow-CTA; радиус 12px. Light, «уютный кабинет».
- **Редактор (app):** **light theme**, белый `#fff`, текст `#383838`, брендовый **фиолетовый
  `#4808D1`** как акцент. UI — **Inter**; проза — сериф **Quattro**; тур — рукописный **Mansalva**.
  Радиусы очень круглые (pills 30/25/20px, карточки 6–10px), мягкие ambient-тени. Tailwind.
- Темпер: дружелюбный, «не страшный», много скруглений и хэнд-дроун акцентов (sticky, стрелки).

### 🎯 Что крадём (подход, не код)
- **Именование AI-инструментов глаголами писателя + однострочное человеческое описание** под каждым
  (Auto = «Autocomplete plus magic»). → наш W3-03 каталог действий + микрокопи.
- **Describe по сенсорным каналам** (5 чувств + метафора как тумблеры) — дёшево, доменно, «вау».
- **Brainstorm с few-shot Examples + 👍/👎 → Keepers + «vote to get new ones»** — генерация идей с
  обучением вкусу; ложится на «дай идею» (W3-03) и заметки (W2-01, keepers → inbox идей).
- **Story Bible как пошаговый пайплайн idea→draft** (Braindump→…→Outline) с **per-element «hide from
  AI»** и историей версий — наш character bible + world state + сборка контекста (W2-02/03, W3-02).
- **Chat с «Allow edits» (агентный) + `#`-mention сущностей** — мощная модель для нашей AI-панели
  (W3-01/02): меншены тянут структурный контекст без парсинга.
- **Тёплый микрокопирайт везде** (даже в login-письме шутка) — голос «для писателей». У нас это
  Bodoni-italic «полночное чтиво».
- **Card/variant-модель приёма результата** (N карточек → выбрать) вместо одного ответа — снижает
  «AI сказал — прими как есть», даёт авторский контроль. → приём результата в W3-03.

### 🚫 Чего избегаем
- **Desktop-only.** Мы mobile-first/late-night — это наш главный разрыв против Sudowrite. НЕ
  повторять «900px+ или уходи».
- Light-mode «бумага» — занятая дефолтная территория writing-tools; наш тёмный Editorial-Y2K даёт
  контраст и ночной характер.
- **Inter в UI** — прямо в нашем DESIGN.md запрещён (системные гротески). Берём идею серифа-для-прозы
  (Quattro→наш EB Garamond), но UI у нас DM Sans, не Inter.
- Перегруз тулбара (8 глаголов + меню у каждого) — для MVP сузить до 4 действий (W3-03), не клонировать.
- Плагины/маркетплейс — мощно для retention, но за рамками MVP; не отвлекаться сейчас.

### ❓ Открытые / не проверили
- Pricing / счётчик кредитов в UI (есть «Upgrade», Words-счётчик; тарифную таблицу не снимал).
- Реальный inline-Write стриминг в прозу (не запускал, чтобы не менять черновик автора).
- Canvas и Plugins-маркетплейс изнутри.
- Match My Style flow (загрузка образца стиля).
