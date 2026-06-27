# Competitor Teardown — Brief & Protocol

> **Назначение.** Канонический reference для разбора конкурентов Headcanon: продукт, UX,
> дизайн-система. Цель — **забрать лучшие решения подхода**, а не код/ассеты. Учимся, строим своё.
>
> Этот файл — источник правды для процесса. Артефакты складываем рядом (`screens/`, `tokens/`,
> `teardown-*.md`, `teardown-synthesis.md`).

---

## Этические границы (read first)

- ✅ Инспектируем то, что сайт **отдаёт каждому посетителю**, + залогиненные экраны владельца
  аккаунта (юзер сама входит) — ради UX-уроков.
- ✅ Скриншоты ключевых экранов и состояний для нашего внутреннего анализа.
- ✅ Снимаем дизайн-токены через `getComputedStyle` (это то, что браузер и так применил к публичной
  странице).
- ❌ **НЕ** выкачиваем чужие пользовательские данные (тексты других авторов массово, приватные
  данные, email-листы).
- ❌ **НЕ** копируем код/ассеты дословно (шрифты-файлы, SVG-иконки, картинки, CSS как есть).
- ❌ **НЕ** обходим платный контент/rate-limits, не скрейпим за пейволом ради контента.
- ❌ **НЕ** нагружаем сайт автоматизацией (никаких циклов-скрейпов; ручная навигация по экранам).

Правило большого пальца: **«мог бы это увидеть и записать любопытный дизайнер, открыв сайт в
браузере?»** Если да — можно. Если для этого нужно слить чужую БД — нет.

---

## Кластеры и что разбираем

### Кластер A — AI-писательские (★ важнее всего: UX редактора + AI-ассистента)

`Sudowrite · NovelAI · NovelCrafter · Squibler`

Чек-лист по каждому:

- **Онбординг / первый вход:** что показывают пустому юзеру, как заводят первый проект, есть ли
  template/wizard, сколько шагов до «пишу».
- **Редактор (core):** layout (одно/двух/трёх-колоночный), где текст, где AI, ширина колонки,
  типографика письма, focus-mode, форматирование, как выглядит «пустой документ».
- **Как вызывается AI:** инлайн-выделение → меню? правый сайдбар? слэш-команды? хоткеи? отдельная
  «панель инструментов» с действиями (write/expand/describe/rewrite/brainstorm)?
- **AI-действия (каталог):** перечислить ВСЕ кнопки/команды (Write, Expand, Describe, Rewrite,
  Brainstorm, Canvas, Story Bible и т.д.) — это прямая карта для нашего W3.
- **Story Bible / world-building / персонажи:** есть ли отдельная база сущностей, как извлекаются,
  как подсовываются в контекст, ручной vs авто.
- **Состояния:** empty (нет проектов/нет текста), loading (генерация — стриминг? спиннер?),
  error (отказ модели/лимит), как показывают «AI думает».
- **Принятие результата:** как AI-вывод попадает в текст (вставка / diff / accept-reject / карточки
  вариантов), история версий.
- **Биллинг/лимиты в UI:** где показан счётчик кредитов/слов, как давят на апгрейд.
- **Мелочи, которые крадём:** микрокопирайт, hotkeys, ощущение «инструмента писателя».

### Кластер B — Фанфик-площадки (чтение, теги/фандомы, дискавери, engagement)

`AO3 (archiveofourown.org) · Wattpad · Фикбук (ficbook.net)`

Чек-лист по каждому:

- **Дискавери:** главная, поиск, фильтры, как устроены теги/фандомы, сортировки, «browse by fandom».
- **Карточка работы в списке:** какие метаданные, теги-предупреждения, рейтинг, warnings, статистика.
- **Reader (чтение главы):** ширина колонки, типографика, навигация глава↔глава, настройки (тема,
  шрифт, размер), прогресс, мобильный режим.
- **Метаданные/теги:** система тегов (canonical vs freeform у AO3), фандом, отношения (ship),
  персонажи, предупреждения, completed/in-progress.
- **Engagement:** kudos/likes, комменты, закладки/коллекции, подписки, share, history.
- **Author-side (если видно):** как выглядит публикация, главы, черновики.
- **Что НЕ делать как они:** AO3 — мощь тегов, но архаичный UI; Wattpad — engagement, но шумно;
  Фикбук — родной для ниши, но визуально устарел. Берём систему, не вид.

### Кластер C — Генеративные / chat (онбординг, generation flow, виральность, ретеншн)

`character.ai · AI Dungeon`

Чек-лист по каждому:

- **Онбординг:** сколько экранов до первого «вау», просят ли регистрацию до ценности, как выбирают
  персонажа/мир.
- **Generation flow:** как выглядит ввод, стриминг ответа, регенерация, ветвление, «свайп вариантов».
- **Виральность:** шеринг персонажей/историй, публичные галереи, ремикс, «создай своего».
- **Ретеншн-крючки:** уведомления, продолжения, коллекции, дейли, персонализация ленты.
- **Empty/loading/error:** как заполняют ожидание, чем держат в пустых состояниях.
- **Монетизация:** где пейвол, что бесплатно, как показывают премиум.

---

## token-grab скрипт (запускать через `evaluate_script`)

Снимаем на **2–3 опорных экранах** каждого конкурента (обычно: редактор/reader + дискавери/главная +
одно модальное/настроечное состояние). Результат сохраняем в
`docs/research/tokens/<competitor>-<screen>.json`.

