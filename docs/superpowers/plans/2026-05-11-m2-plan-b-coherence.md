# M2 Plan B — Coherence (Bible/Auto-tag Background Jobs) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Глава 2 учитывает события главы 1 (через `CharacterState` + `WorldState` + `ChapterSummary`); story получает pre-filled auto-tags после save. Всё это асинхронно через pg_boss workers — save не блокируется.

**Architecture:** pg_boss (Postgres-native очередь) поднят в отдельном Node-процессе (`pnpm worker`), который слушает два queue: `extract-bible` и `auto-tag`. Save endpoint из Plan A теперь enqueue'ит оба job'а. Singleton-debounce на `chapterId` обеспечивает идемпотентность для rapid edits. Existing Prisma `Job` модель и `JobType.EXTRACT_BIBLE/AUTO_TAG` удаляются как dead code (никогда не использовались).

**Tech Stack:** pg-boss 10 · OpenAI / Vercel AI SDK · Prisma · Vitest

**Зависимости:** Plan A merged.

---

## File structure

### Создаём

- `lib/queue/boss.ts` — singleton bootstrap (одна shared `PgBoss` instance)
- `lib/queue/start-workers.ts` — точка входа для `pnpm worker` процесса
- `lib/queue/jobs/extract-bible.ts` — worker handler
- `lib/queue/jobs/auto-tag.ts` — worker handler
- `lib/prompts/bible-extract.ts` — strict-JSON template
- `lib/prompts/auto-tag.ts` — strict-JSON template
- `lib/chapter/load-prior-state.ts` — helper для buildChapterPrompt N>1
- `scripts/worker.ts` — entrypoint для `pnpm worker`

### Модифицируем

- `prisma/schema.prisma` — remove `Job`/`JobStatus`/`JobType` (dead code)
- `app/api/chapter/[id]/save/route.ts` — enqueue jobs (заменить no-op stub из Plan A)
- `app/api/chapter/[id]/stream/route.ts` — для главы N>1 загружать priorState
- `package.json` — добавить deps + `worker` script

---

## Task 1: Install pg-boss

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install**

```bash
pnpm add pg-boss
pnpm add -D @types/pg-boss
```

- [ ] **Step 2: Verify**

```bash
cat package.json | grep pg-boss
```

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(M2-B): add pg-boss + types"
```

---

## Task 2: Remove dead `Job`/`JobType` from Prisma

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<auto>_remove_legacy_jobs/migration.sql`

- [ ] **Step 1: Remove blocks**

Удалить из `schema.prisma`:

```prisma
enum JobStatus { ... }
enum JobType { ... }
model Job { ... }
```

- [ ] **Step 2: Generate migration**

```bash
pnpm db:migrate -- --name remove_legacy_jobs
```
Expected: миграция дропает 3 объекта.

- [ ] **Step 3: Verify типы**

```bash
pnpm typecheck
```
Expected: PASS (Job нигде не использовался — pre-dev sketch).

- [ ] **Step 4: Commit**

```bash
git add prisma
git commit -m "chore(M2-B): drop legacy Job/JobType — replaced by pg_boss"
```

---

## Task 3: pg_boss singleton bootstrap

**Files:**
- Create: `lib/queue/boss.ts`

- [ ] **Step 1: Implement**

```ts
// lib/queue/boss.ts
import PgBoss from 'pg-boss';

let instance: PgBoss | null = null;

export async function getBoss(): Promise<PgBoss> {
  if (instance) return instance;
  const conn = process.env.DATABASE_URL;
  if (!conn) throw new Error('DATABASE_URL required for pg-boss');
  instance = new PgBoss({
    connectionString: conn,
    schema: 'pgboss',
    retryLimit: 3,
    retryBackoff: true,
  });
  await instance.start();
  return instance;
}

export async function enqueue(queue: string, payload: object, opts?: { singletonKey?: string }): Promise<string | null> {
  const boss = await getBoss();
  return boss.send(queue, payload, opts ?? {});
}
```

