// scripts/m2c-e2e.ts
//
// E2E smoke: open an existing chapter, click on the 3rd paragraph, choose
// "переписать", wait for the paragraph text to change.
//
// Prerequisites:
//   pnpm dev running on :3000
//   pnpm worker running (so bible/auto-tag jobs don't pile up)
//   STORY_ID env var = uuid of a story you own (run qa:m2a first to produce one)
//
// Run:
//   STORY_ID=... pnpm qa:m2c
//   HEADED=1 STORY_ID=... pnpm qa:m2c   ← watch mode

import { chromium } from 'playwright';

async function main() {
  const storyId = process.env.STORY_ID;
  if (!storyId) {
    console.error('STORY_ID env var required (run qa:m2a first to create a story).');
    process.exit(1);
  }
  console.log(`🚧  M2-C e2e — make sure pnpm dev & pnpm worker are running. Story: ${storyId}`);

  const headed = process.env.HEADED === '1';
  const browser = await chromium.launch({ headless: !headed });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  console.log('[1/4] Opening reader …');
  await page.goto(`http://localhost:3000/reader/${storyId}/1`, { waitUntil: 'domcontentloaded' });

  // Wait until at least 3 paragraphs are rendered.
  await page.waitForFunction(() => document.querySelectorAll('article p').length >= 3, undefined, {
    timeout: 30_000,
  });

  console.log('[2/4] Tapping 3rd paragraph …');
  const para = page.locator('article p').nth(2);
  const before = (await para.innerText()).trim();
  console.log(`   ↳ before: "${before.slice(0, 60)}…"`);

  await para.click();

  console.log('[3/4] Choosing «переписать» …');
  await page.locator('[data-testid="paragraph-menu-regen"]').first().click();

  console.log('[4/4] Waiting for streamed replacement (up to 90s) …');
  await page.waitForFunction(
    (oldText) => {
      const ps = document.querySelectorAll('article p');
      const txt = ps[2]?.textContent?.trim() ?? '';
      return txt.length > 30 && txt !== oldText;
    },
    before,
    { timeout: 90_000 },
  );

  const after = (await para.innerText()).trim();
  console.log(`   ↳ after:  "${after.slice(0, 60)}…"`);

  await browser.close();
  console.log('✓ M2-C e2e smoke passed.');
}

void main().catch((err: unknown) => {
  console.error('✗ M2-C e2e FAILED:', err);
  process.exit(1);
});