Скрипт собирает: CSS custom properties (`:root` — часто там вся дизайн-система), частотные палитры
цветов/фонов/бордеров, типографику (font-family / size / weight / line-height / letter-spacing),
радиусы, тени. Возвращает агрегаты, отсортированные по частоте.

```js
() => {
  const MAX_NODES = 6000;
  const norm = (s) => (s || '').trim();
  const bump = (m, k) => { if (!k) return; m[k] = (m[k] || 0) + 1; };
  const topN = (m, n = 24) =>
    Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n)
      .map(([value, count]) => ({ value, count }));

  // 1. CSS custom properties on :root (the actual design tokens, when exposed)
  const rootStyle = getComputedStyle(document.documentElement);
  const cssVars = {};
  for (let i = 0; i < rootStyle.length; i++) {
    const prop = rootStyle[i];
    if (prop.startsWith('--')) cssVars[prop] = norm(rootStyle.getPropertyValue(prop));
  }

  // 2. Walk visible elements, harvest computed styles
  const colors = {}, bgs = {}, borderCols = {}, fontFams = {}, fontSizes = {},
        fontWeights = {}, lineHeights = {}, letterSpacings = {}, radii = {}, shadows = {};
  const nodes = document.querySelectorAll('body *');
  let seen = 0;
  for (const el of nodes) {
    if (seen++ > MAX_NODES) break;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;       // skip invisible
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const hasText = el.childNodes && [...el.childNodes].some(
      (n) => n.nodeType === 3 && norm(n.nodeValue));

    if (hasText) {
      bump(colors, cs.color);
      bump(fontFams, cs.fontFamily);
      bump(fontSizes, cs.fontSize);
      bump(fontWeights, cs.fontWeight);
      bump(lineHeights, cs.lineHeight);
      bump(letterSpacings, cs.letterSpacing);
    }
    if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)')
      bump(bgs, cs.backgroundColor);
    if (cs.borderTopWidth !== '0px' && cs.borderTopColor) bump(borderCols, cs.borderTopColor);
    if (cs.borderTopLeftRadius !== '0px') bump(radii, cs.borderTopLeftRadius);
    if (cs.boxShadow && cs.boxShadow !== 'none') bump(shadows, cs.boxShadow);
  }

  return {
    meta: {
      url: location.href,
      title: document.title,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      nodesScanned: Math.min(seen, MAX_NODES),
    },
    cssVars,                                  // raw design tokens if exposed
    color: topN(colors),
    background: topN(bgs),
    borderColor: topN(borderCols),
    fontFamily: topN(fontFams, 12),
    fontSize: topN(fontSizes),
    fontWeight: topN(fontWeights),
    lineHeight: topN(lineHeights, 12),
    letterSpacing: topN(letterSpacings, 12),
    borderRadius: topN(radii),
    boxShadow: topN(shadows, 12),
  };
}
```

Сохранение: вывод `evaluate_script` → пишем как `tokens/<competitor>-<screen>.json` (через Write).

---

## Скриншоты

- Desktop **и** mobile (375px) для ключевых экранов. Mobile — через `resize_page` (375×812) или
  `emulate` устройства, затем `take_screenshot`.
- Имя: `docs/research/screens/<competitor>/<screen>[-mobile].png`.
- Снимаем состояния: default, hover/active меню AI, empty, loading/streaming, error, settings/modal.

---

## Шаблон секции конкурента (в `teardown-<cluster>.md`)

```markdown
## <Competitor> — <одно-строчное позиционирование>

- **URL / дата разбора:** <url> · <YYYY-MM-DD>
- **Доступ:** публично / по логину (юзер вошла) / частично за пейволом
- **Скриншоты:** screens/<competitor>/*.png
- **Токены:** tokens/<competitor>-*.json

### Продукт в двух абзацах
<что это, на кого, core loop>

### Онбординг
<шаги, фрикшн, момент первой ценности>

### Редактор / Reader / Generation flow (по кластеру)
<layout, колонки, типографика, навигация>

### Как вызывается AI / действия (кластер A) ИЛИ теги/дискавери (B) ИЛИ виральность (C)
<полный каталог: меню/команды/сайдбар/хоткеи; или система тегов; или sharing>

### Состояния
<empty / loading / streaming / error / settings — что увидели>

### Дизайн-система (из токенов)
<палитра, шрифты, радиусы, тени, плотность; ссылка на JSON>

### 🎯 Что крадём (подход, не код)
- <конкретный паттерн → как ляжет на наш экран/тикет W?-??>

### 🚫 Чего избегаем
- <анти-паттерн и почему он не для нас>

### ❓ Открытые вопросы / не проверили
- <за пейволом / не дошли>
```

---

## Финальный синтез (`teardown-synthesis.md`)

После всех кластеров — сводка:

- **Берём** (ранжировано) → каждый пункт замаплен на наш экран (`handoff/screens/*`) и тикет
  (`W2`/`W3`/`W4` из `handoff/TASKS.md`).
- **Избегаем** → анти-паттерны с причиной.
- **Gaps / возможности** → чего нет ни у кого, где наш Editorial-Y2K + writer-first + RU-ниша даёт
  отличие.

---

## Рабочий протокол (interactive)

1. Перед каждым новым сайтом — сказать юзеру, **какие вкладки открыть**, чтобы она подготовила логин.
2. Вести браузер по чек-листу кластера.
3. Упёрлись в логин/пейвол → **пауза**, просим юзера войти в той же вкладке → продолжаем.
4. Скриншоты + токены **по ходу**, не в конце.
5. Секцию конкурента дописываем сразу после его разбора, не копим в голове.
```
