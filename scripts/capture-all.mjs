import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { URL } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = process.cwd();
const BASE = 'http://127.0.0.1:3000';
const OUT = join(ROOT, 'ux-audit-screenshots');

const W = 1440, H = 900;
const MOB = 375, MOBH = 812;

const SLUGS = {
  articles: 'bloom-filter-coffee-guide',
  vacancies: 'summer-point-barista-demo',
  events: 'demo-coffee-service-intensive',
  suppliers: 'forma-glass-demo',
};

// ── helpers ──

const shot = async (p, path) => {
  const fp = join(OUT, `${path}.png`);
  await mkdir(dirname(fp), { recursive: true });
  await p.screenshot({ fullPage: true, path: fp });
  return path;
};

const go = async (p, url) => {
  const full = url.startsWith('http') ? url : new URL(url, BASE).toString();
  await p.goto(full, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => p.waitForTimeout(2000));
  await p.waitForTimeout(500);
  // lazy content reveal
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => { /* scrolled */ });
  await p.waitForTimeout(300);
  await p.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
  await p.waitForTimeout(200);
};

const results = [];

const capture = async (p, path, vp) => {
  try {
    if (vp) await p.setViewportSize(vp);
    const r = await shot(p, path);
    results.push(r);
    process.stdout.write('.');
  } catch (e) {
    process.stdout.write('x');
    results.push(`FAIL:${path}:${e.message.substring(0, 60)}`);
  }
};

// ── main ──

const browser = await chromium.launch({ headless: true });

// ================================================================
// BATCH 1: PUBLIC PAGES (desktop)
// ================================================================
let p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();

// Homepage
await go(p, '/');
await capture(p, '01-public/homepage/01-full-page');
await capture(p, '01-public/homepage/02-header');
await capture(p, '01-public/homepage/03-footer');
// Capture hero area
try { await p.locator('[class*="hero"]').first().screenshot({ path: join(OUT, '01-public/homepage/04-hero-section.png') }); results.push('01-public/homepage/04-hero-section'); } catch { /* ignore */ }

// Content listing pages
await go(p, '/articles');
await capture(p, '01-public/articles/01-listing');
await go(p, '/vacancies');
await capture(p, '01-public/vacancies/01-listing');
await go(p, '/suppliers');
await capture(p, '01-public/suppliers/01-listing');
await go(p, '/events');
await capture(p, '01-public/events/01-listing');
await go(p, '/education');
await capture(p, '01-public/education/01-listing');

// Detail pages
await go(p, `/articles/${SLUGS.articles}`);
await capture(p, '01-public/articles/02-detail');
await go(p, `/vacancies/${SLUGS.vacancies}`);
await capture(p, '01-public/vacancies/02-detail');
await go(p, `/events/${SLUGS.events}`);
await capture(p, '01-public/events/02-detail');
await go(p, `/suppliers/${SLUGS.suppliers}`);
await capture(p, '01-public/suppliers/02-detail');

// Static pages
await go(p, '/partners');
await capture(p, '01-public/partners/01-listing');
await go(p, '/about');
await capture(p, '01-public/about/01-page');
await go(p, '/contacts');
await capture(p, '01-public/contacts/01-page');
await go(p, '/consulting');
await capture(p, '01-public/consulting/01-page');
await go(p, '/business');
await capture(p, '01-public/business/01-page');
await go(p, '/general-sponsors');
await capture(p, '01-public/general-sponsors/01-listing');
await go(p, '/tools/cost-calculator');
await capture(p, '01-public/cost-calculator/01-page');

// Legal
await go(p, '/legal/terms');
await capture(p, '01-public/legal/01-terms');
await go(p, '/legal/privacy');
await capture(p, '01-public/legal/02-privacy');
await go(p, '/legal/cookies');
await capture(p, '01-public/legal/03-cookies');
await go(p, '/legal/personal-data-consent');
await capture(p, '01-public/legal/04-personal-data-consent');

p.close();

// ================================================================
// BATCH 2: SEARCH
// ================================================================
p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, '/search?q=бар');
await capture(p, '01-public/search/01-with-results');
await go(p, '/search?q=zxcvbnmnonexistent');
await capture(p, '01-public/search/02-empty');
p.close();

