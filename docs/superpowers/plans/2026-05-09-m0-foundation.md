# M0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** собрать рабочий Next.js 15 + Tailwind v4 + Prisma + Supabase скелет проекта Headcanon с полной дизайн-системой, расширенной data model (теги, character bible, world state, invites, AftG canon seed) и библиотекой UI-примитивов.

**Architecture:** Next.js App Router + TypeScript strict + Tailwind v4 (legacy config + tokens.css), Prisma как ORM поверх self-hosted Supabase Postgres, Storybook для UI-примитивов. Spec deltas из `docs/superpowers/specs/2026-05-09-headcanon-pre-dev-design.md` уже встроены — schema включает все новые таблицы с первой миграции.

**Tech Stack:** Next.js 15 · React 19 · TypeScript 5 · Tailwind v4 · Prisma 5 · Supabase Postgres · pnpm · Storybook 8 · Vitest + React Testing Library · ESLint 9 (flat config) + Prettier 3.

**Длительность:** ~8 рабочих дней.

**Pre-requisites:**

- Hetzner CX32 VPS поднят, Coolify установлен, self-hosted Supabase развёрнут (Phase 0 чек-лист в `docs/roadmap.md`). Если нет — выполнить ДО Task 5.
- Node.js 20+ установлен локально.
- pnpm установлен (`npm i -g pnpm`).

---

## File Structure

```
/                                project root (already has docs/, handoff/, CLAUDE.md, README.md)
├── package.json                  Task 1
├── pnpm-lock.yaml                Task 1 (auto)
├── tsconfig.json                 Task 1
├── next.config.ts                Task 1
├── tailwind.config.ts            Task 2
├── postcss.config.mjs            Task 1
├── eslint.config.mjs             Task 1
├── .prettierrc.json              Task 1
├── .prettierignore               Task 1
├── .env.example                  Task 5
├── app/
│   ├── layout.tsx                Task 1 (skeleton), Task 4 (real)
│   ├── page.tsx                  Task 1 (placeholder), Task 4 (smoke)
│   └── globals.css               Task 1 (skeleton), Task 2 (tokens)
├── components/ui/                Task 7
│   ├── BurstSticker.tsx
│   ├── ScotchTag.tsx
│   ├── GrainCover.tsx
│   ├── Marquee.tsx
│   ├── Ornament.tsx
│   └── MonoBadge.tsx
├── lib/
│   └── prisma.ts                 Task 5
├── prisma/
│   ├── schema.prisma             Task 5
│   ├── migrations/               Task 5 (auto)
│   └── seed.ts                   Task 9
├── prisma/seeds/
│   └── aftg-canon.json           Task 9
├── public/
│   └── textures/                 Task 7 (grain.png — placeholder)
├── tests/
│   ├── setup.ts                  Task 7
│   └── components/ui/
│       ├── BurstSticker.test.tsx
│       ├── ScotchTag.test.tsx
│       ├── GrainCover.test.tsx
│       ├── Marquee.test.tsx
│       ├── Ornament.test.tsx
│       └── MonoBadge.test.tsx    Task 7
├── .storybook/                   Task 8
│   ├── main.ts
│   └── preview.ts
└── stories/                      Task 8
    └── ui/
        ├── BurstSticker.stories.tsx
        ├── ScotchTag.stories.tsx
        ├── GrainCover.stories.tsx
        ├── Marquee.stories.tsx
        ├── Ornament.stories.tsx
        └── MonoBadge.stories.tsx
```

**Принципы декомпозиции:**

- Каждый UI-примитив — отдельный файл (focused responsibility).
- Тесты живут в `tests/` зеркально к структуре `components/`.
- Stories — отдельная директория `stories/` (не рядом с компонентом — чтобы продакшен-бандл не тащил storybook-зависимости).
- Prisma — single-source-of-truth schema файл, `lib/prisma.ts` экспортирует singleton client.

---

## Task 1: Bootstrap Next.js 15 + TS + Tailwind v4 + ESLint/Prettier

**Goal:** работающий `pnpm dev` на `localhost:3000` с пустой страницей, конфиги настроены.

**Files:**

- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Modify: `.gitignore` (extend with Next.js / build artifacts)

- [ ] **Step 1.1: Initialize package.json**

Run: `pnpm init`

Затем перезаписать `package.json`:

```json
{
  "name": "headcanon",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"**/*.{ts,tsx,md,json,css}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,md,json,css}\"",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 1.2: Install Next.js + React + TypeScript**

Run:

```bash
pnpm add next@^15 react@^19 react-dom@^19
pnpm add -D typescript@^5 @types/node @types/react @types/react-dom
```

Expected: успешно установлено, в `package.json` появились dependencies/devDependencies.

- [ ] **Step 1.3: Install Tailwind v4 + PostCSS**

Run:

```bash
pnpm add -D tailwindcss@^4 @tailwindcss/postcss@^4 postcss
```

- [ ] **Step 1.4: Install ESLint 9 + Prettier**

Run:

```bash
pnpm add -D eslint@^9 eslint-config-next@^15 prettier@^3 eslint-config-prettier@^9
```

- [ ] **Step 1.5: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 1.6: Create next.config.ts**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
```

- [ ] **Step 1.7: Create postcss.config.mjs**

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

- [ ] **Step 1.8: Create eslint.config.mjs (flat config)**

```js
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
```

Затем установить `@eslint/eslintrc` для совместимости:

```bash
pnpm add -D @eslint/eslintrc
```

- [ ] **Step 1.9: Create .prettierrc.json**

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

- [ ] **Step 1.10: Create .prettierignore**

```
node_modules
.next
out
prisma/migrations
pnpm-lock.yaml
public
handoff/prototypes
```

- [ ] **Step 1.11: Extend .gitignore**

Заменить содержимое `/.gitignore`:

```
.DS_Store
.claude/
node_modules/
.next/
out/
.env
.env.local
.env*.local
*.log
next-env.d.ts
.vercel
.turbo
storybook-static
coverage
```

- [ ] **Step 1.12: Create skeletal app/globals.css**

```css
@import 'tailwindcss';

html,
body {
  background: #160b22;
  color: #f5efe0;
  font-family: system-ui, sans-serif;
}
```

(Полные tokens добавятся в Task 2.)

- [ ] **Step 1.13: Create skeletal app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Headcanon',
  description: 'AI-фанфик платформа',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 1.14: Create app/page.tsx (placeholder)**

```tsx
export default function Home() {
  return (
    <main style={{ padding: 32 }}>
      <h1>Headcanon — bootstrapping…</h1>
      <p>Если ты видишь этот текст в баклажановом фоне — Tailwind работает.</p>
    </main>
  );
}
```

- [ ] **Step 1.15: Smoke test — dev server**

Run: `pnpm dev`

Expected:

- Сервер стартует без ошибок
- На `http://localhost:3000` видна страница «Headcanon — bootstrapping…»
- Background = `#160B22` (баклажан), text = `#F5EFE0` (тёплый кремовый)

Остановить: Ctrl+C.

- [ ] **Step 1.16: Smoke test — typecheck + lint + format**

Run:

```bash
pnpm typecheck
pnpm lint
pnpm format:check
```

Expected: все три проходят без ошибок (после `pnpm format` если format:check ругается).

- [ ] **Step 1.17: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json next.config.ts postcss.config.mjs \
        eslint.config.mjs .prettierrc.json .prettierignore .gitignore \
        app/layout.tsx app/page.tsx app/globals.css
git commit -m "feat(M0-01): bootstrap Next.js 15 + TS + Tailwind v4 + ESLint/Prettier"
```

---

## Task 2: Wire tokens.css + tailwind.preset.js

**Goal:** дизайн-токены из `handoff/` подключены, Tailwind знает все цвета/шрифты/радиусы из preset.

**Files:**

- Modify: `app/globals.css`
- Create: `tailwind.config.ts`

- [ ] **Step 2.1: Импорт tokens.css + @config directive в globals.css**

> **Критично для Tailwind v4:** legacy `tailwind.config.ts` НЕ подхватывается автоматически — нужен `@config` directive. Без него `bg-amber`, `font-display` и т.д. вернут пустоту.

Заменить `app/globals.css` на:

```css
@import 'tailwindcss';
@config '../tailwind.config.ts';
@import '../handoff/tokens.css';

