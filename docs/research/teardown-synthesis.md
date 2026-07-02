# Конкурентный teardown — синтез

> Кросс-разрез 7 продуктов в 3 кластерах. Цель: вытащить переносимые **подходы** (не код/ассеты) и
> разложить их на наши тикеты **W1** (редактор), **W2** (character bible / world), **W3** (AI-ассистент),
> **W4** (онбординг / generator-path) + **reader-path** и **дизайн-направление**.
> Дата: 2026-06-27. Детали по каждому — в `teardown-<site>.md`.

---

## 0. Покрытие

| Кластер | Продукт | Статус | Артефакты |
|---|---|---|---|
| **A — AI-writing** | Sudowrite | ✅ | teardown + 12 screens + 2 tokens |
| A | NovelCrafter | ✅ | teardown + 8 + 2 |
| A | NovelAI | ✅ | teardown + 7 + 2 |
| A | Squibler | ✅ | teardown + 3 + 2 |
| **B — fanfic-платформы** | Ficbook | ✅ (главный B) | teardown + 26 + 1 |
| B | AO3 | ⏭️ пропущен (Cloudflare «Shields up», по решению юзера) | 2 screens (block-state) |
| B | Wattpad | ⏳ отложен | — |
| **C — generative/chat** | character.ai | ✅ | teardown + 9 + 2 |
| C | AI Dungeon | ✅ | teardown + 9 + 2 |

Метод: смотрели публичные экраны-визитёра + собственные залогиненные сессии, для UX-уроков. Без выгрузки
чужих данных, без копирования кода/ассетов. Cloudflare-блоки обходили скриншотами юзера (Ficbook).

---

## 1. Карта рынка — где сидит Headcanon

Три не-пересекающихся фрейма «человек + AI + текст»:

- **A. Writing-suite** (Sudowrite, NovelCrafter, Squibler) — **автор пишет, AI ассистирует в редакторе**.
  Это наш **primary writer-path**. Разброс философий: «магия в один клик» (Sudowrite) ↔ «власть над
  промптами/моделями» (NovelCrafter) ↔ «вся книга за один промпт» (Squibler). NovelAI — пограничный (co-writing
  движок, ближе к C).
- **B. Платформа дистрибуции** (Ficbook, AO3, Wattpad) — **автор→читатель, дискавери, социальность**, AI нет.
  Это наш **reader-path + two-sided market**.
- **C. Generative/chat** (character.ai, AI Dungeon) — **AI генерит, человек направляет** (чат/ходы). Это наш
  **secondary generator-path** (виральный канал).

**Никто не делает все три.** Headcanon = **A (редактор с AI) + B (читалка/дискавери/two-sided) + C (генератор
как виральный вход)** в одном продукте, для RU-фанфик-ниши, в editorial-эстетике. Это и есть white space:
writing-suite'ы не имеют дистрибуции и комьюнити; платформы не имеют AI; чат-движки не дают «произведение для
читателей». **Наш мост — единственный.**

---

## 2. Кросс-разрез по темам

### 2.1 Как вызывается AI (модель инвокации) → W3
Главное продуктовое решение. Пять найденных моделей:
| Модель | Кто | Суть | Для нас |
|---|---|---|---|
| **Тулбар-глаголы** | Sudowrite | Write / Rewrite / Describe / Brainstorm / Feedback — кнопки над текстом | Понятно новичку; ✅ берём как набор AI-действий |
| **Слэш-команды инлайн** | NovelCrafter | `/` → Scene Beat / Continue / Expand / Rephrase | Вызов в потоке письма, не уходя в сайдбар; ✅ берём |
| **Scene Beat** | NovelCrafter | автор пишет бит (что происходит) → AI разворачивает в прозу | Writer-first по духу (автор ведёт сюжет); ✅ ключевое |
| **Чат-персоны** | NovelCrafter | Developmental Editor / General Chat | Сократические вопросы как роль; ✅ берём для W3-чата |
| **Prompt→Send→continue** | NovelAI, character.ai | чат-подобный цикл генерации | ✅ для generator-path/мобайл, ❌ для primary-редактора |
| **Do/Say/Story/See** | AI Dungeon | один инпут, разные намерения (действие/реплика/проза/картинка) | ✅ модель режимов для generator/ассистента |
| **Agentic-чат с шагами** | Squibler | «Outlining → Writing chapter» как видимый прогресс | ✅ паттерн loading/streaming, не спиннер |

**Вывод для W3:** гибрид — **слэш-команды инлайн** (NovelCrafter) как primary-вызов в редакторе +
**тулбар-глаголы/diff-карточки на выделении** (Sudowrite) + **scene-beat** как сигнатурная writer-first
операция + **чат-персона редактора** в сайдбаре. **Accept/Reject/Refine** на каждое предложение (Sudowrite +
Squibler) — обязательно.

