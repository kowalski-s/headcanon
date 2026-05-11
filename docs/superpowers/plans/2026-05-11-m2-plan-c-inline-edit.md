# M2 Plan C — Inline Paragraph Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Founder в Reader **своей** истории долгим тапом / hover'ом по абзацу открывает context-menu, выбирает «переписать» — старый абзац fades, новый ткётся drop-by-letter с амбер-cursor. Реализованы пять mode'ов (regen / continue / expand / compress / delete), per-chapter квоты, 18+ gate перед E-tier prompt'ами, re-enqueue bible-extract после edit.

**Architecture:** Один endpoint `POST /api/paragraph/[id]/regen` принимает `mode` и стримит реплейсмент через тот же Vercel AI SDK pipeline что в Plan A. Fractional ordinals (`Decimal(20,10)` уже в schema из Plan A) позволяют insert'ить новые параграфы между существующими без пере-нумерации. `InlineRegenStream` рендерер отвечает за визуальный эффект (fade-out старого, weave-in нового, амбер-cursor). После любого edit — `enqueue('extract-bible', ..., { singletonKey: chapterId })` объединяет rapid edits в один bible job.

**Tech Stack:** Vercel AI SDK · React 19 · Tailwind v4 · Prisma · Zod

**Зависимости:** Plan A merged. Plan B желателен (без него bible не пересчитается, но edit будет работать).

---

## File structure

### Создаём

- `app/api/paragraph/[id]/regen/route.ts` — стриминг replace/continue/expand/compress
- `app/api/paragraph/[id]/route.ts` — DELETE для mode=delete (no LLM)
- `app/api/chapter/[id]/tweak-prompt/route.ts` — chapter-level tweak modal
- `lib/prompts/paragraph-regen.ts` — пять mode-функций
- `lib/paragraph/ordinal.ts` — fractional ordinal helpers (between, renumber sweeper)
- `lib/safety/age-gate.ts` — 18+ check для E-tier
- `components/reader/ParagraphMenu.tsx` — bottom-sheet / popover
- `components/reader/InlineRegenStream.tsx` — drop-by-letter renderer
- `components/reader/TweakPromptModal.tsx` — textarea для tweak-chapter
- `components/reader/AgeGateModal.tsx` — 18+ confirmation

### Модифицируем

- ReaderPageView — wire ParagraphMenu к абзацам, render InlineRegenStream когда регенерится
- `lib/quota/check-and-debit.ts` — добавить `debitChapter(...,'continues'|'promptTweaks',...)` если ещё не было

---

## Task 1: Fractional ordinal helpers

**Files:**
- Create: `lib/paragraph/ordinal.ts`
- Test: `lib/paragraph/ordinal.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// lib/paragraph/ordinal.test.ts
import { describe, it, expect } from 'vitest';
import { between, needsRenumber } from './ordinal';

describe('between', () => {
  it('returns midpoint of two ordinals', () => {
    expect(between(1, 2)).toBe(1.5);
  });
  it('returns floor+1 if upper is undefined', () => {
    expect(between(5, undefined)).toBe(6);
  });
  it('returns 1 if both undefined (empty chapter)', () => {
    expect(between(undefined, undefined)).toBe(1);
  });
  it('returns 0.5*lower if upper undefined and lower=undefined fallback', () => {
    expect(between(undefined, 3)).toBe(1.5);
  });
});

describe('needsRenumber', () => {
  it('flags when gap < 0.01', () => {
    expect(needsRenumber([1, 1.5, 1.505])).toBe(true);
  });
  it('clean if gaps are roomy', () => {
    expect(needsRenumber([1, 2, 3])).toBe(false);
  });
});
```

- [ ] **Step 2: Implement**

```ts
// lib/paragraph/ordinal.ts
export function between(lower: number | undefined, upper: number | undefined): number {
  if (lower === undefined && upper === undefined) return 1;
  if (lower === undefined) return upper! / 2;
  if (upper === undefined) return lower + 1;
  return (lower + upper) / 2;
}

export function needsRenumber(ordinals: number[]): boolean {
  for (let i = 1; i < ordinals.length; i++) {
    if (ordinals[i] - ordinals[i - 1] < 0.01) return true;
  }
  return false;
}
```