html {
  background: var(--hc-bg);
  color: var(--hc-ink);
}

body {
  background: var(--hc-bg);
  color: var(--hc-ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

::selection {
  background: var(--hc-amber);
  color: var(--hc-bg);
}
```

- [ ] **Step 2.2: Create tailwind.config.ts с подключением preset**

```ts
import type { Config } from 'tailwindcss';
import headcanonPreset from './handoff/tailwind.preset';

const config: Config = {
  presets: [headcanonPreset as Partial<Config>],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './stories/**/*.{ts,tsx}'],
};

export default config;
```

- [ ] **Step 2.3: Verify tokens.css содержит все CSS-переменные используемые в preset**

Read: `handoff/tokens.css`

Убедиться что определены: `--hc-bg`, `--hc-bg-alt`, `--hc-bg-deep`, `--hc-surface`, `--hc-surface-raised`, `--hc-ink`, `--hc-ink-dim`, `--hc-ink-faint`, `--hc-amber`, `--hc-amber-soft`, `--hc-rose`, `--hc-chrome-1/2/3`, `--hc-border`, `--hc-border-strong`, `--hc-radius-sm/md/lg/xl/full`, `--hc-shadow-poster`, `--hc-shadow-amber-glow`, `--hc-shadow-chrome-cta`, `--hc-chrome-gradient`, `--hc-candle`, `--hc-vignette`, `--hc-ease-cinematic`, `--hc-duration-base`.

Если каких-то нет — добавить в `handoff/tokens.css` (источник правды — `handoff/tokens.json`). Это ожидаемо: handoff-команда могла не объявить все переменные явно; добавление — не нарушение «handoff is source of truth».

- [ ] **Step 2.4: Smoke-test страница демонстрирует токены**

Заменить `app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <h1 className="font-display text-display-l text-ink">Headcanon · tokens smoke test</h1>
      <p className="font-body mt-4 text-body-l text-ink-dim">
        Если этот параграф — серифный (EB Garamond placeholder), а заголовок — антикв-серифный
        (Bodoni Moda placeholder), и фон — глубокий баклажан, токены работают.
      </p>
      <div className="mt-6 flex gap-4">
        <span className="inline-block size-12 rounded-full bg-amber" title="amber" />
        <span className="inline-block size-12 rounded-full bg-rose" title="rose" />
        <span className="inline-block size-12 rounded-full bg-surface" title="surface" />
        <span className="inline-block size-12 rounded-full border border-border" title="border" />
      </div>
    </main>
  );
}
```

- [ ] **Step 2.5: Run dev server, проверить визуально**

Run: `pnpm dev`

Expected:

- Фон `bg-bg` = `#160B22`
- Цветные кружки видны: оранжево-золотой amber, розовый rose, едва заметный surface, обведённый border
- Шрифты пока fallback — реальные подключим в Task 3

- [ ] **Step 2.6: Run typecheck**

Run: `pnpm typecheck`

Expected: проходит. Если `tailwind.preset` ругается на типы — это допустимо, мы его типизируем как `Partial<Config>` (см. шаг 2.2).

- [ ] **Step 2.7: Commit**

```bash
git add tailwind.config.ts app/globals.css app/page.tsx handoff/tokens.css
git commit -m "feat(M0-02): wire design tokens + tailwind preset"
```

---

## Task 3: Fonts через next/font

**Goal:** Bodoni Moda / EB Garamond / DM Sans / JetBrains Mono подключены через `next/font/google` с cyrillic subset, переменные пробрасываются в Tailwind preset.

**Files:**

- Modify: `app/layout.tsx`
- Modify: `app/page.tsx` (чтобы было визуально проверяемо)

- [ ] **Step 3.1: Update app/layout.tsx с next/font**

```tsx
import type { Metadata } from 'next';
import { Bodoni_Moda, EB_Garamond, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = Bodoni_Moda({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const body = EB_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
});

const ui = DM_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Headcanon',
  description: 'AI-фанфик платформа с режимом просмотра историй как мини-сериалов',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${display.variable} ${body.variable} ${ui.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3.2: Update app/page.tsx для визуальной проверки шрифтов**

```tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <h1 className="font-display text-display-l">Headcanon · fonts smoke test</h1>
      <h2 className="font-display mt-2 text-display-m italic text-amber">
        ★ полночное чтиво для тех, кто не спит ★
      </h2>
      <p className="font-body mt-6 text-body-l leading-reading text-ink">
        Тогда снег падал крупными хлопьями. Драко стоял у окна, не оборачиваясь.{' '}
        <em className="text-amber">«Я не хочу говорить об этом»</em> — сказал он негромко.
      </p>
      <p className="font-ui mt-4 text-ui-l text-ink-dim">
        UI-копия (DM Sans): кнопки, чипы, формы, мета.
      </p>
      <p className="font-mono mt-2 text-mono-m uppercase tracking-caps text-ink-dim">
        EP 02 / 04 · 03:42 · STR 3 / 9
      </p>
    </main>
  );
}
```

- [ ] **Step 3.3: Run dev server, визуальная проверка**

Run: `pnpm dev`

Expected:

- H1 «Headcanon» — антикв с контрастными штрихами (Bodoni Moda)
- H2 «полночное чтиво» — italic Bodoni, амбер-цвет
- Параграф с «Драко стоял у окна» — сплошной EB Garamond serif, кириллица читается, italic-фрагмент в амбере
- UI-параграф — sans-serif (DM Sans)
- Mono-метка — monospace JetBrains, разреженные uppercase

- [ ] **Step 3.4: Network smoke test (font loading)**

Открыть DevTools → Network → Filter: Font.

Expected: загружаются woff2 файлы Bodoni Moda, EB Garamond, DM Sans, JetBrains Mono. Никаких 404.

- [ ] **Step 3.5: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat(M0-03): wire next/font with cyrillic subsets for all 4 families"
```

---

## Task 4: Базовый layout с late-night dark theme

**Goal:** root layout правильно применяет фон/текст из токенов, h1 в Bodoni, body в Garamond, скриншот совпадает с эстетикой прототипа.

**Files:**

- Modify: `app/globals.css` (typography defaults)
- Modify: `app/page.tsx` (упрощённый smoke-screen с правильными tokens)

- [ ] **Step 4.1: Update app/globals.css с typography defaults**

Дополнить (после `body { ... }`):

```css
h1,
h2,
h3 {
  font-family: var(--font-display);
  color: var(--hc-ink);
  text-wrap: balance;
}

p {
  font-family: var(--font-body);
  color: var(--hc-ink);
  text-wrap: pretty;
  line-height: 1.6;
}

code,
kbd {
  font-family: var(--font-mono);
}

/* Скрываем nav для скрин-ридеров типографских символов */
[aria-hidden] {
  speak: none;
}
```

- [ ] **Step 4.2: Update app/page.tsx — финальный smoke screen**

