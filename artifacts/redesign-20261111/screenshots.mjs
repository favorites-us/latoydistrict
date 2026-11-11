// Run with Next dev at localhost:3017 and Playwright available.
// PLAYWRIGHT_MODULE may point to an installed playwright/index.mjs.
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = new URL('./', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const width of [375, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    for (const [name, route] of [['home', '/'], ['store', '/stores/american-silk-inc-340'], ['guide', '/guide/visiting']]) {
      await page.goto(`http://localhost:3017${route}`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: new URL(`${name}-${width}.png`, output).pathname, fullPage: true });
      const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
      results.push({ route, width, ...dimensions, overflow: dimensions.document > dimensions.viewport });
    }
    await page.close();
  }
  await writeFile(new URL('browser-checks.json', output), JSON.stringify(results, null, 2));
  if (results.some(result => result.overflow)) throw new Error('Horizontal overflow detected');
} finally { await browser.close(); }
