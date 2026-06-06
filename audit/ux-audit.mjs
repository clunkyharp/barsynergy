/**
 * BARSYNERGY UX/UI Audit Script
 * Automated audit of public forms and user profile
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:3000';
const OUT = path.join(import.meta.dirname, 'screenshots');
const FINDINGS = [];
const CONSOLE_ERRORS = {};

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

let screenshotIdx = 0;
async function shot(page, name) {
  const file = path.join(OUT, `${String(++screenshotIdx).padStart(3, '0')}_${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

function finding(severity, page, component, description) {
  FINDINGS.push({ severity, page, component, description });
  console.log(`[${severity.toUpperCase()}] ${page} / ${component}: ${description}`);
}

async function collectConsoleErrors(page, label) {
  CONSOLE_ERRORS[label] = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warn') {
      CONSOLE_ERRORS[label].push({ type: msg.type(), text: msg.text() });
    }
  });
  page.on('pageerror', err => {
    CONSOLE_ERRORS[label].push({ type: 'pageerror', text: err.message });
  });
}

// ─── REGISTRATION ───────────────────────────────────────────────────────────

async function auditRegistration(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  collectConsoleErrors(page, 'register');

  await page.goto(`${BASE}/auth/register/user`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'register-initial');

  // Check form fields are present
  const fields = ['fullName', 'email', 'password'];
  for (const f of fields) {
    const el = page.locator(`[name="${f}"]`).first();
    const visible = await el.isVisible().catch(() => false);
    if (!visible) finding('critical', '/auth/register/user', `field[${f}]`, `Поле "${f}" не найдено`);
  }

  // Check labels and placeholders
  const inputs = await page.locator('input:not([type="hidden"])').all();
  for (const inp of inputs) {
    const ph = await inp.getAttribute('placeholder').catch(() => null);
    const type = await inp.getAttribute('type').catch(() => null);
    const name = await inp.getAttribute('name').catch(() => null);
    if (!ph && type !== 'checkbox' && type !== 'radio') {
      finding('minor', '/auth/register/user', `field[${name}]`, `Нет placeholder на поле ${name}`);
    }
  }

  // Test empty submit
  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();
  await page.waitForTimeout(500);
  const errorsAfterEmpty = await page.locator('[role="alert"], .text-red, .text-destructive, [data-error]').count();
  if (errorsAfterEmpty === 0) {
    finding('major', '/auth/register/user', 'form', 'Пустая отправка не показывает ошибок валидации');
  }
  await shot(page, 'register-empty-submit');

  // Test invalid email
  const emailInput = page.locator('[name="email"]').first();
  const pwInput = page.locator('[name="password"]').first();
  const nameInput = page.locator('[name="fullName"]').first();

  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill('notanemail');
    await submitBtn.click();
    await page.waitForTimeout(400);
    await shot(page, 'register-invalid-email');
  }

  // Test short password
  if (await pwInput.isVisible().catch(() => false)) {
    await emailInput.fill('test@test.com');
    await pwInput.fill('123');
    await submitBtn.click();
    await page.waitForTimeout(400);
    await shot(page, 'register-short-password');
  }

  // Valid registration
  const ts = Date.now();
  const testEmail = `audit_user_${ts}@barsynergy.test`;
  const testPass = 'AuditPass123!';

  if (await nameInput.isVisible().catch(() => false)) await nameInput.fill('Audit Tester');
  if (await emailInput.isVisible().catch(() => false)) await emailInput.fill(testEmail);
  if (await pwInput.isVisible().catch(() => false)) await pwInput.fill(testPass);

  // Consent checkbox
  const consent = page.locator('[type="checkbox"]').first();
  if (await consent.isVisible().catch(() => false)) {
    await consent.check();
  } else {
    finding('critical', '/auth/register/user', 'consent', 'Чекбокс согласия не найден');
  }

  await shot(page, 'register-filled');
  await submitBtn.click();
  await page.waitForTimeout(2000);

  const url = page.url();
  if (url.includes('/profile')) {
    console.log('[OK] Регистрация успешна, редирект на /profile');
  } else if (url.includes('/register')) {
    finding('critical', '/auth/register/user', 'form', `Регистрация не прошла, остались на: ${url}`);
    await shot(page, 'register-failed');
  } else {
    console.log(`[INFO] После регистрации: ${url}`);
  }

  await shot(page, 'after-register');
  return { page, ctx, testEmail, testPass };
}

// ─── PROFILE AUDIT ──────────────────────────────────────────────────────────

async function auditProfile(page) {
  // Overview
  await page.goto(`${BASE}/profile`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'profile-overview');

  const profileFields = ['email', 'fullName', 'profession', 'city', 'phone', 'telegram', 'company', 'bio'];
  const pageText = await page.locator('body').innerText().catch(() => '');
  const missing = profileFields.filter(f => !pageText.toLowerCase().includes(f.toLowerCase()));
  if (missing.length > 0) {
    finding('minor', '/profile', 'overview', `Поля не видны на странице: ${missing.join(', ')}`);
  }

  // Sidebar navigation
  const sidebarLinks = await page.locator('nav a, aside a').all();
  for (const link of sidebarLinks) {
    const href = await link.getAttribute('href').catch(() => null);
    const text = await link.innerText().catch(() => '');
    if (href && href.startsWith('/profile')) {
      const isVisible = await link.isVisible().catch(() => false);
      if (!isVisible) finding('major', '/profile', 'sidebar', `Ссылка "${text}" (${href}) не видна`);
    }
  }

  // My responses
  await page.goto(`${BASE}/profile/responses`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'profile-responses');

  const hasSearch = await page.locator('[type="search"], [name="search"], [placeholder*="поиск" i]').count();
  if (hasSearch === 0) {
    finding('minor', '/profile/responses', 'filters', 'Поле поиска не найдено');
  }

  // Settings
  await page.goto(`${BASE}/profile/settings`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'profile-settings');

  const settingsFields = ['fullName', 'phone', 'telegram', 'bio'];
  for (const f of settingsFields) {
    const el = page.locator(`[name="${f}"]`).first();
    const visible = await el.isVisible().catch(() => false);
    if (!visible) finding('major', '/profile/settings', `field[${f}]`, `Поле "${f}" не найдено в настройках`);
  }

  // Password change
  const pwFields = await page.locator('[name*="password" i], [name*="Password"]').all();
  if (pwFields.length < 2) {
    finding('major', '/profile/settings', 'password', 'Форма смены пароля не найдена или не хватает полей');
  }

  // Mobile viewport
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE}/profile`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'profile-mobile');
  await page.goto(`${BASE}/profile/settings`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'profile-settings-mobile');

  // Reset viewport
  await page.setViewportSize({ width: 1280, height: 900 });
}

// ─── PUBLIC FORMS AUDIT ──────────────────────────────────────────────────────

async function auditPublicForm(browser, url, formName, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(`${BASE}${url}`);
  await page.waitForLoadState('networkidle').catch(() => {});
  const label = formName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  await shot(page, `form-${label}-initial`);

  // Check form exists
  const form = page.locator('form').first();
  const hasForm = await form.isVisible().catch(() => false);
  if (!hasForm) {
    finding('critical', url, formName, 'Форма не найдена на странице');
    await ctx.close();
    return;
  }

  // Scroll down to find form if it's below the fold
  await page.evaluate(() => document.querySelector('form')?.scrollIntoView());
  await page.waitForTimeout(300);
  await shot(page, `form-${label}-visible`);

  // Check required fields have labels
  const inputs = await page.locator('form input:not([type="hidden"]):not([type="submit"]), form textarea, form select').all();
  for (const inp of inputs) {
    const id = await inp.getAttribute('id').catch(() => null);
    const name = await inp.getAttribute('name').catch(() => null);
    const type = await inp.getAttribute('type').catch(() => null);
    if (type === 'checkbox' || type === 'radio') continue;

    // Check for associated label
    let hasLabel = false;
    if (id) {
      const label = page.locator(`label[for="${id}"]`);
      hasLabel = await label.count() > 0;
    }
    const ph = await inp.getAttribute('placeholder').catch(() => null);
    if (!hasLabel && !ph) {
      finding('minor', url, `field[${name}]`, `Нет label и placeholder на поле ${name}`);
    }
  }

  // Test empty submit
  const submitBtn = page.locator('form button[type="submit"], form button:not([type])').first();
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
    await page.waitForTimeout(800);
    await shot(page, `form-${label}-empty-submit`);

    const validationErrors = await page.locator('[role="alert"], .text-red-500, .text-destructive, [data-slot="error"], p.text-sm.text-red').count();
    if (validationErrors === 0) {
      finding('major', url, formName, 'Пустая отправка не показывает ошибок валидации');
    }
  }

  // Test invalid email if email field exists
  const emailField = page.locator('form input[type="email"], form input[name="email"]').first();
  if (await emailField.isVisible().catch(() => false)) {
    await emailField.fill('bademail');
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(500);
    }
    await shot(page, `form-${label}-bad-email`);
    // restore
    await emailField.fill('');
  }

  // Test invalid phone if phone field exists
  const phoneField = page.locator('form input[name*="phone" i], form input[type="tel"]').first();
  if (await phoneField.isVisible().catch(() => false)) {
    await phoneField.fill('abc');
    await shot(page, `form-${label}-bad-phone`);
    await phoneField.fill('');
  }

  // Check consent checkbox
  const consentCheck = page.locator('form input[type="checkbox"]').first();
  if (await consentCheck.isVisible().catch(() => false)) {
    const isRequired = await consentCheck.getAttribute('required').catch(() => null);
    const nearbyText = await consentCheck.locator('..').innerText().catch(() => '');
    const hasPrivacyLink = nearbyText.toLowerCase().includes('политик') || nearbyText.toLowerCase().includes('согласи');
    if (!hasPrivacyLink) {
      finding('major', url, 'consent', 'Чекбокс согласия не имеет ссылки на политику конфиденциальности');
    }
  } else {
    if (!opts.noConsent) {
      finding('major', url, 'consent', 'Чекбокс согласия с политикой не найден в форме');
    }
  }

  // Check honeypot
  const honeypot = await page.locator('form input[name="website"][tabindex="-1"], form input[name="website"][aria-hidden]').count();
  const websiteField = await page.locator('form input[name="website"]').count();
  if (websiteField > 0 && honeypot === 0) {
    finding('minor', url, 'honeypot', 'Поле website существует, но не скрыто как honeypot (нет tabindex=-1 или aria-hidden)');
  }

  // Mobile viewport
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE}${url}`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(() => document.querySelector('form')?.scrollIntoView());
  await page.waitForTimeout(300);
  await shot(page, `form-${label}-mobile`);
  await page.setViewportSize({ width: 1280, height: 900 });

  // Console errors
  if (errors.length > 0) {
    finding('major', url, formName, `Консольные ошибки: ${errors.slice(0, 3).join('; ')}`);
  }

  await ctx.close();
}

// ─── VACANCY SLUG FORM ───────────────────────────────────────────────────────

async function auditVacancyResponseForm(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // Get list of vacancies to find a slug
  await page.goto(`${BASE}/vacancies`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'vacancies-list');

  const vacancyLink = page.locator('a[href^="/vacancies/"]').first();
  const hasVacancy = await vacancyLink.isVisible().catch(() => false);

  if (hasVacancy) {
    const href = await vacancyLink.getAttribute('href');
    await page.goto(`${BASE}${href}`);
    await page.waitForLoadState('networkidle').catch(() => {});
    await shot(page, 'vacancy-detail-initial');

    // Check response form
    const applyBtn = page.locator('button:has-text("Откликнуться"), button:has-text("Подать заявку"), button:has-text("Отправить отклик")').first();
    if (await applyBtn.isVisible().catch(() => false)) {
      await applyBtn.click();
      await page.waitForTimeout(800);
      await shot(page, 'vacancy-response-form-open');

      // Check file upload
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible().catch(() => false)) {
        // Check accepted formats
        const accept = await fileInput.getAttribute('accept').catch(() => null);
        if (!accept || (!accept.includes('pdf') && !accept.includes('doc'))) {
          finding('minor', '/vacancies/[slug]', 'file-upload', `Поле файла не имеет корректного accept: ${accept}`);
        }
      } else {
        finding('major', '/vacancies/[slug]', 'resume', 'Поле загрузки резюме не найдено в форме отклика');
      }

      // Mobile
      await page.setViewportSize({ width: 375, height: 812 });
      await shot(page, 'vacancy-response-form-mobile');
      await page.setViewportSize({ width: 1280, height: 900 });
    } else {
      // Look for inline form
      const form = page.locator('form').first();
      if (await form.isVisible().catch(() => false)) {
        await shot(page, 'vacancy-inline-form');
        finding('minor', '/vacancies/[slug]', 'apply-button', 'Кнопка "Откликнуться" не найдена, форма может быть инлайн');
      } else {
        finding('critical', '/vacancies/[slug]', 'response-form', 'Форма отклика на вакансию не найдена');
      }
    }
  } else {
    finding('major', '/vacancies', 'list', 'Нет вакансий в списке для тестирования отклика');
  }

  await ctx.close();
}

// ─── EDUCATION FORMS ─────────────────────────────────────────────────────────

async function auditEducationForms(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/education`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'education-initial');

  const forms = await page.locator('form').count();
  console.log(`[INFO] /education: найдено форм: ${forms}`);
  if (forms < 3) {
    finding('major', '/education', 'forms', `Ожидалось 3 формы (курс, корп. обучение, сертификат), найдено: ${forms}`);
  }

  await ctx.close();
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== BARSYNERGY UX/UI Audit ===\n');
  const browser = await chromium.launch({ headless: true });

  // 1. Registration + Profile audit
  console.log('\n── 1. Регистрация пользователя ──');
  let profilePage = null;
  let profileCtx = null;
  try {
    const result = await auditRegistration(browser);
    profilePage = result.page;
    profileCtx = result.ctx;

    console.log('\n── 2. Личный кабинет USER ──');
    await auditProfile(profilePage);
  } catch (e) {
    finding('critical', '/auth/register/user', 'registration', `Ошибка при регистрации: ${e.message}`);
    console.error(e);
  } finally {
    if (profileCtx) await profileCtx.close();
  }

  // 2. Public forms (anonymous context)
  console.log('\n── 3. Публичные формы ──');

  const publicForms = [
    ['/vacancies', 'VacancySubmissionForm'],
    ['/suppliers', 'SupplierForm'],
    ['/partners', 'PartnerForm'],
    ['/events', 'EventForm'],
    ['/contacts', 'ContactForm'],
    ['/consulting', 'ConsultingForm'],
    ['/business', 'BusinessForm'],
  ];

  for (const [url, name] of publicForms) {
    console.log(`\n  → ${url} (${name})`);
    await auditPublicForm(browser, url, name).catch(e => {
      finding('critical', url, name, `Ошибка при аудите: ${e.message}`);
    });
  }

  console.log('\n  → /education (3 формы)');
  await auditEducationForms(browser).catch(e => {
    finding('critical', '/education', 'forms', `Ошибка: ${e.message}`);
  });

  // 3. Vacancy response form
  console.log('\n  → /vacancies/[slug] (форма отклика)');
  await auditVacancyResponseForm(browser).catch(e => {
    finding('critical', '/vacancies/[slug]', 'response-form', `Ошибка: ${e.message}`);
  });

  await browser.close();

  // Output results
  console.log('\n\n══════════════════════════════════════');
  console.log('ИТОГИ АУДИТА');
  console.log('══════════════════════════════════════\n');

  const bySeverity = { critical: [], major: [], minor: [], cosmetic: [] };
  for (const f of FINDINGS) {
    bySeverity[f.severity]?.push(f);
  }

  for (const [sev, items] of Object.entries(bySeverity)) {
    if (items.length === 0) continue;
    console.log(`\n[${sev.toUpperCase()}] (${items.length})`);
    items.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.page} / ${f.component}`);
      console.log(`     ${f.description}`);
    });
  }

  // Save JSON report
  const report = {
    date: new Date().toISOString(),
    totalFindings: FINDINGS.length,
    findings: FINDINGS,
    consoleErrors: CONSOLE_ERRORS,
  };
  fs.writeFileSync(path.join(import.meta.dirname, 'audit-report.json'), JSON.stringify(report, null, 2));
  console.log(`\n\nОтчёт сохранён: audit/audit-report.json`);
  console.log(`Скриншоты: audit/screenshots/ (${screenshotIdx} шт.)`);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