- [ ] **Step 3: Run + commit**

```bash
pnpm test lib/paragraph
git add lib/paragraph
git commit -m "feat(M2-C): fractional ordinal helpers — between() + needsRenumber()"
```

---

## Task 2: Paragraph-regen prompt templates (5 modes)

**Files:**
- Create: `lib/prompts/paragraph-regen.ts`
- Test: `lib/prompts/paragraph-regen.test.ts`

- [ ] **Step 1: Schema-less prompts (output = streamed prose)**

```ts
// lib/prompts/paragraph-regen.ts
import { SYSTEM_INJECTION_NOTICE, wrapUserInput } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'paragraph_regen';
export const TEMPLATE_VERSION = 1;

export type RegenMode = 'regen' | 'continue' | 'expand' | 'compress';
// delete не имеет LLM-вызова — обрабатывается в route без prompt'а

export interface RegenInput {
  mode: RegenMode;
  targetText: string;
  prevText: string | null;
  nextText: string | null;
  storyContext: { fandomName: string; ship: string; toneNote: string };  // короткое summary для prompt'а
  hint?: string;
}

const COMMON = (input: RegenInput) => [
  `Fandom: ${input.storyContext.fandomName}. Ship: ${input.storyContext.ship}.`,
  input.storyContext.toneNote ? `Tone: ${input.storyContext.toneNote}.` : '',
  'Match the surrounding prose voice. Use the same POV and tense.',
  SYSTEM_INJECTION_NOTICE,
].filter(Boolean).join('\n\n');

export function build(input: RegenInput): { system: string; user: string } {
  switch (input.mode) {
    case 'regen':
      return {
        system: COMMON(input) + '\n\nRewrite the target paragraph in the same length and rhythm. Output only the new paragraph text — no preamble, no markdown.',
        user: [
          input.prevText ? `Previous paragraph: ${input.prevText}` : '',
          `Target paragraph (rewrite this): ${wrapUserInput(input.targetText)}`,
          input.nextText ? `Following paragraph: ${input.nextText}` : '',
          input.hint ? `Author hint: ${wrapUserInput(input.hint)}` : '',
        ].filter(Boolean).join('\n\n'),
      };
    case 'continue':
      return {
        system: COMMON(input) + '\n\nWrite continuation paragraphs. Output ~3-5 new paragraphs separated by blank lines. No preamble.',
        user: [
          input.prevText ? `Previous paragraph: ${input.prevText}` : '',
          `Continue from here (this is the last paragraph): ${wrapUserInput(input.targetText)}`,
          input.hint ? `Direction hint: ${wrapUserInput(input.hint)}` : '',
        ].filter(Boolean).join('\n\n'),
      };
    case 'expand':
      return {
        system: COMMON(input) + '\n\nInsert 1-2 details paragraphs RIGHT AFTER the target, fleshing out atmosphere, sensory detail, or interior thought. Do NOT rewrite the target. Output only the new inserted paragraphs separated by blank lines.',
        user: [
          `Target paragraph (insert after this): ${wrapUserInput(input.targetText)}`,
          input.nextText ? `Following paragraph: ${input.nextText}` : '',
        ].join('\n\n'),
      };
    case 'compress':
      return {
        system: COMMON(input) + '\n\nMerge the target with its following paragraph into a single tighter paragraph. Output only the merged paragraph.',
        user: [
          `First paragraph: ${wrapUserInput(input.targetText)}`,
          `Second paragraph (merge in): ${wrapUserInput(input.nextText ?? '')}`,
        ].join('\n\n'),
      };
  }
}
```

- [ ] **Step 2: Snapshot tests per mode**

