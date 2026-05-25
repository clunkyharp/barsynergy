import { expect, test, type Page } from '@playwright/test';
import {
  cleanupAdminSessionData,
  cleanupUploadedFile,
  cleanupUploadedFilesByOriginalName,
  createAdminSession,
  disconnectAdminTestPrisma
} from './admin-test-session';

type FocusSample = {
  hidden: boolean;
  label: string;
  tagName: string;
};

const adminRoutes = [
  '/admin',
  '/admin/applications',
  '/admin/articles',
  '/admin/articles/create',
  '/admin/courses',
  '/admin/courses/create',
  '/admin/events',
  '/admin/events/create',
  '/admin/vacancies',
  '/admin/vacancies/create',
  '/admin/suppliers',
  '/admin/suppliers/create',
  '/admin/partners',
  '/admin/partners/create',
  '/admin/general-sponsors',
  '/admin/general-sponsors/new',
  '/admin/homepage',
  '/admin/users',
  '/admin/categories',
  '/admin/cities',
  '/admin/tags'
];

const pngFixture = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64'
);

async function getOverflowState(page: Page) {
  return page.evaluate(() => ({
    bodyOverflow: Math.max(0, document.body.scrollWidth - window.innerWidth),
    documentOverflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth)
  }));
}

async function collectTabFocusSamples(page: Page) {
  const samples: FocusSample[] = [];

  for (let index = 0; index < 12; index += 1) {
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

test.describe('authenticated admin QA', () => {
  test.beforeEach(async ({ context }, testInfo) => {
    await createAdminSession(context, testInfo.project.use.baseURL as string);
  });

  test.afterAll(async () => {
    await cleanupAdminSessionData();
    await disconnectAdminTestPrisma();
  });

  for (const route of adminRoutes) {
    test(`${route} renders for an authenticated admin and keeps keyboard focus usable`, async ({ page }) => {
      const pageErrors: string[] = [];

      page.on('pageerror', (error) => {
        pageErrors.push(error.message);
      });

      await page.setViewportSize({ width: 1280, height: 900 });
      const response = await page.goto(route);

      expect(response?.ok(), `${route} should respond with a successful HTTP status`).toBe(true);
      await expect(page.locator('.admin-shell')).toBeVisible();
      await expect(page.getByText('Нужен широкий экран')).toBeHidden();

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
    });
  }

  test('admin mobile viewport shows the authenticated wide-screen fallback', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const response = await page.goto('/admin/articles');

    expect(response?.ok(), 'admin route should render for authenticated mobile fallback').toBe(true);
    await expect(page.getByRole('heading', { name: 'Нужен широкий экран' })).toBeVisible();
    await expect(page.locator('.admin-shell')).toBeVisible();

    const overflow = await getOverflowState(page);
    expect(overflow, 'admin mobile fallback should not create horizontal overflow').toEqual({
      bodyOverflow: 0,
      documentOverflow: 0
    });
  });

  test('admin upload endpoint accepts a valid image and rejects an invalid file', async ({ page }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL as string;
    const uploadOrigin = process.env.APP_URL ?? baseURL;
    const uploadedFileIds: string[] = [];

    await cleanupUploadedFilesByOriginalName('e2e-cover.png');

    try {
      await page.goto('/admin/articles/create');

      const validUpload = await page.request.post('/admin/uploads/content-image', {
        headers: {
          Origin: uploadOrigin
        },
        multipart: {
          file: {
            buffer: pngFixture,
            mimeType: 'image/png',
            name: 'e2e-cover.png'
          }
        }
      });

      expect(validUpload.ok(), 'valid admin image upload should succeed').toBe(true);
      const validUploadBody = await validUpload.json();
      expect(validUploadBody.file.id, 'valid upload should return an UploadedFile id').toEqual(expect.any(String));
      uploadedFileIds.push(validUploadBody.file.id);

      const invalidUpload = await page.request.post('/admin/uploads/content-image', {
        headers: {
          Origin: uploadOrigin
        },
        multipart: {
          file: {
            buffer: Buffer.from('not an image'),
            mimeType: 'text/plain',
            name: 'not-image.txt'
          }
        }
      });

      expect(invalidUpload.status(), 'invalid admin upload should fail with a client error').toBe(400);

      const fileInput = page.locator('#article-coverImage');
      await fileInput.setInputFiles({
        buffer: Buffer.from('not an image'),
        mimeType: 'text/plain',
        name: 'not-image.txt'
      });

      await expect(page.locator('#article-coverImage-error')).toHaveText('Выберите JPEG, PNG, WebP или AVIF.');
      await expect(fileInput).toHaveAttribute('aria-invalid', 'true');

      await fileInput.setInputFiles({
        buffer: pngFixture,
        mimeType: 'image/png',
        name: 'e2e-cover.png'
      });

      await expect(page.locator('#article-coverImage-success')).toHaveText(
        'Предпросмотр готов. Сохраните форму, чтобы применить файл.',
      );
      await expect(page.getByLabel('Предпросмотр обложки')).toBeVisible();
    } finally {
      await Promise.all(uploadedFileIds.map((fileId) => cleanupUploadedFile(fileId)));
      await cleanupUploadedFilesByOriginalName('e2e-cover.png');
    }
  });
});
