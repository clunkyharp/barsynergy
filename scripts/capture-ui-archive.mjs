import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const baseUrl = process.env.UI_ARCHIVE_BASE_URL ?? 'http://127.0.0.1:3000';
const outputRoot = path.resolve(process.env.UI_ARCHIVE_OUTPUT_DIR ?? 'output/ui-archive-2026-06-08');
const screenshotsRoot = path.join(outputRoot, 'screenshots');

const credentials = {
  user: {
    email: process.env.UI_ARCHIVE_USER_EMAIL ?? 'user-test@barsynergy.local',
    password: process.env.UI_ARCHIVE_USER_PASSWORD ?? 'UserTest123!',
  },
  business: {
    email: process.env.UI_ARCHIVE_BUSINESS_EMAIL ?? 'business-test@barsynergy.local',
    password: process.env.UI_ARCHIVE_BUSINESS_PASSWORD ?? 'BusinessTest123!',
  },
  admin: {
    email: process.env.UI_ARCHIVE_ADMIN_EMAIL ?? 'admin-test@barsynergy.local',
    password: process.env.UI_ARCHIVE_ADMIN_PASSWORD ?? 'AdminTest123!',
  },
};

const viewports = {
  desktop: { width: 1440, height: 1100 },
  mobile: { width: 390, height: 844 },
};

const publicRoutes = [
  '/',
  '/about',
  '/articles',
  '/business',
  '/consulting',
  '/contacts',
  '/education',
  '/events',
  '/general-sponsors',
  '/partners',
  '/search',
  '/suppliers',
  '/tools/cost-calculator',
  '/vacancies',
];

const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/register/user',
  '/auth/password-reset',
  '/auth/password-reset/confirm',
  '/auth/activate',
  '/admin/login',
];

const userRoutes = [
  '/profile',
  '/profile/settings',
  '/profile/responses',
  '/profile/inquiries',
  '/profile/saved-vacancies',
];

const businessRoutes = [
  '/business/cabinet',
  '/business/cabinet/requests',
  '/business/cabinet/responses',
];

const adminRoutes = [
  '/admin',
  '/admin/applications',
  '/admin/articles',
  '/admin/categories',
  '/admin/cities',
  '/admin/courses',
  '/admin/events',
  '/admin/general-sponsors',
  '/admin/homepage',
  '/admin/partners',
  '/admin/skills',
  '/admin/suppliers',
  '/admin/tags',
  '/admin/users',
  '/admin/vacancies',
];

const manifest = {
  createdAt: new Date().toISOString(),
  baseUrl,
  outputRoot,
  screenshots: [],
  errors: [],
};

function slugify(input) {
  if (!input || input === '/') {
    return 'home';
  }
  return input
    .replace(/^https?:\/\//, '')
    .replace(/[/?#:&=%]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function waitForRoute(url, attempts = 40) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await globalThis.fetch(url, { redirect: 'manual' });
      if (response.status >= 200 && response.status < 400) {
        return;
      }
    } catch {
      // Keep polling until the local server becomes reachable.
    }
    await new Promise((resolve) => globalThis.setTimeout(resolve, 1000));
  }
  throw new Error(`Server did not become ready: ${url}`);
}

async function saveShot(page, group, viewportName, name, note) {
  const dir = path.join(screenshotsRoot, group, viewportName);
  await ensureDir(dir);
  const filename = `${name}.png`;
  const filePath = path.join(dir, filename);
  await page.screenshot({ path: filePath, fullPage: true });
  manifest.screenshots.push({
    group,
    viewport: viewportName,
    name,
    note,
    file: path.relative(outputRoot, filePath),
    url: page.url(),
  });
}

async function captureRoutes(browser, group, routes, viewportName, options = {}) {
  const context = await browser.newContext({ viewport: viewports[viewportName] });
  const page = await context.newPage();

  if (options.beforeAll) {
    await options.beforeAll(page, context);
  }

  for (const route of routes) {
    const url = new globalThis.URL(route, baseUrl).toString();
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(250);
      await options.beforeEach?.(page, route, viewportName);
      await saveShot(page, group, viewportName, slugify(route || 'home'), options.note ?? null);
      await options.afterEach?.(page, route, viewportName);
    } catch (error) {
      manifest.errors.push({
        group,
        viewport: viewportName,
        route,
        error: String(error),
      });
    }
  }

  if (options.afterAll) {
    await options.afterAll(page, context);
  }

  await context.close();
}

