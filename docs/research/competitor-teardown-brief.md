# Brief для локальной сессии: teardown конкурентов (путь A)

> Этот файл — задание для **локальной** сессии Claude Code (VS Code/CLI) с подключённым
> `chrome-devtools-mcp`. Web-сессия не может это сделать: браузер там headless в облачном
> сэндбоксе (юзер не видит окно и не может залогиниться) + egress-политика блокирует домены
> конкурентов. Локально браузер твой, с твоим логином — поэтому teardown делается здесь.

---

## 0. Перед стартом (setup)

1. Установить и подключить Chrome DevTools MCP в локальной сессии:
   ```bash
   claude mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest
   ```
   (или добавить в `.mcp.json` проекта; затем `/mcp` в Claude Code — проверить, что сервер `chrome-devtools` connected).
2. Залогиниться **заранее** в браузере во всех платных тулзах (Sudowrite, NovelAI, NovelCrafter, Squibler, character.ai, AI Dungeon, Wattpad, Фикбук). chrome-devtools-mcp умеет работать с уже открытым Chrome — держи нужные вкладки открытыми и залогиненными.
3. Прочитать контекст проекта перед анализом: `CLAUDE.md`, `docs/vision.md`, `handoff/DESIGN.md`, `handoff/TASKS.md`. Это источник правды по продукту и дизайн-направлению.

---

## ⬇️ ПРОМПТ ДЛЯ ЛОКАЛЬНОЙ СЕССИИ (копировать целиком)

Ты — исследователь-аналитик в проекте **Headcanon**. Цель — teardown конкурентов: разобрать
их продукт, UX и дизайн-систему, чтобы **забрать лучшие решения** (НЕ копировать код/ассеты —
учимся подходу и строим своё). У тебя подключён `chrome-devtools-mcp` и я (юзер) залогинена в
тулзах. Рабочий протокол: **ты ведёшь браузер → упираешься в логин/пейвол → ставишь на паузу и
просишь меня войти/нажать → продолжаешь**. Скриншоть ключевые экраны и состояния.

Сначала прочитай `CLAUDE.md`, `docs/vision.md`, `handoff/DESIGN.md`, `handoff/TASKS.md` —
это контекст. Кратко: Headcanon = **writer-first** AI-инструмент для авторов фанфиков +
two-sided market. Primary — редактор + AI-ассистент (следующая сцена / идея / правка /
сократические вопросы / извлечение персонажей в character bible / консистентность мира) +
приватные черновики + заметки. Generation-from-prompt — secondary виральный канал. Аудио (TTS) —
USP. Видео — только для оригинальных миров. Ниша: **русскоязычные авторы (Фикбук-сегмент)**,
фандомы HP / All for the Game / Naruto / JJK. **Mobile-first, тёмная тема, late-night.**
Дизайн-направление — **Editorial Y2K** (см. `handoff/DESIGN.md`).

### Что разбираем (кластеры)
- **AI-писательские:** Sudowrite, NovelAI, NovelCrafter, Squibler — *самое важное: UX редактора + AI-ассистента.*
- **Фанфик-площадки:** AO3, Wattpad, Фикбук (ficbook.net) — *чтение, теги/фандомы, дискавери, engagement.*
- **Генеративные/chat:** character.ai, AI Dungeon — *онбординг, generation flow, виральность, ретеншн.*

### Метод по каждому сайту
1. Пройди ключевые экраны (см. чек-лист кластера ниже). На каждом — скриншот (desktop + 375px mobile через device emulation).
2. На 2-3 опорных экранах сними **дизайн-токены** — выполни в DevTools-консоли (через `evaluate`) скрипт из раздела «Token grab» ниже. Сохрани JSON-вывод.
3. Зафиксируй **interaction-паттерны**: как вызываются действия, что в сайдбаре vs инлайн vs командах, как устроена навигация, пустые/загрузочные/ошибочные состояния.
4. Если за логином — поставь паузу, попроси меня войти, продолжи.

### Чек-листы по кластерам
**AI-писательские** (на примере Sudowrite/NovelCrafter/NovelAI/Squibler):
- Рабочая поверхность редактора: где текст, где AI, как они сосуществуют на экране.
- Как инвокаются AI-действия (кнопка/слэш-команда/выделение→меню/сайдбар); как показывается результат (inline diff / карточки вариантов / стрим).
- Система памяти/контекста: Story Bible / Codex / Lorebook — как заводятся персонажи/мир, как это переиспользуется в генерации, насколько структурно.
- Версии/история, главы/структура книги, импорт/экспорт.
- Онбординг: что показывают первым, как быстро до первой ценности.
- Мобайл: есть ли, насколько урезан.