```tsx
export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-[640px] px-6 py-12 text-ink">
      <span
        aria-hidden
        className="font-mono mb-3 block text-mono-m uppercase tracking-caps text-amber"
      >
        ✦ M0 · foundation
      </span>
      <h1 className="text-display-l">Headcanon</h1>
      <p className="font-body mt-4 text-body-l text-ink-dim">
        Скелет проекта поднят. Дизайн-токены работают, шрифты с кириллицей загружены, основной фон —
        глубокий баклажан, текст — кремовый. Дальше — данные и UI-примитивы.
      </p>

      <div className="mt-10 border-t border-border pt-6">
        <h2 className="text-display-m italic text-amber">★ типографика</h2>
        <p className="font-body mt-3 text-body-l">
          Тогда снег падал крупными хлопьями. Драко стоял у окна, не оборачиваясь.{' '}
          <em className="text-amber">«Я не хочу говорить об этом»</em> — сказал он негромко.
        </p>
      </div>

      <div className="mt-10 border-t border-border pt-6">
        <h2 className="text-display-m">палитра</h2>
        <div className="mt-3 grid grid-cols-4 gap-3">
          <div className="aspect-square rounded-md bg-amber" title="amber" />
          <div className="aspect-square rounded-md bg-rose" title="rose" />
          <div className="aspect-square rounded-md bg-surface" title="surface" />
          <div
            className="aspect-square rounded-md border border-border-strong bg-bg-alt"
            title="bg-alt"
          />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4.3: Run dev server и сделать скриншот**

Run: `pnpm dev`

Visual checks:

- Фон — глубокий баклажан (`#160B22`)
- Заголовок «Headcanon» — антикв Bodoni
- Подзаголовок «★ типографика» — italic Bodoni в амбере
- Body параграф — EB Garamond, кириллица читается, italic-фраза в амбере
- Палитра 4 квадрата: амбер/розовый/едва-заметный surface/чуть-светлее bg-alt
- Mono-метка `✦ M0 · foundation` сверху, амбер

Сохранить скриншот в `handoff/screenshots/m0-foundation.png` (опционально, для visual regression в дальнейшем).

- [ ] **Step 4.4: Run typecheck + lint**

Run:

```bash
pnpm typecheck
pnpm lint
```

Expected: оба проходят.

- [ ] **Step 4.5: Commit**

```bash
git add app/globals.css app/page.tsx
git commit -m "feat(M0-04): late-night dark theme baseline + typography defaults"
```

---

## Task 5: Supabase + Prisma + полная schema со всеми deltas

**Goal:** self-hosted Supabase подключена, Prisma настроена, миграция №1 применяется и создаёт ВСЕ таблицы (включая deltas из спеки: tags, story_tags, character_states, world_states, chapter_summaries, fandom_canon_seeds, invites + extends).

**Pre-requisite:** self-hosted Supabase развёрнута на VPS, есть `DATABASE_URL` (direct Postgres connection string) и `DIRECT_URL` (для миграций).

**Files:**

- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`
- Create: `.env.example`
- Modify: `.gitignore` (verify `.env*` ignored)
- Create: `tests/lib/prisma.test.ts`

- [ ] **Step 5.1: Install Prisma**

Run:

```bash
pnpm add @prisma/client
pnpm add -D prisma
```

- [ ] **Step 5.2: Init Prisma scaffold**

Run: `pnpm prisma init`

Это создаёт `prisma/schema.prisma` (overwrite-нём в Step 5.4) и `.env` (заменим в Step 5.3).

- [ ] **Step 5.3: Create .env.example (без секретов)**

```bash
# Self-hosted Supabase Postgres
DATABASE_URL="postgresql://postgres:PASSWORD@HETZNER_HOST:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:PASSWORD@HETZNER_HOST:5432/postgres"

# Supabase API
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

# OpenRouter (LLM)
OPENROUTER_API_KEY=""

# Replicate (image gen)
REPLICATE_API_TOKEN=""

# ElevenLabs (TTS, Phase 3)
ELEVENLABS_API_KEY=""
```

И заполнить реальный `.env` с настоящими значениями (этот файл в `.gitignore`).

- [ ] **Step 5.4: Write полную Prisma schema**

Заменить `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// =============================================================================
// USERS & AUTH
// =============================================================================

model User {
  id                String      @id @default(uuid()) @db.Uuid
  email             String      @unique
  handle            String      @unique
  displayName       String?
  avatarUrl         String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  ageConfirmedAt    DateTime?   // 18+ для M/E content
  betaInviteId      String?     @unique @db.Uuid
  betaInvite        Invite?     @relation("InviteRedeemer", fields: [betaInviteId], references: [id])

  stories           Story[]     @relation("StoryAuthor")
  likes             Like[]
  saves             Save[]
  comments          Comment[]
  follows           Follow[]    @relation("Follower")
  followedBy        Follow[]    @relation("Followee")
  generatedInvites  Invite[]    @relation("InviteGenerator")
}

// =============================================================================
// STORIES & CHAPTERS
// =============================================================================

enum Visibility {
  PRIVATE
  UNLISTED
  PUBLIC
}

enum ChapterStatus {
  DRAFT
  PUBLISHED
}

model Story {
  id            String      @id @default(uuid()) @db.Uuid
  authorId      String      @db.Uuid
  author        User        @relation("StoryAuthor", fields: [authorId], references: [id])
  title         String
  premise       String?
  visibility    Visibility  @default(PRIVATE)
  curated       Boolean     @default(false)  // флаг "Curated tab"
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  publishedAt   DateTime?

  chapters      Chapter[]
  characters    Character[]
  characterStates CharacterState[]
  worldState    WorldState?
  scenes        Scene[]
  tags          StoryTag[]
  likes         Like[]
  saves         Save[]
  comments      Comment[]

  @@index([authorId])
  @@index([visibility, publishedAt])
}

model Chapter {
  id            String         @id @default(uuid()) @db.Uuid
  storyId       String         @db.Uuid
  story         Story          @relation(fields: [storyId], references: [id], onDelete: Cascade)
  ordinal       Int
  title         String?
  text          String         // полный текст главы
  status        ChapterStatus  @default(DRAFT)
  userEdited    Boolean        @default(false)
  regensCount   Int            @default(0)
  tokenCost     Decimal        @default(0) @db.Decimal(10, 6)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  publishedAt   DateTime?

  summary       ChapterSummary?
  scenes        Scene[]

  @@unique([storyId, ordinal])
  @@index([storyId, status])
}

model ChapterSummary {
  chapterId   String   @id @db.Uuid
  chapter     Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  summary     String
  updatedAt   DateTime @updatedAt
}

// =============================================================================
// CHARACTERS & STATE (drift control)
// =============================================================================

model Character {
  id              String      @id @default(uuid()) @db.Uuid
  storyId         String      @db.Uuid
  story           Story       @relation(fields: [storyId], references: [id], onDelete: Cascade)
  name            String
  description     String
  ageCanonical    Int?        // для banlist-проверки
  descriptionSeed String?     // из canon seed или из первой главы
  voiceId         String?     // ElevenLabs voice id (Phase 3)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  states          CharacterState[]
  references      CharacterReference[]

  @@unique([storyId, name])
  @@index([storyId])
}

model CharacterState {
  characterId         String     @db.Uuid
  storyId             String     @db.Uuid
  stateJson           Json       // {emotional_state, recent_events, relationships, arc_progress, voice_traits_drift}
  updatedAtChapter    Int        // номер главы после которой state валиден
  updatedAt           DateTime   @updatedAt
  character           Character  @relation(fields: [characterId], references: [id], onDelete: Cascade)
  story               Story      @relation(fields: [storyId], references: [id], onDelete: Cascade)

  @@id([characterId, storyId])
  @@index([storyId])
}

model WorldState {
  storyId             String     @id @db.Uuid
  story               Story      @relation(fields: [storyId], references: [id], onDelete: Cascade)
  stateJson           Json       // {current_location, story_time, active_plot_threads, foreshadowing}
  updatedAtChapter    Int
  updatedAt           DateTime   @updatedAt
}

model CharacterReference {
  id                        String     @id @default(uuid()) @db.Uuid
  characterId               String?    @db.Uuid
  character                 Character? @relation(fields: [characterId], references: [id], onDelete: SetNull)
  fandomNormalized          String
  characterNameNormalized   String
  imageUrl                  String
  templateId                String
  templateVersion           Int        @default(1)
  cost                      Decimal    @default(0) @db.Decimal(10, 6)
  createdAt                 DateTime   @default(now())

  @@unique([fandomNormalized, characterNameNormalized])
}

// =============================================================================
// SCENES (parser output)
// =============================================================================

model Scene {
  id          String     @id @default(uuid()) @db.Uuid
  chapterId   String     @db.Uuid
  chapter     Chapter    @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  storyId     String     @db.Uuid
  story       Story      @relation(fields: [storyId], references: [id], onDelete: Cascade)
  sceneIndex  Int
  emotion     String     // enum string в JSON, не Prisma enum (могут расширяться)
  whoInScene  String[]   // имена персонажей
  camera      String     // closeup | wide | mid | over_shoulder | etc
  locationId  String?    @db.Uuid
  json        Json       // полный structured output

  assets      Asset[]

  @@unique([chapterId, sceneIndex])
  @@index([storyId])
}