async function capturePublicStates(browser) {
  const context = await browser.newContext({ viewport: viewports.mobile });
  const page = await context.newPage();

  try {
    await page.goto(new globalThis.URL('/', baseUrl).toString(), { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(400);
    const menuButton = page.getByRole('button').filter({ hasText: /меню/i }).first();
    if (await menuButton.count()) {
      await menuButton.click();
      await saveShot(page, 'public-states', 'mobile', 'home-mobile-menu-open', 'Mobile menu open');
    }
  } catch (error) {
    manifest.errors.push({ group: 'public-states', viewport: 'mobile', route: '/', error: String(error) });
  }

  try {
    await page.goto(new globalThis.URL('/contacts', baseUrl).toString(), { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(250);
    const inputs = page.locator('input, textarea').filter({ hasNot: page.locator('[type="hidden"]') });
    const firstName = page.locator('input[name="name"], input[name="fullName"]').first();
    if (await firstName.count()) {
      await firstName.fill('Тестовый пользователь');
    }
    const email = page.locator('input[type="email"]').first();
    if (await email.count()) {
      await email.fill('user-test@barsynergy.local');
    }
    const message = page.locator('textarea').first();
    if (await message.count()) {
      await message.fill('Тестовое сообщение для архива интерфейсов.');
    }
    if (await inputs.count()) {
      await saveShot(page, 'public-states', 'mobile', 'contacts-form-filled', 'Filled contact form');
    }
  } catch (error) {
    manifest.errors.push({ group: 'public-states', viewport: 'mobile', route: '/contacts', error: String(error) });
  }

  await context.close();
}

async function discoverAndCaptureDetail(browser, listingRoute, hrefPrefix, group, viewportName) {
  const context = await browser.newContext({ viewport: viewports[viewportName] });
  const page = await context.newPage();

  try {
    await page.goto(new globalThis.URL(listingRoute, baseUrl).toString(), { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(300);
    const candidate = page.locator(`a[href^="${hrefPrefix}"]`).first();
    await candidate.waitFor({ state: 'attached', timeout: 5000 });
    const href = await candidate.getAttribute('href', { timeout: 5000 });
    if (href) {
      await page.goto(new globalThis.URL(href, baseUrl).toString(), { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(250);
      await saveShot(page, group, viewportName, slugify(href), `First detail from ${listingRoute}`);
    }
  } catch (error) {
    manifest.errors.push({ group, viewport: viewportName, route: listingRoute, error: String(error) });
  }

  await context.close();
}

async function loginUser(page) {
  await page.goto(new globalThis.URL('/auth/login', baseUrl).toString(), { waitUntil: 'load', timeout: 20000 });
  await page.locator('input[type="email"]').first().fill(credentials.user.email);
  await page.locator('input[type="password"]').first().fill(credentials.user.password);
  await Promise.all([
    page.waitForURL(/\/profile|\/auth\/login/, { timeout: 15000 }),
    page.getByRole('button').filter({ hasText: /войти|вход/i }).first().click(),
  ]);
  await page.waitForTimeout(500);
}

async function loginBusiness(page) {
  await page.goto(new globalThis.URL('/auth/login?role=business', baseUrl).toString(), { waitUntil: 'load', timeout: 20000 });
  await page.locator('input[type="email"]').first().fill(credentials.business.email);
  await page.locator('input[type="password"]').first().fill(credentials.business.password);
  await Promise.all([
    page.waitForURL(/\/business\/cabinet|\/auth\/login/, { timeout: 15000 }),
    page.getByRole('button').filter({ hasText: /войти|вход/i }).first().click(),
  ]);
  await page.waitForTimeout(500);
}

async function loginAdmin(page) {
  await page.goto(new globalThis.URL('/admin/login', baseUrl).toString(), { waitUntil: 'load', timeout: 20000 });
  await page.locator('input[type="email"]').first().fill(credentials.admin.email);
  await page.locator('input[type="password"]').first().fill(credentials.admin.password);
  await Promise.all([
    page.waitForURL(/\/admin(?:\/|$)/, { timeout: 15000 }),
    page.getByRole('button').filter({ hasText: /войти|вход/i }).first().click(),
  ]);
  await page.waitForTimeout(500);
}

async function captureAuthStates(browser) {
  const context = await browser.newContext({ viewport: viewports.desktop });
  const page = await context.newPage();

  try {
    await page.goto(new globalThis.URL('/auth/login', baseUrl).toString(), { waitUntil: 'load', timeout: 20000 });
    await page.locator('input[type="email"]').first().fill(credentials.user.email);
    await page.locator('input[type="password"]').first().fill(credentials.user.password);
    await saveShot(page, 'auth-states', 'desktop', 'login-filled', 'Filled user login');
  } catch (error) {
    manifest.errors.push({ group: 'auth-states', viewport: 'desktop', route: '/auth/login', error: String(error) });
  }

  try {
    await page.goto(new globalThis.URL('/auth/register/user', baseUrl).toString(), { waitUntil: 'load', timeout: 20000 });
    const inputs = page.locator('input');
    if (await inputs.count()) {
      const email = page.locator('input[type="email"]').first();
      if (await email.count()) await email.fill('capture-user@barsynergy.local');
      const password = page.locator('input[type="password"]').first();
      if (await password.count()) await password.fill('StrongPass123!');
      await saveShot(page, 'auth-states', 'desktop', 'register-user-filled', 'Filled user registration');
    }
  } catch (error) {
    manifest.errors.push({ group: 'auth-states', viewport: 'desktop', route: '/auth/register/user', error: String(error) });
  }

  await context.close();
}

async function capturePrivateArea(browser, group, viewportName, loginFn, routes, extra) {
  const context = await browser.newContext({ viewport: viewports[viewportName] });
  const page = await context.newPage();
  try {
    await loginFn(page);
  } catch (error) {
    manifest.errors.push({ group, viewport: viewportName, route: 'login', error: String(error) });
    await context.close();
    return;
  }

  for (const route of routes) {
    try {
      await page.goto(new globalThis.URL(route, baseUrl).toString(), { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(250);
      await extra?.beforeEach?.(page, route);
      await saveShot(page, group, viewportName, slugify(route), null);
    } catch (error) {
      manifest.errors.push({ group, viewport: viewportName, route, error: String(error) });
    }
  }

  if (extra?.afterAll) {
    await extra.afterAll(page);
  }

  await context.close();
}

async function main() {
  await ensureDir(outputRoot);
  await ensureDir(screenshotsRoot);
  await waitForRoute(baseUrl);

  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
  } catch {
    browser = await chromium.launch({ headless: true });
  }

  await captureRoutes(browser, 'public', publicRoutes, 'desktop');
  await captureRoutes(browser, 'public', publicRoutes, 'mobile');
  await capturePublicStates(browser);
  await discoverAndCaptureDetail(browser, '/articles', '/articles/', 'public-details', 'desktop');
  await discoverAndCaptureDetail(browser, '/education', '/education/', 'public-details', 'desktop');
  await discoverAndCaptureDetail(browser, '/events', '/events/', 'public-details', 'desktop');
  await discoverAndCaptureDetail(browser, '/vacancies', '/vacancies/', 'public-details', 'desktop');
  await discoverAndCaptureDetail(browser, '/suppliers', '/suppliers/', 'public-details', 'desktop');
  await discoverAndCaptureDetail(browser, '/partners', '/partners/', 'public-details', 'desktop');

  await captureRoutes(browser, 'auth', authRoutes, 'desktop');
  await captureRoutes(browser, 'auth', authRoutes, 'mobile');
  await captureAuthStates(browser);

  await capturePrivateArea(browser, 'profile', 'desktop', loginUser, userRoutes);
  await capturePrivateArea(browser, 'business', 'desktop', loginBusiness, businessRoutes);
  await capturePrivateArea(browser, 'admin', 'desktop', loginAdmin, adminRoutes, {
    beforeEach: async (page, route) => {
      if (route === '/admin') {
        const toggle = page.locator('.admin-sidebar-toggle').first();
        if (await toggle.count()) {
          await saveShot(page, 'admin', 'desktop', 'admin-dashboard-sidebar-expanded', 'Admin dashboard expanded sidebar');
          await toggle.click();
          await page.waitForTimeout(250);
          await saveShot(page, 'admin', 'desktop', 'admin-dashboard-sidebar-collapsed', 'Admin dashboard collapsed sidebar');
          await toggle.click();
          await page.waitForTimeout(250);
        }
      }
    },
  });

  await capturePrivateArea(browser, 'admin', 'mobile', loginAdmin, ['/admin/login'], null);

  await browser.close();
  await fs.writeFile(path.join(outputRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch(async (error) => {
  manifest.errors.push({ group: 'runtime', viewport: 'n/a', route: 'main', error: String(error) });
  await ensureDir(outputRoot);
  await fs.writeFile(path.join(outputRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.error(error);
  process.exit(1);
});