- [ ] **Step 2: Smoke test**

```ts
// lib/queue/boss.test.ts
import { describe, it, expect } from 'vitest';
import { getBoss, enqueue } from './boss';

describe('pg-boss', () => {
  it('starts and accepts send', async () => {
    const boss = await getBoss();
    expect(boss).toBeTruthy();
    const id = await enqueue('test-queue', { hello: 'world' });
    expect(id).toBeTruthy();
  });
});
```

Тест опционально skip'ается, если `SKIP_PG_BOSS=1` (CI без живой БД может его пропустить).

- [ ] **Step 3: Commit**

```bash
git add lib/queue/boss.ts lib/queue/boss.test.ts
git commit -m "feat(M2-B): pg-boss singleton + enqueue helper"
```

---

## Task 4: Worker process entrypoint

**Files:**
- Create: `scripts/worker.ts`
- Create: `lib/queue/start-workers.ts`
- Modify: `package.json`

- [ ] **Step 1: Implement start-workers**

```ts
// lib/queue/start-workers.ts
import { getBoss } from './boss';

export async function startAllWorkers(): Promise<void> {
  const boss = await getBoss();
  // Регистрируем queue'и; handlers подключим в Tasks 6 и 9.
  await boss.createQueue('extract-bible');
  await boss.createQueue('auto-tag');
  console.log('[worker] queues registered: extract-bible, auto-tag');
}
```

- [ ] **Step 2: Entrypoint**

```ts
// scripts/worker.ts
import 'dotenv/config';
import { startAllWorkers } from '@/lib/queue/start-workers';

async function main() {
  await startAllWorkers();
  // pg-boss держит соединение само; процесс висит
  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
  console.log('[worker] running. Ctrl-C to exit.');
}

void main().catch((e) => {
  console.error('[worker] fatal:', e);
  process.exit(1);
});
```

- [ ] **Step 3: npm script**

В `package.json` добавить:

```json
"worker": "tsx --env-file=.env scripts/worker.ts"
```

- [ ] **Step 4: Test manually**

```bash
pnpm worker
```
Expected: `[worker] queues registered: extract-bible, auto-tag` + `[worker] running.` Завершить Ctrl-C.

- [ ] **Step 5: Commit**

```bash
git add lib/queue/start-workers.ts scripts/worker.ts package.json
git commit -m "feat(M2-B): pnpm worker entrypoint + queue registration"
```

---

## Task 5: Bible-extract prompt + schema

**Files:**
- Create: `lib/prompts/bible-extract.ts`
- Test: `lib/prompts/bible-extract.test.ts`

- [ ] **Step 1: Schema + build**

```ts
// lib/prompts/bible-extract.ts
import { z } from 'zod';
import { SYSTEM_INJECTION_NOTICE } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'bible_extract';
export const TEMPLATE_VERSION = 1;

export const BibleExtractSchema = z.object({
  chapter_summary: z.string().max(800),
  updated_world_state: z.object({
    current_location: z.string(),
    story_time: z.string(),
    active_plot_threads: z.array(z.string()),
    foreshadowing: z.array(z.string()),
  }),
  updated_character_states: z.array(z.object({
    character_name: z.string(),
    emotional_state: z.string(),
    recent_events: z.array(z.string()).max(5),
    relationships: z.record(z.object({
      closeness: z.number().min(-1).max(1),
      tension: z.number().min(0).max(1),
      last_interaction: z.string(),
    })),
    arc_progress: z.number().min(0).max(1),
    voice_traits_drift: z.array(z.string()),
  })),
});
export type BibleExtractOutput = z.infer<typeof BibleExtractSchema>;

export interface BibleExtractInput {
  chapterText: string;
  priorWorldState: object | null;
  priorCharacterStates: object[];
  characterRoster: string[];   // names known to the story
}

export function build(input: BibleExtractInput): { system: string; user: string } {
  return {
    system: [
      'You analyse a fanfic chapter and update structured story state.',
      'Return strict JSON per the provided schema. Be concise; max 200 words for chapter_summary.',
      'Update arc_progress monotonically (never decrease).',
      `Known characters in this story: ${input.characterRoster.join(', ')}.`,
      SYSTEM_INJECTION_NOTICE,
    ].join('\n\n'),
    user: [
      `Prior world_state: ${JSON.stringify(input.priorWorldState ?? {})}`,
      `Prior character_states: ${JSON.stringify(input.priorCharacterStates ?? [])}`,
      `Chapter text:\n<user_input>${input.chapterText}</user_input>`,
    ].join('\n\n'),
  };
}
```