model Asset {
  id              String   @id @default(uuid()) @db.Uuid
  sceneId         String   @db.Uuid
  scene           Scene    @relation(fields: [sceneId], references: [id], onDelete: Cascade)
  type            String   // image | video | audio
  url             String
  cost            Decimal  @default(0) @db.Decimal(10, 6)
  templateId      String
  templateVersion Int      @default(1)
  createdAt       DateTime @default(now())

  @@index([sceneId])
}

// =============================================================================
// TAGS (AO3-like)
// =============================================================================

enum TagType {
  RATING
  WARNING
  CATEGORY
  FANDOM
  RELATIONSHIP
  CHARACTER_TAG
  FREEFORM
}

model Tag {
  id            String      @id @default(uuid()) @db.Uuid
  type          TagType
  name          String
  slug          String
  count         Int         @default(0)
  canonicalId   String?     @db.Uuid
  canonical     Tag?        @relation("TagCanonicalization", fields: [canonicalId], references: [id])
  variants      Tag[]       @relation("TagCanonicalization")
  createdAt     DateTime    @default(now())

  stories       StoryTag[]

  @@unique([type, slug])
  @@index([type])
  @@index([canonicalId])
}

model StoryTag {
  storyId   String   @db.Uuid
  tagId     String   @db.Uuid
  story     Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([storyId, tagId])
  @@index([tagId])
}

// =============================================================================
// FANDOM CANON SEEDS (для AftG и будущих nichе фандомов)
// =============================================================================

model FandomCanonSeed {
  id              String   @id @default(uuid()) @db.Uuid
  fandomTagId     String   @db.Uuid           // FK к Tag (type=FANDOM)
  characterName   String
  bibleJson       Json
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([fandomTagId, characterName])
  @@index([fandomTagId])
}

// =============================================================================
// INVITES (closed beta)
// =============================================================================

model Invite {
  id            String    @id @default(uuid()) @db.Uuid
  code          String    @unique           // 8-char human-readable
  generatedById String    @db.Uuid
  generatedBy   User      @relation("InviteGenerator", fields: [generatedById], references: [id])
  redeemedBy    User?     @relation("InviteRedeemer")  // back-relation, single-use (User.betaInviteId @unique)
  usedAt        DateTime?
  expiresAt     DateTime?
  createdAt     DateTime  @default(now())
}

// =============================================================================
// SOCIAL
// =============================================================================

model Like {
  userId    String   @db.Uuid
  storyId   String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  story     Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@id([userId, storyId])
  @@index([storyId])
}

model Save {
  userId    String   @db.Uuid
  storyId   String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  story     Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@id([userId, storyId])
  @@index([storyId])
}

model Comment {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  storyId   String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  story     Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)
  text      String
  createdAt DateTime @default(now())

  @@index([storyId])
}

