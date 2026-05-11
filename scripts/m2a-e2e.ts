// scripts/m2a-e2e.ts
//
// E2E smoke: Create flow → first chapter stream.
//
// Prerequisites:
//   pnpm dev running on :3000
//   DB seeded (pnpm db:seed)
//
// Run:
//   pnpm qa:m2a
//   HEADED=1 pnpm qa:m2a   ← watch mode

import { chromium } from 'playwright';

async function main() {
  console.log('🚧  M2-A e2e — make sure pnpm dev is running on :3000 and DB seeded.');

  const headed = process.env.HEADED === '1';

  const browser = await chromium.launch({ headless: !headed });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // ── Step 1: navigate to /create ────────────────────────────────────────────
  console.log('[1/6] Navigating to /create …');
  await page.goto('http://localhost:3000/create', { waitUntil: 'domcontentloaded' });

  // Wait for draft init to complete (loading spinner goes away)
  await page.waitForSelector('[data-testid="step-fandom-harry-potter"]', { timeout: 15_000 });

  // ── Step 2: pick fandom (Harry Potter) ────────────────────────────────────
  console.log('[2/6] Picking fandom: Harry Potter …');
  await page.locator('[data-testid="step-fandom-harry-potter"]').click();

  // Wait for ship cards to load
  await page.waitForSelector('[data-testid="step-ship-card"]', { timeout: 30_000 });

  // ── Step 3: pick first ship (LLM-generated — position-based) ──────────────
  console.log('[3/6] Picking first ship …');
  await page.locator('[data-testid="step-ship-card"]').first().click();

  // Wait for trope chips to load
  await page.waitForSelector('[data-testid="step-trope-chip"]', { timeout: 30_000 });

  // ── Step 4: pick first trope + advance ────────────────────────────────────
  console.log('[4/6] Picking first trope …');
  await page.locator('[data-testid="step-trope-chip"]').first().click();

  // Click "дальше · тон ›"
  await page.locator('[data-testid="step-next"]').first().click();

  // ── Step 5: pick first tone + advance ─────────────────────────────────────
  console.log('[5/6] Picking first tone …');
  await page.waitForSelector('[data-testid="step-tone-chip"]', { timeout: 10_000 });
  await page.locator('[data-testid="step-tone-chip"]').first().click();

  // Click "дальше · превью ›"
  await page.locator('[data-testid="step-next"]').first().click();

  // ── Step 6: start story ────────────────────────────────────────────────────
  console.log('[6/6] Starting story — waiting for reader …');
  await page.waitForSelector('[data-testid="step-start"]', { timeout: 10_000 });
  await page.locator('[data-testid="step-start"]').click();

  // ── Assert: redirected to /reader/{uuid}/1 ─────────────────────────────────
  await page.waitForURL(/\/reader\/[0-9a-f-]{36}\/1/, { timeout: 30_000 });
  console.log(`   ↳ URL: ${page.url()}`);

  // ── Assert: chapter text streams in (>500 chars) ───────────────────────────
  console.log('   Waiting for chapter text (>500 chars, up to 90s) …');
  await page.waitForFunction(
    () => (document.body.innerText ?? '').length > 500,
    undefined,
    { timeout: 90_000 },
  );

  const textLen = await page.evaluate(() => document.body.innerText.length);
  console.log(`   ↳ body text length: ${textLen} chars`);

  await browser.close();
  console.log('✓ M2-A e2e smoke passed.');
}

void main().catch((err: unknown) => {
  console.error('✗ M2-A e2e FAILED:', err);
  process.exit(1);
});