- [ ] **Step 2: Snapshot test**

```ts
import { describe, it, expect } from 'vitest';
import { build, BibleExtractSchema } from './bible-extract';

describe('bible-extract', () => {
  it('builds prompt', () => {
    const p = build({ chapterText: 'Once...', priorWorldState: null, priorCharacterStates: [], characterRoster: ['A', 'B'] });
    expect(p.system).toMatch(/strict JSON/);
    expect(p.user).toMatch(/<user_input>Once/);
  });
  it('schema accepts valid', () => {
    const valid = {
      chapter_summary: 'sum',
      updated_world_state: { current_location: 'x', story_time: 'y', active_plot_threads: [], foreshadowing: [] },
      updated_character_states: [],
    };
    expect(BibleExtractSchema.parse(valid)).toEqual(valid);
  });
});
```

- [ ] **Step 3: Commit**

```bash
pnpm test lib/prompts/bible-extract
git add lib/prompts/bible-extract.ts lib/prompts/bible-extract.test.ts
git commit -m "feat(M2-B): bible-extract prompt + zod schema"
```

---

## Task 6: extract-bible worker

**Files:**
- Create: `lib/queue/jobs/extract-bible.ts`
- Modify: `lib/queue/start-workers.ts`
- Test: `lib/queue/jobs/extract-bible.test.ts`

- [ ] **Step 1: Worker handler**

```ts
// lib/queue/jobs/extract-bible.ts
import { prisma } from '@/lib/prisma';
import { openaiLlm } from '@/lib/llm-openai';
import * as bibleExtract from '@/lib/prompts/bible-extract';

export interface ExtractBibleJob {
  chapterId: string;
}

export async function handleExtractBible(job: { data: ExtractBibleJob }) {
  const { chapterId } = job.data;
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      paragraphs: { orderBy: { ordinal: 'asc' } },
      story: { include: { characters: true, characterStates: true, worldState: true } },
    },
  });
  if (!chapter) return;
  const chapterText = chapter.paragraphs.map((p) => p.text).join('\n\n');
  const characterRoster = chapter.story.characters.map((c) => c.name);

  const prompt = bibleExtract.build({
    chapterText,
    priorWorldState: chapter.story.worldState?.stateJson ?? null,
    priorCharacterStates: chapter.story.characterStates.map((s) => s.stateJson as object),
    characterRoster,
  });

  const result = await openaiLlm.completeStructured({
    callType: 'bible_extract',
    templateId: bibleExtract.TEMPLATE_ID,
    templateVersion: bibleExtract.TEMPLATE_VERSION,
    schema: bibleExtract.BibleExtractSchema,
    ...prompt,
    contextIds: { storyId: chapter.storyId, chapterId },
  });

  await prisma.$transaction(async (tx) => {
    // upsert world state
    await tx.worldState.upsert({
      where: { storyId: chapter.storyId },
      create: {
        storyId: chapter.storyId,
        stateJson: result.updated_world_state,
        updatedAtChapter: chapter.ordinal,
      },
      update: {
        stateJson: result.updated_world_state,
        updatedAtChapter: chapter.ordinal,
      },
    });
    // upsert character states (match by name → characterId)
    for (const cs of result.updated_character_states) {
      const character = chapter.story.characters.find(
        (c) => c.name.toLowerCase() === cs.character_name.toLowerCase(),
      );
      if (!character) continue;
      await tx.characterState.upsert({
        where: {
          characterId_storyId: { characterId: character.id, storyId: chapter.storyId },
        },
        create: {
          characterId: character.id,
          storyId: chapter.storyId,
          stateJson: cs,
          updatedAtChapter: chapter.ordinal,
        },
        update: { stateJson: cs, updatedAtChapter: chapter.ordinal },
      });
    }
    // upsert chapter summary
    await tx.chapterSummary.upsert({
      where: { chapterId },
      create: { chapterId, summary: result.chapter_summary },
      update: { summary: result.chapter_summary },
    });
  });
}
```