model Follow {
  followerId  String   @db.Uuid
  followeeId  String   @db.Uuid
  follower    User     @relation("Follower", fields: [followerId], references: [id], onDelete: Cascade)
  followee    User     @relation("Followee", fields: [followeeId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())

  @@id([followerId, followeeId])
  @@index([followeeId])
}

// =============================================================================
// JOBS (background queue)
// =============================================================================

enum JobStatus {
  PENDING
  RUNNING
  DONE
  FAILED
}

enum JobType {
  EXTRACT_BIBLE
  GENERATE_IMAGE
  GENERATE_VIDEO
  GENERATE_TTS
  AUTO_TAG
}

model Job {
  id          String     @id @default(uuid()) @db.Uuid
  type        JobType
  status      JobStatus  @default(PENDING)
  payload     Json
  retries     Int        @default(0)
  error       String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  startedAt   DateTime?
  finishedAt  DateTime?

  @@index([status, type])
  @@index([createdAt])
}
```

> **Note к схеме:** некоторые поля помечены как опциональные (например, `User.handle` через `@unique` на не-nullable строке предполагает что мы генерим handle при регистрации) — это явно зафиксировано чтобы registration flow обязан был его проставить. Если возникнут вопросы при имплементации M0-NEW seed — `handle` должен быть проставлен.

- [ ] **Step 5.5: Generate Prisma client**

Run: `pnpm prisma generate`

Expected: успешная генерация, `node_modules/.prisma/client/` создан.

- [ ] **Step 5.6: Run первой миграции**

Run: `pnpm prisma migrate dev --name init`

Expected:

- Создаётся `prisma/migrations/<timestamp>_init/migration.sql`
- Миграция применяется к БД
- Все таблицы созданы

Если БД недоступна — починить connection string в `.env` и повторить.

- [ ] **Step 5.7: Verify в Supabase Studio**

Открыть Supabase Studio (Coolify URL → DB → Tables) и убедиться что присутствуют все таблицы:
`User, Story, Chapter, ChapterSummary, Character, CharacterState, WorldState, CharacterReference, Scene, Asset, Tag, StoryTag, FandomCanonSeed, Invite, Like, Save, Comment, Follow, Job`.

19 таблиц.

- [ ] **Step 5.8: Create lib/prisma.ts (singleton client)**

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 5.9: Install Vitest для теста соединения**

Run:

```bash
pnpm add -D vitest @vitest/ui
```

Создать `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
});
```

- [ ] **Step 5.10: Write failing test для Prisma connection**

Create `tests/lib/prisma.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('prisma client', () => {
  it('can execute a trivial raw query', async () => {
    const result = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`;
    expect(result[0].ok).toBe(1);
  });

  it('has all expected tables', async () => {
    const rows = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
    const names = rows.map((r) => r.table_name);
    expect(names).toEqual(
      expect.arrayContaining([
        'User',
        'Story',
        'Chapter',
        'ChapterSummary',
        'Character',
        'CharacterState',
        'WorldState',
        'Tag',
        'StoryTag',
        'FandomCanonSeed',
        'Invite',
        'Job',
      ]),
    );
  });
});
```

- [ ] **Step 5.11: Run test**

Run: `pnpm test`

Expected: оба теста PASS. Если FAIL — проверить .env, перезапустить миграции.

- [ ] **Step 5.12: Add Prisma scripts в package.json**

Добавить в `scripts`:

```json
"db:migrate": "prisma migrate dev",
"db:reset": "prisma migrate reset",
"db:studio": "prisma studio",
"db:generate": "prisma generate"
```

- [ ] **Step 5.13: Commit**

```bash
git add prisma/schema.prisma prisma/migrations lib/prisma.ts \
        .env.example tests/lib/prisma.test.ts vitest.config.ts package.json pnpm-lock.yaml
git commit -m "feat(M0-05): supabase + prisma with full schema (incl spec deltas)"
```

> **Не коммитить `.env`** — он в `.gitignore`. Только `.env.example`.

---

## Task 6: Supabase Storage buckets

**Goal:** три bucket'а (`covers`, `audio`, `avatars`) созданы с public read + authed write policy.

**Pre-requisite:** Task 5 завершён (Supabase подключена).

**Files:**

- Create: `prisma/migrations/<timestamp>_storage_buckets/migration.sql` (manual create after Step 6.3)
- Create: `tests/storage/buckets.test.ts`

- [ ] **Step 6.1: Create buckets через Supabase Studio (UI path)**

Открыть Supabase Studio → Storage → New bucket:

| Имя       | Public | Allowed MIME | Max file size |
| --------- | ------ | ------------ | ------------- |
| `covers`  | ✅     | `image/*`    | 5 MB          |
| `audio`   | ✅     | `audio/*`    | 50 MB         |
| `avatars` | ✅     | `image/*`    | 2 MB          |

> Альтернатива — через SQL (Step 6.3 ниже). UI-путь быстрее для одного раза.

- [ ] **Step 6.2: Set up RLS policies для каждого bucket**

В Supabase Studio → Storage → Policies для каждого bucket добавить:

```sql
-- READ: any user (incl anonymous)
CREATE POLICY "public read" ON storage.objects
  FOR SELECT USING (bucket_id IN ('covers', 'audio', 'avatars'));

-- INSERT: authed users only
CREATE POLICY "authed insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('covers', 'audio', 'avatars'));

-- UPDATE: authed users on own files
CREATE POLICY "authed update own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('covers', 'audio', 'avatars') AND owner = auth.uid());

-- DELETE: authed users on own files
CREATE POLICY "authed delete own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('covers', 'audio', 'avatars') AND owner = auth.uid());
```

- [ ] **Step 6.3: Persist setup в SQL-файле для воспроизводимости**

Так как buckets в Supabase живут вне Prisma migrations, создать `supabase/storage-setup.sql`:

```sql
-- run this once via supabase studio sql editor on a fresh deployment

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('covers',  'covers',  true, 5242880,  ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('audio',   'audio',   true, 52428800, ARRAY['audio/mpeg', 'audio/mp4', 'audio/ogg']),
  ('avatars', 'avatars', true, 2097152,  ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- policies (как в Step 6.2)
```

- [ ] **Step 6.4: Install Supabase JS client (для теста)**

Run: `pnpm add @supabase/supabase-js`

- [ ] **Step 6.5: Write smoke test для buckets**

Create `tests/storage/buckets.test.ts`:

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient;

beforeAll(() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }
  supabase = createClient(url, key);
});

describe('storage buckets', () => {
  it('lists 3 expected buckets', async () => {
    const { data, error } = await supabase.storage.listBuckets();
    expect(error).toBeNull();
    const names = data?.map((b) => b.name) ?? [];
    expect(names).toEqual(expect.arrayContaining(['covers', 'audio', 'avatars']));
  });
});
```

- [ ] **Step 6.6: Run test**

Run: `pnpm test`

Expected: PASS. Если FAIL — проверить env-переменные и что buckets созданы.

- [ ] **Step 6.7: Commit**

```bash
git add supabase/storage-setup.sql tests/storage/buckets.test.ts package.json pnpm-lock.yaml
git commit -m "feat(M0-06): supabase storage buckets (covers, audio, avatars) + smoke test"
```

---

## Task 7: Primitives library в components/ui/

**Goal:** 6 reusable UI-компонентов из дизайн-системы реализованы, протестированы (Vitest + RTL), визуально проверены.

**Files:**

- Create: 6 компонентов в `components/ui/`
- Create: 6 unit-тестов в `tests/components/ui/`
- Create: `tests/setup.ts` (RTL config)
- Create: `public/textures/grain.png` (placeholder, можно черный 256×256 PNG)

**Pre-requisite:** Tasks 1-4 завершены.

- [ ] **Step 7.1: Install Vitest + React Testing Library**

Run:

```bash
pnpm add -D @testing-library/react @testing-library/dom @testing-library/jest-dom \
            @vitejs/plugin-react jsdom
```

- [ ] **Step 7.2: Update vitest.config.ts с jsdom + RTL**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
```

- [ ] **Step 7.3: Create tests/setup.ts**

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 7.4: Add placeholder grain texture**

Сгенерировать (или скачать с textures.com, 256×256 чёрно-белый шум):

```bash
mkdir -p public/textures
# Альтернатива: сгенерировать через ImageMagick
# magick -size 256x256 xc: +noise random public/textures/grain.png
# или скачать любую публичную noise-текстуру 256x256 PNG
```

Если не можешь сгенерить — оставить placeholder файл `public/textures/grain.png` (1 byte). Тесты не должны зависеть от существования файла, а компонент — должен gracefully fallback на отсутствующий image.

- [ ] **Step 7.5: WRITE FAILING TEST: components/ui/Ornament.test.tsx**

Create `tests/components/ui/Ornament.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Ornament } from '@/components/ui/Ornament';

describe('<Ornament>', () => {
  it('renders default size with star symbol', () => {
    render(<Ornament />);
    expect(screen.getByRole('separator')).toHaveTextContent('─ ✦ ─');
  });

  it('respects size prop sm|md|lg', () => {
    const { rerender } = render(<Ornament size="sm" />);
    expect(screen.getByRole('separator')).toHaveClass('text-mono-s');
    rerender(<Ornament size="md" />);
    expect(screen.getByRole('separator')).toHaveClass('text-mono-m');
    rerender(<Ornament size="lg" />);
    expect(screen.getByRole('separator')).toHaveClass('text-display-s');
  });

  it('is hidden from screen readers', () => {
    render(<Ornament />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-hidden', 'true');
  });
});
```

- [ ] **Step 7.6: Run test, verify FAIL**

Run: `pnpm test tests/components/ui/Ornament.test.tsx`

Expected: FAIL (модуль не существует).

- [ ] **Step 7.7: Implement components/ui/Ornament.tsx**

```tsx
type OrnamentSize = 'sm' | 'md' | 'lg';

const sizeClasses: Record<OrnamentSize, string> = {
  sm: 'text-mono-s',
  md: 'text-mono-m',
  lg: 'text-display-s',
};

export function Ornament({ size = 'md' }: { size?: OrnamentSize }) {
  return (
    <span
      role="separator"
      aria-hidden="true"
      className={`block text-center text-amber ${sizeClasses[size]}`}
    >
      ─ ✦ ─
    </span>
  );
}
```

- [ ] **Step 7.8: Run test, verify PASS**

Run: `pnpm test tests/components/ui/Ornament.test.tsx`

Expected: 3 tests PASS.

- [ ] **Step 7.9: Commit Ornament**

```bash
git add components/ui/Ornament.tsx tests/components/ui/Ornament.test.tsx tests/setup.ts \
        vitest.config.ts package.json pnpm-lock.yaml
git commit -m "feat(M0-07): Ornament primitive + RTL setup"
```

- [ ] **Step 7.10: WRITE FAILING TEST: MonoBadge**

Create `tests/components/ui/MonoBadge.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MonoBadge } from '@/components/ui/MonoBadge';

describe('<MonoBadge>', () => {
  it('renders children with mono caps styling', () => {
    render(<MonoBadge>EP 02 / 04</MonoBadge>);
    const el = screen.getByText('EP 02 / 04');
    expect(el).toHaveClass('font-mono');
    expect(el).toHaveClass('uppercase');
    expect(el).toHaveClass('tracking-caps');
  });

  it('respects tone prop (default | amber | rose)', () => {
    const { rerender } = render(<MonoBadge>x</MonoBadge>);
    expect(screen.getByText('x')).toHaveClass('text-ink-dim');
    rerender(<MonoBadge tone="amber">x</MonoBadge>);
    expect(screen.getByText('x')).toHaveClass('text-amber');
    rerender(<MonoBadge tone="rose">x</MonoBadge>);
    expect(screen.getByText('x')).toHaveClass('text-rose');
  });
});
```

- [ ] **Step 7.11: Verify test fails**

Run: `pnpm test tests/components/ui/MonoBadge.test.tsx`
Expected: FAIL.

- [ ] **Step 7.12: Implement components/ui/MonoBadge.tsx**

```tsx
import type { ReactNode } from 'react';

type Tone = 'default' | 'amber' | 'rose';

const toneClasses: Record<Tone, string> = {
  default: 'text-ink-dim',
  amber: 'text-amber',
  rose: 'text-rose',
};

export function MonoBadge({
  children,
  tone = 'default',
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`font-mono text-mono-m uppercase tracking-caps ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 7.13: Verify test passes**

Run: `pnpm test tests/components/ui/MonoBadge.test.tsx`
Expected: PASS.

- [ ] **Step 7.14: Commit MonoBadge**

```bash
git add components/ui/MonoBadge.tsx tests/components/ui/MonoBadge.test.tsx
git commit -m "feat(M0-07): MonoBadge primitive"
```

- [ ] **Step 7.15: WRITE FAILING TEST: BurstSticker**

Create `tests/components/ui/BurstSticker.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BurstSticker } from '@/components/ui/BurstSticker';

describe('<BurstSticker>', () => {
  it('renders label inside star-shaped clip', () => {
    render(<BurstSticker label="★ хит" />);
    expect(screen.getByText('★ хит')).toBeInTheDocument();
  });

  it('applies rotation via inline style', () => {
    const { container } = render(<BurstSticker label="★ хит" rotate={-8} />);
    const root = container.firstChild as HTMLElement;
    expect(root.style.transform).toContain('rotate(-8deg)');
  });

  it('defaults rotation to -8 deg if not provided', () => {
    const { container } = render(<BurstSticker label="★ хит" />);
    const root = container.firstChild as HTMLElement;
    expect(root.style.transform).toContain('rotate(-8deg)');
  });
});
```

- [ ] **Step 7.16: Verify FAIL**

Run: `pnpm test tests/components/ui/BurstSticker.test.tsx`
Expected: FAIL.

- [ ] **Step 7.17: Implement components/ui/BurstSticker.tsx**

```tsx
const STAR_CLIP_PATH =
  'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';

export function BurstSticker({
  label,
  rotate = -8,
  className = '',
}: {
  label: string;
  rotate?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex size-20 items-center justify-center bg-amber ${className}`}
      style={{
        clipPath: STAR_CLIP_PATH,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <span className="font-mono text-mono-m uppercase tracking-caps text-bg">{label}</span>
    </span>
  );
}
```

- [ ] **Step 7.18: Verify PASS**

Run: `pnpm test tests/components/ui/BurstSticker.test.tsx`
Expected: PASS.

- [ ] **Step 7.19: Commit BurstSticker**

```bash
git add components/ui/BurstSticker.tsx tests/components/ui/BurstSticker.test.tsx
git commit -m "feat(M0-07): BurstSticker primitive"
```

- [ ] **Step 7.20: WRITE FAILING TEST: ScotchTag**

Create `tests/components/ui/ScotchTag.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScotchTag } from '@/components/ui/ScotchTag';

