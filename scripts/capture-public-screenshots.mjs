import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { URL } from 'node:url';
import { chromium } from '@playwright/test';

const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:3100';
const outputDir = process.env.SCREENSHOT_DIR ?? 'output/screenshots';
const routes = (process.env.SCREENSHOT_ROUTES ?? '/,/events,/education,/vacancies,/suppliers,/contacts,/tools/cost-calculator')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean);

function screenshotName(route) {
  return route === '/' ? 'home.png' : `${route.replace(/^\/+/, '').replace(/[^a-z0-9]+/gi, '-')}.png`;
}

async function waitForHydration(page) {
  await page.waitForLoadState('domcontentloaded');

  try {
    await page.waitForLoadState('networkidle', { timeout: 5000 });
  } catch {
    await page.waitForTimeout(1500);
  }
}

async function revealLazySections(page) {
  await page.evaluate(() => globalThis.scrollTo(0, globalThis.document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.evaluate(() => globalThis.scrollTo(0, 0));
  await page.waitForTimeout(300);
}

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

try {
  for (const route of routes) {
    await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'domcontentloaded' });
    await waitForHydration(page);
    await revealLazySections(page);
    await page.screenshot({
      fullPage: true,
      path: join(outputDir, screenshotName(route))
    });
  }
} finally {
  await browser.close();
}