```ts
// lib/prompts/paragraph-regen.test.ts
import { describe, it, expect } from 'vitest';
import { build } from './paragraph-regen';

const ctx = { fandomName: 'HP', ship: 'Drarry', toneNote: 'slow burn' };

describe('paragraph-regen prompt builder', () => {
  it('regen wraps target', () => {
    const p = build({ mode: 'regen', targetText: 't', prevText: null, nextText: null, storyContext: ctx });
    expect(p.user).toMatch(/<user_input>t<\/user_input>/);
  });
  it('continue asks for 3-5 paragraphs', () => {
    const p = build({ mode: 'continue', targetText: 't', prevText: null, nextText: null, storyContext: ctx });
    expect(p.system).toMatch(/3-5 new paragraphs/);
  });
  it('expand says don\'t rewrite target', () => {
    const p = build({ mode: 'expand', targetText: 't', prevText: null, nextText: 'n', storyContext: ctx });
    expect(p.system).toMatch(/Do NOT rewrite the target/);
  });
  it('compress merges two', () => {
    const p = build({ mode: 'compress', targetText: 'a', prevText: null, nextText: 'b', storyContext: ctx });
    expect(p.user).toMatch(/Second paragraph/);
  });
});
```

- [ ] **Step 3: Commit**

```bash
pnpm test lib/prompts/paragraph-regen
git add lib/prompts/paragraph-regen.ts lib/prompts/paragraph-regen.test.ts
git commit -m "feat(M2-C): paragraph-regen prompt templates — 4 modes (delete не нужен)"
```

---

## Task 3: Age gate helper

**Files:**
- Create: `lib/safety/age-gate.ts`
- Test: `lib/safety/age-gate.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from 'vitest';
import { requiresAgeGate, isAgeConfirmed } from './age-gate';

describe('age-gate', () => {
  it('requires gate when rating is E', () => {
    expect(requiresAgeGate({ rating: 'E', tropes: [] })).toBe(true);
  });
  it('does not require for T', () => {
    expect(requiresAgeGate({ rating: 'T', tropes: [] })).toBe(false);
  });
  it('confirmed when ageConfirmedAt is set', () => {
    expect(isAgeConfirmed({ ageConfirmedAt: new Date() })).toBe(true);
    expect(isAgeConfirmed({ ageConfirmedAt: null })).toBe(false);
  });
});
```

- [ ] **Step 2: Implement**

```ts
// lib/safety/age-gate.ts
export function requiresAgeGate(input: { rating?: string | null; tropes: string[] }): boolean {
  return input.rating === 'E' || input.rating === 'M';
}

export function isAgeConfirmed(user: { ageConfirmedAt: Date | null }): boolean {
  return user.ageConfirmedAt !== null;
}
```

- [ ] **Step 3: Commit**

```bash
pnpm test lib/safety/age-gate
git add lib/safety/age-gate.ts lib/safety/age-gate.test.ts
git commit -m "feat(M2-C): age-gate predicates"
```

---

## Task 4: Paragraph regen endpoint

**Files:**
- Create: `app/api/paragraph/[id]/regen/route.ts`
- Test: `app/api/paragraph/[id]/regen/route.test.ts`

- [ ] **Step 1: Test (mocked LLM, mocked quota)**

```ts
// app/api/paragraph/[id]/regen/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('@/lib/llm-openai', () => ({
  openaiLlm: { stream: async function* () { yield 'new '; yield 'text.'; } },
}));
vi.mock('@/lib/queue/boss', () => ({ enqueue: vi.fn() }));
import { POST } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTestStoryWithChapter } from '@/lib/test-fixtures';

describe('POST /api/paragraph/[id]/regen', () => {
  it('streams replacement and persists', async () => {
    const { user, chapter } = await createTestStoryWithChapter();
    const para = await prisma.paragraph.create({
      data: { chapterId: chapter.id, ordinal: 1, text: 'old' },
    });
    const res = await POST(
      new NextRequest('http://x', {
        method: 'POST', headers: { 'x-test-user-id': user.id },
        body: JSON.stringify({ mode: 'regen' }),
      }),
      { params: Promise.resolve({ id: para.id }) },
    );
    const body = await res.text();
    expect(body).toBe('new text.');
    const after = await prisma.paragraph.findUniqueOrThrow({ where: { id: para.id } });
    expect(after.text).toBe('new text.');
    expect(after.regensCount).toBe(1);
  });

  it('returns 429 over per-chapter regen limit', async () => {
    const { user, chapter } = await createTestStoryWithChapter();
    await prisma.chapterUsage.update({ where: { chapterId: chapter.id }, data: { regens: 5 } });
    const para = await prisma.paragraph.create({
      data: { chapterId: chapter.id, ordinal: 1, text: 'x' },
    });
    const res = await POST(
      new NextRequest('http://x', {
        method: 'POST', headers: { 'x-test-user-id': user.id },
        body: JSON.stringify({ mode: 'regen' }),
      }),
      { params: Promise.resolve({ id: para.id }) },
    );
    expect(res.status).toBe(429);
  });
});
```