- [ ] **Step 2: Register handler in start-workers**

```ts
// lib/queue/start-workers.ts (replace)
import { getBoss } from './boss';
import { handleExtractBible } from './jobs/extract-bible';

export async function startAllWorkers(): Promise<void> {
  const boss = await getBoss();
  await boss.createQueue('extract-bible');
  await boss.createQueue('auto-tag');
  await boss.work('extract-bible', { teamSize: 2 }, handleExtractBible);
  console.log('[worker] queues registered + workers started');
}
```

- [ ] **Step 3: Worker integration test**

```ts
// lib/queue/jobs/extract-bible.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('@/lib/llm-openai', () => ({
  openaiLlm: { completeStructured: vi.fn(async () => ({
    chapter_summary: 'Test summary.',
    updated_world_state: { current_location: 'lib', story_time: 'd1', active_plot_threads: [], foreshadowing: [] },
    updated_character_states: [],
  })) },
}));
import { handleExtractBible } from './extract-bible';
import { prisma } from '@/lib/prisma';
import { createTestStoryWithChapter } from '@/lib/test-fixtures';

describe('handleExtractBible', () => {
  beforeEach(async () => {
    await prisma.worldState.deleteMany();
    await prisma.chapterSummary.deleteMany();
  });
  it('upserts world state + summary', async () => {
    const { story, chapter } = await createTestStoryWithChapter();
    await prisma.paragraph.create({ data: { chapterId: chapter.id, ordinal: 1, text: 'Once.' } });
    await handleExtractBible({ data: { chapterId: chapter.id } });
    const ws = await prisma.worldState.findUniqueOrThrow({ where: { storyId: story.id } });
    expect((ws.stateJson as any).current_location).toBe('lib');
    const cs = await prisma.chapterSummary.findUniqueOrThrow({ where: { chapterId: chapter.id } });
    expect(cs.summary).toBe('Test summary.');
  });
});
```

- [ ] **Step 4: Run + commit**

```bash
pnpm test lib/queue/jobs/extract-bible
git add lib/queue/jobs/extract-bible.ts lib/queue/start-workers.ts lib/queue/jobs/extract-bible.test.ts
git commit -m "feat(M2-B): extract-bible worker — updates world+character states+summary"
```

---

## Task 7: Wire enqueue в `/api/chapter/[id]/save`

**Files:**
- Modify: `app/api/chapter/[id]/save/route.ts`

- [ ] **Step 1: Add enqueue calls**

В конец `POST` handler (после tx) добавить:

```ts
import { enqueue } from '@/lib/queue/boss';

// ...после tx
await enqueue('extract-bible', { chapterId: id }, { singletonKey: id });
await enqueue('auto-tag', { storyId: chapter.story.id }, { singletonKey: chapter.story.id });
```

- [ ] **Step 2: Test (mocked enqueue)**

```ts
vi.mock('@/lib/queue/boss', () => ({
  enqueue: vi.fn(async () => 'job-id'),
}));
// ...assert enqueue called twice with right keys
```

- [ ] **Step 3: Commit**

