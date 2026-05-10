// scripts/responsive-smoke.ts
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const widths = [320, 375, 414, 768, 1024, 1280, 1920];
const routes = ['/', '/story/hero-1', '/reader/hero-1/7'];

async function main() {
  const outDir = resolve(__dirname, '../tmp/responsive');
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
    const page = await ctx.newPage();
    for (const r of routes) {
      const url = `http://localhost:3000${r}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      const slug = r.replace(/\//g, '_').replace(/^_/, '');
      await page.screenshot({
        path: resolve(outDir, `${w}-${slug || 'home'}.png`),
        fullPage: true,
      });
    }
    await ctx.close();
  }
  await browser.close();
  console.log(`✓ screenshots saved to ${outDir}`);
}

main();