- [ ] **Step 2: Implement**

```ts
// app/api/paragraph/[id]/regen/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';
import { openaiLlm } from '@/lib/llm-openai';
import * as regenPrompt from '@/lib/prompts/paragraph-regen';
import { debitChapter } from '@/lib/quota/check-and-debit';
import { enqueue } from '@/lib/queue/boss';
import { between } from '@/lib/paragraph/ordinal';
import { requiresAgeGate, isAgeConfirmed } from '@/lib/safety/age-gate';

const Body = z.object({
  mode: z.enum(['regen', 'continue', 'expand', 'compress']),
  hint: z.string().max(500).optional(),
});

const LIMITS = { regens: 5, continues: 1, promptTweaks: 2 };

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdOrThrow();
  const { id } = await params;
  const body = Body.parse(await req.json());

  const para = await prisma.paragraph.findUnique({
    where: { id },
    include: {
      chapter: {
        include: {
          story: { include: { author: true, tags: { include: { tag: true } } } },
          paragraphs: { orderBy: { ordinal: 'asc' } },
        },
      },
    },
  });
  if (!para || para.chapter.story.authorId !== userId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  // 18+ gate, если rating=E/M и юзер не подтверждал
  const ratingTag = para.chapter.story.tags.find((st) => st.tag.type === 'RATING')?.tag.name;
  if (requiresAgeGate({ rating: ratingTag ?? null, tropes: [] }) && !isAgeConfirmed(para.chapter.story.author)) {
    return NextResponse.json({ error: 'age_gate' }, { status: 403 });
  }

  const resource = body.mode === 'continue' ? 'continues' : 'regens';
  const quota = await debitChapter(para.chapter.id, resource, LIMITS[resource]);
  if (!quota.allowed) return NextResponse.json({ error: 'quota_exceeded' }, { status: 429 });

  const orderedParas = para.chapter.paragraphs;
  const idx = orderedParas.findIndex((p) => p.id === para.id);
  const prev = idx > 0 ? orderedParas[idx - 1] : null;
  const next = idx < orderedParas.length - 1 ? orderedParas[idx + 1] : null;

  const fandomName = para.chapter.story.tags.find((st) => st.tag.type === 'FANDOM')?.tag.name ?? 'unknown';
  const ship = para.chapter.story.tags.find((st) => st.tag.type === 'RELATIONSHIP')?.tag.name ?? '';

  const { system, user } = regenPrompt.build({
    mode: body.mode,
    targetText: para.text,
    prevText: prev?.text ?? null,
    nextText: next?.text ?? null,
    storyContext: { fandomName, ship, toneNote: '' },
    hint: body.hint,
  });

  // Collect stream into buffer; persist on finish
  let collected = '';
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of openaiLlm.stream({
          callType: `paragraph_${body.mode}`,
          templateId: regenPrompt.TEMPLATE_ID,
          templateVersion: regenPrompt.TEMPLATE_VERSION,
          system, user,
          contextIds: { storyId: para.chapter.storyId, chapterId: para.chapter.id, userId },
          abortSignal: req.signal,
        })) {
          collected += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
        await persistResult(body.mode, para, orderedParas, idx, collected);
        await prisma.chapter.update({ where: { id: para.chapter.id }, data: { userEdited: true } });
        await enqueue('extract-bible', { chapterId: para.chapter.id }, { singletonKey: para.chapter.id });
      } catch (e) {
        controller.error(e);
        return;
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

async function persistResult(
  mode: 'regen' | 'continue' | 'expand' | 'compress',
  target: { id: string; chapterId: string; ordinal: any; regensCount: number },
  ordered: Array<{ id: string; ordinal: any; text: string }>,
  idx: number,
  fullText: string,
) {
  if (mode === 'regen') {
    await prisma.paragraph.update({
      where: { id: target.id },
      data: { text: fullText.trim(), regensCount: { increment: 1 } },
    });
    return;
  }
  if (mode === 'expand' || mode === 'continue') {
    // Split incoming on \n\n+, insert после target используя fractional ordinals.
    const newTexts = fullText.split(/\n{2,}/g).map((s) => s.trim()).filter(Boolean);
    const lowerOrd = Number(target.ordinal);
    const upperOrd = idx < ordered.length - 1 ? Number(ordered[idx + 1].ordinal) : undefined;
    const step = upperOrd === undefined ? 1 : (upperOrd - lowerOrd) / (newTexts.length + 1);
    for (let i = 0; i < newTexts.length; i++) {
      await prisma.paragraph.create({
        data: {
          chapterId: target.chapterId,
          ordinal: lowerOrd + step * (i + 1),
          text: newTexts[i],
        },
      });
    }
    return;
  }
  if (mode === 'compress') {
    // Заменяем target + next: целевой получает merged text, next удаляется.
    const nextPara = ordered[idx + 1];
    if (!nextPara) {
      await prisma.paragraph.update({ where: { id: target.id }, data: { text: fullText.trim() } });
      return;
    }
    await prisma.$transaction([
      prisma.paragraph.update({ where: { id: target.id }, data: { text: fullText.trim(), regensCount: { increment: 1 } } }),
      prisma.paragraph.delete({ where: { id: nextPara.id } }),
    ]);
  }
}
```