```bash
git add app/api/chapter/[id]/save
git commit -m "feat(M2-B): /save enqueues extract-bible + auto-tag (debounced via singletonKey)"
```

---

## Task 8: Stream endpoint loads prior state для N>1

**Files:**
- Create: `lib/chapter/load-prior-state.ts`
- Modify: `app/api/chapter/[id]/stream/route.ts`

- [ ] **Step 1: Helper**

```ts
// lib/chapter/load-prior-state.ts
import { prisma } from '@/lib/prisma';
import type { PriorState } from '@/lib/prompts/chapter';

export async function loadPriorState(storyId: string, chapterOrdinal: number): Promise<PriorState | null> {
  if (chapterOrdinal <= 1) return null;
  const [worldState, characterStates, summaries, recentChapters] = await Promise.all([
    prisma.worldState.findUnique({ where: { storyId } }),
    prisma.characterState.findMany({
      where: { storyId },
      include: { character: true },
    }),
    prisma.chapterSummary.findMany({
      where: { chapter: { storyId, ordinal: { lt: chapterOrdinal - 1 } } },
      include: { chapter: true },
      orderBy: { chapter: { ordinal: 'asc' } },
    }),
    prisma.chapter.findMany({
      where: { storyId, ordinal: { in: [chapterOrdinal - 2, chapterOrdinal - 1].filter((n) => n > 0) } },
      include: { paragraphs: { orderBy: { ordinal: 'asc' } } },
      orderBy: { ordinal: 'asc' },
    }),
  ]);
  if (!worldState) return null;
  return {
    worldState: worldState.stateJson as PriorState['worldState'],
    characterStates: characterStates.map((cs) => cs.stateJson as PriorState['characterStates'][number]),
    summaries: summaries.map((s) => s.summary),
    recentChapters: recentChapters.map((ch) => ch.paragraphs.map((p) => p.text).join('\n\n')),
  };
}
```

- [ ] **Step 2: Use в stream route**

В `app/api/chapter/[id]/stream/route.ts` перед `chapterPrompt.build(...)`:

```ts
import { loadPriorState } from '@/lib/chapter/load-prior-state';

const priorState = await loadPriorState(chapter.storyId, chapter.ordinal);
const { system, user } = chapterPrompt.build({
  // ...existing fields
  priorState: priorState ?? undefined,
});
```

- [ ] **Step 3: Integration test**

```ts
// app/api/chapter/[id]/stream/route.coherence.test.ts
import { describe, it, expect, vi } from 'vitest';
vi.mock('@/lib/llm-openai', () => ({ openaiLlm: { stream: async function* () { yield 'ok'; } } }));
import { GET } from './route';
// setup: создать Chapter ordinal=2, WorldState уже в БД
// → assert: priorState попал в prompt (можно через spy на chapterPrompt.build)
```

- [ ] **Step 4: Commit**

```bash
pnpm test app/api/chapter/[id]/stream
git add lib/chapter app/api/chapter
git commit -m "feat(M2-B): stream loads CharacterState/WorldState/Summaries for chapter N>1"
```

---

## Task 9: Auto-tag prompt + worker

**Files:**
- Create: `lib/prompts/auto-tag.ts`
- Create: `lib/queue/jobs/auto-tag.ts`

- [ ] **Step 1: Prompt + schema**

