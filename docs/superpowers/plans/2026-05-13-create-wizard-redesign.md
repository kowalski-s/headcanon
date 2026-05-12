# Create Wizard Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Переработать `/create` визард: убрать required-ship, добавить focus-driven flow (Romance/Gen/Character study/Friendship) с conditional input, AO3-стандарт-поля (rating/category/warnings/POV/tense/жанр), идиоматичную русскую локализацию.

**Architecture:** 5-шаговый flow остаётся, но Step 2 = focus-driven, Step 4 = одна страница с 4 свёрнутыми секциями. БД: новые поля в `CreateDraft`/`Story`, переименование `shipId` → `characters[]`, `tone` → `tones[]`. LLM-промпты расширяются и переходят на русский фандом-сленг.

**Tech Stack:** Next.js (App Router) · TypeScript · Prisma + Supabase Postgres · Zod · Tailwind · vitest + React Testing Library · OpenAI structured outputs.

**Spec:** `docs/superpowers/specs/2026-05-12-create-wizard-redesign-design.md`

---

## File Structure Map

| Layer | File | Action |
|---|---|---|
| Schema | `prisma/schema.prisma` | modify: add enums + fields |
| Schema | `prisma/migrations/<ts>_wizard_redesign/migration.sql` | create |
| Locale | `lib/create/locale.ts` | create |
| Prompts | `lib/prompts/chapter.ts` | modify |
| Prompts | `lib/prompts/chapter.test.ts` | modify |
| Prompts | `lib/prompts/character-suggest.ts` | create (replaces ship-suggest) |
| Prompts | `lib/prompts/character-suggest.test.ts` | create |
| Prompts | `lib/prompts/ship-suggest.ts` | delete after migration |
| Prompts | `lib/prompts/trope-suggest.ts` | modify |
| Prompts | `lib/prompts/trope-suggest.test.ts` | modify |
| Prompts | `lib/prompts/genre-suggest.ts` | create |
| Prompts | `lib/prompts/genre-suggest.test.ts` | create |
| API | `app/api/create/draft/[id]/route.ts` | modify (Zod) |
| API | `app/api/create/suggestions/characters/route.ts` | create |
| API | `app/api/create/suggestions/characters/route.test.ts` | create |
| API | `app/api/create/suggestions/tropes/route.ts` | modify |
| API | `app/api/create/suggestions/tropes/route.test.ts` | modify |
| API | `app/api/create/suggestions/genres/route.ts` | create |
| API | `app/api/create/suggestions/genres/route.test.ts` | create |
| API | `app/api/create/suggestions/ships/*` | delete |
| API | `app/api/create/draft/[id]/start/route.ts` | modify |
| API | `app/api/create/draft/[id]/start/route.test.ts` | modify |
| API | `app/api/chapter/[id]/stream/route.ts` | modify (passes new fields) |
| UI prim | `components/ui/ChipGroup.tsx` | create |
| UI prim | `components/ui/MultiChipGroup.tsx` | create |
| UI prim | `components/ui/TagInput.tsx` | create |
| UI prim | `components/ui/AccordionSection.tsx` | create |
| UI steps | `components/create/StepFocusCharacters.tsx` | create |
| UI steps | `components/create/StepDetails.tsx` | create |
| UI shell | `components/create/CreatePageView.tsx` | rewrite |
| Tests | `tests/pages/create-flow.test.tsx` | rewrite |
| Tracking | `lib/track.ts` | modify (event names) |

---

## Phase 1 — Schema and Locale Foundations

### Task 1: Prisma schema — enums and CreateDraft fields

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add new enums and extend `CreateDraft`**

Edit `prisma/schema.prisma`:

Add near the existing `enum Tone {...}` block:

```prisma
enum FocusType {
  ROMANCE
  GEN
  CHARACTER_STUDY
  FRIENDSHIP
}

enum Rating {
  GENERAL
  TEEN
  MATURE
  EXPLICIT
}

enum Category {
  SLASH
  FEMSLASH
  HET
  GEN
  MULTI
  OTHER
}

enum Pov {
  FIRST
  CLOSE_THIRD
  OMNISCIENT
}

enum Tense {
  PAST
  PRESENT
}
```

Extend `enum Tone {...}` with new values (preserve existing ordering):

```prisma
enum Tone {
  SLOW_BURN
  SPICY
  FLUFF
  ANGST
  HURT_COMFORT
  CRACK
  DARK
}
```

Replace `model CreateDraft` body with:

```prisma
model CreateDraft {
  id           String     @id @default(uuid()) @db.Uuid
  userId       String     @db.Uuid
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  fandomId     String?    @db.Uuid

  focusType    FocusType?
  characters   String[]   @default([])

  tropes       String[]   @default([])

  rating       Rating?
  category     Category?
  warnings     String[]   @default([])

  pov          Pov?
  tense        Tense?
  tones        Tone[]     @default([])

  timeline     String?
  timelineNote String?
  genres       String[]   @default([])
  setting      String?

  premise      String?

  step         Int        @default(1)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  @@index([userId, updatedAt])
}
```

Note: old `shipId` field is removed; old `tone Tone?` is replaced by `tones Tone[]`.

- [ ] **Step 2: Extend `Story` with same generation hints**

In `model Story`, add fields right after the existing `tone Tone?`:

```prisma
  tone            Tone?                       // keep for backward-compat of existing rows
  tones           Tone[]      @default([])
  focusType       FocusType?
  rating          Rating?
  category        Category?
  warnings        String[]    @default([])
  pov             Pov?
  tense           Tense?
  timeline        String?
  timelineNote    String?
  genres          String[]    @default([])
  premise         String?
```

(`setting` already exists on `CreateDraft` only; Story carries hints via tags + above generation fields.)

- [ ] **Step 3: Generate migration**

Run: `pnpm prisma migrate dev --name wizard_redesign --create-only`
Expected: file under `prisma/migrations/<timestamp>_wizard_redesign/migration.sql` is created.

- [ ] **Step 4: Inspect and edit migration to preserve old draft data**

Open the generated `migration.sql`. Insert (at the top) a data backfill block before the `DROP COLUMN "shipId"`:

```sql
-- Backfill characters[] from old shipId by splitting on common ship separators.
UPDATE "CreateDraft"
SET "characters" = CASE
  WHEN "shipId" IS NULL OR "shipId" = '' THEN '{}'::text[]
  WHEN "shipId" ~ '\s*[×x/]\s*' THEN regexp_split_to_array("shipId", '\s*[×x/]\s*')
  ELSE ARRAY["shipId"]
END;

-- Default focusType for existing drafts that had a ship.
UPDATE "CreateDraft" SET "focusType" = 'ROMANCE' WHERE "shipId" IS NOT NULL;

-- Backfill tones[] from old tone.
UPDATE "CreateDraft" SET "tones" = CASE
  WHEN "tone" IS NULL THEN '{}'::"Tone"[]
  ELSE ARRAY["tone"]::"Tone"[]
END;
```

- [ ] **Step 5: Apply migration locally**

Run: `pnpm prisma migrate dev`
Expected: migration applies; `pnpm prisma generate` runs; no error.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(db): wizard redesign schema — focus, characters[], AO3 fields, expanded Tone"
```

---

### Task 2: Russian locale module

**Files:**
- Create: `lib/create/locale.ts`
- Create: `lib/create/locale.test.ts`

- [ ] **Step 1: Write failing test**

Create `lib/create/locale.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  FOCUS_LABELS, FOCUS_DESCRIPTIONS,
  RATING_LABELS, CATEGORY_LABELS,
  POV_LABELS, TENSE_LABELS,
  TONE_LABELS, WARNING_LABELS, TIMELINE_LABELS,
} from './locale';

describe('locale labels', () => {
  it('has slang transliteration for tones, not literal translation', () => {
    expect(TONE_LABELS.SLOW_BURN).toBe('слоуберн');
    expect(TONE_LABELS.ANGST).toBe('ангст');
    expect(TONE_LABELS.FLUFF).toBe('флафф');
    expect(TONE_LABELS.HURT_COMFORT).toBe('хёрт/комфорт');
  });

  it('has idiomatic Russian for focus, rating, category, POV, tense', () => {
    expect(FOCUS_LABELS.ROMANCE).toBe('романтика');
    expect(FOCUS_DESCRIPTIONS.GEN).toMatch(/без любовной/i);
    expect(RATING_LABELS.GENERAL).toBe('общий');
    expect(RATING_LABELS.EXPLICIT).toBe('explicit');
    expect(CATEGORY_LABELS.SLASH).toBe('слэш');
    expect(POV_LABELS.CLOSE_THIRD).toBe('третье близкое');
    expect(TENSE_LABELS.PRESENT).toBe('настоящее');
  });

  it('has warnings and timeline labels', () => {
    expect(WARNING_LABELS.death).toBe('смерть персонажа');
    expect(WARNING_LABELS.cntw).toBe('без предупреждений');
    expect(TIMELINE_LABELS.au).toBe('AU без канона');
  });
});
```

- [ ] **Step 2: Run test — expect FAIL (module missing)**

Run: `pnpm vitest run lib/create/locale.test.ts`
Expected: FAIL with "Cannot find module './locale'".

- [ ] **Step 3: Implement locale module**

Create `lib/create/locale.ts`:

```ts
import type { FocusType, Rating, Category, Pov, Tense, Tone } from '@prisma/client';

export const FOCUS_LABELS: Record<FocusType, string> = {
  ROMANCE: 'романтика',
  GEN: 'джен',
  CHARACTER_STUDY: 'один герой',
  FRIENDSHIP: 'дружба',
};

export const FOCUS_DESCRIPTIONS: Record<FocusType, string> = {
  ROMANCE: 'пейринг в центре сюжета',
  GEN: 'приключения, мистика, без любовной линии',
  CHARACTER_STUDY: 'один герой, его рост и арка',
  FRIENDSHIP: 'двое или больше — друзья, семья, союз',
};

export const RATING_LABELS: Record<Rating, string> = {
  GENERAL: 'общий',
  TEEN: '16+',
  MATURE: '18+',
  EXPLICIT: 'explicit',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  SLASH: 'слэш',
  FEMSLASH: 'фемслэш',
  HET: 'гет',
  GEN: 'джен',
  MULTI: 'multi',
  OTHER: 'другое',
};

export const POV_LABELS: Record<Pov, string> = {
  FIRST: 'от первого лица',
  CLOSE_THIRD: 'третье близкое',
  OMNISCIENT: 'всеведущее',
};

export const TENSE_LABELS: Record<Tense, string> = {
  PAST: 'прошедшее',
  PRESENT: 'настоящее',
};

export const TONE_LABELS: Record<Tone, string> = {
  SLOW_BURN: 'слоуберн',
  SPICY: 'спайси',
  FLUFF: 'флафф',
  ANGST: 'ангст',
  HURT_COMFORT: 'хёрт/комфорт',
  CRACK: 'крэк',
  DARK: 'дарк',
};

export const WARNING_KEYS = ['death', 'violence', 'non_con', 'cntw'] as const;
export type WarningKey = (typeof WARNING_KEYS)[number];
export const WARNING_LABELS: Record<WarningKey, string> = {
  death: 'смерть персонажа',
  violence: 'жестокость',
  non_con: 'non-con',
  cntw: 'без предупреждений',
};

export const TIMELINE_KEYS = ['canon', 'pre', 'post', 'au'] as const;
export type TimelineKey = (typeof TIMELINE_KEYS)[number];
export const TIMELINE_LABELS: Record<TimelineKey, string> = {
  canon: 'канон',
  pre: 'pre-canon',
  post: 'post-canon',
  au: 'AU без канона',
};
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm vitest run lib/create/locale.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/create/locale.ts lib/create/locale.test.ts
git commit -m "feat(create): RU locale module — fanfic slang labels"
```

---

## Phase 2 — LLM Prompts

### Task 3: Chapter prompt — extended input + new fields

**Files:**
- Modify: `lib/prompts/chapter.ts`
- Modify: `lib/prompts/chapter.test.ts`

- [ ] **Step 1: Update test — new ChapterInput shape**

Replace `lib/prompts/chapter.test.ts` with:

```ts
import { describe, it, expect } from 'vitest';
import { build } from './chapter';