// ================================================================
// BATCH 3: AUTH PAGES
// ================================================================
// Login
p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, '/auth/login');
await capture(p, '02-auth/01-login-initial');
// Submit empty to show validation
const loginForm = p.locator('form').first();
await loginForm.locator('button[type="submit"]').first().click();
await p.waitForTimeout(1200);
await capture(p, '02-auth/02-login-validation-errors');
p.close();

// Register
p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, '/auth/register');
await capture(p, '02-auth/03-register-role-select');
p.close();

p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, '/auth/register/user');
await capture(p, '02-auth/04-register-user-form');
const regForm = p.locator('form').first();
await regForm.locator('button[type="submit"]').first().click();
await p.waitForTimeout(1200);
await capture(p, '02-auth/05-register-user-validation');
p.close();

// Password reset
p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, '/auth/password-reset');
await capture(p, '02-auth/06-password-reset-request');
p.close();
p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, '/auth/password-reset/confirm');
await capture(p, '02-auth/07-password-reset-confirm');
p.close();

// Admin login
p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, '/admin/login');
await capture(p, '02-auth/08-admin-login');
const adminForm = p.locator('form').first();
await adminForm.locator('button[type="submit"]').first().click();
await p.waitForTimeout(1200);
await capture(p, '02-auth/09-admin-login-validation');
p.close();

// ================================================================
// BATCH 4: MODALS & DIALOGS
// ================================================================
// Supplier inquiry dialog
p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, `/suppliers/${SLUGS.suppliers}`);
const inquiryBtn = p.locator('button, a', { hasText: /запрос|связаться|написать|отправить/i }).first();
if (await inquiryBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  await inquiryBtn.click();
  await p.waitForTimeout(1200);
  await capture(p, '03-modals/01-supplier-inquiry');
}
p.close();

// Login error toast
p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, '/auth/login');
const emailF = p.locator('input[name="email"]').first();
const passF = p.locator('input[name="password"]').first();
if (await emailF.isVisible({ timeout: 2000 }).catch(() => false)) {
  await emailF.fill('wrong@test.com');
  await passF.fill('wrongpass123');
  await p.locator('form button[type="submit"]').first().click();
  await p.waitForTimeout(3000);
  const toast = p.locator('[class*="toast"], [class*="notification"]').first();
  if (await toast.isVisible({ timeout: 1000 }).catch(() => false)) {
    await capture(p, '03-modals/02-toast-login-error');
  } else {
    await capture(p, '03-modals/02-login-error-state');
  }
}
p.close();

// Admin unauthorized redirect
p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, '/admin');
await capture(p, '03-modals/03-admin-unauthorized-redirect');
// Also capture the redirect URL to show it redirects to login
await go(p, '/admin/articles');
await capture(p, '03-modals/04-admin-articles-unauthorized');
p.close();

// Profile redirect
p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, '/profile');
await capture(p, '03-modals/05-profile-unauthorized');
p.close();

// Business redirect
p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, '/business/cabinet');
await capture(p, '03-modals/06-business-unauthorized');
p.close();

// ================================================================
// BATCH 5: INTERACTIVE STATES & PUBLIC FORMS
// ================================================================
// Contacts form validation
p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, '/contacts');
const contactForm = p.locator('form').first();
await contactForm.locator('button[type="submit"]').first().click();
await p.waitForTimeout(1200);
await capture(p, '04-forms/01-contact-validation');
p.close();

// Cost calculator interaction
p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, '/tools/cost-calculator');
await capture(p, '04-forms/02-calculator-initial');
// Try filling an input
const calcInput = p.locator('input').first();
if (await calcInput.isVisible({ timeout: 1000 }).catch(() => false)) {
  await calcInput.fill('150');
  await p.waitForTimeout(500);
  await capture(p, '04-forms/03-calculator-filled');
}
p.close();

// ================================================================
// BATCH 6: ERROR / LOADING / NOT FOUND STATES
// ================================================================
p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, '/this-page-does-not-exist-xyz-12345');
await capture(p, '05-states/01-404-not-found');
p.close();

