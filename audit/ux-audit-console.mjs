/**
 * Console error check across all public pages
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

const pages = [
  '/auth/register/user',
  '/auth/login',
  '/profile',
  '/profile/responses',
  '/profile/settings',
  '/vacancies',
  '/vacancies/senior-barista-aster-roasters-demo',
  '/suppliers',
  '/partners',
  '/events',
  '/education',
  '/contacts',
  '/consulting',
  '/business',
];

async function main() {
  const browser = await chromium.launch({ headless: true });

  // Register test user first
  const authCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const authPage = await authCtx.newPage();
  const ts = Date.now();
  await authPage.goto(`${BASE}/auth/register/user`);
  await authPage.waitForLoadState('networkidle').catch(() => {});
  await authPage.locator('input[name="fullName"]').fill('Console Tester').catch(() => {});
  await authPage.locator('input[name="email"]').fill(`console_${ts}@test.com`).catch(() => {});
  await authPage.locator('input[name="password"]').fill('AuditPass99!').catch(() => {});
  await authPage.locator('input[type="checkbox"]').check().catch(() => {});
  await authPage.locator('button[type="submit"]').click();
  await authPage.waitForTimeout(2000);

  // Get cookies for auth pages
  const cookies = await authCtx.cookies();
  await authCtx.close();

  console.log('\n=== CONSOLE ERROR AUDIT ===\n');
  const allErrors = {};

  for (const path of pages) {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      // Pass auth cookies for profile pages
      ...(path.startsWith('/profile') ? { storageState: undefined } : {})
    });

    // Set cookies for auth pages
    if (path.startsWith('/profile')) {
      await ctx.addCookies(cookies);
    }

    const page = await ctx.newPage();
    const errors = [];
    const warnings = [];

    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') errors.push(text);
      if (msg.type() === 'warn' && !text.includes('is deprecated') && !text.includes('React DevTools')) warnings.push(text);
    });
    page.on('pageerror', e => errors.push(`[PageError] ${e.message}`));

    await page.goto(`${BASE}${path}`);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(500);

    const critErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('ERR_BLOCKED') &&
      !e.includes('net::') &&
      !e.includes('Failed to load resource')
    );

    allErrors[path] = { errors: critErrors, warnings };

    const status = critErrors.length > 0 ? '❌' : '✓';
    console.log(`${status} ${path}`);
    if (critErrors.length > 0) {
      critErrors.forEach(e => console.log(`   [ERROR] ${e.slice(0, 150)}`));
    }
    if (warnings.length > 0) {
      warnings.slice(0, 2).forEach(w => console.log(`   [WARN]  ${w.slice(0, 150)}`));
    }

    await ctx.close();
  }

  // Summary
  const errorPages = Object.entries(allErrors).filter(([, v]) => v.errors.length > 0);
  console.log(`\n\nИтого страниц с ошибками: ${errorPages.length} / ${pages.length}`);
  errorPages.forEach(([p, v]) => {
    console.log(`  ${p}: ${v.errors.length} ошибок`);
  });

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