describe('<ScotchTag>', () => {
  it('renders text content', () => {
    render(<ScotchTag>★ slow burn</ScotchTag>);
    expect(screen.getByText('★ slow burn')).toBeInTheDocument();
  });

  it('applies amber-translucent background by default', () => {
    const { container } = render(<ScotchTag>x</ScotchTag>);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('bg-amber/30');
  });

  it('respects rotate prop', () => {
    const { container } = render(<ScotchTag rotate={3}>x</ScotchTag>);
    const root = container.firstChild as HTMLElement;
    expect(root.style.transform).toContain('rotate(3deg)');
  });
});
```

- [ ] **Step 7.21: Verify FAIL**

Run: `pnpm test tests/components/ui/ScotchTag.test.tsx`
Expected: FAIL.

- [ ] **Step 7.22: Implement components/ui/ScotchTag.tsx**

```tsx
import type { ReactNode } from 'react';

export function ScotchTag({
  children,
  rotate = -2,
  className = '',
}: {
  children: ReactNode;
  rotate?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-block bg-amber/30 px-2 py-0.5 font-mono text-mono-s uppercase tracking-caps text-ink ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 7.23: Verify PASS**

Run: `pnpm test tests/components/ui/ScotchTag.test.tsx`
Expected: PASS.

- [ ] **Step 7.24: Commit ScotchTag**

```bash
git add components/ui/ScotchTag.tsx tests/components/ui/ScotchTag.test.tsx
git commit -m "feat(M0-07): ScotchTag primitive"
```

- [ ] **Step 7.25: WRITE FAILING TEST: GrainCover**

Create `tests/components/ui/GrainCover.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GrainCover } from '@/components/ui/GrainCover';

describe('<GrainCover>', () => {
  it('renders gradient with two color stops via inline style', () => {
    const { container } = render(<GrainCover from="#160B22" to="#E5A95A" />);
    const root = container.firstChild as HTMLElement;
    expect(root.style.background).toContain('#160B22');
    expect(root.style.background).toContain('#E5A95A');
  });

  it('renders grain overlay layer', () => {
    const { container } = render(<GrainCover from="#000" to="#fff" />);
    const overlay = container.querySelector('[data-layer="grain"]');
    expect(overlay).toBeInTheDocument();
  });

  it('renders vignette layer', () => {
    const { container } = render(<GrainCover from="#000" to="#fff" />);
    const vignette = container.querySelector('[data-layer="vignette"]');
    expect(vignette).toBeInTheDocument();
  });
});
```

- [ ] **Step 7.26: Verify FAIL**

Run: `pnpm test tests/components/ui/GrainCover.test.tsx`
Expected: FAIL.

- [ ] **Step 7.27: Implement components/ui/GrainCover.tsx**

```tsx
export function GrainCover({
  from,
  to,
  className = '',
  children,
}: {
  from: string;
  to: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <div
        data-layer="grain"
        aria-hidden
        className="absolute inset-0 mix-blend-overlay opacity-[0.18]"
        style={{
          backgroundImage: "url('/textures/grain.png')",
          backgroundSize: '256px 256px',
          backgroundRepeat: 'repeat',
        }}
      />
      <div
        data-layer="vignette"
        aria-hidden
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

- [ ] **Step 7.28: Verify PASS**

Run: `pnpm test tests/components/ui/GrainCover.test.tsx`
Expected: PASS.

- [ ] **Step 7.29: Commit GrainCover**

```bash
git add components/ui/GrainCover.tsx tests/components/ui/GrainCover.test.tsx public/textures/grain.png
git commit -m "feat(M0-07): GrainCover primitive with grain + vignette layers"
```

- [ ] **Step 7.30: WRITE FAILING TEST: Marquee**

Create `tests/components/ui/Marquee.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Marquee } from '@/components/ui/Marquee';

describe('<Marquee>', () => {
  it('renders items joined by separator', () => {
    render(<Marquee items={['ab', 'cd', 'ef']} />);
    // двойной рендер для бесшовности — каждый item встречается 2 раза
    expect(screen.getAllByText('ab')).toHaveLength(2);
  });

  it('uses marquee animation class', () => {
    const { container } = render(<Marquee items={['x']} />);
    const track = container.querySelector('[data-track]');
    expect(track).toHaveClass('animate-marquee');
  });

  it('respects prefers-reduced-motion (no animation)', () => {
    // имитировать reduced-motion через media-query — компонент должен иметь fallback class
    const { container } = render(<Marquee items={['x']} />);
    const track = container.querySelector('[data-track]');
    // motion-reduce:animate-none встроен в Tailwind v4
    expect(track?.className).toContain('motion-reduce:animate-none');
  });
});
```

- [ ] **Step 7.31: Verify FAIL**

Run: `pnpm test tests/components/ui/Marquee.test.tsx`
Expected: FAIL.

- [ ] **Step 7.32: Implement components/ui/Marquee.tsx**

```tsx
export function Marquee({
  items,
  separator = ' ✦ ',
  className = '',
}: {
  items: string[];
  separator?: string;
  className?: string;
}) {
  const text = items.join(separator);
  return (
    <div className={`overflow-hidden bg-amber py-2 ${className}`}>
      <div data-track className="flex w-max animate-marquee gap-8 motion-reduce:animate-none">
        {/* двойной набор для бесшовной зацикленной анимации */}
        {[0, 1].map((i) => (
          <span
            key={i}
            className="font-mono text-mono-m uppercase tracking-caps text-bg whitespace-nowrap"
          >
            {items.map((item, idx) => (
              <span key={idx}>
                {item}
                {idx < items.length - 1 && separator}
              </span>
            ))}
            <span aria-hidden>{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 7.33: Verify PASS**

Run: `pnpm test tests/components/ui/Marquee.test.tsx`
Expected: PASS.

- [ ] **Step 7.34: Commit Marquee**

```bash
git add components/ui/Marquee.tsx tests/components/ui/Marquee.test.tsx
git commit -m "feat(M0-07): Marquee ticker primitive"
```

- [ ] **Step 7.35: Run all tests, verify suite passes**

Run: `pnpm test`

Expected: все тесты PASS (Ornament 3, MonoBadge 2, BurstSticker 3, ScotchTag 3, GrainCover 3, Marquee 3, Prisma 2 = ~19 тестов).

- [ ] **Step 7.36: Run typecheck + lint**

Run:

```bash
pnpm typecheck
pnpm lint
```

Expected: оба проходят.

---

## Task 8: Storybook 8 для primitives

**Goal:** Storybook запускается локально, есть 6 stories (по одному на каждый primitive), визуально можно листать варианты.

**Files:**

- Create: `.storybook/main.ts`
- Create: `.storybook/preview.ts`
- Create: 6 stories в `stories/ui/`

- [ ] **Step 8.1: Install Storybook 8**

Run:

```bash
pnpm dlx storybook@latest init --type nextjs --skip-install
pnpm install
```

Это создаст `.storybook/`, `stories/` (демо), и обновит `package.json`.

- [ ] **Step 8.2: Update .storybook/main.ts**

```ts
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  staticDirs: ['../public'],
};

export default config;
```

- [ ] **Step 8.3: Update .storybook/preview.ts с глобальным фоном**

```ts
import type { Preview } from '@storybook/react';
import '../app/globals.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'bg',
      values: [
        { name: 'bg', value: '#160B22' },
        { name: 'bg-alt', value: '#1F1230' },
        { name: 'bg-deep', value: '#06030C' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
```

- [ ] **Step 8.4: Удалить демо-stories которые добавил Storybook init**

Удалить всё содержимое `stories/` кроме `stories/ui/` (не существует ещё).

```bash
rm -rf stories/
mkdir -p stories/ui
```

- [ ] **Step 8.5: Create stories/ui/Ornament.stories.tsx**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Ornament } from '@/components/ui/Ornament';

const meta: Meta<typeof Ornament> = {
  title: 'UI/Ornament',
  component: Ornament,
};

export default meta;
type Story = StoryObj<typeof Ornament>;

export const Small: Story = { args: { size: 'sm' } };
export const Medium: Story = { args: { size: 'md' } };
export const Large: Story = { args: { size: 'lg' } };
```

- [ ] **Step 8.6: Create stories/ui/MonoBadge.stories.tsx**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MonoBadge } from '@/components/ui/MonoBadge';

const meta: Meta<typeof MonoBadge> = {
  title: 'UI/MonoBadge',
  component: MonoBadge,
};

export default meta;
type Story = StoryObj<typeof MonoBadge>;

export const Default: Story = { args: { children: 'EP 02 / 04' } };
export const Amber: Story = { args: { children: 'WATCH MODE', tone: 'amber' } };
export const Rose: Story = { args: { children: '♡ 142', tone: 'rose' } };
```

- [ ] **Step 8.7: Create stories/ui/BurstSticker.stories.tsx**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { BurstSticker } from '@/components/ui/BurstSticker';

const meta: Meta<typeof BurstSticker> = {
  title: 'UI/BurstSticker',
  component: BurstSticker,
};

export default meta;
type Story = StoryObj<typeof BurstSticker>;

export const Hit: Story = { args: { label: '★ хит', rotate: -8 } };
export const NewLabel: Story = { args: { label: '✦ новое', rotate: 6 } };
```

- [ ] **Step 8.8: Create stories/ui/ScotchTag.stories.tsx**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ScotchTag } from '@/components/ui/ScotchTag';

const meta: Meta<typeof ScotchTag> = {
  title: 'UI/ScotchTag',
  component: ScotchTag,
};

export default meta;
type Story = StoryObj<typeof ScotchTag>;

export const SlowBurn: Story = { args: { children: '★ slow burn' } };
export const EnemiesToLovers: Story = {
  args: { children: 'enemies → lovers', rotate: 4 },
};
```

- [ ] **Step 8.9: Create stories/ui/GrainCover.stories.tsx**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { GrainCover } from '@/components/ui/GrainCover';

const meta: Meta<typeof GrainCover> = {
  title: 'UI/GrainCover',
  component: GrainCover,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof GrainCover>;

export const Poster: Story = {
  args: { from: '#160B22', to: '#E5A95A' },
  render: (args) => (
    <GrainCover {...args} className="aspect-[2/3] w-64 rounded-md">
      <span className="absolute inset-0 flex items-center justify-center font-display text-display-l text-ink">
        обложка
      </span>
    </GrainCover>
  ),
};
```

- [ ] **Step 8.10: Create stories/ui/Marquee.stories.tsx**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Marquee } from '@/components/ui/Marquee';

const meta: Meta<typeof Marquee> = {
  title: 'UI/Marquee',
  component: Marquee,
};

export default meta;
type Story = StoryObj<typeof Marquee>;

export const FeedTopTicker: Story = {
  args: {
    items: [
      'полночное чтиво',
      'новые главы каждый вечер',
      '★ для тех, кто не спит',
      'эфемерные shipsы',
    ],
  },
};
```

- [ ] **Step 8.11: Run storybook dev**

Run: `pnpm storybook`

Expected: открывается `http://localhost:6006`, видны 6 разделов в sidebar (Ornament, MonoBadge, BurstSticker, ScotchTag, GrainCover, Marquee), каждый с 2-3 stories. Фон — баклажан.

- [ ] **Step 8.12: Run storybook build для верификации production build работает**

Run: `pnpm build-storybook`

Expected: успешный билд в `storybook-static/` (он в .gitignore — не коммитим).

- [ ] **Step 8.13: Commit**

```bash
git add .storybook/ stories/ui/ package.json pnpm-lock.yaml
git commit -m "feat(M0-08): storybook 8 with stories for all 6 primitives"
```

---

## Task 9: AftG canon seed

**Goal:** schema для `FandomCanonSeed` уже есть (Task 5). Создать Prisma seed-script + JSON-файл с placeholder bible 6 героев Foxhole Court для founder'а заполнить.

**Files:**

- Create: `prisma/seed.ts`
- Create: `prisma/seeds/aftg-canon.json`
- Create: `prisma/seeds/fandom-tags.json`
- Modify: `package.json` (Prisma seed script)
- Create: `tests/prisma/seed.test.ts`

- [ ] **Step 9.1: Configure Prisma seed в package.json**

Добавить в `package.json`:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

И установить tsx:

```bash
pnpm add -D tsx
```

- [ ] **Step 9.2: Create prisma/seeds/fandom-tags.json**

```json
[
  { "name": "Всё ради игры", "slug": "all-for-the-game" },
  { "name": "Harry Potter", "slug": "harry-potter" },
  { "name": "Наруто", "slug": "naruto" },
  { "name": "Магическая битва", "slug": "jjk" }
]
```

- [ ] **Step 9.3: Create prisma/seeds/aftg-canon.json (placeholder template)**

Founder заполнит реальное содержимое позже. Сейчас — структура с правильными ключами для всех 6 персонажей.

```json
{
  "fandomSlug": "all-for-the-game",
  "characters": [
    {
      "name": "Neil Josten",
      "bible": {
        "physical": "TODO founder: ~5'3, auburn hair, brown contacts hide blue eyes",
        "voice": "TODO founder: deflective, sarcastic, evasive about past",
        "core_traits": [
          "TODO founder: stubborn",
          "TODO founder: traumatized",
          "TODO founder: loyal to Foxes"
        ],
        "canon_relationships": {
          "Andrew Minyard": "TODO founder: tentative trust → eventual partnership",
          "Kevin Day": "TODO founder: shared past, complicated"
        },
        "speech_patterns": "TODO founder: short sentences, deflects with questions",
        "do_not": "TODO founder: write him as openly emotional in early chapters; he is closed off"
      }
    },
    {
      "name": "Andrew Minyard",
      "bible": {
        "physical": "TODO founder: 5'0, blond, dead eyes, smile when threatening",
        "voice": "TODO founder: flat affect, monotone unless on meds",
        "core_traits": ["TODO founder", "TODO founder", "TODO founder"],
        "canon_relationships": {
          "Neil Josten": "TODO founder",
          "Aaron Minyard": "TODO founder: twin, fraught"
        },
        "speech_patterns": "TODO founder",
        "do_not": "TODO founder"
      }
    },
    {
      "name": "Kevin Day",
      "bible": {
        "physical": "TODO founder",
        "voice": "TODO founder",
        "core_traits": ["TODO founder", "TODO founder", "TODO founder"],
        "canon_relationships": {},
        "speech_patterns": "TODO founder",
        "do_not": "TODO founder"
      }
    },
    {
      "name": "Aaron Minyard",
      "bible": {
        "physical": "TODO founder",
        "voice": "TODO founder",
        "core_traits": ["TODO founder", "TODO founder", "TODO founder"],
        "canon_relationships": {},
        "speech_patterns": "TODO founder",
        "do_not": "TODO founder"
      }
    },
    {
      "name": "Nicky Hemmick",
      "bible": {
        "physical": "TODO founder",
        "voice": "TODO founder",
        "core_traits": ["TODO founder", "TODO founder", "TODO founder"],
        "canon_relationships": {},
        "speech_patterns": "TODO founder",
        "do_not": "TODO founder"
      }
    },
    {
      "name": "Matt Boyd",
      "bible": {
        "physical": "TODO founder",
        "voice": "TODO founder",
        "core_traits": ["TODO founder", "TODO founder", "TODO founder"],
        "canon_relationships": {},
        "speech_patterns": "TODO founder",
        "do_not": "TODO founder"
      }
    }
  ]
}
```

> **NOTE для founder'а:** замените все `"TODO founder: ..."` на реальные канон-описания из книг. Это единственный источник truth для AftG в LLM-промптах. Качество story generation зависит от качества bible.

- [ ] **Step 9.4: Create prisma/seed.ts**

```ts
import { PrismaClient } from '@prisma/client';
import fandomTags from './seeds/fandom-tags.json';
import aftgCanon from './seeds/aftg-canon.json';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding fandom tags…');
  for (const t of fandomTags) {
    await prisma.tag.upsert({
      where: { type_slug: { type: 'FANDOM', slug: t.slug } },
      update: { name: t.name },
      create: { type: 'FANDOM', name: t.name, slug: t.slug },
    });
  }

  console.log('🌱 Seeding AftG canon bible…');
  const aftgFandom = await prisma.tag.findUnique({
    where: { type_slug: { type: 'FANDOM', slug: aftgCanon.fandomSlug } },
  });
  if (!aftgFandom) throw new Error('AftG fandom tag not found — should be seeded first');

  for (const char of aftgCanon.characters) {
    await prisma.fandomCanonSeed.upsert({
      where: {
        fandomTagId_characterName: {
          fandomTagId: aftgFandom.id,
          characterName: char.name,
        },
      },
      update: { bibleJson: char.bible },
      create: {
        fandomTagId: aftgFandom.id,
        characterName: char.name,
        bibleJson: char.bible,
      },
    });
  }

  console.log('✓ seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 9.5: Run seed**

Run: `pnpm prisma db seed`

Expected: вывод `🌱 Seeding fandom tags…` → `🌱 Seeding AftG canon bible…` → `✓ seed complete`. Без ошибок.

- [ ] **Step 9.6: Write test для верификации seed**

Create `tests/prisma/seed.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('seed: fandom tags', () => {
  it('has 4 fandom tags', async () => {
    const fandoms = await prisma.tag.findMany({ where: { type: 'FANDOM' } });
    expect(fandoms.length).toBeGreaterThanOrEqual(4);
    const slugs = fandoms.map((f) => f.slug);
    expect(slugs).toEqual(
      expect.arrayContaining(['all-for-the-game', 'harry-potter', 'naruto', 'jjk']),
    );
  });
});

describe('seed: AftG canon bible', () => {
  it('has 6 character bibles', async () => {
    const aftg = await prisma.tag.findUnique({
      where: { type_slug: { type: 'FANDOM', slug: 'all-for-the-game' } },
    });
    expect(aftg).not.toBeNull();
    const bibles = await prisma.fandomCanonSeed.findMany({
      where: { fandomTagId: aftg!.id },
    });
    expect(bibles.length).toBe(6);
    const names = bibles.map((b) => b.characterName);
    expect(names).toEqual(
      expect.arrayContaining([
        'Neil Josten',
        'Andrew Minyard',
        'Kevin Day',
        'Aaron Minyard',
        'Nicky Hemmick',
        'Matt Boyd',
      ]),
    );
  });

  it('every bible has placeholder structure', async () => {
    const bibles = await prisma.fandomCanonSeed.findMany();
    for (const b of bibles) {
      const bible = b.bibleJson as Record<string, unknown>;
      expect(bible).toHaveProperty('physical');
      expect(bible).toHaveProperty('voice');
      expect(bible).toHaveProperty('core_traits');
      expect(bible).toHaveProperty('speech_patterns');
      expect(bible).toHaveProperty('do_not');
    }
  });
});
```

- [ ] **Step 9.7: Run test**

Run: `pnpm test tests/prisma/seed.test.ts`

Expected: 3 tests PASS.

- [ ] **Step 9.8: Run all tests финальная проверка**

Run: `pnpm test`

Expected: все тесты pass (Prisma connection 2, seed 3, primitives 17 = 22 теста).

- [ ] **Step 9.9: Run full smoke**

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
```

Все четыре должны пройти.

- [ ] **Step 9.10: Commit**

```bash
git add prisma/seed.ts prisma/seeds/ tests/prisma/seed.test.ts package.json pnpm-lock.yaml
git commit -m "feat(M0-NEW): AftG canon seed scaffold (founder fills bibles next)"
```

---

## Final smoke test (вся M0)

- [ ] **Step F.1: Свежий клон + установка**

В новом терминале:

```bash
cd /tmp && rm -rf headcanon-smoke
git clone /Users/inga/Desktop/мое/headcanon headcanon-smoke
cd headcanon-smoke
pnpm install
cp .env.example .env  # затем заполнить настоящими значениями
pnpm prisma generate
```

- [ ] **Step F.2: Migrate + seed на чистой БД (test или staging)**

```bash
pnpm prisma migrate deploy
pnpm prisma db seed
```

- [ ] **Step F.3: Run dev + storybook параллельно**

В двух терминалах:

```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm storybook
```

Visual checks:

- `localhost:3000` — smoke screen из Task 4 рендерится корректно
- `localhost:6006` — Storybook показывает 6 примитивов

- [ ] **Step F.4: Run всё тестовое**

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
```

Все четыре проходят.

- [ ] **Step F.5: Tag релиза M0**

```bash
git tag -a m0-foundation -m "M0 foundation complete: scaffold + design system + data model + primitives + seed"
```

(Push не делаем без отдельной просьбы founder'а.)

---

## What is NOT in this plan (на следующие планы)

- M1 (Read): Feed, Story page, Reader экраны — отдельный plan `m1-read.md`
- M2 (Generate): Create flow, OpenRouter integration, character bible extraction — отдельный plan `m2-generate.md`
- M3 (Watch): TTS, Watch player — отдельный plan
- Auth flow (Supabase Auth): зависит от M1, отдельный sub-plan внутри M1
- 18+ confirmation gate (M1-NEW): отдельный sub-plan внутри M1
- Tag filter UI (M1-NEW): отдельный sub-plan внутри M1
- Invite redemption flow (M1-NEW): отдельный sub-plan внутри M1

---

## Acceptance criteria

- [ ] `pnpm dev` запускается без ошибок
- [ ] `localhost:3000` показывает Editorial Y2K smoke screen
- [ ] `pnpm storybook` показывает 6 примитивов
- [ ] `pnpm test` — все тесты pass (~22)
- [ ] `pnpm typecheck` чистый
- [ ] `pnpm lint` чистый
- [ ] `pnpm format:check` чистый
- [ ] Prisma миграция применена, 19 таблиц в БД
- [ ] Seed запущен, 4 fandom tags + 6 AftG character placeholders в БД
- [ ] Все коммиты сделаны на каждом шаге (см. commit messages в задачах)
- [ ] Tag `m0-foundation` создан

После apply — переход к написанию плана `m1-read.md` (через writing-plans).