### 2.2 Character bible / world / контекст → W2
| Продукт | Механизм | Урок |
|---|---|---|
| Sudowrite | **Story Bible** | структурная база, на которую AI ссылается |
| NovelCrafter | **Codex** + **Codex Progression** | состояние сущности **меняется по позиции в сюжете** (версионируемый контекст) — умнее статики |
| NovelAI | **Memory + Author's Note + Lorebook** (Activation Keys) | мощно, но ключи руками = power-user-труд → ❌ |
| character.ai | **форма персонажа** (имя+слоган+описание+приветствия) | персона из **горстки полей**, не свободный текст; до 5 greeting'ов |
| AI Dungeon | **Story Cards** (не докрутили) | UGC-лор сценария |

**Вывод для W2:** структурная база сущностей (персонажи/локации/лор) → сборка контекста **кодом** (не ручными
ключами, против NovelAI). Берём **Codex Progression** (состояние по сюжету) и **минимализм формы персонажа**
(character.ai: несколько полей + 1–5 «затравок»). Контекст собираем структурно (наш арх-принцип №2).

### 2.3 Онбординг / cold-start / generator → W4
| Продукт | Приём |
|---|---|
| Squibler | **инстант-генерация с лендинга БЕЗ логина** (ввёл строку → пишет книгу) |
| AI Dungeon | **играбельно сразу без логина** + **гайдед-старт** (сеттинг→персонаж→имя) + Interests-модал |
| character.ai | **библиотека готовых персонажей/сценариев** (никогда чистый лист) |
| NovelAI | готовые сценарии с POV-тегами + Shuffle |
| NovelCrafter | прогресс-бейдж 0/5, Tip of the Day, «Surprise me» генератор тайтла |

**Вывод для W4:** **мгновенная ценность до регистрации** (Squibler/AI Dungeon) — ввёл фандом+троп → сразу
сцена; sign-up только чтобы **сохранить/продолжить**. **Гайдед-старт** (выбор из готового) против чистого
листа. **Затравки по фандому** как посев. ⚠️ НО без жёсткого login-wall (анти-character.ai) — у нас
read/write free-tier обязателен.

### 2.4 Reader-path и дискавери → читалка + discovery (из Ficbook)
Ficbook — наш эталон ниши:
- **3 оси дискавери:** направленность (Джен/Гет/Слэш/…) + рейтинг (G…NC-21) + **метки** с категориями
  (Формат/Жанры/Предупреждения/Отношения) + счётчиками + 18+ маркерами. **Готовый словарь локализации тропов.**
- **Плотная карточка работы** (направленность+рейтинг+статус+размер в словах/частях+пейринг+метки+синопсис).
- **Persona-модель** автор/читатель/(помощник) в одном аккаунте.
- **Action-бар из 4 раздельных сигналов** (лайк ≠ подписка ≠ в-сборник ≠ прочитано).
- **Read-depth funnel** (Только шапка→Весь текст) — лучшая идея их аналитики.
- **Per-chapter отзывы**, соц-логины **VK/Yandex/Apple**.

### 2.5 Two-sided / социальность / монетизация
- **Заявки** (Ficbook): читатель заказывает фик → автор пишет. Demand-marketplace. → кандидат в виральную
  механику (и для generator-path).
- **UGC-маркетплейс** (AI Dungeon сценарии, character.ai персонажи): создатель↔потребитель, статы plays/likes/saves.
- **Монетизация-паттерны:** подписка на AI/премиум-модели (NovelAI, c.ai+, AI Dungeon), скрытие/премиум-фильтры
  (Ficbook), free-tier на чтение/базу. **Наш принцип:** платим за AI сверх лимита/аудио/скрытие-AI/видео —
  не за письмо и не за свою же аналитику (анти-Ficbook premium-гейтинг базы).

### 2.6 Streaming / генерация UX
- **Вариативность + курация:** свайп альтернатив N/30 (character.ai), Retry/Continue/Erase/Undo (AI Dungeon),
  Keepers 👍/👎 (Sudowrite Brainstorm), accept/reject (Sudowrite/Squibler). → генерация **недетерминирована,
  обратима, курируема** — не «один слепой вывод».
- **Прогресс как нарратив** (Squibler agentic-шаги) вместо спиннера.
- **Стоп во время стрима** (character.ai) + **AI-текст визуально отделён** от пользовательского (AI Dungeon,
  character.ai badge) → прямо в наш «скрыть/показать AI-generated» + redo-UX.
- **Token/context-прозрачность** (NovelAI, AI Dungeon Plot Components) → наш cost-tracking (W3-04).

