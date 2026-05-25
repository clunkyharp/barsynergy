import { expect, test } from '@playwright/test';
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

const require = createRequire(import.meta.url);
const axeSourcePath = require.resolve('axe-core/axe.min.js');
const defaultRoutes = ['/tools/cost-calculator'];
const smokeRoutes = (process.env.PLAYWRIGHT_SMOKE_ROUTES ?? defaultRoutes.join(','))
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean);

let axeSource = '';

test.beforeAll(async () => {
  axeSource = await readFile(axeSourcePath, 'utf8');
});

test.describe('public browser smoke', () => {
  for (const route of smokeRoutes) {
    test(`${route} renders and has no critical accessibility violations`, async ({ page }) => {
      const pageErrors: string[] = [];

      page.on('pageerror', (error) => {
        pageErrors.push(error.message);
      });

      const response = await page.goto(route);

      expect(response?.ok(), `${route} should respond with a successful HTTP status`).toBe(true);
      await expect(page.locator('.site-main').first()).toBeVisible();

      await page.addScriptTag({ content: axeSource });

      const violations = await page.evaluate(async () => {
        const axe = (globalThis as AxeGlobal).axe;
        const result = await axe.run(globalThis.document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
          }
        });

        return result.violations
          .filter((violation) => violation.impact === 'critical')
          .map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            nodeCount: violation.nodes.length
          }));
      });

      expect(pageErrors, `${route} should not throw browser page errors`).toEqual([]);
      expect(violations, `${route} should not have critical axe violations`).toEqual([]);
    });
  }
});
