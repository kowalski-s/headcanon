# Screen 02 — Create story flow (Mobile)

**Path:** `/create` (multi-step с `?step=2`)
**Layout:** `app/(create)/create/page.tsx`
**Prototype:** артборд `mix-create`, функция `MixCreateMobile()`

---

## Интент

«Ship → готовая глава за <60 сек». Главный конверсионный flow.

5 этапов, но пользователь может пропустить 3-5 (получит дефолты от AI):

1. **Фандом** — что: «Гарри Поттер», «BG3», и т.д.
2. **Ship (пейринг)** ← мы здесь в прототипе
3. **Тропы** — checkboxes, max 3
4. **Сеттинг** — опционально (year 7, modern AU, …)
5. **Тон** — опционально (slow burn / spicy / fluff)

После 5-го шага → стриминг главы прямо в ридер.

---

## Layout этапа 2 (как в прототипе)

1. **Top bar** — `×` close, mono-метка `STAGE 02 / 05`, `DRAFT` индикатор амбером.
2. **Compact progress** — тонкая полоса 40% + строка `дальше — тропы пакета` (italic Garamond, ink-dim, амбер-акцент на «тропы пакета»).
3. **Title** — Bodoni 30px «Подбираем `★ пейринг`» (выделение амбером + рукописный поворот -1.5°).
4. **Sub** — Garamond 12px, ink-dim, объясняет почему ship важен.
5. **Selected pair card** — два аватара (градиенты-плейсхолдеры) с большим Bodoni `×` посередине, ниже полное имя пары.
6. **Suggestion list** — 3-4 альтернативных пейринга, swipe horizontal. Каждый: маленькие аватары + имя + popularity bar.
7. **CTA bar (sticky bottom)** — ghost `← назад` + amber `дальше · завязка →`.

---

## Данные с бэка

```ts
type CreateDraft = {
  id: string;
  fandomId: string | null;
  shipId: string | null;
  tropes: string[];        // max 3
  setting: string | null;
  tone: 'slow-burn' | 'spicy' | 'fluff' | 'angst' | null;
  step: 1 | 2 | 3 | 4 | 5;
  createdAt: Date;
};

POST /api/create/draft       // → { id }
PATCH /api/create/draft/:id  // step update
GET /api/create/ships?fandomId={...}  // → Ship[]
GET /api/create/tropes?shipId={...}   // → Trope[] (контекст-зависимо)
POST /api/create/draft/:id/start      // → стриминг → /reader/:storyId
```

---

## AI suggestions (важно)

**После выбора фандома** — бэк дёргает OpenRouter с промптом «топ-7 пейрингов по популярности на AO3 + 2 редких но топовых», возвращает с avatars-промптами для Replicate. Кэшируется в БД.

**После выбора ship** — аналогично топ-12 тропов под этот ship, плюс 1 «AI Sensei tip» (как в прототипе): «enemies-to-lovers + slow burn = 12+ глав. Я разгоню напряжение медленно. Готова ждать?» — рендерится в speech bubble, амбер-burst-метка.

---

## Edge cases

- Юзер вернулся через 3 дня → восстанавливаем draft из БД, открываем на последнем шаге.
- Юзер выбрал ship из непопулярного → AI подсказывает «канон или АU?», предлагает оба пути.
- Юзер хочет poly (3+ персонажа) → разрешаем после ship-2, появляется кнопка `+ ещё персонаж`.
- Лимит бесплатных историй исчерпан → blocking modal с YooKassa pricing на этапе 5 «начать».

---

## Tracking

- `create_started`
- `create_step_completed { step, took_ms }`
- `create_step_skipped { step }`
- `create_ship_selected { ship_id, source: 'top' | 'search' | 'custom' }`
- `create_finished { took_total_ms }`
- `create_abandoned { last_step }`

---

## Что отличается от прототипа

- Прототип показывает только этап 2. Нужны 1, 3, 4, 5 — каждый по тому же паттерну (top bar / progress / title с акцентом / контент / sticky CTA).
- На этапе 3 (тропы) — карточки трупов с описанием 1-line + пример (нав AO3).
- На этапе 5 — превью «как начнётся глава» (~2 предложения), генерируется лайтово.