### 2.7 Дизайн и типографика
| Продукт | Тёмная | Акцент | Шрифты | Близость к нам |
|---|---|---|---|---|
| Sudowrite | ☀️ светлая «бумага» | пурпур #4808D1 | GT Super (serif) + Inter | средне |
| NovelCrafter | 🌙 zinc | лайм #BEF264 | Inter + BespokeSerif | средне |
| NovelAI | 🌙 navy #13152C | свечной жёлтый #F5F3C2 | Source Sans + Eczar (serif) | по настроению близко |
| Squibler | 🌙 slate | синий+золото | Montserrat/Inter | далеко |
| Ficbook | 🌙 near-black | янтарь/охра | системный гротеск | CMS, не editorial |
| character.ai | 🌙 near-black | синий | atHauss (sans) | далеко |
| **AI Dungeon** | 🌙 near-black | **амбер #EAB308** | **IBM Plex Serif** + Plex Sans | **ближе всех** |

**Вывод:** наш **Editorial-Y2K** (баклажан `#160B22` + амбер `#E5A95A` + роза `#D67890`, Bodoni/Garamond/DM
Sans) — **дифференциатор**. Главный паттерн-победитель (подтверждён AI Dungeon + NovelAI): **тёмный фон +
тёплый акцент + serif для контента + sans для UI**. Мы усиливаем цветностью (баклажан вместо нейтрального
чёрного, роза в пару к амберу) и более «журнальной» типографикой. Никто из конкурентов не выглядит как
литературный editorial-журнал — это наша ниша.

### 2.8 Mobile
Все, кроме Sudowrite (desktop-only, «works best ≥900px»), mobile-friendly. NovelAI/character.ai/AI Dungeon —
mobile-native (чат/ходы к этому располагают). Ficbook — отличный мобайл reader. **Подтверждает наш mobile-first**
(особенно reader + generator). Sudowrite-десктоп-онли — слабость, в которую мы заходим.

---

## 3. TAKE — консолидированный список (по тикетам)

**W1 (редактор):**
- Слэш-команды инлайн как точка вызова AI (NovelCrafter).
- Выбор шрифта письма / typewriter mode / justify / focus-mode / Atkinson Hyperlegible-опция (NovelCrafter Format).
- Автосейв-индикатор + счётчик слов/страниц (Ficbook, NovelCrafter).
- Непрерывный скролл книга→главы (Scrivener-style, NovelCrafter) — ложится на нашу структуру.

**W2 (character bible / world):**
- Структурная база сущностей → контекст кодом (Codex), **Codex Progression** (состояние по сюжету).
- Минимальная форма персоны: имя+краткое описание+1–5 затравок (character.ai), не свободный текст.
- Готовый словарь меток/тропов с категориями и определениями (Ficbook) — для тегов + локализации.

**W3 (AI-ассистент):**
- Тулбар-глаголы (Write/Rewrite/Describe/Brainstorm/Feedback) + **scene-beat** + accept/reject/refine.
- Describe = «5 чувств + метафора»; Brainstorm = few-shot + 👍/👎 → Keepers (Sudowrite).
- Чат-персона «редактор» (Developmental Editor, NovelCrafter) для сократических вопросов.
- Режимы намерения (Do/Say/Story/See → «продолжи/реплика/опиши/визуализируй», AI Dungeon).
- Стриминг: прогресс-как-нарратив (Squibler), стоп, варианты+retry+undo, AI-текст отделён, token-прозрачность.

**W4 (онбординг / generator):**
- Мгновенная генерация до логина (Squibler/AI Dungeon), sign-up на «сохранить».
- Гайдед-старт (сеттинг→персонаж→… , AI Dungeon) + затравки по фандому/тропу (character.ai/NovelAI).
- Interests-модал / tag-prefs для персонализации ленты (AI Dungeon, Ficbook).
- Generator = «один промпт → аутлайн + проза в навигации глав» (Squibler), continue-by-chat.

**Reader-path / discovery / social:**
- 3 оси (направленность+рейтинг+метки) + плотная карточка + read-depth funnel + 4 раздельных сигнала +
  per-chapter отзывы + персонализация меток + VK/Yandex/Apple + persona автор/читатель (всё Ficbook).
- Заявки (demand-marketplace) + UGC-витрина шаблонов со статами (Ficbook/AI Dungeon/character.ai) — пост-MVP.

**Дизайн:** тёмный + тёплый акцент + serif-контент/sans-UI (AI Dungeon/NovelAI) — усиливаем своим Editorial-Y2K.

---

## 4. AVOID — консолидированный

- **Голый редактор без AI** (Ficbook) — это наш gap, не образец.
- **Выставление модели/промптов/температуры/BYO-ключ** (NovelCrafter, NovelAI, AI Dungeon Model Switcher) —
  анти-writer-first; модель прячем (берём только token-прозрачность).