**Фанфик-площадки** (AO3/Wattpad/Фикбук):
- Reading UX: типографика длинного текста, ширина строки, шрифты, night/dark mode, настройки (размер/тема), навигация по главам, прогресс.
- Теги и фандомная таксономия: фандомы/пейринги/предупреждения/рейтинги, фильтрация и исключение тегов (детально разобрать систему тегов AO3 и контраст с Фикбуком).
- Дискавери/лента: как читатель находит истории, сортировки, что выводится.
- Engagement: kudos/лайки, комменты, закладки/подписки, коллекции, «сохранения», списки чтения.
- Флоу публикации многоглавника, черновики, серии.

**Генеративные/chat** (character.ai/AI Dungeon):
- Онбординг и скорость до «вау», как сидируется первый контент.
- Generation/interaction flow, контролы, система памяти/персон.
- Share/виральность: как контент шерится наружу, креатор-шеринг, соц-петли.
- Ретеншн и проблема «надоедает через 2-3 главы»; где теряют людей.
- Монетизация: что за пейволом (скорость, память, NSFW, голос).
- Обращение с фандомами/IP, модерация, NSFW-позиция.

### Token grab (выполнить через chrome-devtools-mcp `evaluate`)
```js
(() => {
  const out = {};
  const vars = {};
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    if (!rules) continue;
    for (const rule of rules) if (rule.style) for (const p of rule.style)
      if (p.startsWith('--')) vars[p] = rule.style.getPropertyValue(p).trim();
  }
  out.cssVariables = vars;
  const S = sel => { const el = document.querySelector(sel); if (!el) return null;
    const s = getComputedStyle(el);
    return { fontFamily:s.fontFamily, fontSize:s.fontSize, fontWeight:s.fontWeight,
      lineHeight:s.lineHeight, letterSpacing:s.letterSpacing, color:s.color,
      background:s.backgroundColor, borderRadius:s.borderRadius, boxShadow:s.boxShadow, padding:s.padding }; };
  out.samples = { body:S('body'), h1:S('h1'), h2:S('h2'), p:S('p'),
    button:S('button'), a:S('a'), input:S('input,textarea'), card:S('[class*=card]') };
  const els = [...document.querySelectorAll('*')].slice(0, 4000);
  out.fonts = [...new Set(els.map(e=>getComputedStyle(e).fontFamily))].slice(0, 30);
  const cc = {};
  for (const e of els) { const s = getComputedStyle(e);
    for (const c of [s.color, s.backgroundColor, s.borderColor])
      if (c && c!=='rgba(0, 0, 0, 0)' && c!=='transparent') cc[c]=(cc[c]||0)+1; }
  out.colorsTop = Object.entries(cc).sort((a,b)=>b[1]-a[1]).slice(0, 30);
  return out;
})();
```

### Артефакты (сохранять по ходу, не в самом конце)
- Скриншоты → `docs/research/screens/<competitor>/<screen>.png`.
- По каждому конкуренту — секция в `docs/research/teardown-<cluster>.md` по шаблону ниже.
- Финал — `docs/research/teardown-synthesis.md`: что **берём** / что **избегаем** / **gaps**, замапленные на наши экраны и тикеты W2–W4.

### Шаблон секции конкурента
```
## <Название>
- **Позиционирование / кто юзер:**
- **IA / основные экраны:**
- **Редактор+AI UX** (или Reading UX / Generation flow по кластеру):
- **Система памяти/контекста (Bible/Codex/Lorebook/теги):**
- **Онбординг / first value / aha-момент:**
- **Монетизация / что за пейволом:**
- **Дизайн-язык:** типографика, палитра, плотность, dark mode, мобайл (+ вставить token-grab JSON)
- **Любят / ненавидят** (из живого UX + что знаешь):
- **Уроки для Headcanon** (3-5, конкретно: steal / avoid / gap):
- **Скриншоты:** ссылки на файлы
```

### Этика / границы
Инспектируем то, что сайт и так отдаёт каждому посетителю + твои залогиненные экраны — ради
дизайн/UX-уроков. **Не** выкачиваем чужие пользовательские данные, **не** копируем код/ассеты
дословно. «Best practices» = понять *как решено* и сделать **своё**, лучше и под нашу нишу.

— конец промпта —

---

## Как пользоваться (для Инги)
1. Открой локальную сессию Claude Code в этом репо (ветка `claude/project-review-access-d6lml4`), `git pull`.
2. Подключи `chrome-devtools-mcp` (раздел 0).
3. Залогинься в тулзах, оставь вкладки открытыми.
4. Вставь промпт выше (от «Ты — исследователь-аналитик…» до «— конец промпта —»).
5. Когда сессия упрётся в логин — она попросит тебя войти; входишь и говоришь «продолжай».
