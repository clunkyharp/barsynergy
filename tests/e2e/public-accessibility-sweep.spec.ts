import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

type AxeViolation = {
  id: string;
  impact: string | null;
  nodes: unknown[];
};

type AxeGlobal = typeof globalThis & {
  axe: {
    run: (
      context: Document,
      options: {
        runOnly: {
          type: 'tag';
          values: string[];
        };
      }
    ) => Promise<{ violations: AxeViolation[] }>;
  };
};

type FocusSample = {
  hidden: boolean;
  label: string;
  tagName: string;
};

const require = createRequire(import.meta.url);
const axeSourcePath = require.resolve('axe-core/axe.min.js');

const publicRoutes = [
  '/',
  '/about',
  '/articles',
  '/education',
  '/events',
  '/vacancies',
  '/suppliers',
  '/partners',
  '/general-sponsors',
  '/contacts',
  '/business',
  '/consulting',
  '/tools/cost-calculator',
  '/auth/login'
];

const viewports = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
];

let axeSource = '';

test.beforeAll(async () => {
  axeSource = await readFile(axeSourcePath, 'utf8');
});

async function getBlockingAxeViolations(page: Page, options: { includeSeriousContrast: boolean }) {
  await page.addScriptTag({ content: axeSource });

  return page.evaluate(async ({ includeSeriousContrast }) => {
    const axe = (globalThis as AxeGlobal).axe;
    const result = await axe.run(globalThis.document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
      }
    });

    return result.violations
      .filter(
        (violation) =>
          violation.impact === 'critical' ||
          (includeSeriousContrast &&
            violation.id === 'color-contrast' &&
            (violation.impact === 'serious' || violation.impact === 'critical'))
      )
      .map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodeCount: violation.nodes.length
      }));
  }, options);
}

async function getOverflowState(page: Page) {
  return page.evaluate(() => ({
    bodyOverflow: Math.max(0, document.body.scrollWidth - window.innerWidth),
    documentOverflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth)
  }));
}

async function collectTabFocusSamples(page: Page) {
  const samples: FocusSample[] = [];

  for (let index = 0; index < 10; index += 1) {
    await page.keyboard.press('Tab');
    const sample = await page.evaluate<FocusSample>(() => {
      const active = document.activeElement;

      if (!(active instanceof HTMLElement) || active === document.body) {
        return {
          hidden: true,
          label: 'body-or-empty',
          tagName: active?.tagName ?? 'none'
        };
      }

      const rect = active.getBoundingClientRect();
      const style = window.getComputedStyle(active);
      const label =
        active.getAttribute('aria-label') ||
        active.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) ||
        active.getAttribute('href') ||
        active.id ||
        active.tagName.toLowerCase();

      return {
        hidden:
          rect.width <= 0 ||
          rect.height <= 0 ||
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          style.opacity === '0',
        label,
        tagName: active.tagName
      };
    });

    samples.push(sample);
  }

  return samples;
}

test.describe('public route accessibility sweep', () => {
  for (const viewport of viewports) {
    test.describe(viewport.name, () => {
      test.use({ viewport });

      for (const route of publicRoutes) {
        test(`${route} keeps keyboard focus visible and avoids blocking accessibility failures`, async ({ page }) => {
          const pageErrors: string[] = [];

          page.on('pageerror', (error) => {
            pageErrors.push(error.message);
          });

          const response = await page.goto(route);

          expect(response?.ok(), `${route} should respond with a successful HTTP status`).toBe(true);
          await expect(page.locator('.site-main').first()).toBeVisible();

          const overflow = await getOverflowState(page);
          expect(overflow, `${route} should not create horizontal overflow`).toEqual({
            bodyOverflow: 0,
            documentOverflow: 0
          });

          const focusSamples = await collectTabFocusSamples(page);
          const visibleFocusSamples = focusSamples.filter((sample) => !sample.hidden);
          const uniqueFocusLabels = new Set(visibleFocusSamples.map((sample) => `${sample.tagName}:${sample.label}`));

          expect(pageErrors, `${route} should not throw browser page errors`).toEqual([]);
          expect(visibleFocusSamples.length, `${route} should expose visible keyboard focus while tabbing`).toBeGreaterThanOrEqual(6);
          expect(uniqueFocusLabels.size, `${route} should move keyboard focus across multiple controls`).toBeGreaterThanOrEqual(4);
          await expect(page.locator(':focus-visible')).toBeVisible();

          const violations = await getBlockingAxeViolations(page, { includeSeriousContrast: true });
          expect(violations, `${route} should not have critical axe or serious color contrast violations`).toEqual([]);
        });
      }
    });
  }
});
