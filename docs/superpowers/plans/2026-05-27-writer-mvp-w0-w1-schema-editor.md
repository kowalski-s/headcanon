# Writer MVP — W0 (schema) + W1 (editor) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Автор создаёт приватную WRITTEN-историю, пишет главы в редакторе (TipTap), автосейв, публикует и читает через существующую читалку.

**Architecture:** Writer и generator живут на общих таблицах `Story`/`Chapter` с дискриминатором `Story.source`. Главы хранятся как markdown в `Chapter.text`; читалка получает `paragraphs: string[]`, поэтому для WRITTEN добавляется адаптер markdown→paragraphs. Tag-based video gating закладывается данными (`Tag.isCanonicalIp`) и хелпером, без UI.

**Tech Stack:** Next.js 15 (App Router), Prisma 7 (+ adapter-pg), Postgres (self-hosted Supabase dev на Cloud), TipTap 2 (ProseMirror), Vitest (`--project=unit`, jsdom), TypeScript, zod 4.

**Спека:** `docs/superpowers/specs/2026-05-27-writer-mvp-design.md`. **Тикеты:** handoff/TASKS.md → W0, W1.

**Соглашения репо (важно для исполнителя):**

- Запуск одного теста: `pnpm test <path-filter>` (раскрывается в `vitest run --project=unit <path-filter>`).
- API route-тесты: импортируют хендлер напрямую, `NextRequest`, заголовок `x-test-user-id`, `createTestUser` из `@/lib/test-fixtures`, чистка через `prisma.*.deleteMany()` в `beforeEach`. **Пользователей не удалять** (другие файлы шарят USER_ID) — upsert.
- Prisma client: `import { prisma } from '@/lib/prisma'`. Auth: `import { getUserIdOrThrow } from '@/lib/auth/server'`.
- Миграции: `pnpm db:migrate --name <name>` (читает `.env`, генерит client). Сид: `pnpm db:seed`.
- Коммиты частые, по одному на задачу. Solo dev — коммитим прямо в `main`.

---

## File Structure

**W0 (создаётся/меняется):**

- Modify: `prisma/schema.prisma` — `StorySource` enum, `Story.source`, `Tag.isCanonicalIp`, `Note`, `AiThread`, `AiMessage`, обратные связи на `User`/`Story`.
- Create: `prisma/migrations/<ts>_writer_mvp_w0/migration.sql` (через prisma, с ручным backfill).
- Create: `lib/gating.ts` — `storyHasCanonicalIp()`.
- Create: `lib/gating.test.ts`.
- Modify: `prisma/seed.ts` — `isCanonicalIp = true` для канонных фандом-тегов.

**W1 (создаётся):**

- Create: `lib/markdown.ts` — `tiptapDocToMarkdown()`, `markdownToParagraphs()`.
- Create: `lib/markdown.test.ts`.
- Create: `app/api/write/story/route.ts` (POST), `route.test.ts`.
- Create: `app/api/write/story/[id]/route.ts` (PATCH/DELETE), `route.test.ts`.
- Create: `app/api/write/story/[id]/publish/route.ts` (POST), `route.test.ts`.
- Create: `app/api/write/chapter/route.ts` (POST), `app/api/write/chapter/[id]/route.ts` (PATCH/DELETE), `route.test.ts`.
- Create: `app/api/write/chapter/reorder/route.ts` (PATCH), `route.test.ts`.
- Create: `components/write/Editor.tsx`, `ChapterNav.tsx`, `StoryList.tsx`, `PublishToggle.tsx` + Storybook stories.
- Create: `app/write/page.tsx`, `app/write/[storyId]/page.tsx`.
- Create: `lib/reader/written-paragraphs.ts` + test — адаптер markdown→paragraphs для читалки.
- Modify: `components/reader/ReaderBody.tsx` — рендер inline `*italic*`/`**bold**` через новый `lib/markdown-inline.tsx` (безопасно для generator: без маркеров — no-op).
- Create: `lib/markdown-inline.tsx` + test.

---

## W0 — Schema foundation

### Task 1: `Story.source` дискриминатор

**Files:**

- Modify: `prisma/schema.prisma`
- Migration: `prisma/migrations/<ts>_story_source/migration.sql`

- [ ] **Step 1: Добавить enum и поле в схему**

В `prisma/schema.prisma` рядом с другими enum (после `enum ChapterStatus { ... }`) добавить:

```prisma
enum StorySource {
  WRITTEN
  GENERATED
}
```

В `model Story` добавить поле (после `premise`):

```prisma
  source          StorySource @default(WRITTEN)
```

- [ ] **Step 2: Сгенерировать миграцию**

Run: `pnpm db:migrate --name story_source`
Expected: создаётся `prisma/migrations/<ts>_story_source/migration.sql`, client регенерится.

- [ ] **Step 3: Дописать backfill в миграцию**

Все существующие истории построены generator-флоу. Открыть свежий `migration.sql`, в КОНЕЦ файла добавить:

```sql
-- Все истории, существовавшие до пивота v2 — generator path
UPDATE "Story" SET "source" = 'GENERATED' WHERE "createdAt" < NOW();
```

Re-apply: `pnpm db:migrate` (применит изменённый SQL к dev DB; если уже применён — `pnpm db:reset` на dev и повторить, dev DB не содержит прод-данных).

- [ ] **Step 4: Проверить тип**

Run: `pnpm db:generate && pnpm typecheck`
Expected: PASS, `StorySource` доступен в `@prisma/client`.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(schema): Story.source discriminator (WRITTEN|GENERATED), backfill existing→GENERATED"
```

---

### Task 2: `Tag.isCanonicalIp` + gating helper

**Files:**

- Modify: `prisma/schema.prisma`
- Create: `lib/gating.ts`, `lib/gating.test.ts`
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Написать падающий тест gating**

Create `lib/gating.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { storyHasCanonicalIp } from './gating';