describe('build chapter prompt', () => {
  it('builds chapter prompt with focus + characters + all new hints', () => {
    const out = build({
      fandomName: 'Harry Potter',
      focusType: 'ROMANCE',
      characters: ['Гарри Поттер', 'Драко Малфой'],
      tropes: ['от врагов к возлюбленным', 'слоуберн'],
      rating: 'MATURE',
      category: 'SLASH',
      warnings: ['cntw'],
      pov: 'CLOSE_THIRD',
      tense: 'PAST',
      tones: ['SLOW_BURN', 'ANGST'],
      timeline: 'post',
      timelineNote: 'через 5 лет после битвы',
      genres: ['современная AU'],
      setting: 'Лондон, осень',
      premise: 'Случайная встреча в баре',
      chapterLength: 'short',
      chapterOrdinal: 1,
    });
    expect(out.system).toMatch(/Harry Potter/);
    expect(out.system).toMatch(/Focus: ROMANCE/);
    expect(out.system).toMatch(/Main characters: Гарри Поттер, Драко Малфой/);
    expect(out.system).toMatch(/Rating: MATURE/);
    expect(out.system).toMatch(/Category: SLASH/);
    expect(out.system).toMatch(/POV: close 3rd/);
    expect(out.system).toMatch(/Tense: past/);
    expect(out.system).toMatch(/Tones: slow burn, angst/);
    expect(out.system).toMatch(/Genres: современная AU/);
    expect(out.system).toMatch(/Timeline: post-canon — через 5 лет/);
    expect(out.system).toMatch(/around 1500 words/i);
    expect(out.user).toMatch(/<user_input>Случайная встреча/);
  });

  it('focus=GEN with single character omits ship-y guidance', () => {
    const out = build({
      fandomName: 'JJK',
      focusType: 'GEN',
      characters: ['Юдзи Итадори'],
      tropes: ['приключение'],
      chapterLength: 'short',
      chapterOrdinal: 1,
    });
    expect(out.system).toMatch(/Focus: GEN/);
    expect(out.system).toMatch(/Main characters: Юдзи Итадори/);
    expect(out.system).not.toMatch(/Rating:/);
    expect(out.system).not.toMatch(/Category:/);
  });

  it('includes prior state for N>1', () => {
    const out = build({
      fandomName: 'HP',
      focusType: 'ROMANCE',
      characters: ['Гарри', 'Драко'],
      tropes: [],
      chapterLength: 'medium',
      chapterOrdinal: 3,
      priorState: {
        worldState: { current_location: 'library', story_time: 'Sept', active_plot_threads: ['letters'], foreshadowing: [] },
        characterStates: [{ character_name: 'Draco', emotional_state: 'guarded', recent_events: [], relationships: {}, arc_progress: 0.3, voice_traits_drift: [] }],
        summaries: ['Ch 1 summary.'],
        recentChapters: ['Full ch 2.'],
      },
    });
    expect(out.system).toMatch(/guarded/);
    expect(out.system).toMatch(/Ch 1 summary/);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL (interface mismatch)**

Run: `pnpm vitest run lib/prompts/chapter.test.ts`
Expected: FAIL with type errors on `focusType`, `characters`, etc.

- [ ] **Step 3: Rewrite `lib/prompts/chapter.ts`**

Replace the entire file with:

```ts
import type { FocusType, Rating, Category, Pov, Tense, Tone } from '@prisma/client';
import { SYSTEM_INJECTION_NOTICE, wrapUserInput } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'chapter';
export const TEMPLATE_VERSION = 2;

export type ChapterLength = 'short' | 'medium' | 'long';
const TARGET_WORDS: Record<ChapterLength, number> = { short: 1500, medium: 3000, long: 4500 };

const TIMELINE_DESCR: Record<string, string> = {
  canon: 'canon',
  pre: 'pre-canon',
  post: 'post-canon',
  au: 'AU (not bound by canon)',
};

export interface PriorState {
  worldState: {
    current_location: string;
    story_time: string;
    active_plot_threads: string[];
    foreshadowing: string[];
  };
  characterStates: Array<{
    character_name: string;
    emotional_state: string;
    recent_events: string[];
    relationships: Record<string, unknown>;
    arc_progress: number;
    voice_traits_drift: string[];
  }>;
  summaries: string[];
  recentChapters: string[];
}

export interface ChapterInput {
  fandomName: string;
  focusType: FocusType;
  characters: string[];
  tropes: string[];
  rating?: Rating;
  category?: Category;
  warnings?: string[];
  pov?: Pov;
  tense?: Tense;
  tones?: Tone[];
  timeline?: string;
  timelineNote?: string;
  genres?: string[];
  setting?: string;
  premise?: string;
  chapterLength: ChapterLength;
  chapterOrdinal: number;
  priorState?: PriorState;
}

function tone(t: Tone): string {
  return t.toLowerCase().replace(/_/g, ' ');
}
function pov(p: Pov): string {
  return p === 'FIRST' ? '1st person' : p === 'OMNISCIENT' ? 'omniscient' : 'close 3rd';
}
function tense(t: Tense): string {
  return t === 'PRESENT' ? 'present' : 'past';
}

export function build(input: ChapterInput): { system: string; user: string } {
  const target = TARGET_WORDS[input.chapterLength];
  const lines: string[] = [
    `You are a fanfic writer. Write in Russian, idiomatic Russian fanfic prose. Lyrical, literary, Bodoni-Garamond aesthetic.`,
    `Fandom: ${input.fandomName}. Focus: ${input.focusType}.`,
    input.characters.length ? `Main characters: ${input.characters.join(', ')}.` : '',
    input.tropes.length ? `Tropes: ${input.tropes.join(', ')}.` : '',
    input.rating ? `Rating: ${input.rating}.` : '',
    input.category ? `Category: ${input.category}.` : '',
    input.warnings?.length ? `Warnings: ${input.warnings.join(', ')}.` : '',
    input.pov ? `POV: ${pov(input.pov)}.` : 'POV: close 3rd.',
    input.tense ? `Tense: ${tense(input.tense)}.` : 'Tense: past.',
    input.tones?.length ? `Tones: ${input.tones.map(tone).join(', ')}.` : '',
    input.genres?.length ? `Genres: ${input.genres.join(', ')}.` : '',
    input.timeline ? `Timeline: ${TIMELINE_DESCR[input.timeline] ?? input.timeline}${input.timelineNote ? ' — ' + input.timelineNote : ''}.` : '',
    input.setting ? `Setting: ${input.setting}.` : '',
    `Target length: around ${target} words. Use blank lines between paragraphs (paragraphs of 2-4 sentences each).`,
    SYSTEM_INJECTION_NOTICE,
  ].filter(Boolean);

  if (input.priorState) {
    lines.push('--- STORY STATE ---');
    lines.push(`World: ${JSON.stringify(input.priorState.worldState)}`);
    lines.push(`Characters: ${JSON.stringify(input.priorState.characterStates)}`);
    lines.push(`Summaries (earlier chapters): ${input.priorState.summaries.join('\n---\n')}`);
    lines.push(`Recent full chapters: ${input.priorState.recentChapters.join('\n---\n')}`);
  }

  const user = input.chapterOrdinal === 1
    ? input.premise
      ? `Write chapter 1 from this premise: ${wrapUserInput(input.premise)}`
      : 'Write chapter 1 from scratch, drawing on the configured fandom/focus/characters/tropes.'
    : `Continue the story with chapter ${input.chapterOrdinal}. Honor existing state.`;

  return { system: lines.join('\n\n'), user };
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm vitest run lib/prompts/chapter.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/prompts/chapter.ts lib/prompts/chapter.test.ts
git commit -m "feat(prompts): chapter — focus, characters, AO3 hints; bump template v2"
```

---

### Task 4: Character-suggest prompt (replaces ship-suggest)

**Files:**
- Create: `lib/prompts/character-suggest.ts`
- Create: `lib/prompts/character-suggest.test.ts`

- [ ] **Step 1: Write failing test**

Create `lib/prompts/character-suggest.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { build, CharacterSuggestSchema, TEMPLATE_ID } from './character-suggest';

describe('character-suggest', () => {
  it('builds romance prompt asking for ship pairings', () => {
    const out = build({ fandomName: 'Harry Potter', focus: 'ROMANCE' });
    expect(out.system).toMatch(/ship pairings/i);
    expect(out.system).toMatch(/idiomatic Russian/i);
    expect(out.user).toMatch(/Harry Potter/);
  });

  it('builds gen prompt asking for main characters/groups', () => {
    const out = build({ fandomName: 'HP', focus: 'GEN' });
    expect(out.system).toMatch(/main characters or groups/i);
    expect(out.system).not.toMatch(/ship pairings/i);
  });

  it('builds character_study prompt asking for solo protagonists', () => {
    const out = build({ fandomName: 'HP', focus: 'CHARACTER_STUDY' });
    expect(out.system).toMatch(/solo protagonists/i);
  });

  it('builds friendship prompt asking for friend pairs/trios', () => {
    const out = build({ fandomName: 'HP', focus: 'FRIENDSHIP' });
    expect(out.system).toMatch(/friendship pairs or trios/i);
  });

  it('schema accepts focus_compatible array per suggestion', () => {
    const sample = {
      suggestions: Array.from({ length: 7 }, () => ({
        names: ['A', 'B'],
        label_ru: 'A × B',
        popularity: 0.5,
        avatar_prompt: 'two figures',
        rarity: 'top' as const,
        focus_compatible: ['romance' as const],
      })),
    };
    expect(() => CharacterSuggestSchema.parse(sample)).not.toThrow();
  });

  it('exposes stable TEMPLATE_ID', () => {
    expect(TEMPLATE_ID).toBe('character_suggest');
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm vitest run lib/prompts/character-suggest.test.ts`
Expected: FAIL "Cannot find module './character-suggest'".

- [ ] **Step 3: Implement module**

Create `lib/prompts/character-suggest.ts`:

```ts
import { z } from 'zod';
import type { FocusType } from '@prisma/client';
import { SYSTEM_INJECTION_NOTICE } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'character_suggest';
export const TEMPLATE_VERSION = 1;

export const CharacterSuggestSchema = z.object({
  suggestions: z
    .array(
      z.object({
        names: z.array(z.string()).min(1).max(4),
        label_ru: z.string(),
        popularity: z.number().min(0).max(1),
        avatar_prompt: z.string(),
        rarity: z.enum(['top', 'rare']),
        focus_compatible: z
          .array(z.enum(['romance', 'gen', 'character_study', 'friendship']))
          .min(1),
      }),
    )
    .min(5)
    .max(12),
});
export type CharacterSuggestOutput = z.infer<typeof CharacterSuggestSchema>;

const FOCUS_INSTRUCTIONS: Record<FocusType, string> = {
  ROMANCE:
    'Return 7 popular ship pairings on AO3 + 2 rare-but-beloved pairings. Each suggestion: 2 names (or 3 for poly), label_ru as written in Russian fandom (e.g. «Гарри × Драко», «Снейп/Гермиона»).',
  GEN:
    'Return main characters or groups for gen stories (adventure, mystery, no romance). Mix solo protagonists and well-known groups (e.g. «Мародёры», «Золотое трио»). label_ru is the Russian fandom name of the character or group.',
  CHARACTER_STUDY:
    'Return solo protagonists for character study fanfic. label_ru is the Russian fandom spelling of the character name.',
  FRIENDSHIP:
    'Return friendship pairs or trios (no romance). label_ru in Russian fandom slang (e.g. «Гарри & Рон», «Мародёры»).',
};

export function build(args: { fandomName: string; focus: FocusType }): { system: string; user: string } {
  return {
    system: [
      'You suggest characters or pairings for a fanfic in a given fandom and focus mode.',
      FOCUS_INSTRUCTIONS[args.focus],
      'Use idiomatic Russian fandom slang in label_ru — never literal English. Names go in `names` field as their canonical Russian-fandom spelling.',
      'avatar_prompt: 1 sentence visual essence.',
      'focus_compatible: list which focus modes (romance, gen, character_study, friendship) this suggestion suits.',
      SYSTEM_INJECTION_NOTICE,
    ].join('\n\n'),
    user: `Fandom: <user_input>${args.fandomName}</user_input>\nFocus: ${args.focus}`,
  };
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm vitest run lib/prompts/character-suggest.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/prompts/character-suggest.ts lib/prompts/character-suggest.test.ts
git commit -m "feat(prompts): character-suggest — focus-conditional, RU slang labels"
```

---

### Task 5: Trope-suggest — focus + characters context

**Files:**
- Modify: `lib/prompts/trope-suggest.ts`
- Modify: `lib/prompts/trope-suggest.test.ts`

- [ ] **Step 1: Update test**

Replace `lib/prompts/trope-suggest.test.ts` with:

```ts
import { describe, it, expect } from 'vitest';
import { build, TropeSuggestSchema } from './trope-suggest';

describe('trope-suggest', () => {
  it('builds prompt with focus + characters context', () => {
    const out = build({
      fandomName: 'HP',
      focus: 'ROMANCE',
      characters: ['Гарри', 'Драко'],
    });
    expect(out.system).toMatch(/idiomatic Russian fandom slang/i);
    expect(out.user).toMatch(/HP/);
    expect(out.user).toMatch(/ROMANCE/);
    expect(out.user).toMatch(/Гарри/);
  });

  it('schema requires label_ru in Russian', () => {
    const sample = {
      tropes: Array.from({ length: 8 }, (_, i) => ({
        slug: `t-${i}`,
        label_ru: `троп ${i}`,
        description_ru: 'описание',
        popularity: 0.5,
      })),
      sensei_tip: 'Удачи.',
    };
    expect(() => TropeSuggestSchema.parse(sample)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm vitest run lib/prompts/trope-suggest.test.ts`
Expected: FAIL (schema field rename).

- [ ] **Step 3: Rewrite prompt**

Replace `lib/prompts/trope-suggest.ts` with:

```ts
import { z } from 'zod';
import type { FocusType } from '@prisma/client';
import { SYSTEM_INJECTION_NOTICE } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'trope_suggest';
export const TEMPLATE_VERSION = 2;

export const TropeSuggestSchema = z.object({
  tropes: z
    .array(
      z.object({
        slug: z.string(),
        label_ru: z.string(),
        description_ru: z.string().max(140),
        popularity: z.number().min(0).max(1),
      }),
    )
    .min(8)
    .max(15),
  sensei_tip: z.string().max(220),
});
export type TropeSuggestOutput = z.infer<typeof TropeSuggestSchema>;

export function build(args: {
  fandomName: string;
  focus: FocusType;
  characters: string[];
}): { system: string; user: string } {
  return {
    system: [
      'You suggest fanfic tropes for a given fandom, focus mode, and main characters.',
      'Return 8–15 tropes popular on AO3 for this combination. Mix well-loved classics with a couple of niche ones.',
      'CRITICAL: label_ru and description_ru must be in idiomatic Russian fanfic community slang. Mix transliterated terms (слоуберн, ангст, флафф, омегаверс) with established idiomatic Russian phrases (от врагов к возлюбленным, школьная AU, фэйк-релейшеншип). NEVER literal word-for-word translation from English.',
      'slug stays lowercase-hyphenated Latin (for tag dedup).',
      'Also write a short sensei_tip (≤220 chars) in Russian: a playful "AI Sensei" hint about writing this combination.',
      SYSTEM_INJECTION_NOTICE,
    ].join('\n\n'),
    user: [
      `Fandom: <user_input>${args.fandomName}</user_input>`,
      `Focus: ${args.focus}`,
      `Characters: <user_input>${args.characters.join(', ')}</user_input>`,
    ].join('\n'),
  };
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm vitest run lib/prompts/trope-suggest.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/prompts/trope-suggest.ts lib/prompts/trope-suggest.test.ts
git commit -m "feat(prompts): trope-suggest — focus+characters, RU slang labels, v2"
```

---

### Task 6: Genre-suggest prompt (new)

**Files:**
- Create: `lib/prompts/genre-suggest.ts`
- Create: `lib/prompts/genre-suggest.test.ts`

- [ ] **Step 1: Write failing test**

Create `lib/prompts/genre-suggest.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { build, GenreSuggestSchema, TEMPLATE_ID } from './genre-suggest';

describe('genre-suggest', () => {
  it('builds prompt with fandom + focus', () => {
    const out = build({ fandomName: 'HP', focus: 'ROMANCE' });
    expect(out.system).toMatch(/AU/i);
    expect(out.system).toMatch(/idiomatic Russian/i);
    expect(out.user).toMatch(/HP/);
  });

  it('schema produces label_ru in Russian', () => {
    const sample = {
      genres: Array.from({ length: 10 }, (_, i) => ({
        slug: `g-${i}`,
        label_ru: `жанр ${i}`,
        popularity: 0.5,
      })),
    };
    expect(() => GenreSuggestSchema.parse(sample)).not.toThrow();
  });

  it('exposes stable TEMPLATE_ID', () => {
    expect(TEMPLATE_ID).toBe('genre_suggest');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm vitest run lib/prompts/genre-suggest.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `lib/prompts/genre-suggest.ts`:

```ts
import { z } from 'zod';
import type { FocusType } from '@prisma/client';
import { SYSTEM_INJECTION_NOTICE } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'genre_suggest';
export const TEMPLATE_VERSION = 1;

export const GenreSuggestSchema = z.object({
  genres: z
    .array(
      z.object({
        slug: z.string(),
        label_ru: z.string(),
        popularity: z.number().min(0).max(1),
      }),
    )
    .min(8)
    .max(14),
});
export type GenreSuggestOutput = z.infer<typeof GenreSuggestSchema>;

export function build(args: { fandomName: string; focus: FocusType }): { system: string; user: string } {
  return {
    system: [
      'You suggest AU/genre tags for fanfic in a given fandom and focus mode.',
      'Return 8–14 popular AU or genre tags. Mix mainstream («современная AU», «школьная AU», «coffee shop», «омегаверс», «соулмейты») with fandom-specific subgenres.',
      'label_ru must be in idiomatic Russian fanfic community slang. Never literal English translation.',
      'slug stays lowercase-hyphenated Latin.',
      SYSTEM_INJECTION_NOTICE,
    ].join('\n\n'),
    user: `Fandom: <user_input>${args.fandomName}</user_input>\nFocus: ${args.focus}`,
  };
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm vitest run lib/prompts/genre-suggest.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/prompts/genre-suggest.ts lib/prompts/genre-suggest.test.ts
git commit -m "feat(prompts): genre-suggest — fandom+focus AU/genre tags in RU"
```

---

## Phase 3 — API endpoints

### Task 7: PATCH draft — extend Zod schema

**Files:**
- Modify: `app/api/create/draft/[id]/route.ts`

- [ ] **Step 1: Update Zod schema**

Replace the schema in `app/api/create/draft/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

const UpdateSchema = z.object({
  fandomId: z.string().uuid().nullable().optional(),
  focusType: z.enum(['ROMANCE', 'GEN', 'CHARACTER_STUDY', 'FRIENDSHIP']).nullable().optional(),
  characters: z.array(z.string().min(1)).max(8).optional(),
  tropes: z.array(z.string().min(1)).max(10).optional(),
  rating: z.enum(['GENERAL', 'TEEN', 'MATURE', 'EXPLICIT']).nullable().optional(),
  category: z.enum(['SLASH', 'FEMSLASH', 'HET', 'GEN', 'MULTI', 'OTHER']).nullable().optional(),
  warnings: z.array(z.enum(['death', 'violence', 'non_con', 'cntw'])).optional(),
  pov: z.enum(['FIRST', 'CLOSE_THIRD', 'OMNISCIENT']).nullable().optional(),
  tense: z.enum(['PAST', 'PRESENT']).nullable().optional(),
  tones: z.array(z.enum(['SLOW_BURN', 'SPICY', 'FLUFF', 'ANGST', 'HURT_COMFORT', 'CRACK', 'DARK'])).optional(),
  timeline: z.string().nullable().optional(),
  timelineNote: z.string().max(500).nullable().optional(),
  genres: z.array(z.string().min(1)).max(10).optional(),
  setting: z.string().max(500).nullable().optional(),
  premise: z.string().max(2000).nullable().optional(),
  step: z.number().int().min(1).max(5).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdOrThrow(req);
  const { id } = await params;
  const body = UpdateSchema.parse(await req.json());
  const draft = await prisma.createDraft.findUnique({ where: { id } });
  if (!draft || draft.userId !== userId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  const updated = await prisma.createDraft.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}
```

- [ ] **Step 2: Update existing test if it references shipId/tone**

Open `app/api/create/draft/route.test.ts`. Replace any test that PATCHes `shipId: 'drarry'` with `characters: ['Гарри', 'Драко']`, and any `tone: 'SLOW_BURN'` with `tones: ['SLOW_BURN']`. Assertion lines `expect(after.shipId).toBe('drarry')` → `expect(after.characters).toEqual(['Гарри','Драко'])`.

- [ ] **Step 3: Run tests**

Run: `pnpm vitest run app/api/create/draft/route.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/api/create/draft/[id]/route.ts app/api/create/draft/route.test.ts
git commit -m "feat(api): PATCH draft — extended Zod schema for new wizard fields"
```

---

### Task 8: GET /api/create/suggestions/characters

**Files:**
- Create: `app/api/create/suggestions/characters/route.ts`
- Create: `app/api/create/suggestions/characters/route.test.ts`

- [ ] **Step 1: Write failing test**

Look at the existing `app/api/create/suggestions/ships/route.test.ts` for the test shape. Create `app/api/create/suggestions/characters/route.test.ts` mirroring it:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/llm-openai', () => ({
  openaiLlm: {
    completeStructured: vi.fn(async () => ({
      suggestions: Array.from({ length: 7 }, (_, i) => ({
        names: ['A' + i, 'B' + i],
        label_ru: `A${i} × B${i}`,
        popularity: 0.5,
        avatar_prompt: 'two figures',
        rarity: 'top',
        focus_compatible: ['romance'],
      })),
    })),
  },
}));
vi.mock('@/lib/cache/ai-suggestion', () => ({
  getSuggestion: vi.fn(async () => null),
  setSuggestion: vi.fn(async () => undefined),
}));

const FANDOM_ID = 'f1f1f1f1-1111-1111-1111-111111111111';

function makeReq(params: Record<string, string>) {
  const u = new URL('http://x/api/create/suggestions/characters');
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return new NextRequest(u);
}

beforeEach(async () => {
  await prisma.tag.upsert({
    where: { type_slug: { type: 'FANDOM', slug: 'hp-test-chars' } },
    create: { id: FANDOM_ID, type: 'FANDOM', name: 'HP', slug: 'hp-test-chars' },
    update: {},
  });
});

describe('GET /api/create/suggestions/characters', () => {
  it('400 without fandomId', async () => {
    const res = await GET(makeReq({ focus: 'ROMANCE' }));
    expect(res.status).toBe(400);
  });

  it('400 without focus', async () => {
    const res = await GET(makeReq({ fandomId: FANDOM_ID }));
    expect(res.status).toBe(400);
  });

  it('400 on invalid focus', async () => {
    const res = await GET(makeReq({ fandomId: FANDOM_ID, focus: 'BOGUS' }));
    expect(res.status).toBe(400);
  });

  it('returns suggestions array on success', async () => {
    const res = await GET(makeReq({ fandomId: FANDOM_ID, focus: 'ROMANCE' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.suggestions).toHaveLength(7);
    expect(body.suggestions[0]).toHaveProperty('label_ru');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm vitest run app/api/create/suggestions/characters/route.test.ts`
Expected: FAIL (file missing).

- [ ] **Step 3: Implement route**

Create `app/api/create/suggestions/characters/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { openaiLlm } from '@/lib/llm-openai';
import { getSuggestion, setSuggestion } from '@/lib/cache/ai-suggestion';
import * as characterSuggest from '@/lib/prompts/character-suggest';
import { canonicalFandom } from '@/lib/fandom/canonical';

const TTL_30D = 30 * 24 * 3600;
const FocusEnum = z.enum(['ROMANCE', 'GEN', 'CHARACTER_STUDY', 'FRIENDSHIP']);

export async function GET(req: NextRequest) {
  const fandomId = req.nextUrl.searchParams.get('fandomId');
  const focusRaw = req.nextUrl.searchParams.get('focus');
  if (!fandomId) return NextResponse.json({ error: 'fandomId required' }, { status: 400 });
  if (!focusRaw) return NextResponse.json({ error: 'focus required' }, { status: 400 });
  const focusParsed = FocusEnum.safeParse(focusRaw);
  if (!focusParsed.success) return NextResponse.json({ error: 'invalid focus' }, { status: 400 });
  const focus = focusParsed.data;

  const fandom = await prisma.tag.findUnique({ where: { id: fandomId } });
  if (!fandom) return NextResponse.json({ error: 'fandom not found' }, { status: 404 });

  const cacheKey = { scope: 'character_suggestions', fandomId, focus };
  const cached = await getSuggestion<characterSuggest.CharacterSuggestOutput>(
    'character_suggestions',
    cacheKey,
  );
  if (cached) return NextResponse.json({ suggestions: cached.suggestions, cached: true });

  const prompt = characterSuggest.build({
    fandomName: canonicalFandom(fandom.slug, fandom.name),
    focus,
  });
  const result = await openaiLlm.completeStructured({
    callType: 'character_suggest',
    templateId: characterSuggest.TEMPLATE_ID,
    templateVersion: characterSuggest.TEMPLATE_VERSION,
    schema: characterSuggest.CharacterSuggestSchema,
    ...prompt,
  });
  await setSuggestion(
    'character_suggestions',
    cacheKey,
    result,
    process.env.LLM_MODEL_DEFAULT ?? 'gpt-4o-mini',
    TTL_30D,
  );
  return NextResponse.json({ suggestions: result.suggestions, cached: false });
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm vitest run app/api/create/suggestions/characters/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/create/suggestions/characters/
git commit -m "feat(api): GET /api/create/suggestions/characters — focus-aware"
```

---

### Task 9: GET /api/create/suggestions/tropes — focus + characters

**Files:**
- Modify: `app/api/create/suggestions/tropes/route.ts`
- Modify: `app/api/create/suggestions/tropes/route.test.ts`

- [ ] **Step 1: Update test**

Open `app/api/create/suggestions/tropes/route.test.ts`. Change every `shipId` query param to `focus=ROMANCE` + `characters=Гарри,Драко`. Adjust 400-tests to assert on missing `focus` instead of `shipId`. Update mock to return new schema (`label_ru`, `description_ru`).

- [ ] **Step 2: Run — expect FAIL (param mismatch)**

Run: `pnpm vitest run app/api/create/suggestions/tropes/route.test.ts`
Expected: FAIL.

- [ ] **Step 3: Rewrite route**

Replace `app/api/create/suggestions/tropes/route.ts` with:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { openaiLlm } from '@/lib/llm-openai';
import { getSuggestion, setSuggestion } from '@/lib/cache/ai-suggestion';
import * as tropeSuggest from '@/lib/prompts/trope-suggest';
import { canonicalFandom } from '@/lib/fandom/canonical';

const TTL_7D = 7 * 24 * 3600;
const FocusEnum = z.enum(['ROMANCE', 'GEN', 'CHARACTER_STUDY', 'FRIENDSHIP']);

export async function GET(req: NextRequest) {
  const fandomId = req.nextUrl.searchParams.get('fandomId');
  const focusRaw = req.nextUrl.searchParams.get('focus');
  const charactersRaw = req.nextUrl.searchParams.get('characters');
  if (!fandomId) return NextResponse.json({ error: 'fandomId required' }, { status: 400 });
  if (!focusRaw) return NextResponse.json({ error: 'focus required' }, { status: 400 });
  const focusParsed = FocusEnum.safeParse(focusRaw);
  if (!focusParsed.success) return NextResponse.json({ error: 'invalid focus' }, { status: 400 });
  const focus = focusParsed.data;
  const characters = (charactersRaw ?? '').split(',').map((s) => s.trim()).filter(Boolean);

  const fandom = await prisma.tag.findUnique({ where: { id: fandomId } });
  if (!fandom) return NextResponse.json({ error: 'fandom not found' }, { status: 404 });

  const cacheKey = { scope: 'trope_suggestions', fandomId, focus, characters };
  const cached = await getSuggestion<tropeSuggest.TropeSuggestOutput>(
    'trope_suggestions',
    cacheKey,
  );
  if (cached) {
    return NextResponse.json({ tropes: cached.tropes, sensei_tip: cached.sensei_tip, cached: true });
  }

  const prompt = tropeSuggest.build({
    fandomName: canonicalFandom(fandom.slug, fandom.name),
    focus,
    characters,
  });
  const result = await openaiLlm.completeStructured({
    callType: 'trope_suggest',
    templateId: tropeSuggest.TEMPLATE_ID,
    templateVersion: tropeSuggest.TEMPLATE_VERSION,
    schema: tropeSuggest.TropeSuggestSchema,
    ...prompt,
  });
  await setSuggestion(
    'trope_suggestions',
    cacheKey,
    result,
    process.env.LLM_MODEL_DEFAULT ?? 'gpt-4o-mini',
    TTL_7D,
  );
  return NextResponse.json({ tropes: result.tropes, sensei_tip: result.sensei_tip, cached: false });
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm vitest run app/api/create/suggestions/tropes/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/create/suggestions/tropes/
git commit -m "feat(api): GET tropes — focus + characters; v2 schema"
```

---

### Task 10: GET /api/create/suggestions/genres (new)

**Files:**
- Create: `app/api/create/suggestions/genres/route.ts`
- Create: `app/api/create/suggestions/genres/route.test.ts`

- [ ] **Step 1: Write failing test**

Pattern after the characters route test. Mock `openaiLlm.completeStructured` to return 10 genre suggestions with `slug`/`label_ru`/`popularity`. Assert `200` + array length, plus 400 for missing fandomId/focus and 400 for invalid focus enum.

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm vitest run app/api/create/suggestions/genres/route.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement route**

Create `app/api/create/suggestions/genres/route.ts` modeled exactly on the characters route, swapping in `genreSuggest` and TTL 30d:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { openaiLlm } from '@/lib/llm-openai';
import { getSuggestion, setSuggestion } from '@/lib/cache/ai-suggestion';
import * as genreSuggest from '@/lib/prompts/genre-suggest';
import { canonicalFandom } from '@/lib/fandom/canonical';

const TTL_30D = 30 * 24 * 3600;
const FocusEnum = z.enum(['ROMANCE', 'GEN', 'CHARACTER_STUDY', 'FRIENDSHIP']);

export async function GET(req: NextRequest) {
  const fandomId = req.nextUrl.searchParams.get('fandomId');
  const focusRaw = req.nextUrl.searchParams.get('focus');
  if (!fandomId) return NextResponse.json({ error: 'fandomId required' }, { status: 400 });
  if (!focusRaw) return NextResponse.json({ error: 'focus required' }, { status: 400 });
  const focusParsed = FocusEnum.safeParse(focusRaw);
  if (!focusParsed.success) return NextResponse.json({ error: 'invalid focus' }, { status: 400 });
  const focus = focusParsed.data;

  const fandom = await prisma.tag.findUnique({ where: { id: fandomId } });
  if (!fandom) return NextResponse.json({ error: 'fandom not found' }, { status: 404 });

  const cacheKey = { scope: 'genre_suggestions', fandomId, focus };
  const cached = await getSuggestion<genreSuggest.GenreSuggestOutput>('genre_suggestions', cacheKey);
  if (cached) return NextResponse.json({ genres: cached.genres, cached: true });

  const prompt = genreSuggest.build({
    fandomName: canonicalFandom(fandom.slug, fandom.name),
    focus,
  });
  const result = await openaiLlm.completeStructured({
    callType: 'genre_suggest',
    templateId: genreSuggest.TEMPLATE_ID,
    templateVersion: genreSuggest.TEMPLATE_VERSION,
    schema: genreSuggest.GenreSuggestSchema,
    ...prompt,
  });
  await setSuggestion(
    'genre_suggestions',
    cacheKey,
    result,
    process.env.LLM_MODEL_DEFAULT ?? 'gpt-4o-mini',
    TTL_30D,
  );
  return NextResponse.json({ genres: result.genres, cached: false });
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm vitest run app/api/create/suggestions/genres/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/create/suggestions/genres/
git commit -m "feat(api): GET genres — fandom+focus AU/genre suggestions"
```

---

### Task 11: POST start — new validation + Story field copying

**Files:**
- Modify: `app/api/create/draft/[id]/start/route.ts`
- Modify: `app/api/create/draft/[id]/start/route.test.ts`

- [ ] **Step 1: Update test**

Open `app/api/create/draft/[id]/start/route.test.ts`. Update fixtures so drafts have `focusType: 'ROMANCE'` + `characters: ['Гарри', 'Драко']` instead of `shipId`. Add new test cases:
- 400 when `focusType` is null
- 400 when `characters` is empty
- 200 when valid draft with new shape — assert Story has `focusType`, `category`, `rating` etc copied from draft.
- Removed: the existing "shipId required" check.

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm vitest run app/api/create/draft/[id]/start/route.test.ts`
Expected: FAIL.

- [ ] **Step 3: Rewrite route**

Replace `app/api/create/draft/[id]/start/route.ts` with:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';
import { debitDaily } from '@/lib/quota/check-and-debit';
import { TEMPLATE_ID, TEMPLATE_VERSION } from '@/lib/prompts/chapter';
import { toSlug } from '@/lib/tag/slug';

const FREE_DAILY_STORIES = 3;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdOrThrow(req);
  const { id } = await params;
  const draft = await prisma.createDraft.findUnique({ where: { id } });
  if (!draft || draft.userId !== userId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  if (!draft.fandomId) {
    return NextResponse.json({ error: 'draft_incomplete', reason: 'fandom' }, { status: 400 });
  }
  if (!draft.focusType) {
    return NextResponse.json({ error: 'draft_incomplete', reason: 'focus' }, { status: 400 });
  }
  if (draft.characters.length === 0) {
    return NextResponse.json({ error: 'draft_incomplete', reason: 'characters' }, { status: 400 });
  }

  const quota = await debitDaily(userId, 'stories', FREE_DAILY_STORIES);
  if (!quota.allowed) {
    return NextResponse.json({ error: 'quota_exceeded' }, { status: 429 });
  }

  const { storyId, chapterId } = await prisma.$transaction(async (tx) => {
    const story = await tx.story.create({
      data: {
        authorId: userId,
        title: '(черновик)',
        visibility: 'PRIVATE',
        focusType: draft.focusType,
        rating: draft.rating,
        category: draft.category,
        warnings: draft.warnings,
        pov: draft.pov,
        tense: draft.tense,
        tones: draft.tones,
        tone: draft.tones[0] ?? null,    // legacy single-value field
        timeline: draft.timeline,
        timelineNote: draft.timelineNote,
        genres: draft.genres,
        premise: draft.premise,
      },
    });
    const chapter = await tx.chapter.create({
      data: {
        storyId: story.id,
        ordinal: 1,
        status: 'DRAFT',
        templateId: TEMPLATE_ID,
        templateVersion: TEMPLATE_VERSION,
      },
    });
    await tx.chapterUsage.create({ data: { chapterId: chapter.id } });

    await tx.storyTag.create({ data: { storyId: story.id, tagId: draft.fandomId! } });

    // Persist characters as RELATIONSHIP tag if focus=ROMANCE/FRIENDSHIP (≥2) else as CHARACTER tags.
    const relationshipFocuses: typeof draft.focusType[] = ['ROMANCE', 'FRIENDSHIP'];
    if (relationshipFocuses.includes(draft.focusType) && draft.characters.length >= 2) {
      const relName = draft.characters.join(' × ');
      const slug = toSlug(relName);
      const tag = await tx.tag.upsert({
        where: { type_slug: { type: 'RELATIONSHIP', slug } },
        create: { type: 'RELATIONSHIP', name: relName, slug },
        update: {},
      });
      await tx.storyTag.upsert({
        where: { storyId_tagId: { storyId: story.id, tagId: tag.id } },
        create: { storyId: story.id, tagId: tag.id },
        update: {},
      });
    }
    for (const charName of draft.characters) {
      const slug = toSlug(charName);
      const tag = await tx.tag.upsert({
        where: { type_slug: { type: 'CHARACTER', slug } },
        create: { type: 'CHARACTER', name: charName, slug },
        update: {},
      });
      await tx.storyTag.upsert({
        where: { storyId_tagId: { storyId: story.id, tagId: tag.id } },
        create: { storyId: story.id, tagId: tag.id },
        update: {},
      });
    }

    for (const trope of draft.tropes) {
      const slug = toSlug(trope);
      const tag = await tx.tag.upsert({
        where: { type_slug: { type: 'FREEFORM', slug } },
        create: { type: 'FREEFORM', name: trope, slug },
        update: {},
      });
      await tx.storyTag.upsert({
        where: { storyId_tagId: { storyId: story.id, tagId: tag.id } },
        create: { storyId: story.id, tagId: tag.id },
        update: {},
      });
    }
    for (const genre of draft.genres) {
      const slug = toSlug(genre);
      const tag = await tx.tag.upsert({
        where: { type_slug: { type: 'FREEFORM', slug } },
        create: { type: 'FREEFORM', name: genre, slug },
        update: {},
      });
      await tx.storyTag.upsert({
        where: { storyId_tagId: { storyId: story.id, tagId: tag.id } },
        create: { storyId: story.id, tagId: tag.id },
        update: {},
      });
    }

    return { storyId: story.id, chapterId: chapter.id };
  });

  return NextResponse.json({ storyId, chapterId });
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm vitest run app/api/create/draft/[id]/start/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/create/draft/[id]/start/
git commit -m "feat(api): start — focus+characters validation, propagate fields to Story"
```

---

### Task 12: Chapter stream route — pass new fields from Story

**Files:**
- Modify: `app/api/chapter/[id]/stream/route.ts`

- [ ] **Step 1: Update test**

Open `app/api/chapter/[id]/stream/route.test.ts`. Update fixtures so Story rows have `focusType: 'ROMANCE'`, `category: 'SLASH'`, `rating: 'MATURE'`, etc. Update the test that captures `chapterPrompt.build` args to assert `focusType`, `characters`, `rating`, `category`, `pov`, `tense`, `tones`, `genres`, `timeline`, `timelineNote`, `premise` are forwarded.

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm vitest run app/api/chapter/[id]/stream/route.test.ts`
Expected: FAIL.

- [ ] **Step 3: Update route**

In `app/api/chapter/[id]/stream/route.ts`, replace the `chapterPrompt.build({...})` call with the expanded shape, sourcing values from `chapter.story`:

```ts
const fandomTag = chapter.story.tags.find((st) => st.tag.type === 'FANDOM')?.tag;
const characterTags = chapter.story.tags
  .filter((st) => st.tag.type === 'CHARACTER')
  .map((st) => st.tag.name);
const tropeTags = chapter.story.tags
  .filter((st) => st.tag.type === 'FREEFORM' && !st.prefilled)
  .map((st) => st.tag.name);
const priorState = await loadPriorState(chapter.storyId, chapter.ordinal);

const { system, user } = chapterPrompt.build({
  fandomName: fandomTag ? canonicalFandom(fandomTag.slug, fandomTag.name) : 'unknown',
  focusType: chapter.story.focusType ?? 'ROMANCE',
  characters: characterTags,
  tropes: tropeTags,
  rating: chapter.story.rating ?? undefined,
  category: chapter.story.category ?? undefined,
  warnings: chapter.story.warnings,
  pov: chapter.story.pov ?? undefined,
  tense: chapter.story.tense ?? undefined,
  tones: chapter.story.tones,
  genres: chapter.story.genres,
  timeline: chapter.story.timeline ?? undefined,
  timelineNote: chapter.story.timelineNote ?? undefined,
  premise: chapter.story.premise ?? undefined,
  chapterLength: length,
  chapterOrdinal: chapter.ordinal,
  priorState: priorState ?? undefined,
});
```

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm vitest run app/api/chapter/[id]/stream/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/chapter/[id]/stream/
git commit -m "feat(api): chapter stream — pass all new Story fields to chapterPrompt"
```

---

### Task 13: Delete old ship-suggest endpoint and prompt

**Files:**
- Delete: `app/api/create/suggestions/ships/route.ts`
- Delete: `app/api/create/suggestions/ships/route.test.ts`
- Delete: `lib/prompts/ship-suggest.ts`

- [ ] **Step 1: Remove files**

```bash
git rm app/api/create/suggestions/ships/route.ts \
  app/api/create/suggestions/ships/route.test.ts \
  lib/prompts/ship-suggest.ts
rmdir app/api/create/suggestions/ships
```

- [ ] **Step 2: Verify build**

Run: `pnpm typecheck`
Expected: no errors. (If any file still imports `ship-suggest`, fix it — `CreatePageView.tsx` will be rewritten in Phase 5 and the old client is replaced then.)

- [ ] **Step 3: Commit**

```bash
git commit -m "chore(api): drop deprecated ship-suggest endpoint"
```

---

## Phase 4 — UI Primitives

### Task 14: ChipGroup (single-select)

**Files:**
- Create: `components/ui/ChipGroup.tsx`
- Create: `components/ui/ChipGroup.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChipGroup } from './ChipGroup';

const OPTIONS = [
  { value: 'a', label: 'один' },
  { value: 'b', label: 'два' },
];

describe('ChipGroup', () => {
  it('renders all options as buttons', () => {
    render(<ChipGroup options={OPTIONS} value={null} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /один/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /два/ })).toBeTruthy();
  });

  it('calls onChange with value on click', () => {
    const onChange = vi.fn();
    render(<ChipGroup options={OPTIONS} value={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /два/ }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('marks selected chip with aria-pressed', () => {
    render(<ChipGroup options={OPTIONS} value="a" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /один/ }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: /два/ }).getAttribute('aria-pressed')).toBe('false');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm vitest run components/ui/ChipGroup.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `components/ui/ChipGroup.tsx`:

```tsx
'use client';

interface ChipOption<V extends string> {
  value: V;
  label: string;
  description?: string;
}

interface ChipGroupProps<V extends string> {
  options: ChipOption<V>[];
  value: V | null;
  onChange: (next: V) => void;
  testIdPrefix?: string;
}

export function ChipGroup<V extends string>({ options, value, onChange, testIdPrefix }: ChipGroupProps<V>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            type="button"
            key={opt.value}
            aria-pressed={active}
            data-testid={testIdPrefix ? `${testIdPrefix}-${opt.value}` : undefined}
            onClick={() => onChange(opt.value)}
            className={`rounded-full border px-4 py-1.5 font-mono text-mono-s tracking-caps uppercase transition-colors ${
              active
                ? 'border-amber/60 bg-amber-soft text-amber'
                : 'border-ink-faint/30 text-ink-dim hover:text-ink'
            }`}
            title={opt.description}
          >
            {active ? '★ ' : ''}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm vitest run components/ui/ChipGroup.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/ui/ChipGroup.tsx components/ui/ChipGroup.test.tsx
git commit -m "feat(ui): ChipGroup single-select primitive"
```

---

### Task 15: MultiChipGroup (multi-select)

**Files:**
- Create: `components/ui/MultiChipGroup.tsx`
- Create: `components/ui/MultiChipGroup.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiChipGroup } from './MultiChipGroup';

const OPTIONS = [
  { value: 'a', label: 'один' },
  { value: 'b', label: 'два' },
  { value: 'c', label: 'три' },
];

describe('MultiChipGroup', () => {
  it('toggles values on click', () => {
    const onChange = vi.fn();
    render(<MultiChipGroup options={OPTIONS} values={['a']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /два/ }));
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('removes value on second click', () => {
    const onChange = vi.fn();
    render(<MultiChipGroup options={OPTIONS} values={['a', 'b']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /один/ }));
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('enforces max if provided', () => {
    const onChange = vi.fn();
    render(<MultiChipGroup options={OPTIONS} values={['a', 'b']} onChange={onChange} max={2} />);
    fireEvent.click(screen.getByRole('button', { name: /три/ }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm vitest run components/ui/MultiChipGroup.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `components/ui/MultiChipGroup.tsx`:

```tsx
'use client';

interface ChipOption<V extends string> {
  value: V;
  label: string;
  description?: string;
}

interface MultiChipGroupProps<V extends string> {
  options: ChipOption<V>[];
  values: V[];
  onChange: (next: V[]) => void;
  max?: number;
  testIdPrefix?: string;
}

export function MultiChipGroup<V extends string>({
  options,
  values,
  onChange,
  max,
  testIdPrefix,
}: MultiChipGroupProps<V>) {
  const toggle = (v: V) => {
    if (values.includes(v)) {
      onChange(values.filter((x) => x !== v));
      return;
    }
    if (max !== undefined && values.length >= max) return;
    onChange([...values, v]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = values.includes(opt.value);
        return (
          <button
            type="button"
            key={opt.value}
            aria-pressed={active}
            data-testid={testIdPrefix ? `${testIdPrefix}-${opt.value}` : undefined}
            onClick={() => toggle(opt.value)}
            className={`rounded-full border px-3 py-1.5 font-mono text-mono-s tracking-caps uppercase transition-colors ${
              active
                ? 'border-amber/60 bg-amber-soft text-amber'
                : 'border-ink-faint/30 text-ink-dim hover:text-ink'
            }`}
            title={opt.description}
          >
            {active ? '★ ' : ''}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm vitest run components/ui/MultiChipGroup.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/ui/MultiChipGroup.tsx components/ui/MultiChipGroup.test.tsx
git commit -m "feat(ui): MultiChipGroup multi-select primitive"
```

---

### Task 16: TagInput (free-input + selected chips)

**Files:**
- Create: `components/ui/TagInput.tsx`
- Create: `components/ui/TagInput.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagInput } from './TagInput';

describe('TagInput', () => {
  it('adds tag on Enter', () => {
    const onChange = vi.fn();
    render(<TagInput values={[]} onChange={onChange} placeholder="+ свой" />);
    const input = screen.getByPlaceholderText('+ свой') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'мой троп' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['мой троп']);
  });

  it('removes tag on chip × click', () => {
    const onChange = vi.fn();
    render(<TagInput values={['a', 'b']} onChange={onChange} placeholder="x" />);
    const removeBtn = screen.getByRole('button', { name: /remove a/i });
    fireEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('ignores empty or duplicate input', () => {
    const onChange = vi.fn();
    render(<TagInput values={['a']} onChange={onChange} placeholder="x" />);
    const input = screen.getByPlaceholderText('x') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('enforces max if provided', () => {
    const onChange = vi.fn();
    render(<TagInput values={['a', 'b']} onChange={onChange} placeholder="x" max={2} />);
    const input = screen.getByPlaceholderText('x') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'c' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm vitest run components/ui/TagInput.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `components/ui/TagInput.tsx`:

```tsx
'use client';

import { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  max?: number;
  testIdPrefix?: string;
}

export function TagInput({ values, onChange, placeholder, max, testIdPrefix }: TagInputProps) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) return;
    if (max !== undefined && values.length >= max) return;
    onChange([...values, trimmed]);
    setDraft('');
  };
  const remove = (v: string) => {
    onChange(values.filter((x) => x !== v));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && draft === '' && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-ink-faint/25 bg-surface-raised px-2 py-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber-soft px-2 py-0.5 font-mono text-mono-s tracking-caps text-amber uppercase"
            data-testid={testIdPrefix ? `${testIdPrefix}-chip` : undefined}
          >
            {v}
            <button
              type="button"
              aria-label={`remove ${v}`}
              onClick={() => remove(v)}
              className="text-amber/70 hover:text-amber"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={add}
          placeholder={placeholder}
          className="flex-1 min-w-[120px] bg-transparent font-body text-body-s italic text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm vitest run components/ui/TagInput.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/ui/TagInput.tsx components/ui/TagInput.test.tsx
git commit -m "feat(ui): TagInput — free-input with chips and max"
```

---

### Task 17: AccordionSection

**Files:**
- Create: `components/ui/AccordionSection.tsx`
- Create: `components/ui/AccordionSection.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccordionSection } from './AccordionSection';

describe('AccordionSection', () => {
  it('hides body by default and reveals on header click', () => {
    render(
      <AccordionSection title="маркировка" subtitle="рейтинг · категория">
        <span data-testid="body-content">body</span>
      </AccordionSection>,
    );
    expect(screen.queryByTestId('body-content')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /маркировка/ }));
    expect(screen.getByTestId('body-content')).toBeTruthy();
  });

  it('starts open if defaultOpen=true', () => {
    render(
      <AccordionSection title="x" defaultOpen>
        <span data-testid="body-content">body</span>
      </AccordionSection>,
    );
    expect(screen.getByTestId('body-content')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm vitest run components/ui/AccordionSection.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `components/ui/AccordionSection.tsx`:

```tsx
'use client';

import { useState, ReactNode } from 'react';

interface AccordionSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function AccordionSection({ title, subtitle, defaultOpen = false, children }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-t border-ink-faint/15 pt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-baseline justify-between text-left"
      >
        <span className="flex items-baseline gap-3">
          <span className="font-mono text-mono-s tracking-caps text-amber uppercase">
            {open ? '▾' : '▸'} {title}
          </span>
          {subtitle && (
            <span className="font-body text-body-s italic text-ink-dim">{subtitle}</span>
          )}
        </span>
      </button>
      {open && <div className="pt-4 pb-2">{children}</div>}
    </section>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm vitest run components/ui/AccordionSection.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/ui/AccordionSection.tsx components/ui/AccordionSection.test.tsx
git commit -m "feat(ui): AccordionSection collapsible primitive"
```

---

## Phase 5 — Step components and shell

### Task 18: StepFocusCharacters

**Files:**
- Create: `components/create/StepFocusCharacters.tsx`
- Create: `components/create/StepFocusCharacters.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepFocusCharacters } from './StepFocusCharacters';

const SUGGESTIONS = [
  { names: ['Гарри', 'Драко'], label_ru: 'Гарри × Драко', popularity: 0.9, rarity: 'top' as const, focus_compatible: ['romance' as const] },
  { names: ['Снейп', 'Гермиона'], label_ru: 'Снейп × Гермиона', popularity: 0.3, rarity: 'rare' as const, focus_compatible: ['romance' as const] },
];

describe('StepFocusCharacters', () => {
  it('does not render character input until focus is chosen', () => {
    render(
      <StepFocusCharacters
        focus={null}
        characters={[]}
        suggestions={[]}
        suggestionsLoading={false}
        onFocusChange={() => {}}
        onCharactersChange={() => {}}
        onNext={() => {}}
      />,
    );
    expect(screen.queryByPlaceholderText(/свой пейринг|свой герой/i)).toBeNull();
  });

  it('shows ship-input after picking Romance', () => {
    const onFocusChange = vi.fn();
    render(
      <StepFocusCharacters
        focus={null}
        characters={[]}
        suggestions={[]}
        suggestionsLoading={false}
        onFocusChange={onFocusChange}
        onCharactersChange={() => {}}
        onNext={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /романтика/i }));
    expect(onFocusChange).toHaveBeenCalledWith('ROMANCE');
  });

  it('clicking a suggestion adds names to characters', () => {
    const onCharactersChange = vi.fn();
    render(
      <StepFocusCharacters
        focus="ROMANCE"
        characters={[]}
        suggestions={SUGGESTIONS}
        suggestionsLoading={false}
        onFocusChange={() => {}}
        onCharactersChange={onCharactersChange}
        onNext={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Гарри × Драко/i }));
    expect(onCharactersChange).toHaveBeenCalledWith(['Гарри', 'Драко']);
  });

  it('Romance requires ≥2 characters before onNext is enabled', () => {
    const onNext = vi.fn();
    render(
      <StepFocusCharacters
        focus="ROMANCE"
        characters={['Гарри']}
        suggestions={[]}
        suggestionsLoading={false}
        onFocusChange={() => {}}
        onCharactersChange={() => {}}
        onNext={onNext}
      />,
    );
    const next = screen.getByRole('button', { name: /дальше/i });
    expect((next as HTMLButtonElement).disabled).toBe(true);
  });

  it('Gen requires ≥1 character', () => {
    render(
      <StepFocusCharacters
        focus="GEN"
        characters={['Гарри']}
        suggestions={[]}
        suggestionsLoading={false}
        onFocusChange={() => {}}
        onCharactersChange={() => {}}
        onNext={() => {}}
      />,
    );
    const next = screen.getByRole('button', { name: /дальше/i });
    expect((next as HTMLButtonElement).disabled).toBe(false);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm vitest run components/create/StepFocusCharacters.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `components/create/StepFocusCharacters.tsx`:

```tsx
'use client';

import { ChipGroup } from '@/components/ui/ChipGroup';
import { TagInput } from '@/components/ui/TagInput';
import { FOCUS_LABELS, FOCUS_DESCRIPTIONS } from '@/lib/create/locale';
import type { FocusType } from '@prisma/client';

export interface CharacterSuggestion {
  names: string[];
  label_ru: string;
  popularity: number;
  avatar_prompt?: string;
  rarity: 'top' | 'rare';
  focus_compatible: Array<'romance' | 'gen' | 'character_study' | 'friendship'>;
}

interface StepFocusCharactersProps {
  focus: FocusType | null;
  characters: string[];
  suggestions: CharacterSuggestion[];
  suggestionsLoading: boolean;
  onFocusChange: (f: FocusType) => void;
  onCharactersChange: (next: string[]) => void;
  onNext: () => void;
}

const FOCUS_OPTIONS: Array<{ value: FocusType; label: string; description: string }> = (
  ['ROMANCE', 'GEN', 'CHARACTER_STUDY', 'FRIENDSHIP'] as FocusType[]
).map((f) => ({ value: f, label: FOCUS_LABELS[f], description: FOCUS_DESCRIPTIONS[f] }));

function minCharactersFor(focus: FocusType): number {
  if (focus === 'CHARACTER_STUDY') return 1;
  if (focus === 'ROMANCE' || focus === 'FRIENDSHIP') return 2;
  return 1;
}

function placeholderFor(focus: FocusType): string {
  if (focus === 'ROMANCE') return '+ свой пейринг (например, «Снейп × Гермиона»)';
  if (focus === 'CHARACTER_STUDY') return '+ свой герой';
  return '+ свой герой';
}

export function StepFocusCharacters({
  focus,
  characters,
  suggestions,
  suggestionsLoading,
  onFocusChange,
  onCharactersChange,
  onNext,
}: StepFocusCharactersProps) {
  const canNext = focus !== null && characters.length >= minCharactersFor(focus);
  const maxChars = focus === 'CHARACTER_STUDY' ? 1 : 6;

  const addFromSuggestion = (s: CharacterSuggestion) => {
    if (focus === 'CHARACTER_STUDY') {
      onCharactersChange([s.names[0]]);
    } else {
      const merged = Array.from(new Set([...characters, ...s.names])).slice(0, maxChars);
      onCharactersChange(merged);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[34px] lg:text-[64px] leading-[1.05] lg:leading-[0.95] tracking-tight text-balance">
          <span className="italic text-amber">фокус</span> истории<span className="text-amber">.</span>
        </h1>
        <p className="mt-3 max-w-[48ch] font-body text-body-s lg:text-body-l italic text-ink-dim">
          С чего строим сюжет — пейринг, приключение, один герой или дружба.
        </p>
      </div>

      <ChipGroup
        options={FOCUS_OPTIONS}
        value={focus}
        onChange={onFocusChange}
        testIdPrefix="step-focus"
      />

      {focus && (
        <div className="flex flex-col gap-4">
          <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
            ✦ {focus === 'ROMANCE' ? 'пейринг' : focus === 'CHARACTER_STUDY' ? 'главный герой' : 'главные герои'}
          </div>

          {suggestionsLoading && (
            <div className="font-mono text-mono-s tracking-caps uppercase text-ink-dim animate-pulse">
              загружаем подсказки...
            </div>
          )}

          {!suggestionsLoading && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  type="button"
                  key={s.label_ru}
                  data-testid="character-suggestion"
                  onClick={() => addFromSuggestion(s)}
                  className="rounded-full border border-ink-faint/30 px-3 py-1.5 font-mono text-mono-s tracking-caps text-ink-dim uppercase hover:border-amber/50 hover:text-amber transition-colors"
                >
                  {s.rarity === 'top' ? '★ ' : ''}
                  {s.label_ru}
                </button>
              ))}
            </div>
          )}

          <TagInput
            values={characters}
            onChange={onCharactersChange}
            placeholder={placeholderFor(focus)}
            max={maxChars}
            testIdPrefix="character"
          />
        </div>
      )}

      <div className="pt-2">
        <button
          type="button"
          data-testid="step-next"
          onClick={onNext}
          disabled={!canNext}
          className="rounded-full bg-amber px-7 py-3 font-mono text-mono-m tracking-caps uppercase text-bg-deep shadow-amber-glow disabled:opacity-40 disabled:cursor-not-allowed"
        >
          дальше · тропы ›
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm vitest run components/create/StepFocusCharacters.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/create/StepFocusCharacters.tsx components/create/StepFocusCharacters.test.tsx
git commit -m "feat(create): StepFocusCharacters — focus-driven Step 2"
```

---

### Task 19: StepDetails (4 accordion sections)

**Files:**
- Create: `components/create/StepDetails.tsx`
- Create: `components/create/StepDetails.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepDetails, type StepDetailsValue } from './StepDetails';

const EMPTY: StepDetailsValue = {
  rating: null, category: null, warnings: [],
  pov: null, tense: null, tones: [],
  timeline: null, timelineNote: null, genres: [], setting: null,
  premise: null,
};

describe('StepDetails', () => {
  it('renders 4 collapsed accordion sections', () => {
    render(
      <StepDetails
        value={EMPTY}
        onChange={() => {}}
        genreSuggestions={[]}
        genreSuggestionsLoading={false}
        onNext={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /маркировка/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /голос/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /вселенная/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /завязка/i })).toBeTruthy();
  });

  it('opening "маркировка" reveals rating chips', () => {
    render(
      <StepDetails
        value={EMPTY}
        onChange={() => {}}
        genreSuggestions={[]}
        genreSuggestionsLoading={false}
        onNext={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /маркировка/i }));
    expect(screen.getByRole('button', { name: /общий/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /16\+/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /18\+/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /explicit/i })).toBeTruthy();
  });

  it('clicking rating chip emits onChange patch', () => {
    const onChange = vi.fn();
    render(
      <StepDetails
        value={EMPTY}
        onChange={onChange}
        genreSuggestions={[]}
        genreSuggestionsLoading={false}
        onNext={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /маркировка/i }));
    fireEvent.click(screen.getByRole('button', { name: /18\+/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ rating: 'MATURE' }));
  });

  it('"дальше" is always enabled (all advanced fields optional)', () => {
    render(
      <StepDetails
        value={EMPTY}
        onChange={() => {}}
        genreSuggestions={[]}
        genreSuggestionsLoading={false}
        onNext={() => {}}
      />,
    );
    const next = screen.getByRole('button', { name: /дальше/i });
    expect((next as HTMLButtonElement).disabled).toBe(false);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm vitest run components/create/StepDetails.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `components/create/StepDetails.tsx`:

```tsx
'use client';

import type { Rating, Category, Pov, Tense, Tone } from '@prisma/client';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { MultiChipGroup } from '@/components/ui/MultiChipGroup';
import { TagInput } from '@/components/ui/TagInput';
import { AccordionSection } from '@/components/ui/AccordionSection';
import {
  RATING_LABELS,
  CATEGORY_LABELS,
  POV_LABELS,
  TENSE_LABELS,
  TONE_LABELS,
  WARNING_LABELS,
  WARNING_KEYS,
  TIMELINE_LABELS,
  TIMELINE_KEYS,
  type WarningKey,
  type TimelineKey,
} from '@/lib/create/locale';

export interface StepDetailsValue {
  rating: Rating | null;
  category: Category | null;
  warnings: WarningKey[];
  pov: Pov | null;
  tense: Tense | null;
  tones: Tone[];
  timeline: TimelineKey | null;
  timelineNote: string | null;
  genres: string[];
  setting: string | null;
  premise: string | null;
}

export interface GenreSuggestion {
  slug: string;
  label_ru: string;
  popularity: number;
}

interface StepDetailsProps {
  value: StepDetailsValue;
  onChange: (patch: Partial<StepDetailsValue>) => void;
  genreSuggestions: GenreSuggestion[];
  genreSuggestionsLoading: boolean;
  onNext: () => void;
}

const RATING_OPTS = (['GENERAL', 'TEEN', 'MATURE', 'EXPLICIT'] as Rating[]).map((r) => ({
  value: r, label: RATING_LABELS[r],
}));
const CATEGORY_OPTS = (['SLASH', 'FEMSLASH', 'HET', 'GEN', 'MULTI'] as Category[]).map((c) => ({
  value: c, label: CATEGORY_LABELS[c],
}));
const POV_OPTS = (['FIRST', 'CLOSE_THIRD', 'OMNISCIENT'] as Pov[]).map((p) => ({
  value: p, label: POV_LABELS[p],
}));
const TENSE_OPTS = (['PAST', 'PRESENT'] as Tense[]).map((t) => ({
  value: t, label: TENSE_LABELS[t],
}));
const TONE_OPTS = (['SLOW_BURN', 'SPICY', 'FLUFF', 'ANGST', 'HURT_COMFORT', 'CRACK', 'DARK'] as Tone[]).map((t) => ({
  value: t, label: TONE_LABELS[t],
}));
const WARNING_OPTS = WARNING_KEYS.map((k) => ({ value: k, label: WARNING_LABELS[k] }));
const TIMELINE_OPTS = TIMELINE_KEYS.map((k) => ({ value: k, label: TIMELINE_LABELS[k] }));

export function StepDetails({
  value, onChange, genreSuggestions, genreSuggestionsLoading, onNext,
}: StepDetailsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[34px] lg:text-[64px] leading-[1.05] lg:leading-[0.95] tracking-tight text-balance">
          <span className="italic text-amber">детали</span><span className="text-amber">.</span>
        </h1>
        <p className="mt-3 max-w-[48ch] font-body text-body-s lg:text-body-l italic text-ink-dim">
          всё опционально — пропусти, и AI заполнит сам.
        </p>
      </div>

      <div className="flex flex-col">
        <AccordionSection title="маркировка" subtitle="рейтинг · категория · предупреждения">
          <div className="flex flex-col gap-4">
            <Field label="рейтинг">
              <ChipGroup
                options={RATING_OPTS}
                value={value.rating}
                onChange={(v) => onChange({ rating: v })}
                testIdPrefix="detail-rating"
              />
            </Field>
            <Field label="категория">
              <ChipGroup
                options={CATEGORY_OPTS}
                value={value.category}
                onChange={(v) => onChange({ category: v })}
                testIdPrefix="detail-category"
              />
            </Field>
            <Field label="предупреждения">
              <MultiChipGroup
                options={WARNING_OPTS}
                values={value.warnings}
                onChange={(v) => onChange({ warnings: v })}
                testIdPrefix="detail-warnings"
              />
            </Field>
          </div>
        </AccordionSection>

        <AccordionSection title="голос истории" subtitle="POV · время · тон">
          <div className="flex flex-col gap-4">
            <Field label="POV">
              <ChipGroup
                options={POV_OPTS}
                value={value.pov}
                onChange={(v) => onChange({ pov: v })}
                testIdPrefix="detail-pov"
              />
            </Field>
            <Field label="время">
              <ChipGroup
                options={TENSE_OPTS}
                value={value.tense}
                onChange={(v) => onChange({ tense: v })}
                testIdPrefix="detail-tense"
              />
            </Field>
            <Field label="тон">
              <MultiChipGroup
                options={TONE_OPTS}
                values={value.tones}
                onChange={(v) => onChange({ tones: v })}
                testIdPrefix="detail-tones"
              />
            </Field>
          </div>
        </AccordionSection>

        <AccordionSection title="вселенная" subtitle="канон или AU · жанр · место">
          <div className="flex flex-col gap-4">
            <Field label="когда происходит">
              <ChipGroup
                options={TIMELINE_OPTS}
                value={value.timeline}
                onChange={(v) => onChange({ timeline: v })}
                testIdPrefix="detail-timeline"
              />
              <textarea
                value={value.timelineNote ?? ''}
                onChange={(e) => onChange({ timelineNote: e.target.value || null })}
                rows={2}
                placeholder="уточни (год, эпоха) — опционально"
                className="mt-2 w-full resize-none rounded-md border border-ink-faint/25 bg-surface-raised px-3 py-2 font-body text-body-s italic text-ink placeholder:text-ink-faint focus:border-amber/40 focus:outline-none"
              />
            </Field>
            <Field label="жанр / AU-тип">
              {genreSuggestionsLoading && (
                <div className="font-mono text-mono-s tracking-caps uppercase text-ink-dim animate-pulse">
                  загружаем жанры...
                </div>
              )}
              {!genreSuggestionsLoading && genreSuggestions.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {genreSuggestions.map((g) => (
                    <button
                      type="button"
                      key={g.slug}
                      onClick={() => {
                        if (!value.genres.includes(g.label_ru)) {
                          onChange({ genres: [...value.genres, g.label_ru] });
                        }
                      }}
                      className="rounded-full border border-ink-faint/30 px-3 py-1 font-mono text-mono-s tracking-caps text-ink-dim uppercase hover:border-amber/50 hover:text-amber"
                    >
                      {g.label_ru}
                    </button>
                  ))}
                </div>
              )}
              <TagInput
                values={value.genres}
                onChange={(v) => onChange({ genres: v })}
                placeholder="+ свой жанр / AU"
                max={6}
                testIdPrefix="detail-genres"
              />
            </Field>
            <Field label="место и время">
              <textarea
                value={value.setting ?? ''}
                onChange={(e) => onChange({ setting: e.target.value || null })}
                rows={2}
                placeholder="напр. «Хогвартс, зима», «Лондон, 2042»"
                className="w-full resize-none rounded-md border border-ink-faint/25 bg-surface-raised px-3 py-2 font-body text-body-s italic text-ink placeholder:text-ink-faint focus:border-amber/40 focus:outline-none"
              />
            </Field>
          </div>
        </AccordionSection>

        <AccordionSection title="завязка" subtitle="с чего начнётся первая глава">
          <textarea
            value={value.premise ?? ''}
            onChange={(e) => onChange({ premise: e.target.value || null })}
            rows={4}
            placeholder="что происходит в начале — фраза, сцена, идея"
            data-testid="detail-premise"
            className="w-full resize-none rounded-md border border-ink-faint/25 bg-surface-raised px-3 py-3 font-body text-body-s italic text-ink placeholder:text-ink-faint focus:border-amber/40 focus:outline-none"
          />
        </AccordionSection>
      </div>

      <div className="pt-2">
        <button
          type="button"
          data-testid="step-next"
          onClick={onNext}
          className="rounded-full bg-amber px-7 py-3 font-mono text-mono-m tracking-caps uppercase text-bg-deep shadow-amber-glow"
        >
          дальше · превью ›
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">{label}</div>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm vitest run components/create/StepDetails.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/create/StepDetails.tsx components/create/StepDetails.test.tsx
git commit -m "feat(create): StepDetails — accordion advanced fields"
```

---

### Task 20: CreatePageView — rewire state machine

**Files:**
- Modify: `components/create/CreatePageView.tsx`

This is a large rewrite. Plan it as two sub-commits: shell + step 3/5 first, then validate end-to-end with the existing flow test in Task 21.

- [ ] **Step 1: Replace top-of-file state and step labels**

Replace the imports, types, and state block of `components/create/CreatePageView.tsx` with the structure below. Keep `FeedHeader`, `GrainCover`, `ScotchTag`, `BurstSticker`, `SenseiTip`, `QuotaModal`, `FANDOMS`, `apiFetch` imports — add the new step imports.

```tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import type { FocusType, Rating, Category, Pov, Tense, Tone } from '@prisma/client';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { GrainCover } from '@/components/ui/GrainCover';
import { ScotchTag } from '@/components/ui/ScotchTag';
import { BurstSticker } from '@/components/ui/BurstSticker';
import { MultiChipGroup } from '@/components/ui/MultiChipGroup';
import { TagInput } from '@/components/ui/TagInput';
import { SenseiTip } from '@/components/create/SenseiTip';
import {
  StepFocusCharacters,
  type CharacterSuggestion,
} from '@/components/create/StepFocusCharacters';
import { StepDetails, type StepDetailsValue, type GenreSuggestion } from '@/components/create/StepDetails';
import { QuotaModal } from '@/components/quota/QuotaModal';
import { FANDOMS, type FandomOption } from '@/lib/create/fandoms';
import { apiFetch } from '@/lib/api/client';
import { TONE_LABELS, RATING_LABELS, CATEGORY_LABELS, POV_LABELS, TIMELINE_LABELS } from '@/lib/create/locale';

interface TropeSuggestion {
  slug: string;
  label_ru: string;
  description_ru: string;
  popularity: number;
}

const STEPS = ['fandom', 'focus', 'tropes', 'details', 'preview'] as const;
type Step = 1 | 2 | 3 | 4 | 5;

export function CreatePageView() {
  const router = useRouter();

  // Draft
  const [draftId, setDraftId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [isInitializing, setIsInitializing] = useState(true);

  // Step 1
  const [selectedFandom, setSelectedFandom] = useState<FandomOption | null>(null);

  // Step 2
  const [focus, setFocus] = useState<FocusType | null>(null);
  const [characters, setCharacters] = useState<string[]>([]);
  const [characterSuggestions, setCharacterSuggestions] = useState<CharacterSuggestion[]>([]);
  const [characterSuggestionsLoading, setCharacterSuggestionsLoading] = useState(false);

  // Step 3
  const [tropes, setTropes] = useState<string[]>([]);
  const [tropeSuggestions, setTropeSuggestions] = useState<TropeSuggestion[]>([]);
  const [tropeSuggestionsLoading, setTropeSuggestionsLoading] = useState(false);
  const [senseiTip, setSenseiTip] = useState('');

  // Step 4
  const [details, setDetails] = useState<StepDetailsValue>({
    rating: null, category: null, warnings: [],
    pov: null, tense: null, tones: [],
    timeline: null, timelineNote: null, genres: [], setting: null,
    premise: null,
  });
  const [genreSuggestions, setGenreSuggestions] = useState<GenreSuggestion[]>([]);
  const [genreSuggestionsLoading, setGenreSuggestionsLoading] = useState(false);

  // UI
  const [isStarting, setIsStarting] = useState(false);
  const [showQuota, setShowQuota] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Debounce ref for PATCHes
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ... (the rest of the component continues in Step 2)
```

- [ ] **Step 2: Implement helpers and effect hooks**

Below the state block, add helpers and effects (still inside `CreatePageView`):

```tsx
  useEffect(() => {
    async function createDraft() {
      try {
        const res = await apiFetch('/api/create/draft', { method: 'POST' });
        if (!res.ok) throw new Error('failed to create draft');
        const data = await res.json();
        setDraftId(data.id);
      } catch {
        setErrorMsg('не удалось создать черновик. перезагрузи страницу.');
      } finally {
        setIsInitializing(false);
      }
    }
    void createDraft();
  }, []);

  const patchDraft = useCallback(
    async (body: Record<string, unknown>) => {
      if (!draftId) return;
      try {
        await apiFetch(`/api/create/draft/${draftId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
      } catch {
        // silent autosave failure
      }
    },
    [draftId],
  );

  const debouncedPatch = useCallback(
    (body: Record<string, unknown>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => void patchDraft(body), 500);
    },
    [patchDraft],
  );

  // ── Step 1 → 2 ─────────────────────────────────────────────────────────────
  const pickFandom = useCallback(
    async (fandom: FandomOption) => {
      setSelectedFandom(fandom);
      setStep(2);
      await patchDraft({ fandomId: fandom.id, step: 2 });
    },
    [patchDraft],
  );

  // ── Step 2: pick focus → fetch character suggestions ──────────────────────
  const handleFocusChange = useCallback(
    async (next: FocusType) => {
      setFocus(next);
      setCharacters([]);
      setCharacterSuggestionsLoading(true);
      await patchDraft({ focusType: next, characters: [] });
      if (!selectedFandom) return;
      try {
        const res = await apiFetch(
          `/api/create/suggestions/characters?fandomId=${encodeURIComponent(selectedFandom.id)}&focus=${next}`,
        );
        if (!res.ok) throw new Error('characters fetch failed');
        const data = await res.json();
        setCharacterSuggestions(data.suggestions ?? []);
      } catch {
        setErrorMsg('не удалось загрузить подсказки');
      } finally {
        setCharacterSuggestionsLoading(false);
      }
    },
    [patchDraft, selectedFandom],
  );

  const handleCharactersChange = useCallback(
    (next: string[]) => {
      setCharacters(next);
      debouncedPatch({ characters: next });
    },
    [debouncedPatch],
  );

  const confirmFocusCharacters = useCallback(async () => {
    setStep(3);
    setTropeSuggestionsLoading(true);
    await patchDraft({ step: 3 });
    if (!selectedFandom || !focus) return;
    try {
      const res = await apiFetch(
        `/api/create/suggestions/tropes?fandomId=${encodeURIComponent(selectedFandom.id)}&focus=${focus}&characters=${encodeURIComponent(characters.join(','))}`,
      );
      if (!res.ok) throw new Error('tropes fetch failed');
      const data = await res.json();
      setTropeSuggestions(data.tropes ?? []);
      setSenseiTip(data.sensei_tip ?? '');
    } catch {
      setErrorMsg('не удалось загрузить тропы');
    } finally {
      setTropeSuggestionsLoading(false);
    }
  }, [patchDraft, selectedFandom, focus, characters]);

  // ── Step 3 ─────────────────────────────────────────────────────────────────
  const handleTropesChange = useCallback(
    (next: string[]) => {
      setTropes(next);
      debouncedPatch({ tropes: next });
    },
    [debouncedPatch],
  );

  const confirmTropes = useCallback(async () => {
    if (tropes.length === 0) return;
    setStep(4);
    setGenreSuggestionsLoading(true);
    await patchDraft({ tropes, step: 4 });
    if (!selectedFandom || !focus) return;
    try {
      const res = await apiFetch(
        `/api/create/suggestions/genres?fandomId=${encodeURIComponent(selectedFandom.id)}&focus=${focus}`,
      );
      if (!res.ok) throw new Error('genres fetch failed');
      const data = await res.json();
      setGenreSuggestions(data.genres ?? []);
    } catch {
      // non-blocking
    } finally {
      setGenreSuggestionsLoading(false);
    }
  }, [patchDraft, tropes, selectedFandom, focus]);

  // ── Step 4 ─────────────────────────────────────────────────────────────────
  const handleDetailsChange = useCallback(
    (patch: Partial<StepDetailsValue>) => {
      setDetails((prev) => {
        const next = { ...prev, ...patch };
        debouncedPatch(patch);
        return next;
      });
    },
    [debouncedPatch],
  );

  const confirmDetails = useCallback(async () => {
    setStep(5);
    await patchDraft({ step: 5 });
  }, [patchDraft]);

  // ── Step 5 ─────────────────────────────────────────────────────────────────
  const startStory = useCallback(async () => {
    if (!draftId) return;
    setIsStarting(true);
    setErrorMsg('');
    try {
      const res = await apiFetch(`/api/create/draft/${draftId}/start`, { method: 'POST' });
      if (res.status === 429) {
        setShowQuota(true);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? 'ошибка старта');
        return;
      }
      const { storyId } = await res.json();
      router.push(`/reader/${storyId}/1` as Route);
    } catch {
      setErrorMsg('не удалось начать историю. попробуй ещё раз.');
    } finally {
      setIsStarting(false);
    }
  }, [draftId, router]);
```

- [ ] **Step 3: Implement renderStepContent and shell**

Below the handlers, add the render function and return the same shell as the current component, swapping in new step components:

```tsx
  function renderStepContent() {
    switch (step) {
      case 1:
        return <StepFandom onPick={pickFandom} />;
      case 2:
        return (
          <StepFocusCharacters
            focus={focus}
            characters={characters}
            suggestions={characterSuggestions}
            suggestionsLoading={characterSuggestionsLoading}
            onFocusChange={handleFocusChange}
            onCharactersChange={handleCharactersChange}
            onNext={confirmFocusCharacters}
          />
        );
      case 3:
        return (
          <StepTropes
            suggestions={tropeSuggestions}
            loading={tropeSuggestionsLoading}
            selected={tropes}
            senseiTip={senseiTip}
            onChange={handleTropesChange}
            onNext={confirmTropes}
          />
        );
      case 4:
        return (
          <StepDetails
            value={details}
            onChange={handleDetailsChange}
            genreSuggestions={genreSuggestions}
            genreSuggestionsLoading={genreSuggestionsLoading}
            onNext={confirmDetails}
          />
        );
      case 5:
        return (
          <StepPreview
            fandom={selectedFandom}
            focus={focus}
            characters={characters}
            tropes={tropes}
            details={details}
            isStarting={isStarting}
            onStart={startStory}
          />
        );
    }
  }
```

Keep the JSX shell (mobile/desktop wrappers, progress bar, error display) from the existing file as-is, but update the `stepLabel` derivation to use the new `STEPS` constant. Remove the old `StepShip`, `StepTone`, original `StepTropes`, and original `StepPreview` and replace them with the implementations below.

- [ ] **Step 4: Replace remaining sub-components**

At the bottom of the file, keep `StepFandom` (unchanged) and replace `StepTropes` + `StepPreview`:

```tsx
function StepFandom({ onPick }: { onPick: (f: FandomOption) => void }) {
  // ... existing implementation, unchanged
}

function StepTropes({
  suggestions, loading, selected, senseiTip, onChange, onNext,
}: {
  suggestions: TropeSuggestion[];
  loading: boolean;
  selected: string[];
  senseiTip: string;
  onChange: (next: string[]) => void;
  onNext: () => void;
}) {
  const suggestionOptions = suggestions.map((t) => ({ value: t.label_ru, label: t.label_ru, description: t.description_ru }));
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[34px] lg:text-[64px] leading-[1.05] lg:leading-[0.95] tracking-tight text-balance">
          выбираем <span className="italic text-amber">тропы</span><span className="text-amber">.</span>
        </h1>
        <p className="mt-3 max-w-[48ch] font-body text-body-s lg:text-body-l italic text-ink-dim">
          тропы — сердце сюжета. минимум один.
        </p>
      </div>

      {loading && (
        <div className="font-mono text-mono-s tracking-caps uppercase text-ink-dim animate-pulse">
          загружаем тропы...
        </div>
      )}

      {!loading && (
        <>
          <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">
            ✦ {selected.length} выбрано
          </div>

          <MultiChipGroup
            options={suggestionOptions}
            values={selected}
            onChange={onChange}
            max={5}
            testIdPrefix="trope"
          />

          <TagInput
            values={selected.filter((s) => !suggestions.some((sug) => sug.label_ru === s))}
            onChange={(custom) => {
              const fromSuggestions = selected.filter((s) => suggestions.some((sug) => sug.label_ru === s));
              onChange([...fromSuggestions, ...custom]);
            }}
            placeholder="+ свой троп"
            max={5}
            testIdPrefix="custom-trope"
          />

          {senseiTip && (
            <div className="pt-4">
              <SenseiTip>{senseiTip}</SenseiTip>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              data-testid="step-next"
              onClick={onNext}
              disabled={selected.length === 0}
              className="rounded-full bg-amber px-7 py-3 font-mono text-mono-m tracking-caps uppercase text-bg-deep shadow-amber-glow disabled:opacity-40 disabled:cursor-not-allowed"
            >
              дальше · детали ›
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StepPreview({
  fandom, focus, characters, tropes, details, isStarting, onStart,
}: {
  fandom: FandomOption | null;
  focus: FocusType | null;
  characters: string[];
  tropes: string[];
  details: StepDetailsValue;
  isStarting: boolean;
  onStart: () => void;
}) {
  const placeholder = <span className="font-body text-body-s italic text-ink-faint">AI решит</span>;
  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="font-display text-[34px] lg:text-[64px] leading-[1.05] lg:leading-[0.95] tracking-tight text-balance">
          всё <span className="italic text-amber">готово</span><span className="text-amber">.</span>
        </h1>
        <p className="mt-3 font-body text-body-s lg:text-body-l italic text-ink-dim">
          проверь — и нажмём старт.
        </p>
      </div>

      <div className="rounded-md border border-ink-faint/20 bg-surface-raised p-5 flex flex-col gap-4">
        {fandom && <SummaryRow label="фандом" value={fandom.name} />}
        {focus && <SummaryRow label="фокус" value={focus.toLowerCase().replace('_', ' ')} />}
        {characters.length > 0 && <SummaryRow label="герои" value={characters.join(' × ')} />}
        {tropes.length > 0 && (
          <div>
            <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">тропы</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {tropes.map((t) => (
                <span key={t} className="rounded-full border border-amber/30 bg-amber-soft px-2 py-0.5 font-mono text-mono-s tracking-caps text-amber uppercase">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
        <SummaryRow label="рейтинг" value={details.rating ? RATING_LABELS[details.rating] : null} fallback={placeholder} />
        <SummaryRow label="категория" value={details.category ? CATEGORY_LABELS[details.category] : null} fallback={placeholder} />
        <SummaryRow label="POV" value={details.pov ? POV_LABELS[details.pov] : null} fallback={placeholder} />
        {details.tones.length > 0 && (
          <SummaryRow label="тон" value={details.tones.map((t) => TONE_LABELS[t]).join(', ')} />
        )}
        {details.timeline && (
          <SummaryRow label="когда" value={TIMELINE_LABELS[details.timeline] + (details.timelineNote ? ` — ${details.timelineNote}` : '')} />
        )}
        {details.genres.length > 0 && <SummaryRow label="жанр / AU" value={details.genres.join(', ')} />}
        {details.setting && <SummaryRow label="место" value={details.setting} />}
        {details.premise && <SummaryRow label="завязка" value={details.premise} />}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-faint/20 bg-bg/95 p-3 backdrop-blur lg:static lg:border-none lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <button
          type="button"
          data-testid="step-start"
          onClick={onStart}
          disabled={isStarting}
          className="block w-full lg:w-auto rounded-full bg-amber py-3.5 lg:py-3 lg:px-10 text-center font-mono text-mono-s tracking-caps uppercase text-bg-deep shadow-amber-glow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isStarting ? 'создаём историю...' : 'начать историю ›'}
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, fallback }: { label: string; value: string | null; fallback?: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-mono-s tracking-caps text-ink-dim uppercase">{label}</div>
      <div className="mt-1 font-display italic text-xl text-ink">{value ?? fallback ?? null}</div>
    </div>
  );
}
```

- [ ] **Step 5: Typecheck + commit**

Run: `pnpm typecheck`
Expected: clean.

```bash
git add components/create/CreatePageView.tsx
git commit -m "feat(create): CreatePageView — new state machine, focus + details"
```

---

### Task 21: Rewrite full-flow integration test

**Files:**
- Modify: `tests/pages/create-flow.test.tsx`

- [ ] **Step 1: Rewrite the test**

Replace `tests/pages/create-flow.test.tsx` with a new flow:

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreatePageView } from '@/components/create/CreatePageView';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const DRAFT_ID = 'draft-1';
const STORY_ID = 'story-abc-123';

const MOCK_CHARACTERS = [
  { names: ['Гарри', 'Драко'], label_ru: 'Гарри × Драко', popularity: 0.9, rarity: 'top', focus_compatible: ['romance'] },
];
const MOCK_TROPES = [
  { slug: 'enemies-to-lovers', label_ru: 'от врагов к возлюбленным', description_ru: 'враждуют, потом любят', popularity: 0.9 },
];
const MOCK_GENRES = [
  { slug: 'modern-au', label_ru: 'современная AU', popularity: 0.8 },
];

function buildFetchMock({ startStatus = 200 } = {}) {
  return vi.fn(async (url: string | Request | URL, init?: RequestInit) => {
    const u = url.toString();
    const m = init?.method?.toUpperCase() ?? 'GET';
    if (m === 'POST' && u.includes('/api/create/draft') && !u.includes('/start')) {
      return new Response(JSON.stringify({ id: DRAFT_ID }), { status: 200 });
    }
    if (m === 'PATCH' && u.includes(`/api/create/draft/${DRAFT_ID}`)) {
      return new Response(JSON.stringify({ id: DRAFT_ID }), { status: 200 });
    }
    if (m === 'GET' && u.includes('/api/create/suggestions/characters')) {
      return new Response(JSON.stringify({ suggestions: MOCK_CHARACTERS }), { status: 200 });
    }
    if (m === 'GET' && u.includes('/api/create/suggestions/tropes')) {
      return new Response(JSON.stringify({ tropes: MOCK_TROPES, sensei_tip: 'удачи' }), { status: 200 });
    }
    if (m === 'GET' && u.includes('/api/create/suggestions/genres')) {
      return new Response(JSON.stringify({ genres: MOCK_GENRES }), { status: 200 });
    }
    if (m === 'POST' && u.includes('/start')) {
      if (startStatus === 429) return new Response(JSON.stringify({ error: 'quota_exceeded' }), { status: 429 });
      return new Response(JSON.stringify({ storyId: STORY_ID, chapterId: 'ch-1' }), { status: 200 });
    }
    return new Response(JSON.stringify({ error: 'not mocked' }), { status: 404 });
  });
}

beforeEach(() => mockPush.mockClear());
afterEach(() => vi.restoreAllMocks());

describe('CreatePageView — wizard flow', () => {
  it('walks through fandom → focus → characters → tropes → details (skipped) → start', async () => {
    global.fetch = buildFetchMock();
    render(<CreatePageView />);

    await waitFor(() => expect(screen.getAllByText(/AftG|HP|Naruto|JJK/i).length).toBeGreaterThan(0));

    // Step 1: pick HP
    fireEvent.click(screen.getAllByText('HP')[0]);

    // Step 2: pick Romance focus
    await waitFor(() => expect(screen.getAllByRole('button', { name: /романтика/i }).length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByRole('button', { name: /романтика/i })[0]);
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: /Гарри × Драко/i }).length).toBeGreaterThan(0),
    );
    fireEvent.click(screen.getAllByRole('button', { name: /Гарри × Драко/i })[0]);
    fireEvent.click(screen.getAllByTestId('step-next')[0]);

    // Step 3: pick a trope
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: /от врагов к возлюбленным/i }).length).toBeGreaterThan(0),
    );
    fireEvent.click(screen.getAllByRole('button', { name: /от врагов к возлюбленным/i })[0]);
    fireEvent.click(screen.getAllByTestId('step-next')[0]);

    // Step 4: skip details
    await waitFor(() => expect(screen.getAllByRole('button', { name: /маркировка/i }).length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByTestId('step-next')[0]);

    // Step 5: start
    await waitFor(() => expect(screen.getAllByTestId('step-start').length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByTestId('step-start')[0]);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(`/reader/${STORY_ID}/1`));
  });

  it('Gen focus accepts single character via TagInput', async () => {
    global.fetch = buildFetchMock();
    render(<CreatePageView />);
    await waitFor(() => expect(screen.getAllByText('HP').length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByText('HP')[0]);
    fireEvent.click(screen.getAllByRole('button', { name: /^джен$/i })[0]);

    const inputs = await screen.findAllByPlaceholderText(/свой герой/i);
    fireEvent.change(inputs[0], { target: { value: 'Юдзи Итадори' } });
    fireEvent.keyDown(inputs[0], { key: 'Enter' });

    const next = screen.getAllByTestId('step-next')[0] as HTMLButtonElement;
    await waitFor(() => expect(next.disabled).toBe(false));
  });

  it('shows quota modal on 429 from start', async () => {
    global.fetch = buildFetchMock({ startStatus: 429 });
    render(<CreatePageView />);
    // Drive the flow as in the first test, then click start
    await waitFor(() => expect(screen.getAllByText('HP').length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByText('HP')[0]);
    fireEvent.click(screen.getAllByRole('button', { name: /романтика/i })[0]);
    await waitFor(() => screen.getAllByRole('button', { name: /Гарри × Драко/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /Гарри × Драко/i })[0]);
    fireEvent.click(screen.getAllByTestId('step-next')[0]);
    await waitFor(() => screen.getAllByRole('button', { name: /от врагов к возлюбленным/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /от врагов к возлюбленным/i })[0]);
    fireEvent.click(screen.getAllByTestId('step-next')[0]);
    fireEvent.click(screen.getAllByTestId('step-next')[0]);
    fireEvent.click(screen.getAllByTestId('step-start')[0]);
    await waitFor(() => expect(screen.getAllByText(/лимит/i).length).toBeGreaterThan(0));
  });
});
```

- [ ] **Step 2: Run integration tests**

Run: `pnpm vitest run tests/pages/create-flow.test.tsx`
Expected: PASS (all 3 scenarios).

- [ ] **Step 3: Commit**

```bash
git add tests/pages/create-flow.test.tsx
git commit -m "test(create): full wizard flow — focus + custom + skip-details + 429"
```

---

## Phase 6 — Tracking + verification

### Task 22: Update tracking event names

**Files:**
- Modify: `lib/track.ts`

- [ ] **Step 1: Read existing track.ts**

Open `lib/track.ts` and locate the existing `create_*` event names.

- [ ] **Step 2: Add new event signatures**

Add (or rename) so the file exposes typed senders for these names:

- `create_focus_selected { focus_type: FocusType }`
- `create_character_added { source: 'suggestion' | 'custom' }`
- `create_trope_added { source: 'suggestion' | 'custom' }`
- `create_section_expanded { section: 'marking' | 'voice' | 'universe' | 'opening' }`
- `create_advanced_skipped { fields_filled: number }`
- `create_finished { took_total_ms: number; focus_type: FocusType; advanced_fields_filled: number }`

Wire calls from `CreatePageView.tsx` and `StepFocusCharacters.tsx`/`StepDetails.tsx` to fire these events at the right moments.

- [ ] **Step 3: Run typecheck + tests**

Run: `pnpm typecheck && pnpm vitest run`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/track.ts components/create/
git commit -m "feat(track): new wizard events — focus, custom-add, advanced-skip"
```

---

### Task 23: Manual end-to-end smoke

**Files:** none — manual.

- [ ] **Step 1: Run dev server**

Run: `pnpm dev`
Expected: server up at http://localhost:3000.

- [ ] **Step 2: Walk through scenario A — minimal Romance**

In the browser:
1. Navigate to `/create`.
2. Pick HP.
3. Pick «романтика».
4. Click suggestion «Гарри × Драко».
5. Click «дальше».
6. Click trope «от врагов к возлюбленным».
7. Click «дальше».
8. Click «дальше» (skip all details).
9. Click «начать историю».

Expected: ridirect to `/reader/<id>/1`, first chapter streams in Russian.

- [ ] **Step 3: Walk through scenario B — Gen with custom**

1. Reload `/create`.
2. Pick JJK.
3. Pick «джен».
4. Type «Юдзи Итадори» + Enter; type «Мегуми Фушигуро» + Enter.
5. Click «дальше».
6. Type «авторская мистика» + Enter as custom trope.
7. Click «дальше».
8. Open «маркировка» → pick rating «18+», warnings «смерть персонажа».
9. Open «голос» → pick POV «первое лицо», tone «ангст», «слоуберн».
10. Open «вселенная» → pick «post-canon», добавь жанр «школьная AU».
11. Open «завязка» → premise «Юдзи находит письмо…».
12. Click «дальше», «начать историю».

Expected: chapter generates with all hints incorporated, Russian POV from Юдзи's perspective in 1st person, dark tone.

- [ ] **Step 4: Verify DB rows**

In Supabase studio (or psql):
```sql
SELECT id, "focusType", characters, rating, category, pov, tones, genres, premise
FROM "Story" ORDER BY "createdAt" DESC LIMIT 2;
```
Expected: both stories present with fields populated as configured.

- [ ] **Step 5: No commit needed**

(Manual smoke. If bugs found, fix and commit per Task layout.)

---

## Self-Review (for plan author)

Run before handing off:

- **Spec coverage:** Focus-driven Step 2 (T18), tropes custom-input (T20 sub-steps), advanced fields (T19), русский локаль (T2), переименование `shipId` → `characters` (T1, T11), новые промпты (T3-T6), новые endpoints (T7-T11), удаление старых (T13), tracking (T22), e2e smoke (T23). ✓
- **Placeholder scan:** "Update existing test if it references shipId/tone" в T7 — конкретно сказано какие строки менять; "Update test" в T9, T11, T12 — то же самое; tests have full code shown for new files. ✓
- **Type consistency:** `FocusType`, `Rating`, `Category`, `Pov`, `Tense`, `Tone` импортятся из `@prisma/client` везде. `CharacterSuggestion` shape совпадает между API mock, UI prop, и Zod schema. `StepDetailsValue` определён в `StepDetails.tsx` и переиспользуется в `CreatePageView.tsx`. ✓

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-13-create-wizard-redesign.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — диспатчу свежего subagent на каждую таску, review между ними, быстрая итерация.

**2. Inline Execution** — выполняю таски в этой сессии с checkpoint'ами для ревью.

**Какой подход?**