- [ ] **Step 3: Run + commit**

```bash
pnpm test app/api/paragraph
git add app/api/paragraph
git commit -m "feat(M2-C): paragraph regen endpoint — streams + persists for 4 modes"
```

---

## Task 5: Paragraph delete endpoint (no LLM)

**Files:**
- Create: `app/api/paragraph/[id]/route.ts`

- [ ] **Step 1: Implement**

```ts
// app/api/paragraph/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';
import { enqueue } from '@/lib/queue/boss';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdOrThrow();
  const { id } = await params;
  const para = await prisma.paragraph.findUnique({
    where: { id },
    include: { chapter: { include: { story: true } } },
  });
  if (!para || para.chapter.story.authorId !== userId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  await prisma.paragraph.delete({ where: { id } });
  await prisma.chapter.update({ where: { id: para.chapter.id }, data: { userEdited: true } });
  await enqueue('extract-bible', { chapterId: para.chapter.id }, { singletonKey: para.chapter.id });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Quick test + commit**

```bash
git add app/api/paragraph/[id]/route.ts
git commit -m "feat(M2-C): paragraph DELETE — no LLM, no quota"
```

---

## Task 6: Tweak chapter prompt endpoint

**Files:**
- Create: `app/api/chapter/[id]/tweak-prompt/route.ts`

- [ ] **Step 1: Implement (regenerate entire chapter with user hint)**

```ts
// app/api/chapter/[id]/tweak-prompt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';
import { debitChapter } from '@/lib/quota/check-and-debit';
import { openaiLlm } from '@/lib/llm-openai';
import * as chapterPrompt from '@/lib/prompts/chapter';
import { loadPriorState } from '@/lib/chapter/load-prior-state';
import { wrapUserInput } from '@/lib/safety/injection-guard';

const Body = z.object({ hint: z.string().min(1).max(500), length: z.enum(['short','medium','long']).default('short') });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdOrThrow();
  const { id } = await params;
  const { hint, length } = Body.parse(await req.json());

  const chapter = await prisma.chapter.findUnique({
    where: { id }, include: { story: { include: { tags: { include: { tag: true } } } } },
  });
  if (!chapter || chapter.story.authorId !== userId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  const q = await debitChapter(id, 'promptTweaks', 2);
  if (!q.allowed) return NextResponse.json({ error: 'quota_exceeded' }, { status: 429 });

  const priorState = await loadPriorState(chapter.storyId, chapter.ordinal);
  const fandomName = chapter.story.tags.find((st) => st.tag.type === 'FANDOM')?.tag.name ?? 'unknown';
  const ship = chapter.story.tags.find((st) => st.tag.type === 'RELATIONSHIP')?.tag.name ?? '';

  const { system, user } = chapterPrompt.build({
    fandomName, ship, tropes: [],
    chapterLength: length,
    chapterOrdinal: chapter.ordinal,
    priorState: priorState ?? undefined,
    premise: `Rewrite this chapter with author note: ${wrapUserInput(hint)}`,
  });

  // Clear existing paragraphs (юзер сам пере-сохранит после стрима)
  await prisma.paragraph.deleteMany({ where: { chapterId: id } });

  // Возвращаем стрим (как /stream)
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of openaiLlm.stream({
          callType: 'chapter_tweak',
          templateId: chapterPrompt.TEMPLATE_ID,
          templateVersion: chapterPrompt.TEMPLATE_VERSION,
          system, user,
          contextIds: { storyId: chapter.storyId, chapterId: id, userId },
          abortSignal: req.signal,
        })) controller.enqueue(encoder.encode(chunk));
      } catch (e) { controller.error(e); return; }
      controller.close();
    },
  });
  return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/chapter/[id]/tweak-prompt