describe('storyHasCanonicalIp', () => {
  it('true when a tag is canonical IP', () => {
    const story = { tags: [{ tag: { isCanonicalIp: false } }, { tag: { isCanonicalIp: true } }] };
    expect(storyHasCanonicalIp(story)).toBe(true);
  });

  it('false for original world (no canonical tags)', () => {
    const story = { tags: [{ tag: { isCanonicalIp: false } }] };
    expect(storyHasCanonicalIp(story)).toBe(false);
  });

  it('false when no tags', () => {
    expect(storyHasCanonicalIp({ tags: [] })).toBe(false);
  });
});
```

- [ ] **Step 2: Запустить — должен упасть**

Run: `pnpm test lib/gating.test.ts`
Expected: FAIL — `storyHasCanonicalIp` не существует.

- [ ] **Step 3: Реализовать хелпер**

Create `lib/gating.ts`:

```typescript
/** Story с подгруженными тегами (StoryTag[] → Tag.isCanonicalIp). */
export type StoryWithTagFlags = {
  tags: { tag: { isCanonicalIp: boolean } }[];
};

/**
 * true, если в тегах истории есть хотя бы один канонный фандом.
 * Видео-генерация (Phase 3) доступна ТОЛЬКО когда это false (оригинальный мир).
 */
export function storyHasCanonicalIp(story: StoryWithTagFlags): boolean {
  return story.tags.some((st) => st.tag.isCanonicalIp);
}
```

- [ ] **Step 4: Запустить — должен пройти**

Run: `pnpm test lib/gating.test.ts`
Expected: PASS (3 теста).

- [ ] **Step 5: Добавить поле в схему**

В `model Tag` добавить (после `count`):

```prisma
  isCanonicalIp Boolean @default(false)
```

Run: `pnpm db:migrate --name tag_canonical_ip`

- [ ] **Step 6: Сид канонных фандомов**

В `prisma/seed.ts` найти место, где апсёртятся фандом-теги (`type: 'FANDOM'`). Для канонных фандомов выставить флаг. Добавить/обновить upsert так, чтобы при создании/обновлении тега канонного фандома `isCanonicalIp: true`. Пример массива канонных слагов:

```typescript
const CANONICAL_FANDOM_SLUGS = [
  'harry-potter',
  'genshin-impact',
  'marvel',
  'naruto',
  'jujutsu-kaisen',
  'honkai-star-rail',
];
// при upsert фандом-тега:
//   update: { isCanonicalIp: CANONICAL_FANDOM_SLUGS.includes(slug) },
//   create: { ..., isCanonicalIp: CANONICAL_FANDOM_SLUGS.includes(slug) },
```

> Примечание: `all-for-the-game` (AftG) — beachhead, но НЕ крупный IP-правообладатель; оставить `isCanonicalIp: false` (видео разрешено). Канонными метим только агрессивных правообладателей.

Run: `pnpm db:seed`
Expected: без ошибок; в `prisma studio` фандом-теги из списка имеют `isCanonicalIp = true`.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations prisma/seed.ts lib/gating.ts lib/gating.test.ts
git commit -m "feat(gating): Tag.isCanonicalIp + storyHasCanonicalIp helper + seed canonical fandoms"
```

---

### Task 3: `Note` model

**Files:**

- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Добавить модель и обратные связи**

В `prisma/schema.prisma` добавить модель:

```prisma
model Note {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  storyId   String?  @db.Uuid
  story     Story?   @relation(fields: [storyId], references: [id], onDelete: Cascade)
  title     String?
  body      String   @default("")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, updatedAt])
  @@index([storyId])
}
```

В `model User` добавить: `notes  Note[]`
В `model Story` добавить: `notes  Note[]`

- [ ] **Step 2: Миграция**

Run: `pnpm db:migrate --name note_model`
Expected: создана таблица `Note`.

- [ ] **Step 3: Проверить тип**

Run: `pnpm db:generate && pnpm typecheck`
Expected: PASS, `prisma.note` доступна.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(schema): Note model (global idea inbox + per-story)"
```

---

### Task 4: `AiThread` / `AiMessage` models

**Files:**

- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Добавить модели и связь**

```prisma
model AiThread {
  id        String      @id @default(uuid()) @db.Uuid
  storyId   String      @unique @db.Uuid
  story     Story       @relation(fields: [storyId], references: [id], onDelete: Cascade)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  messages  AiMessage[]
}

model AiMessage {
  id          String   @id @default(uuid()) @db.Uuid
  threadId    String   @db.Uuid
  thread      AiThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  role        String   // "user" | "assistant"
  action      String?  // "next_scene" | "idea" | "edit" | "socratic" | "chat"
  content     String
  payloadJson Json?
  createdAt   DateTime @default(now())

  @@index([threadId, createdAt])
}
```

В `model Story` добавить: `aiThread  AiThread?`

- [ ] **Step 2: Миграция**

Run: `pnpm db:migrate --name ai_thread`
Expected: созданы таблицы `AiThread`, `AiMessage`.

- [ ] **Step 3: Проверить тип**

Run: `pnpm db:generate && pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(schema): AiThread + AiMessage (one thread per story, persisted)"
```

---

## W1 — Writer editor

### Task 5: markdown ↔ paragraphs утилита

**Files:**

- Create: `lib/markdown.ts`, `lib/markdown.test.ts`

TipTap отдаёт JSON-документ. Храним главу как markdown в `Chapter.text`. Минимальный конфиг: paragraph, heading (h2/h3), bold, italic, horizontalRule (scene-break).

- [ ] **Step 1: Написать падающий тест**

Create `lib/markdown.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { tiptapDocToMarkdown, markdownToParagraphs } from './markdown';

const doc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Привет ' },
        { type: 'text', marks: [{ type: 'italic' }], text: 'мир' },
      ],
    },
    { type: 'horizontalRule' },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Глава' }] },
    { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'жирный' }] },
  ],
};