```ts
// lib/prompts/auto-tag.ts
import { z } from 'zod';
import { SYSTEM_INJECTION_NOTICE } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'auto_tag';
export const TEMPLATE_VERSION = 1;

const RATINGS = ['G', 'T', 'M', 'E'] as const;
const WARNINGS = [
  'major_character_death', 'graphic_violence', 'rape_non_con',
  'underage', 'choose_not_to_use', 'no_archive_warnings_apply',
] as const;
const CATEGORIES = ['Gen', 'F/F', 'F/M', 'M/M', 'Multi', 'Other'] as const;

export const AutoTagSchema = z.object({
  rating_suggestion: z.enum(RATINGS),
  warnings_suggestion: z.array(z.enum(WARNINGS)),
  category: z.enum(CATEGORIES),
  freeform_tags: z.array(z.string()).max(10),
  confidence: z.number().min(0).max(1),
});
export type AutoTagOutput = z.infer<typeof AutoTagSchema>;

export function build(input: { storyText: string; existingTags: string[] }): { system: string; user: string } {
  return {
    system: [
      'You suggest AO3-style tags for a fanfic.',
      'Be conservative on rating (G/T/M/E) and on warnings — they affect legal compliance.',
      'Freeform tags should be popular and findable (slow-burn, enemies-to-lovers, hurt/comfort, etc).',
      SYSTEM_INJECTION_NOTICE,
    ].join('\n\n'),
    user: [
      input.existingTags.length ? `Existing tags: ${input.existingTags.join(', ')}` : '',
      `Story text:\n<user_input>${input.storyText}</user_input>`,
    ].join('\n\n'),
  };
}
```

- [ ] **Step 2: Worker**

```ts
// lib/queue/jobs/auto-tag.ts
import { prisma } from '@/lib/prisma';
import { openaiLlm } from '@/lib/llm-openai';
import * as autoTag from '@/lib/prompts/auto-tag';

export interface AutoTagJob { storyId: string; }

export async function handleAutoTag(job: { data: AutoTagJob }) {
  const { storyId } = job.data;
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      chapters: { where: { status: 'PUBLISHED' }, include: { paragraphs: { orderBy: { ordinal: 'asc' } } } },
      tags: { include: { tag: true } },
    },
  });
  if (!story) return;
  const storyText = story.chapters
    .flatMap((ch) => ch.paragraphs.map((p) => p.text))
    .join('\n\n');
  const existingTags = story.tags.map((st) => st.tag.name);

  const prompt = autoTag.build({ storyText, existingTags });
  const result = await openaiLlm.completeStructured({
    callType: 'auto_tag',
    templateId: autoTag.TEMPLATE_ID,
    templateVersion: autoTag.TEMPLATE_VERSION,
    schema: autoTag.AutoTagSchema,
    ...prompt,
    contextIds: { storyId },
  });

  // Persist freeform tags only — rating + warnings ждут confirm от юзера.
  // Создаём/находим Tag-row по slug, добавляем StoryTag если ещё нет.
  for (const slug of result.freeform_tags) {
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { type: 'FREEFORM', name: slug, slug },
      update: {},
    });
    await prisma.storyTag.upsert({
      where: { storyId_tagId: { storyId, tagId: tag.id } },
      create: { storyId, tagId: tag.id, prefilled: true },
      update: {},
    });
  }
  // Suggestions для rating/warnings/category — пишем в Story.aiTagSuggestion JSON-blob для UI.
  await prisma.story.update({
    where: { id: storyId },
    data: { aiTagSuggestion: result as object },
  });
}
```

- [ ] **Step 3: schema delta — `StoryTag.prefilled` + `Story.aiTagSuggestion`**

В `prisma/schema.prisma`:

```prisma
model StoryTag {
  // ...existing
  prefilled  Boolean  @default(false)
}

model Story {
  // ...existing
  aiTagSuggestion Json?
}
```

Migrate:

```bash
pnpm db:migrate -- --name story_tag_prefilled
```

- [ ] **Step 4: Register worker**

В `lib/queue/start-workers.ts`:

```ts
import { handleAutoTag } from './jobs/auto-tag';
// ...
await boss.work('auto-tag', { teamSize: 2 }, handleAutoTag);
```

- [ ] **Step 5: Test (mocked LLM)**

