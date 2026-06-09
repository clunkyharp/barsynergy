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

async function getOverflowState(page: Page) {
  return page.evaluate(() => ({
    bodyOverflow: Math.max(0, document.body.scrollWidth - window.innerWidth),
    documentOverflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth)
  }));
}

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

  test('all header and footer navigation links return 200', async ({ page }) => {
    const response = await page.goto('/');

    expect(response?.ok(), 'homepage should respond successfully').toBe(true);

    const links = await page.evaluate(() => {
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const navElements = document.querySelectorAll('nav');
      const allNavLinks = new Set<string>();

      [header, footer, ...Array.from(navElements)].forEach((section) => {
        if (!section) return;
        section.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
          const href = a.getAttribute('href');
          if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) return;
          allNavLinks.add(href);
        });
      });

      return Array.from(allNavLinks);
    });

    expect(links.length, 'should find navigation links to test').toBeGreaterThan(0);

    for (const link of links) {
      const linkResponse = await page.goto(link);

      expect(linkResponse?.ok(), `${link} should return 200`).toBe(true);
    }
  });

  test('cost calculator keeps visible ingredient controls usable across viewport widths', async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 1280, height: 900 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 }
    ]) {
      await page.setViewportSize(viewport);

      const response = await page.goto('/tools/cost-calculator');

      expect(response?.ok(), 'calculator page should respond successfully').toBe(true);
      await expect(page.locator('#calculator')).toBeVisible();
      await page.locator('#calculator').scrollIntoViewIfNeeded();

      const overflow = await getOverflowState(page);
      expect(overflow, `calculator should not create document overflow at ${viewport.width}px`).toEqual({
        bodyOverflow: 0,
        documentOverflow: 0
      });

      const controlState = await page.locator('#calculator').evaluate((root) => {
        function isVisible(element: HTMLElement) {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);

          return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        }

        function minWidthFor(element: HTMLElement) {
          if (element instanceof HTMLInputElement && (element.id.endsWith('-name') || element.id === 'calculatorItemName')) {
            return 120;
          }

          if (element instanceof HTMLInputElement) {
            return 60;
          }

          return 40;
        }

        const visibleControls = Array.from(root.querySelectorAll<HTMLElement>('input, button, .custom-select-trigger')).filter(isVisible);
        const clippedControls = visibleControls
          .map((element) => {
            const rect = element.getBoundingClientRect();

            return {
              id: element.id,
              className: element.className,
              tagName: element.tagName,
              height: rect.height,
              minWidth: minWidthFor(element),
              text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) ?? '',
              width: rect.width
            };
          })
          .filter((control) => control.width < control.minWidth || control.height < 40);
        const nativeSelects = Array.from(root.querySelectorAll<HTMLSelectElement>('select.custom-select-native')).map((select) => {
          const rect = select.getBoundingClientRect();

          return {
            ariaHidden: select.getAttribute('aria-hidden'),
            height: rect.height,
            tabIndex: select.tabIndex,
            width: rect.width
          };
        });

        return {
          clippedControls,
          nativeSelects
        };
      });

      expect(controlState.clippedControls, `visible calculator controls should not be clipped at ${viewport.width}px`).toEqual([]);
      expect(
        controlState.nativeSelects.every((select) => select.ariaHidden === 'true' && select.tabIndex === -1 && select.width <= 1 && select.height <= 1),
        'hidden native selects are expected custom Select false positives, not visible clipped controls'
      ).toBe(true);
    }
  });
});