- **Ручные Activation Keys / Lorebook-труд** (NovelAI) — контекст собираем кодом.
- **«Вся книга за один промпт» как primary** (Squibler) — годится только для secondary generator-path.
- **Жёсткий login-wall до ценности** (character.ai) — read/write free-tier обязателен.
- **Бесконечный чат/ходы без структуры глав** (character.ai, AI Dungeon) — нужна книга→главы→читалка.
- **Premium-гейтинг базовой аналитики/обложек** (Ficbook) — платим за AI, не за свой дашборд.
- **Desktop-only** (Sudowrite) — мы mobile-first.
- **Плотный CMS/«приложенческий» UI + нейтральные гротески** (Ficbook, character.ai, Squibler) — анти-editorial.
- **Тяжёлая геймификация** (стикеры-подарки/монеты/награды на комменты, Ficbook; adventure/RPG-фрейм, AI Dungeon)
  — в меру и пост-MVP.
- **Companion/romance-доминанта + навязчивый upsell на каждом экране** (character.ai) — не наш тон.

---

## 5. GAPS — наша белая зона (что НИКТО не делает)

1. **AI-редактор + дистрибуция/читалка/комьюнити в одном** — writing-suite'ы (A) не имеют B; платформы (B) не
   имеют AI. Headcanon соединяет → defensible.
2. **Editorial-журнальная эстетика в AI-инструменте** — все либо утилитарны (Ficbook, character.ai), либо
   product-SaaS (Squibler). AI Dungeon ближе всех, но нейтрально-тёмный; мы — цветной баклажан+роза, Bodoni.
3. **RU-фанфик-ниша с AI** — Ficbook огромен, но без AI; western AI-suite'ы без RU/фандом-локализации. Наш
   «слоуберн/ангст/омегаверс»-словарь + знание фандомов из претрейна = моат.
4. **Writer-first AI без выставления модели** — рынок поляризован «магия-в-клик» (Sudowrite, закрыто) ↔
   «power-user-контроль» (NovelCrafter/NovelAI, сложно). Мы: writer-first простота + структурный контекст под
   капотом.
5. **Generator-path как виральный мост в writing** — character.ai/AI Dungeon генерят, но не конвертируют в
   «стань автором произведения с читателями». Наш generator → читатель → (стань автором) — уникальная воронка.
6. **Тег-based video-gating и оригинальные миры** (наш Phase 3) — никто из A/C не разделяет fanfic vs original IP.

---

## 6. Конкретные рекомендации (приоритет)

1. **W3 — гибрид вызова AI:** слэш-команды инлайн (primary) + тулбар-глаголы на выделении + scene-beat +
   accept/reject/refine + чат-персона-редактор. Стриминг с вариантами/retry/стоп + AI-текст визуально отделён.
2. **W4 — generator до логина:** ввёл фандом+троп+пейринг → сразу сцена (гайдед-старт), sign-up на сохранить.
   Затравки по фандому. Это и top-of-funnel, и виральный канал.
3. **Reader/discovery (отдельный приоритет рядом с W-серией):** перенести Ficbook-модель дискавери
   (направленность+рейтинг+метки с категориями/определениями/счётчиками) — это база и для tag-системы, и для
   локализации, и для two-sided. Read-depth funnel в writer-аналитику.
4. **W2 — минимальный bible + Codex Progression:** несколько полей персоны + состояние по сюжету; контекст кодом.
5. **W1 — writer-grade ощущение письма:** выбор шрифта/typewriter/focus/justify + автосейв + счётчик, на
   editorial-типографике.
6. **Дизайн — закрепить дифференциатор:** тёмный баклажан + амбер/роза + Bodoni/Garamond/DM Sans; serif-контент
   + sans-UI (валидировано AI Dungeon/NovelAI). Решить cyrillic-gap шрифтов (см. memory).
7. **Пост-MVP виральность:** Заявки (demand-marketplace) + UGC-витрина затравок со статами.

---

## 7. Что ещё стоит добрать (если вернёмся)
- **Wattpad** (массовый mobile-first reader/social — сравнить с Ficbook reader-path).
- **AO3** (тег-система/фильтры — эталон таксономии, но Cloudflare-block).
- Внутри уже снятых: Sudowrite Story Bible UI, NovelCrafter Scene Beat в действии, AI Dungeon **Story Cards**,
  character.ai **Definition/Pinned memories**, реальный стриминг генерации (бот-детект мешал на free).

> Cleanup-хвосты в аккаунтах юзера: NovelAI «New Story» (1 промпт), NovelCrafter тестовая новелла,
> character.ai чат с «Buddy» (2 сообщения). AI Dungeon — гость-сессия, не сохранена. Удалить при желании.
