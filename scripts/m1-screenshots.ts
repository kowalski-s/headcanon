import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

type Shot = { name: string; route: string; viewport: { width: number; height: number } };

const shots: Shot[] = [
  { name: 'feed-mobile', route: '/', viewport: { width: 375, height: 812 } },
  { name: 'feed-desktop', route: '/', viewport: { width: 1280, height: 900 } },
  { name: 'story-mobile', route: '/story/hero-1', viewport: { width: 375, height: 812 } },
  { name: 'story-desktop', route: '/story/hero-1', viewport: { width: 1280, height: 900 } },
  { name: 'reader-mobile', route: '/reader/hero-1/7', viewport: { width: 375, height: 812 } },
  { name: 'reader-desktop', route: '/reader/hero-1/7', viewport: { width: 1280, height: 900 } },
  { name: 'watch-mobile', route: '/watch/hero-1/7', viewport: { width: 375, height: 812 } },
  { name: 'watch-desktop', route: '/watch/hero-1/7', viewport: { width: 1280, height: 900 } },
  { name: 'create-mobile', route: '/create', viewport: { width: 375, height: 812 } },
  { name: 'create-desktop', route: '/create', viewport: { width: 1280, height: 900 } },
];

async function main() {
  const outDir = resolve(__dirname, '../tmp/m1-actual');
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  for (const s of shots) {
    const ctx = await browser.newContext({ viewport: s.viewport });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.error(`[${s.name}] pageerror:`, e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') console.error(`[${s.name}] console.error:`, m.text());
    });
    const resp = await page.goto(`http://localhost:3000${s.route}`, {
      waitUntil: 'domcontentloaded',
    });
    console.log(`[${s.name}] status=${resp?.status()}`);
    await page.waitForTimeout(800);
    await page.screenshot({
      path: resolve(outDir, `${s.name}.png`),
      fullPage: true,
    });
    await ctx.close();
  }
  await browser.close();
  console.log(`\n✓ saved to ${outDir}`);
}

main();