describe('tiptapDocToMarkdown', () => {
  it('serializes paragraphs, marks, hr, headings', () => {
    expect(tiptapDocToMarkdown(doc)).toBe('Привет *мир*\n\n---\n\n## Глава\n\n**жирный**');
  });
  it('empty doc → empty string', () => {
    expect(tiptapDocToMarkdown({ type: 'doc', content: [] })).toBe('');
  });
});

describe('markdownToParagraphs', () => {
  it('splits on blank lines, keeps hr as its own block', () => {
    expect(markdownToParagraphs('a\n\n---\n\nb')).toEqual(['a', '---', 'b']);
  });
  it('strips heading marker but keeps text as a paragraph', () => {
    expect(markdownToParagraphs('## Глава\n\nтекст')).toEqual(['Глава', 'текст']);
  });
});
```

- [ ] **Step 2: Запустить — упадёт**

Run: `pnpm test lib/markdown.test.ts`
Expected: FAIL — модуль не существует.

- [ ] **Step 3: Реализовать**

Create `lib/markdown.ts`:

```typescript
type Mark = { type: string };
type Node = {
  type: string;
  text?: string;
  marks?: Mark[];
  attrs?: { level?: number };
  content?: Node[];
};

function inline(nodes: Node[] = []): string {
  return nodes
    .map((n) => {
      let t = n.text ?? '';
      const marks = new Set((n.marks ?? []).map((m) => m.type));
      if (marks.has('bold')) t = `**${t}**`;
      if (marks.has('italic')) t = `*${t}*`;
      return t;
    })
    .join('');
}

/** TipTap JSON-документ → markdown. Поддержка: paragraph, heading(h2/h3), bold, italic, horizontalRule. */
export function tiptapDocToMarkdown(doc: Node): string {
  const blocks = (doc.content ?? []).map((node) => {
    switch (node.type) {
      case 'paragraph':
        return inline(node.content);
      case 'heading':
        return `${'#'.repeat(node.attrs?.level ?? 2)} ${inline(node.content)}`;
      case 'horizontalRule':
        return '---';
      default:
        return inline(node.content);
    }
  });
  return blocks.join('\n\n').trim();
}

