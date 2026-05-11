# Next session — M2 Plan B (Coherence) handoff

Скопируй промпт ниже в новую сессию Claude Code, когда захочешь продолжить M2.

---

## Промпт для новой сессии

```
Продолжаем M2. Plan A (Generate core) шипнут в прошлой сессии — тэг m2a-done,
123 теста проходят, founder уже прогнал e2e локально.

Сейчас нужно реализовать Plan B (Coherence — bible-extract + auto-tag workers
через pg-boss) через subagent-driven-development.

План:
docs/superpowers/plans/2026-05-11-m2-plan-b-coherence.md

Дизайн-спека:
docs/superpowers/specs/2026-05-11-m2-generate-design.md (§11 background jobs)

11 задач в плане. Каждую — через свежий sonnet-имплементер; для критичных
(миграция, worker handler) — opus spec+quality review. Trivial install/cron —
inline.

Что уже работает из Plan A и понадобится Plan B:
- `lib/llm-openai.ts` exports `openaiLlm.completeStructured({ schema, ... })` —
  workers зовут его для structured-output (bible-extract, auto-tag).
- AI SDK 6: `inputTokens/outputTokens` (не `promptTokens`), wrap zod через
  `zodSchema()` из 'ai'.
- Auth helper: `getUserIdOrThrow(req)` — пас req. Workers не вызываются из HTTP,
  им auth не нужен.
- Prisma имеет: `CharacterState`, `WorldState`, `ChapterSummary`, `Character`,
  `StoryTag` (без `prefilled`), `Story` (без `aiTagSuggestion`). Plan B Task 9
  добавит prefilled+aiTagSuggestion миграцией.
- Legacy `Job`/`JobType`/`JobStatus` enum/модель ещё в schema.prisma — Plan B
  Task 2 их удаляет.
- Tests serialized через `fileParallelism: false` (Plan A установил).

Gotchas из Plan A на которые надо смотреть в Plan B:
1. `pnpm db:migrate -- --name foo` — pnpm не пропускает `--name` через `--`.
   Использовать `pnpm exec prisma migrate dev --name foo` напрямую.
2. После миграции иногда нужен явный `pnpm prisma generate` чтобы клиент
   увидел новые модели.
3. DB-touching тесты используют live Supabase dev DB. Беречь fixtures: после
   beforeEach убирать только то что создавала, не дёргать чужие USER_ID.
4. `DEV_USER_ID = '00000000-0000-0000-0000-000000000001'` уже засеян в БД.
5. Solo dev — commit прямо в main, не предлагать ветки/PR/worktree.

Метод работы:
- Прочитать план B полностью
- Создать TaskCreate-список (11 задач, концайз)
- Дисптачить sonnet-имплементера на каждую задачу с полным текстом + контекстом
- Для важных (миграция, worker handler) — opus spec+quality review
- Trivial (install/cron) — inline без сабагента
- Commit после каждой задачи, никаких PR

Особенность Plan B: pg-boss требует второго процесса `pnpm worker`. Это меняет
deploy (Coolify), но в dev запускается отдельной вкладкой. Worker регистрирует
два queue (extract-bible, auto-tag) + cron sweeper.

После Plan B — Plan C (Inline edit, 11 задач). Но не запускать без подтверждения.

Финальный exit criterion Plan B:
- Глава 2 prompt включает summary главы 1 + WorldState + CharacterState[]
- Save главы 1 enqueue'ит extract-bible job → worker через ~5s записывает state
- Auto-tag job pre-fills freeform tags + aiTagSuggestion blob
- Тэг `m2b-done` локально

Начни с чтения плана, потом дисптачь Task 1 (install pg-boss).
```

---

## Quick verify где остановились

```bash
cd /Users/inga/Desktop/мое/headcanon
git log --oneline -3       # последний — ca584f7 test(M2-A): playwright e2e smoke
git tag --list "m2*"        # m2a-done
pnpm test 2>&1 | tail -3    # 123 passed (123)
```

Если что — состояние сохранено в memory:
`~/.claude/projects/-Users-inga-Desktop-----headcanon/memory/project_state.md`
