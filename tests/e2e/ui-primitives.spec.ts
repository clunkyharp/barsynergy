import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { ContentStatus, PrismaClient } from '@prisma/client';
import {
  cleanupAdminSessionData,
  createAdminSession,
  disconnectAdminTestPrisma
} from './admin-test-session';

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
const prisma = new PrismaClient();
const articleSlug = 'e2e-ui-primitives-action-menu';
const articleTitle = 'E2E UI primitives action menu';

let axeSource = '';

test.beforeAll(async () => {
  axeSource = await readFile(axeSourcePath, 'utf8');
});

test.afterAll(async () => {
  await prisma.article.deleteMany({ where: { slug: articleSlug } });
  await cleanupAdminSessionData();
  await Promise.all([prisma.$disconnect(), disconnectAdminTestPrisma()]);
});

async function getCriticalAxeViolations(page: Page) {
  await page.addScriptTag({ content: axeSource });

  return page.evaluate(async () => {
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
}

test('custom Select supports keyboard selection, Escape and form value submission', async ({ page }) => {
  const response = await page.goto('/contacts#contact-form');

  expect(response?.ok(), 'contacts page should respond successfully').toBe(true);

  const topicTrigger = page.locator('#contactTopic');
  await expect(topicTrigger).toBeVisible();

  await topicTrigger.focus();
  await page.keyboard.press('Enter');
  await expect(topicTrigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('listbox')).toBeVisible();

  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await expect(topicTrigger).toHaveText(/Событие/);
  await expect(topicTrigger).toBeFocused();
  await expect(page.locator('select[name="topic"]')).toHaveValue('event');

  const submittedTopic = await page.locator('form.editorial-form-shell').evaluate((form) => new FormData(form as HTMLFormElement).get('topic'));
  expect(submittedTopic).toBe('event');

  await page.keyboard.press('Enter');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(topicTrigger).toBeFocused();

  await page.getByRole('button', { name: 'Отправить сообщение' }).click();
  await expect(page.locator('#contactName')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#contactName-validation-error')).toBeVisible();

  const violations = await getCriticalAxeViolations(page);
  expect(violations, 'contacts Select flow should not introduce critical axe violations').toEqual([]);
});

test('admin Dropdown menu supports keyboard open, focus and Escape restore', async ({ context, page }, testInfo) => {
  const adminId = await createAdminSession(context, testInfo.project.use.baseURL as string);

  await prisma.article.deleteMany({ where: { slug: articleSlug } });
  await prisma.article.create({
    data: {
      title: articleTitle,
      slug: articleSlug,
      summary: 'Short summary for the UI primitive action menu test.',
      body: 'Long enough body for the UI primitive action menu test content.',
      status: ContentStatus.DRAFT,
      createdById: adminId,
      updatedById: adminId
    }
  });

  const response = await page.goto('/admin/articles');

  expect(response?.ok(), 'admin articles page should respond successfully').toBe(true);

  const row = page.getByRole('row').filter({ hasText: articleTitle }).first();
  await expect(row).toBeVisible();

  const trigger = row.getByRole('button', { name: 'Открыть действия' });
  await trigger.focus();
  await page.keyboard.press('Enter');

  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  await expect(page.getByRole('menuitem').first()).toBeFocused();

  const violations = await getCriticalAxeViolations(page);
  expect(violations, 'admin Dropdown flow should not introduce critical axe violations').toEqual([]);

  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});