/** markdown → массив параграфов для читалки. Заголовки → текст без маркера; hr остаётся как '---'. */
export function markdownToParagraphs(md: string): string[] {
  return md
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => b.replace(/^#{1,6}\s+/, ''));
}
```

- [ ] **Step 4: Запустить — пройдёт**

Run: `pnpm test lib/markdown.test.ts`
Expected: PASS (4 теста).

- [ ] **Step 5: Commit**

```bash
git add lib/markdown.ts lib/markdown.test.ts
git commit -m "feat(write): markdown serialization (tiptap doc ↔ markdown ↔ paragraphs)"
```

---

### Task 6: POST `/api/write/story` — создать WRITTEN-историю

**Files:**

- Create: `app/api/write/story/route.ts`, `app/api/write/story/route.test.ts`

- [ ] **Step 1: Написать падающий тест**

Create `app/api/write/story/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { POST as createStory } from './route';
import { NextRequest } from 'next/server';
import { createTestUser } from '@/lib/test-fixtures';
import { prisma } from '@/lib/prisma';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const auth = { 'x-test-user-id': USER_ID };

describe('POST /api/write/story', () => {
  beforeEach(async () => {
    await createTestUser(USER_ID);
  });

  it('creates a WRITTEN private story with an empty first chapter', async () => {
    const res = await createStory(
      new NextRequest('http://x', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ title: 'Моя история' }),
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    const story = await prisma.story.findUniqueOrThrow({
      where: { id: json.storyId },
      include: { chapters: true },
    });
    expect(story.source).toBe('WRITTEN');
    expect(story.visibility).toBe('PRIVATE');
    expect(story.authorId).toBe(USER_ID);
    expect(story.chapters).toHaveLength(1);
    expect(story.chapters[0].ordinal).toBe(1);
    expect(story.chapters[0].status).toBe('DRAFT');
  });

  it('401 when unauthenticated', async () => {
    const res = await createStory(new NextRequest('http://x', { method: 'POST', body: '{}' }));
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Запустить — упадёт**

Run: `pnpm test app/api/write/story/route.test.ts`
Expected: FAIL — route не существует.

- [ ] **Step 3: Реализовать route**

Create `app/api/write/story/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

const Body = z.object({ title: z.string().trim().min(1).max(200).default('Без названия') });

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await getUserIdOrThrow(req);
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  const title = parsed.success ? parsed.data.title : 'Без названия';

  const story = await prisma.$transaction(async (tx) => {
    const s = await tx.story.create({
      data: { authorId: userId, title, source: 'WRITTEN', visibility: 'PRIVATE' },
    });
    await tx.chapter.create({ data: { storyId: s.id, ordinal: 1, status: 'DRAFT', text: '' } });
    return s;
  });
  return NextResponse.json({ storyId: story.id });
}
```

- [ ] **Step 4: Запустить — пройдёт**

Run: `pnpm test app/api/write/story/route.test.ts`
Expected: PASS (2 теста).

- [ ] **Step 5: Commit**

```bash
git add app/api/write/story/route.ts app/api/write/story/route.test.ts
git commit -m "feat(write): POST /api/write/story — create WRITTEN story + first chapter"
```

---

### Task 7: PATCH/DELETE `/api/write/story/[id]`

**Files:**

- Create: `app/api/write/story/[id]/route.ts`, `app/api/write/story/[id]/route.test.ts`

- [ ] **Step 1: Написать падающий тест**

Create `app/api/write/story/[id]/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { PATCH, DELETE } from './route';
import { NextRequest } from 'next/server';
import { createTestUser } from '@/lib/test-fixtures';
import { prisma } from '@/lib/prisma';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const auth = { 'x-test-user-id': USER_ID };

async function makeStory() {
  await createTestUser(USER_ID);
  return prisma.story.create({
    data: { authorId: USER_ID, title: 't', source: 'WRITTEN', visibility: 'PRIVATE' },
  });
}

describe('PATCH/DELETE /api/write/story/[id]', () => {
  beforeEach(async () => {
    await createTestUser(USER_ID);
  });

  it('PATCH updates title and premise', async () => {
    const s = await makeStory();
    const res = await PATCH(
      new NextRequest('http://x', {
        method: 'PATCH',
        headers: auth,
        body: JSON.stringify({ title: 'Новое', premise: 'завязка' }),
      }),
      { params: Promise.resolve({ id: s.id }) },
    );
    expect(res.status).toBe(200);
    const after = await prisma.story.findUniqueOrThrow({ where: { id: s.id } });
    expect(after.title).toBe('Новое');
    expect(after.premise).toBe('завязка');
  });

  it('PATCH 404 for другого пользователя', async () => {
    const s = await makeStory();
    const res = await PATCH(
      new NextRequest('http://x', {
        method: 'PATCH',
        headers: { 'x-test-user-id': '00000000-0000-0000-0000-000000000002' },
        body: JSON.stringify({ title: 'x' }),
      }),
      { params: Promise.resolve({ id: s.id }) },
    );
    expect(res.status).toBe(404);
  });

  it('DELETE removes the story', async () => {
    const s = await makeStory();
    const res = await DELETE(new NextRequest('http://x', { method: 'DELETE', headers: auth }), {
      params: Promise.resolve({ id: s.id }),
    });
    expect(res.status).toBe(200);
    expect(await prisma.story.findUnique({ where: { id: s.id } })).toBeNull();
  });
});
```

- [ ] **Step 2: Запустить — упадёт**

Run: `pnpm test app/api/write/story/[id]/route.test.ts`
Expected: FAIL — route не существует.

- [ ] **Step 3: Реализовать route**

Create `app/api/write/story/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

const Patch = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  premise: z.string().max(2000).optional(),
  visibility: z.enum(['PRIVATE', 'UNLISTED', 'PUBLIC']).optional(),
});

async function ownStoryOr404(req: NextRequest, id: string) {
  const userId = await getUserIdOrThrow(req);
  const story = await prisma.story.findUnique({ where: { id } });
  if (!story || story.authorId !== userId) return null;
  return story;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let story;
  try {
    story = await ownStoryOr404(req, id);
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  if (!story) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const parsed = Patch.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  await prisma.story.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let story;
  try {
    story = await ownStoryOr404(req, id);
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  if (!story) return NextResponse.json({ error: 'not found' }, { status: 404 });
  await prisma.story.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Запустить — пройдёт**

Run: `pnpm test app/api/write/story/[id]/route.test.ts`
Expected: PASS (3 теста).

- [ ] **Step 5: Commit**

```bash
git add "app/api/write/story/[id]/route.ts" "app/api/write/story/[id]/route.test.ts"
git commit -m "feat(write): PATCH/DELETE story — title/premise/visibility + ownership guard"
```

---

### Task 8: Chapter CRUD + autosave

**Files:**

- Create: `app/api/write/chapter/route.ts` (POST), `app/api/write/chapter/[id]/route.ts` (PATCH/DELETE), `app/api/write/chapter/route.test.ts`

- [ ] **Step 1: Написать падающий тест**

Create `app/api/write/chapter/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { POST as createChapter } from './route';
import { PATCH as patchChapter, DELETE as deleteChapter } from './[id]/route';
import { NextRequest } from 'next/server';
import { createTestUser } from '@/lib/test-fixtures';
import { prisma } from '@/lib/prisma';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const auth = { 'x-test-user-id': USER_ID };

async function story() {
  await createTestUser(USER_ID);
  return prisma.story.create({
    data: { authorId: USER_ID, title: 't', source: 'WRITTEN', visibility: 'PRIVATE' },
  });
}

describe('write chapter API', () => {
  beforeEach(async () => {
    await createTestUser(USER_ID);
  });

  it('POST appends chapter with next ordinal', async () => {
    const s = await story();
    await prisma.chapter.create({ data: { storyId: s.id, ordinal: 1, status: 'DRAFT', text: '' } });
    const res = await createChapter(
      new NextRequest('http://x', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ storyId: s.id }),
      }),
    );
    expect(res.status).toBe(200);
    const { chapterId } = await res.json();
    const ch = await prisma.chapter.findUniqueOrThrow({ where: { id: chapterId } });
    expect(ch.ordinal).toBe(2);
  });

  it('PATCH autosaves text + sets userEdited', async () => {
    const s = await story();
    const ch = await prisma.chapter.create({
      data: { storyId: s.id, ordinal: 1, status: 'DRAFT', text: '' },
    });
    const res = await patchChapter(
      new NextRequest('http://x', {
        method: 'PATCH',
        headers: auth,
        body: JSON.stringify({ text: 'Первый абзац.\n\nВторой.', title: 'Глава 1' }),
      }),
      { params: Promise.resolve({ id: ch.id }) },
    );
    expect(res.status).toBe(200);
    const after = await prisma.chapter.findUniqueOrThrow({ where: { id: ch.id } });
    expect(after.text).toBe('Первый абзац.\n\nВторой.');
    expect(after.title).toBe('Глава 1');
    expect(after.userEdited).toBe(true);
  });

  it('PATCH 404 для чужой главы', async () => {
    const s = await story();
    const ch = await prisma.chapter.create({
      data: { storyId: s.id, ordinal: 1, status: 'DRAFT', text: '' },
    });
    const res = await patchChapter(
      new NextRequest('http://x', {
        method: 'PATCH',
        headers: { 'x-test-user-id': '00000000-0000-0000-0000-000000000002' },
        body: JSON.stringify({ text: 'x' }),
      }),
      { params: Promise.resolve({ id: ch.id }) },
    );
    expect(res.status).toBe(404);
  });

  it('DELETE removes chapter', async () => {
    const s = await story();
    const ch = await prisma.chapter.create({
      data: { storyId: s.id, ordinal: 2, status: 'DRAFT', text: '' },
    });
    const res = await deleteChapter(
      new NextRequest('http://x', { method: 'DELETE', headers: auth }),
      { params: Promise.resolve({ id: ch.id }) },
    );
    expect(res.status).toBe(200);
    expect(await prisma.chapter.findUnique({ where: { id: ch.id } })).toBeNull();
  });
});
```

- [ ] **Step 2: Запустить — упадёт**

Run: `pnpm test app/api/write/chapter/route.test.ts`
Expected: FAIL — routes не существуют.

- [ ] **Step 3: Реализовать POST**

Create `app/api/write/chapter/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

const Body = z.object({ storyId: z.string().uuid() });

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await getUserIdOrThrow(req);
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const story = await prisma.story.findUnique({ where: { id: parsed.data.storyId } });
  if (!story || story.authorId !== userId)
    return NextResponse.json({ error: 'not found' }, { status: 404 });

  const last = await prisma.chapter.findFirst({
    where: { storyId: story.id },
    orderBy: { ordinal: 'desc' },
  });
  const chapter = await prisma.chapter.create({
    data: { storyId: story.id, ordinal: (last?.ordinal ?? 0) + 1, status: 'DRAFT', text: '' },
  });
  return NextResponse.json({ chapterId: chapter.id, ordinal: chapter.ordinal });
}
```

- [ ] **Step 4: Реализовать PATCH/DELETE**

Create `app/api/write/chapter/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

const Patch = z.object({
  text: z.string().optional(),
  title: z.string().max(200).nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

async function ownChapterOr404(req: NextRequest, id: string) {
  const userId = await getUserIdOrThrow(req);
  const ch = await prisma.chapter.findUnique({ where: { id }, include: { story: true } });
  if (!ch || ch.story.authorId !== userId) return null;
  return ch;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let ch;
  try {
    ch = await ownChapterOr404(req, id);
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  if (!ch) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const parsed = Patch.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.text !== undefined) data.userEdited = true;
  await prisma.chapter.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let ch;
  try {
    ch = await ownChapterOr404(req, id);
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  if (!ch) return NextResponse.json({ error: 'not found' }, { status: 404 });
  await prisma.chapter.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Запустить — пройдёт**

Run: `pnpm test app/api/write/chapter/route.test.ts`
Expected: PASS (4 теста).

- [ ] **Step 6: Commit**

```bash
git add app/api/write/chapter
git commit -m "feat(write): chapter CRUD — append/autosave(text,title)/delete + ownership"
```

---

### Task 9: Reorder глав

**Files:**

- Create: `app/api/write/chapter/reorder/route.ts`, `app/api/write/chapter/reorder/route.test.ts`

- [ ] **Step 1: Написать падающий тест**

Create `app/api/write/chapter/reorder/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { PATCH as reorder } from './route';
import { NextRequest } from 'next/server';
import { createTestUser } from '@/lib/test-fixtures';
import { prisma } from '@/lib/prisma';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const auth = { 'x-test-user-id': USER_ID };

describe('PATCH /api/write/chapter/reorder', () => {
  beforeEach(async () => {
    await createTestUser(USER_ID);
  });

  it('reorders chapters by provided id sequence', async () => {
    const s = await prisma.story.create({
      data: { authorId: USER_ID, title: 't', source: 'WRITTEN', visibility: 'PRIVATE' },
    });
    const a = await prisma.chapter.create({
      data: { storyId: s.id, ordinal: 1, status: 'DRAFT', text: 'A' },
    });
    const b = await prisma.chapter.create({
      data: { storyId: s.id, ordinal: 2, status: 'DRAFT', text: 'B' },
    });
    const res = await reorder(
      new NextRequest('http://x', {
        method: 'PATCH',
        headers: auth,
        body: JSON.stringify({ storyId: s.id, order: [b.id, a.id] }),
      }),
    );
    expect(res.status).toBe(200);
    const after = await prisma.chapter.findMany({
      where: { storyId: s.id },
      orderBy: { ordinal: 'asc' },
    });
    expect(after.map((c) => c.id)).toEqual([b.id, a.id]);
    expect(after.map((c) => c.ordinal)).toEqual([1, 2]);
  });
});
```

- [ ] **Step 2: Запустить — упадёт**

Run: `pnpm test app/api/write/chapter/reorder/route.test.ts`
Expected: FAIL.

- [ ] **Step 3: Реализовать**

Уникальный constraint `@@unique([storyId, ordinal])` запрещает прямое присвоение пересекающихся ordinal. Делаем в две фазы внутри транзакции: сперва сдвигаем все в безопасный диапазон (отрицательные), затем расставляем 1..N.

Create `app/api/write/chapter/reorder/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

const Body = z.object({ storyId: z.string().uuid(), order: z.array(z.string().uuid()).min(1) });

export async function PATCH(req: NextRequest) {
  let userId: string;
  try {
    userId = await getUserIdOrThrow(req);
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const { storyId, order } = parsed.data;

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: { chapters: { select: { id: true } } },
  });
  if (!story || story.authorId !== userId)
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  const existing = new Set(story.chapters.map((c) => c.id));
  if (order.length !== existing.size || !order.every((id) => existing.has(id))) {
    return NextResponse.json({ error: 'bad_request', reason: 'order_mismatch' }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    // фаза 1: сдвиг в отрицательный диапазон, чтобы не конфликтовать с unique
    await Promise.all(
      order.map((id, i) => tx.chapter.update({ where: { id }, data: { ordinal: -(i + 1) } })),
    );
    // фаза 2: финальные 1..N
    await Promise.all(
      order.map((id, i) => tx.chapter.update({ where: { id }, data: { ordinal: i + 1 } })),
    );
  });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Запустить — пройдёт**

Run: `pnpm test app/api/write/chapter/reorder/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/write/chapter/reorder
git commit -m "feat(write): chapter reorder — two-phase ordinal reassign within transaction"
```

---

### Task 10: POST `/api/write/story/[id]/publish`

**Files:**

- Create: `app/api/write/story/[id]/publish/route.ts`, `app/api/write/story/[id]/publish/route.test.ts`

- [ ] **Step 1: Написать падающий тест**

Create `app/api/write/story/[id]/publish/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { POST as publish } from './route';
import { NextRequest } from 'next/server';
import { createTestUser } from '@/lib/test-fixtures';
import { prisma } from '@/lib/prisma';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const auth = { 'x-test-user-id': USER_ID };

describe('POST publish', () => {
  beforeEach(async () => {
    await createTestUser(USER_ID);
  });

  it('publish=true → PUBLIC + chapters with text become PUBLISHED', async () => {
    const s = await prisma.story.create({
      data: { authorId: USER_ID, title: 't', source: 'WRITTEN', visibility: 'PRIVATE' },
    });
    await prisma.chapter.create({
      data: { storyId: s.id, ordinal: 1, status: 'DRAFT', text: 'есть текст' },
    });
    await prisma.chapter.create({ data: { storyId: s.id, ordinal: 2, status: 'DRAFT', text: '' } });
    const res = await publish(
      new NextRequest('http://x', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ publish: true }),
      }),
      { params: Promise.resolve({ id: s.id }) },
    );
    expect(res.status).toBe(200);
    const after = await prisma.story.findUniqueOrThrow({
      where: { id: s.id },
      include: { chapters: { orderBy: { ordinal: 'asc' } } },
    });
    expect(after.visibility).toBe('PUBLIC');
    expect(after.publishedAt).not.toBeNull();
    expect(after.chapters[0].status).toBe('PUBLISHED'); // есть текст
    expect(after.chapters[1].status).toBe('DRAFT'); // пустая остаётся черновиком
  });

  it('publish=false → back to PRIVATE', async () => {
    const s = await prisma.story.create({
      data: {
        authorId: USER_ID,
        title: 't',
        source: 'WRITTEN',
        visibility: 'PUBLIC',
        publishedAt: new Date(),
      },
    });
    const res = await publish(
      new NextRequest('http://x', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ publish: false }),
      }),
      { params: Promise.resolve({ id: s.id }) },
    );
    expect(res.status).toBe(200);
    const after = await prisma.story.findUniqueOrThrow({ where: { id: s.id } });
    expect(after.visibility).toBe('PRIVATE');
  });
});
```

- [ ] **Step 2: Запустить — упадёт**

Run: `pnpm test app/api/write/story/[id]/publish/route.test.ts`
Expected: FAIL.

- [ ] **Step 3: Реализовать**

Create `app/api/write/story/[id]/publish/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