```ts
// lib/queue/jobs/auto-tag.test.ts
import { describe, it, expect, vi } from 'vitest';
vi.mock('@/lib/llm-openai', () => ({
  openaiLlm: { completeStructured: vi.fn(async () => ({
    rating_suggestion: 'T',
    warnings_suggestion: ['no_archive_warnings_apply'],
    category: 'M/M',
    freeform_tags: ['slow-burn', 'enemies-to-lovers'],
    confidence: 0.85,
  })) },
}));
// ... assert prefilled tags created
```

- [ ] **Step 6: Commit**

```bash
pnpm test lib/queue/jobs/auto-tag
git add lib/prompts/auto-tag.ts lib/queue/jobs/auto-tag.ts lib/queue/start-workers.ts prisma
git commit -m "feat(M2-B): auto-tag worker — pre-fills freeform tags + ai_tag_suggestion blob"
```

---

## Task 10: Sweeper — AiSuggestion cleanup

**Files:**
- Modify: `lib/queue/start-workers.ts`

- [ ] **Step 1: Add cron schedule**

```ts
// lib/queue/start-workers.ts addition
await boss.schedule('ai-suggestion-sweeper', '0 3 * * *');  // daily 3am UTC

await boss.work('ai-suggestion-sweeper', async () => {
  const { prisma } = await import('@/lib/prisma');
  const { count } = await prisma.aiSuggestion.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  console.log(`[sweeper] cleaned ${count} expired AiSuggestion rows`);
});
```

- [ ] **Step 2: Commit**

```bash
git add lib/queue/start-workers.ts
git commit -m "feat(M2-B): nightly sweeper — drop expired AiSuggestion rows"
```

---

## Task 11: End-to-end smoke — chapter 2 cites chapter 1

**Files:**
- Create: `scripts/m2b-e2e.ts`

- [ ] **Step 1: Script**

```ts
// scripts/m2b-e2e.ts
import 'dotenv/config';
import { prisma } from '@/lib/prisma';

async function main() {
  // setup: создаём user + story + chapter 1 с Paragraph[]
  // → enqueue extract-bible
  // → polling: ждём пока ChapterSummary появится (max 60s)
  // → run chapter 2 stream (нужен running dev server) — проверяем что system prompt включает summary
  console.log('M2-B smoke OK');
}
void main();
```

- [ ] **Step 2: Run founder-manually**

```bash
pnpm dev                  # tab 1
pnpm worker               # tab 2
pnpm tsx --env-file=.env scripts/m2b-e2e.ts   # tab 3
```

- [ ] **Step 3: Commit + tag**

```bash
git add scripts/m2b-e2e.ts
git commit -m "test(M2-B): smoke — chapter 2 prompt includes ch1 summary + world state"
git tag m2b-done
```

---

## Coolify deploy notes (для founder когда деплоится prod)

В Coolify нужен второй service `headcanon-worker`:

- Та же Docker image что у Next-приложения
- Start command: `pnpm worker` вместо `pnpm start`
- Те же env vars (DATABASE_URL, OPENAI_API_KEY)
- Health check — нет (pg_boss сам мониторит)
- Restart policy: `always`

Founder сделает это вручную при первом prod-deploy; в этот plan не входит.

---

## Self-review notes

- Spec §11 — все three workers (extract-bible, auto-tag, sweeper) ✓
- Spec §7 «Stream loads prior state для N>1» ✓ Task 8
- Spec §11 «singleton-debounce на chapterId» ✓ Task 7 — `singletonKey: id`
- `Job` legacy model выпилен — Plan B Task 2
- `StoryTag.prefilled` + `Story.aiTagSuggestion` — нужны для будущего edit-метаданных UI; сам UI — backlog. Worker пишет в них.
- Auto-tag НЕ persist'ит rating/warnings/category — pre-dev §2: «обязательно подтверждаются юзером».
- Test coverage: handlers (mocked LLM), enqueue wiring (mocked boss), schema validation. Real pg_boss roundtrip — manual smoke (Task 11).

---

После завершения Plan B → переход в Plan C (Inline edit).