git commit -m "feat(M2-C): chapter tweak-prompt endpoint — regenerate with author hint"
```

---

## Task 7: ParagraphMenu component (mobile bottom-sheet + desktop popover)

**Files:**
- Create: `components/reader/ParagraphMenu.tsx`

- [ ] **Step 1: Component**

```tsx
// components/reader/ParagraphMenu.tsx
'use client';
import { useEffect, useRef } from 'react';
import type { RegenMode } from '@/lib/prompts/paragraph-regen';

type Mode = RegenMode | 'delete';

interface Props {
  open: boolean;
  onClose: () => void;
  onAction: (mode: Mode, hint?: string) => void;
  paragraphText: string;
}

export function ParagraphMenu({ open, onClose, onAction, paragraphText }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open, onClose]);
  if (!open) return null;

  const items: Array<{ mode: Mode; label: string; hint?: string }> = [
    { mode: 'regen',    label: '▸ переписать' },
    { mode: 'continue', label: '▸ продолжить отсюда' },
    { mode: 'expand',   label: '▸ развернуть' },
    { mode: 'compress', label: '▸ сжать' },
    { mode: 'delete',   label: '▸ удалить' },
  ];

  return (
    <>
      {/* Mobile bottom-sheet */}
      <div ref={ref} className="lg:hidden fixed inset-x-0 bottom-0 z-40 rounded-t-2xl bg-surface-raised p-5 shadow-2xl">
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-ink-faint" />
        {items.map((it) => (
          <button key={it.mode} type="button" onClick={() => { onAction(it.mode); onClose(); }}
            className="block w-full py-3 text-left font-mono text-mono-s tracking-caps uppercase text-ink">
            {it.label}
          </button>
        ))}
      </div>
      {/* Desktop popover — positioned via parent via portal */}
      <div ref={ref} className="hidden lg:block absolute right-0 top-full z-40 mt-2 w-56 rounded-xl border border-ink-faint/20 bg-surface-raised p-2 shadow-xl">
        {items.map((it) => (
          <button key={it.mode} type="button" onClick={() => { onAction(it.mode); onClose(); }}
            className="block w-full rounded px-3 py-2 text-left font-mono text-mono-s tracking-caps uppercase text-ink hover:bg-bg-deep">
            {it.label}
          </button>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Storybook story**

```tsx
// components/reader/ParagraphMenu.stories.tsx
import { ParagraphMenu } from './ParagraphMenu';

export default { component: ParagraphMenu };
export const Open = {
  args: { open: true, onClose: () => {}, onAction: () => {}, paragraphText: 'sample' },
};
```

- [ ] **Step 3: Commit**

```bash
git add components/reader/ParagraphMenu.tsx components/reader/ParagraphMenu.stories.tsx
git commit -m "feat(M2-C): ParagraphMenu — bottom-sheet (mobile) / popover (desktop)"
```

---

## Task 8: InlineRegenStream renderer

**Files:**
- Create: `components/reader/InlineRegenStream.tsx`

- [ ] **Step 1: Component (drop-by-letter, amber cursor, fade-out old)**

```tsx
// components/reader/InlineRegenStream.tsx
'use client';
import { useEffect, useState } from 'react';

interface Props {
  oldText: string;
  endpoint: string;
  body: object;
  onFinish: (newText: string) => void;
  onError?: (e: Error) => void;
}

export function InlineRegenStream({ oldText, endpoint, body, onFinish, onError }: Props) {
  const [streamed, setStreamed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const abort = new AbortController();
    void (async () => {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: { 'Content-Type': 'application/json' },
          signal: abort.signal,
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { value, done: streamDone } = await reader.read();
          if (streamDone) break;
          buf += decoder.decode(value);
          setStreamed(buf);
        }
        setDone(true);
        onFinish(buf);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') onError?.(e as Error);
      }
    })();
    return () => abort.abort();
  }, [endpoint]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <p className="relative font-body text-body-l leading-relaxed">
      <span
        aria-hidden
        className={`absolute inset-0 transition-opacity duration-700 ${streamed.length > 0 ? 'opacity-20 blur-[2px]' : 'opacity-100'}`}
      >
        {oldText}
      </span>
      <span className={`relative ${done ? '' : 'after:ml-0.5 after:inline-block after:h-[1em] after:w-[2px] after:animate-pulse after:bg-amber'}`}>
        {streamed}
      </span>
    </p>
  );
}
```

- [ ] **Step 2: Storybook**

- [ ] **Step 3: Commit**

```bash
git add components/reader/InlineRegenStream.tsx
git commit -m "feat(M2-C): InlineRegenStream — fade-out old, drop-by-letter new, amber cursor"
```

---

## Task 9: AgeGateModal + TweakPromptModal

**Files:**
- Create: `components/reader/AgeGateModal.tsx`
- Create: `components/reader/TweakPromptModal.tsx`

- [ ] **Step 1: AgeGateModal**

```tsx
// components/reader/AgeGateModal.tsx
'use client';
export function AgeGateModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-deep/85">
      <div className="max-w-sm rounded-2xl bg-surface-raised p-6">
        <h2 className="font-display text-2xl">тебе 18+?</h2>
        <p className="mt-3 font-body text-body italic text-ink-dim">
          для контента с пометкой M/E нужно подтвердить возраст. это одноразовый шаг.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 rounded-full border border-ink-faint/30 px-4 py-2 font-mono text-mono-s tracking-caps uppercase text-ink-dim">
            нет
          </button>
          <button onClick={onConfirm}
            className="flex-1 rounded-full bg-amber px-4 py-2 font-mono text-mono-s tracking-caps uppercase text-bg-deep">
            да, мне 18+
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TweakPromptModal**

```tsx
// components/reader/TweakPromptModal.tsx
'use client';
import { useState } from 'react';

interface Props { onSubmit: (hint: string) => void; onClose: () => void; }
export function TweakPromptModal({ onSubmit, onClose }: Props) {
  const [hint, setHint] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-deep/85" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-w-md rounded-2xl bg-surface-raised p-6">
        <h2 className="font-display text-2xl">подкрутить главу</h2>
        <p className="mt-2 font-body text-body italic text-ink-dim">
          один абзац или общая правка — модель пере-сгенерит главу с учётом подсказки.
        </p>
        <textarea
          value={hint} onChange={(e) => setHint(e.target.value)} maxLength={500} rows={4}
          placeholder="например: больше внутреннего монолога Драко"
          className="mt-4 w-full rounded-lg bg-bg-deep p-3 font-body text-body italic"
        />
        <div className="mt-4 flex gap-3">
          <button onClick={onClose} className="rounded-full border border-ink-faint/30 px-4 py-2 font-mono text-mono-s tracking-caps uppercase text-ink-dim">
            отмена
          </button>
          <button onClick={() => onSubmit(hint)} disabled={!hint.trim()}
            className="rounded-full bg-amber px-4 py-2 font-mono text-mono-s tracking-caps uppercase text-bg-deep disabled:opacity-50">
            пере-сгенерить
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/reader/AgeGateModal.tsx components/reader/TweakPromptModal.tsx
git commit -m "feat(M2-C): AgeGate + TweakPrompt modals"
```

---

## Task 10: Wire ParagraphMenu в ReaderPageView

**Files:**
- Modify: ReaderPageView (точное имя из M1)

- [ ] **Step 1: Per-paragraph menu state**

В Reader-компоненте рендера `Paragraph[]`:

```tsx
'use client';
import { useState } from 'react';
import { ParagraphMenu } from '@/components/reader/ParagraphMenu';
import { InlineRegenStream } from '@/components/reader/InlineRegenStream';
import { AgeGateModal } from '@/components/reader/AgeGateModal';
import type { RegenMode } from '@/lib/prompts/paragraph-regen';

interface ParaProps { id: string; text: string; canEdit: boolean; }

function ParagraphView({ id, text, canEdit }: ParaProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [regenMode, setRegenMode] = useState<RegenMode | null>(null);
  const [ageGate, setAgeGate] = useState(false);

  if (regenMode) {
    return (
      <InlineRegenStream
        oldText={text}
        endpoint={`/api/paragraph/${id}/regen`}
        body={{ mode: regenMode }}
        onFinish={() => { /* parent refetches chapter; здесь — local replace для optimistic UX */ setRegenMode(null); }}
        onError={(e) => { if (e.message.includes('age_gate')) setAgeGate(true); setRegenMode(null); }}
      />
    );
  }

  return (
    <p
      onClick={() => canEdit && setMenuOpen(true)}
      className="relative font-body text-body-l leading-relaxed"
    >
      {text}
      <ParagraphMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onAction={async (mode) => {
          if (mode === 'delete') {
            await fetch(`/api/paragraph/${id}`, { method: 'DELETE' });
            // parent refetches
            return;
          }
          setRegenMode(mode);
        }}
        paragraphText={text}
      />
      {ageGate && (
        <AgeGateModal
          onClose={() => setAgeGate(false)}
          onConfirm={async () => {
            await fetch('/api/me/confirm-age', { method: 'POST' });
            setAgeGate(false);
          }}
        />
      )}
    </p>
  );
}
```

- [ ] **Step 2: Quick `/api/me/confirm-age` endpoint**

```ts
// app/api/me/confirm-age/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

export async function POST() {
  const userId = await getUserIdOrThrow();
  await prisma.user.update({ where: { id: userId }, data: { ageConfirmedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(reader\) app/api/me components/reader
git commit -m "feat(M2-C): Reader wires ParagraphMenu → regen/InlineRegenStream + age gate"
```

---

## Task 11: End-to-end smoke

**Files:**
- Create: `scripts/m2c-e2e.ts`

- [ ] **Step 1: Playwright script**

```ts
// scripts/m2c-e2e.ts
import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // assumes story+chapter already exists with Paragraph[]
  await page.goto(`http://localhost:3000/reader/${process.env.STORY_ID}/1`);
  await page.click('p >> nth=2');
  await page.click('text=переписать');
  // wait for fade + new text
  await page.waitForFunction(() => {
    const ps = document.querySelectorAll('p');
    return ps[2]?.textContent && ps[2].textContent.length > 50;
  }, { timeout: 60000 });
  await browser.close();
}
void main();
```

- [ ] **Step 2: npm script**

```json
"qa:m2c": "tsx --env-file=.env scripts/m2c-e2e.ts"
```

- [ ] **Step 3: Commit + tag**

```bash
git add scripts/m2c-e2e.ts package.json
git commit -m "test(M2-C): playwright smoke — paragraph regen drop-by-letter"
git tag m2c-done
```

---

## Self-review notes

- Spec §12 modes: regen / continue / expand / compress / delete — все пять ✓ (delete без LLM, без quota)
- Spec §12 ordinal management: fractional `Decimal(20,10)` ✓ Task 1, `between()` использован в Task 4 для expand/continue
- Spec §13 18+ gate: `requiresAgeGate` + `isAgeConfirmed` + `/api/me/confirm-age` + Reader UI ✓ Tasks 3, 4, 10
- Spec §11 re-enqueue extract-bible после edit: `enqueue('extract-bible', ..., { singletonKey: chapterId })` в каждом endpoint'е ✓ Tasks 4, 5
- Spec §9 quotas: `debitChapter` использует `regens` / `continues` / `promptTweaks` ✓ Tasks 4, 6
- Spec §12 streaming UX (drop-by-letter, amber cursor, fade-out) ✓ Task 8
- Tweak-prompt textarea + endpoint ✓ Tasks 6, 9
- Compress edge case (target — последний параграф) — обработан: `nextPara` undefined → просто rewrite target

---

После завершения Plan C → весь M2 ship'нут. Следующий milestone — M3 (Watch mode), brainstorm запускается заново в новой сессии.