const Body = z.object({ publish: z.boolean() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let userId: string;
  try {
    userId = await getUserIdOrThrow(req);
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const story = await prisma.story.findUnique({ where: { id } });
  if (!story || story.authorId !== userId)
    return NextResponse.json({ error: 'not found' }, { status: 404 });

  if (parsed.data.publish) {
    await prisma.$transaction([
      prisma.story.update({
        where: { id },
        data: { visibility: 'PUBLIC', publishedAt: story.publishedAt ?? new Date() },
      }),
      prisma.chapter.updateMany({
        where: { storyId: id, NOT: { text: '' } },
        data: { status: 'PUBLISHED' },
      }),
    ]);
  } else {
    await prisma.story.update({ where: { id }, data: { visibility: 'PRIVATE' } });
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Запустить — пройдёт**

Run: `pnpm test app/api/write/story/[id]/publish/route.test.ts`
Expected: PASS (2 теста).

- [ ] **Step 5: Commit**

```bash
git add "app/api/write/story/[id]/publish"
git commit -m "feat(write): publish toggle — story PUBLIC + non-empty chapters PUBLISHED"
```

---

### Task 11: Адаптер читалки для WRITTEN-историй

Читалка (`ReaderBody`) принимает `paragraphs: string[]`. Generator-истории берут параграфы из `Paragraph[]`; WRITTEN-истории хранят markdown в `Chapter.text`. Добавляем чистую функцию.

**Files:**

- Create: `lib/reader/written-paragraphs.ts`, `lib/reader/written-paragraphs.test.ts`

- [ ] **Step 1: Написать падающий тест**

Create `lib/reader/written-paragraphs.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { chapterToParagraphs } from './written-paragraphs';

describe('chapterToParagraphs', () => {
  it('GENERATED: joins Paragraph rows', () => {
    const ch = { text: '', paragraphs: [{ text: 'a' }, { text: 'b' }] };
    expect(chapterToParagraphs(ch)).toEqual(['a', 'b']);
  });
  it('WRITTEN: splits markdown text on blank lines, strips heading markers', () => {
    const ch = { text: '## Заголовок\n\nПервый.\n\nВторой.', paragraphs: [] };
    expect(chapterToParagraphs(ch)).toEqual(['Заголовок', 'Первый.', 'Второй.']);
  });
});
```

- [ ] **Step 2: Запустить — упадёт**

Run: `pnpm test lib/reader/written-paragraphs.test.ts`
Expected: FAIL.

- [ ] **Step 3: Реализовать**

Create `lib/reader/written-paragraphs.ts`:

```typescript
import { markdownToParagraphs } from '@/lib/markdown';

type ChapterLike = { text: string; paragraphs: { text: string }[] };

/**
 * Единый источник параграфов для читалки.
 * Если есть Paragraph-строки (generator path) — используем их.
 * Иначе (writer path) — разбиваем markdown `text` на параграфы.
 */
export function chapterToParagraphs(ch: ChapterLike): string[] {
  if (ch.paragraphs.length > 0) return ch.paragraphs.map((p) => p.text);
  return markdownToParagraphs(ch.text);
}
```

- [ ] **Step 4: Запустить — пройдёт**

Run: `pnpm test lib/reader/written-paragraphs.test.ts`
Expected: PASS (2 теста).

- [ ] **Step 5: Подключить в reader-страницу**

В `app/(reader)/reader/[storyId]/[chapterN]/ReaderPageView.tsx` (или серверном prefetch, где главе сопоставляются параграфы) использовать `chapterToParagraphs(chapter)` вместо прямого `chapter.paragraphs.map(...)`. Убедиться, что запрос главы делает `include: { paragraphs: { orderBy: { ordinal: 'asc' } } }` и поле `text` тоже выбирается. Запустить существующие reader-тесты, чтобы не сломать generator path:

Run: `pnpm test app/\(reader\)`
Expected: PASS (существующие reader-тесты зелёные).

- [ ] **Step 6: Commit**

```bash
git add lib/reader/written-paragraphs.ts lib/reader/written-paragraphs.test.ts "app/(reader)"
git commit -m "feat(reader): chapterToParagraphs adapter — WRITTEN reads markdown text, GENERATED reads Paragraph rows"
```

---

### Task 12: Inline markdown в читалке (bold/italic)

WRITTEN-главы содержат `*italic*` / `**bold**`. Generator-текст маркеров не содержит → рендер no-op. Добавляем чистый рендер inline-маркдауна и подключаем в `ParagraphLine`.

**Files:**

- Create: `lib/markdown-inline.tsx`, `lib/markdown-inline.test.tsx`
- Modify: `components/reader/ReaderBody.tsx`

- [ ] **Step 1: Написать падающий тест**

Create `lib/markdown-inline.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { renderInline } from './markdown-inline';

describe('renderInline', () => {
  it('renders bold and italic', () => {
    const { container } = render(<p>{renderInline('обычный **жирный** и *курсив*')}</p>);
    expect(container.querySelector('strong')?.textContent).toBe('жирный');
    expect(container.querySelector('em')?.textContent).toBe('курсив');
  });
  it('plain text без маркеров — без тегов', () => {
    const { container } = render(<p>{renderInline('просто текст')}</p>);
    expect(container.querySelector('strong')).toBeNull();
    expect(container.querySelector('em')).toBeNull();
    expect(container.textContent).toBe('просто текст');
  });
});
```

- [ ] **Step 2: Запустить — упадёт**

Run: `pnpm test lib/markdown-inline.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Реализовать**

Create `lib/markdown-inline.tsx`:

```tsx
import { Fragment, type ReactNode } from 'react';

// Сначала **bold**, затем *italic*. Порядок важен (** до *).
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

/** Рендерит inline markdown (**bold**, *italic*) в React-узлы. Без маркеров — возвращает строку как есть. */
export function renderInline(text: string): ReactNode {
  const parts = text.split(TOKEN).filter((s) => s !== '');
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
```

- [ ] **Step 4: Запустить — пройдёт**

Run: `pnpm test lib/markdown-inline.test.tsx`
Expected: PASS (2 теста).

- [ ] **Step 5: Подключить в `ParagraphLine`**

В `components/reader/ReaderBody.tsx`: импортировать `renderInline`. В `ParagraphLine` заменить вывод текста:

- для не-первого параграфа `{text}` → `{renderInline(text)}`
- для первого (drop cap) оставить `text.charAt(0)` как есть (drop-cap), а `text.slice(1)` → `{renderInline(text.slice(1))}`.

```tsx
import { renderInline } from '@/lib/markdown-inline';
// ...
// не-первый:
//   ) : (
//     renderInline(text)
//   )}
// первый (после span с drop-cap):
//   {renderInline(text.slice(1))}
```

- [ ] **Step 6: Прогнать reader-тесты и сторибук**

Run: `pnpm test components/reader && pnpm test app/\(reader\)`
Expected: PASS — generator-текст без маркеров рендерится идентично (no-op), reader-тесты зелёные.

- [ ] **Step 7: Commit**

```bash
git add lib/markdown-inline.tsx lib/markdown-inline.test.tsx components/reader/ReaderBody.tsx
git commit -m "feat(reader): inline markdown (bold/italic) rendering — no-op for generator text"
```

---

### Task 13: TipTap editor компонент

**Files:**

- Create: `components/write/Editor.tsx`, `components/write/Editor.stories.tsx`

- [ ] **Step 1: Установить TipTap**

Run: `pnpm add @tiptap/react @tiptap/pm @tiptap/starter-kit`
Expected: пакеты добавлены в `package.json`.

- [ ] **Step 2: Реализовать Editor**

Минимальный конфиг через StarterKit с отключением лишнего (lists, code, blockquote, codeBlock), оставляем paragraph/heading/bold/italic/horizontalRule. На изменение — debounce-колбэк с markdown (через `tiptapDocToMarkdown(editor.getJSON())`).

Create `components/write/Editor.tsx`:

```tsx
'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef } from 'react';
import { tiptapDocToMarkdown } from '@/lib/markdown';

type Props = {
  initialMarkdown: string;
  onSave: (markdown: string) => void; // debounced снаружи
};

export function Editor({ initialMarkdown, onSave }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editor = useEditor({
    immediatelyRender: false, // Next SSR
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        code: false,
        codeBlock: false,
        blockquote: false,
      }),
    ],
    // initialMarkdown — простой текст/markdown; StarterKit примет как параграфы.
    content: initialMarkdown,
    onUpdate: ({ editor }) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(
        () => onSave(tiptapDocToMarkdown(editor.getJSON() as never)),
        1500,
      );
    },
  });

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return <EditorContent editor={editor} className="prose-reader min-h-[300px] outline-none" />;
}
```

> Заметка про markdown→TipTap при загрузке: для MVP `content` принимает строку (TipTap трактует переводы строк как параграфы). Полноценный markdown-парсер inline-маркеров на вход — отдельная задача (не в этом плане); авторский ввод сериализуется в markdown на выходе через `tiptapDocToMarkdown`.

- [ ] **Step 3: Storybook story**

Create `components/write/Editor.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from './Editor';

const meta: Meta<typeof Editor> = {
  title: 'Write/Editor',
  component: Editor,
  args: { initialMarkdown: 'Первый абзац истории.\n\nВторой абзац.', onSave: () => {} },
};
export default meta;
export const Default: StoryObj<typeof Editor> = {};
```

- [ ] **Step 4: Проверить сборку сторибука/типы**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/write/Editor.tsx components/write/Editor.stories.tsx package.json pnpm-lock.yaml
git commit -m "feat(write): TipTap editor (minimal config) with debounced markdown save"
```

---

### Task 14: Workspace UI — StoryList, ChapterNav, PublishToggle, страницы

UI-склейка. Логика покрыта тестами выше; здесь — клиентские компоненты + стори. Используется `apiFetch` (`@/lib/api/client`) с заголовком dev-user.

**Files:**

- Create: `components/write/StoryList.tsx`, `components/write/ChapterNav.tsx`, `components/write/PublishToggle.tsx` (+ `.stories.tsx` для каждого)
- Create: `app/write/page.tsx`, `app/write/[storyId]/page.tsx`

- [ ] **Step 1: StoryList + story**

Create `components/write/StoryList.tsx` — принимает `stories: { id, title, visibility }[]`, рендерит список ссылок на `/write/[id]` с бейджем статуса (`PRIVATE`/`PUBLIC`) и кнопкой «+ Новая история» (POST `/api/write/story` → redirect). Бейдж — `<MonoBadge>` из `components/ui`.

Create `components/write/StoryList.stories.tsx` с фикстурой из 2 историй (одна PRIVATE, одна PUBLIC).

- [ ] **Step 2: ChapterNav**

Create `components/write/ChapterNav.tsx` — список глав истории (ordinal + title|«Глава N»), активная подсвечена, кнопки «+ глава» (POST chapter), удалить (DELETE chapter с confirm). Reorder — drag опционально; для MVP кнопки ↑/↓, вызывающие PATCH reorder с переставленным массивом id.

Create `components/write/ChapterNav.stories.tsx`.

- [ ] **Step 3: PublishToggle**

Create `components/write/PublishToggle.tsx` — переключатель PUBLIC/PRIVATE (POST publish), показывает текущий `visibility`, ссылку «Открыть в читалке» (`/reader/[storyId]/1`) когда PUBLIC.

Create `components/write/PublishToggle.stories.tsx`.

- [ ] **Step 4: Страницы workspace**

Create `app/write/page.tsx` — server component: грузит истории автора (`prisma.story.findMany({ where: { authorId, source: 'WRITTEN' }, orderBy: { updatedAt: 'desc' } })`, userId через dev-stub на сервере или header), рендерит `<StoryList>`.

Create `app/write/[storyId]/page.tsx` — server component: грузит story + chapters (ownership-проверка, иначе `notFound()`), рендерит layout: слева `<ChapterNav>`, по центру `<Editor>` для выбранной главы (по query `?ch=ordinal`, по умолчанию 1) с автосейвом через `apiFetch('PATCH /api/write/chapter/[id]')`, сверху `<PublishToggle>`. (AI-панель — отдельный план W3, здесь оставить место/заглушку-кнопку без логики.)

- [ ] **Step 5: Проверить типы и ручной прогон**

Run: `pnpm typecheck`
Expected: PASS.

Ручная проверка (опиши, не автоматизируй): `pnpm dev` → `/write` → создать историю → написать 2 абзаца (автосейв «сохранено») → добавить главу 2 → опубликовать → «Открыть в читалке» показывает текст с курсивом/жирным.

- [ ] **Step 6: Commit**

```bash
git add components/write app/write
git commit -m "feat(write): writer workspace UI — StoryList, ChapterNav, PublishToggle, /write pages"
```

---

## Финальная проверка фазы

- [ ] **Прогнать весь unit-проект**

Run: `pnpm test`
Expected: все тесты зелёные (новые + существующие generator/reader не сломаны). Учесть [[feedback_subagent_verify]] — проверить вывод глазами, не доверять «DONE».

- [ ] **Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

---

## Self-review заметки (для исполнителя)

- **Покрытие спеки:** Task 1-4 = W0 (Story.source, Tag.isCanonicalIp+helper, Note, AiThread/AiMessage). Task 5-14 = W1 (editor, chapter CRUD/autosave, reorder, publish, reader-адаптер, inline-md, TipTap, workspace UI). Заметки (W2-01), character bible (W2), AI-ассистент (W3), onboarding (W4) — **отдельные планы**, не здесь.
- **Совместимость с generator:** `Story.source` default WRITTEN, но backfill существующих → GENERATED (Task 1 Step 3). Reader-адаптер (Task 11) сохраняет generator-путь (Paragraph rows приоритетны). Inline-md (Task 12) — no-op без маркеров.
- **Типы согласованы:** `tiptapDocToMarkdown`/`markdownToParagraphs` (Task 5) используются в Task 11/13; `chapterToParagraphs` (Task 11) в reader-странице; `renderInline` (Task 12) в `ParagraphLine`.
- **Live DB:** тесты шарят dev Postgres — upsert для shared rows ([[project_test_db_isolation]]), пользователей не удалять, `fileParallelism: false` уже в конфиге. Если стрим/persist тормозит — `15_000ms` таймаут ([[project_streaming_test_timeouts]]).

## Следующие планы (после этого)

- W2 — toolkit: Note API+UI, CharacterBible (+AI-extract), WorldPanel.
- W3 — AI-ассистент: context assembly, prompts, chat panel, AiThread persistence, лимиты.
- W4 — onboarding 3 экрана, generator как secondary, source-бейдж в ленте, tracking saves/completion.