// Loading states (articles)
p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await p.route('**/*', async (route) => {
  const url = route.request().url();
  if (url.includes('/api/') || url.includes('_next/data')) {
    await new Promise(r => setTimeout(r, 4000));
  }
  await route.continue();
});
await p.goto(new URL('/articles', BASE).toString(), { waitUntil: 'domcontentloaded', timeout: 15000 });
await p.waitForTimeout(500);
await capture(p, '05-states/02-loading-skeleton');
p.close();

// ================================================================
// BATCH 7: RESPONSIVE (MOBILE)
// ================================================================
p = await (await browser.newContext({ viewport: { width: MOB, height: MOBH }, locale: 'ru-RU' })).newPage();
await go(p, '/');
await capture(p, '06-responsive/01-homepage-mobile');
// Try opening mobile menu
const hamburger = p.locator('button[class*="menu"], button[aria-label*="меню"], [class*="hamburger"]').first();
if (await hamburger.isVisible({ timeout: 2000 }).catch(() => false)) {
  await hamburger.click();
  await p.waitForTimeout(800);
  await capture(p, '06-responsive/02-mobile-menu-open');
}
p.close();

p = await (await browser.newContext({ viewport: { width: MOB, height: MOBH }, locale: 'ru-RU' })).newPage();
await go(p, `/vacancies/${SLUGS.vacancies}`);
await capture(p, '06-responsive/03-vacancy-detail-mobile');
p.close();

p = await (await browser.newContext({ viewport: { width: MOB, height: MOBH }, locale: 'ru-RU' })).newPage();
await go(p, '/auth/login');
await capture(p, '06-responsive/04-auth-login-mobile');
p.close();

p = await (await browser.newContext({ viewport: { width: 768, height: 1024 }, locale: 'ru-RU' })).newPage();
await go(p, '/');
await capture(p, '06-responsive/05-homepage-tablet');
p.close();

p = await (await browser.newContext({ viewport: { width: MOB, height: MOBH }, locale: 'ru-RU' })).newPage();
await go(p, '/articles');
await capture(p, '06-responsive/06-articles-listing-mobile');
p.close();

// ================================================================
// BATCH 8: AUTH-GATED PAGES (show login redirect state — useful for UX audit)
// ================================================================
p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, '/profile');
await capture(p, '07-auth-gated/01-profile-redirect');
await go(p, '/profile/settings');
await capture(p, '07-auth-gated/02-profile-settings-redirect');
await go(p, '/profile/saved-vacancies');
await capture(p, '07-auth-gated/03-profile-saved-vacancies-redirect');
p.close();

p = await (await browser.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU' })).newPage();
await go(p, '/business/cabinet');
await capture(p, '07-auth-gated/04-business-cabinet-redirect');
await go(p, '/business/cabinet/responses');
await capture(p, '07-auth-gated/05-business-responses-redirect');
p.close();

await browser.close();

// ── Summary ──
const ok = results.filter(r => !r.startsWith('FAIL')).length;
const fail = results.filter(r => r.startsWith('FAIL')).length;
const failDetails = results.filter(r => r.startsWith('FAIL'));

console.log(`\n\n══════════════════════════════`);
console.log(`   Total: ${results.length}`);
console.log(`   OK:    ${ok}`);
console.log(`   FAIL:  ${fail}`);
console.log(`══════════════════════════════\n`);

if (failDetails.length > 0) {
  console.log('Failed captures:');
  failDetails.forEach(f => console.log(`   ${f.substring(5)}`));
}

// Write manifest
const manifest = {
  capturedAt: new Date().toISOString(),
  baseUrl: BASE,
  viewports: [`${W}x${H}`, `${MOB}x${MOBH}`, '768x1024'],
  total: results.length,
  success: ok,
  failed: fail,
  screenshots: results.map(r => ({
    path: r.startsWith('FAIL') ? r : `${r}.png`,
    status: r.startsWith('FAIL') ? 'failed' : 'ok',
  })),
};
await writeFile(join(OUT, '_manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`\nManifest: ${join(OUT, '_manifest.json')}`);
