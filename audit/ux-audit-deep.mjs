/**
 * BARSYNERGY Deep UX Audit — forms in modals/drawers, vacancy slug, education
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:3000';
const OUT = path.join(import.meta.dirname, 'screenshots');
const FINDINGS = [];

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

let idx = 0;
async function shot(page, name, opts = {}) {
  const file = path.join(OUT, `${String(++idx).padStart(3, '0')}_D_${name}.png`);
  await page.screenshot({ path: file, fullPage: opts.fullPage ?? true });
  return file;
}

function finding(severity, pageUrl, component, description) {
  FINDINGS.push({ severity, page: pageUrl, component, description });
  console.log(`  [${severity.toUpperCase()}] ${component}: ${description}`);
}

async function waitAndShot(page, name, waitFor = 500) {
  await page.waitForTimeout(waitFor);
  return shot(page, name);
}

// ─── Helper: find & click open-form trigger ──────────────────────────────────

async function openFormAndAudit(page, url, triggerTexts, formName) {
  await page.goto(`${BASE}${url}`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, `${formName}-page`);

  // Try clicking trigger buttons
  for (const text of triggerTexts) {
    const btn = page.locator(`button:has-text("${text}"), a:has-text("${text}")`).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.scrollIntoViewIfNeeded().catch(() => {});
      await btn.click();
      await page.waitForTimeout(800);
      await shot(page, `${formName}-after-trigger`);
      break;
    }
  }

  // Look for form in modal/dialog
  const dialog = page.locator('[role="dialog"], [data-radix-dialog-content], [data-dialog-content]');
  const hasDialog = await dialog.isVisible().catch(() => false);

  // Also check for inline form
  const inlineForm = page.locator('form').first();
  const hasInlineForm = await inlineForm.isVisible().catch(() => false);

  const form = hasDialog ? dialog.locator('form').first() : inlineForm;
  const hasForm = hasDialog ? await dialog.locator('form').isVisible().catch(() => false) : hasInlineForm;

  return { hasForm, hasDialog, form, page };
}

// ─── Detailed form auditor ───────────────────────────────────────────────────

async function deepFormAudit(page, formName, url, form) {
  console.log(`\n  Аудит формы: ${formName}`);

  // --- Required fields ---
  const inputs = await form.locator('input:not([type="hidden"]):not([type="submit"]), textarea, select').all();
  const selectCount = await form.locator('select, [data-radix-select-trigger], [role="combobox"]').count();
  console.log(`    Полей ввода: ${inputs.length}, Select/Combobox: ${selectCount}`);

  // Check each input for label
  for (const inp of inputs.slice(0, 20)) { // limit
    const type = await inp.getAttribute('type').catch(() => 'text');
    const name = await inp.getAttribute('name').catch(() => null);
    const id = await inp.getAttribute('id').catch(() => null);
    if (type === 'checkbox' || type === 'radio' || type === 'hidden') continue;

    const ph = await inp.getAttribute('placeholder').catch(() => null);
    const label = id ? await page.locator(`label[for="${id}"]`).count() : 0;
    const ariaLabel = await inp.getAttribute('aria-label').catch(() => null);
    const ariaLabelledby = await inp.getAttribute('aria-labelledby').catch(() => null);

    if (!ph && !label && !ariaLabel && !ariaLabelledby) {
      finding('minor', url, `field[${name || id}]`, `Поле без label, placeholder и aria-label`);
    }
  }

  // --- Consent checkbox ---
  const checkboxes = await form.locator('input[type="checkbox"]').all();
  let foundConsent = false;
  for (const cb of checkboxes) {
    const parentText = await cb.evaluate(el => el.closest('label, div')?.innerText || '').catch(() => '');
    if (parentText.toLowerCase().includes('политик') || parentText.toLowerCase().includes('согласи') || parentText.toLowerCase().includes('персональн')) {
      foundConsent = true;
      // Check for privacy link
      const nearLink = await cb.locator('xpath=../..//a[contains(@href,"privac") or contains(@href,"policy") or contains(@href,"agreement")]').count();
      if (nearLink === 0) {
        finding('minor', url, 'consent', 'Чекбокс согласия без ссылки на политику конф. (ссылка не найдена в DOM)');
      }
    }
  }
  if (!foundConsent && checkboxes.length === 0) {
    finding('major', url, 'consent', 'Чекбокс согласия с персональными данными отсутствует');
  }

  // --- Honeypot ---
  const honeypotField = await form.locator('input[name="website"]').count();
  if (honeypotField > 0) {
    const tabIndex = await form.locator('input[name="website"]').first().getAttribute('tabindex').catch(() => null);
    const hidden = await form.locator('input[name="website"]').first().isHidden().catch(() => false);
    const ariaHidden = await form.locator('input[name="website"]').first().getAttribute('aria-hidden').catch(() => null);
    if (tabIndex !== '-1' && !hidden && ariaHidden !== 'true') {
      finding('major', url, 'honeypot', `Поле website (honeypot) видимо пользователю: tabindex=${tabIndex}, hidden=${hidden}`);
    } else {
      console.log(`    [OK] Honeypot поле: tabindex=${tabIndex}, hidden=${hidden}`);
    }
  }

  // --- File upload ---
  const fileInput = await form.locator('input[type="file"]').count();
  if (fileInput > 0) {
    const accept = await form.locator('input[type="file"]').first().getAttribute('accept').catch(() => null);
    const sizeText = await page.locator('text=/8\s*MB|8MB|8мб/i').count();
    console.log(`    [OK] Загрузка файла найдена: accept="${accept}", ограничение 8MB текст: ${sizeText > 0}`);
    if (accept && !accept.includes('pdf') && !accept.includes('doc')) {
      finding('minor', url, 'file-upload', `Нестандартный accept: ${accept}`);
    }
    if (sizeText === 0) {
      finding('minor', url, 'file-upload', 'Не указано ограничение 8MB рядом с полем загрузки');
    }
  }

  // --- Empty submit ---
  const submitBtn = form.locator('button[type="submit"], button:not([type])').last();
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
    await page.waitForTimeout(800);
    const errMsgs = await form.locator('[role="alert"], p.text-sm, .text-destructive, [data-slot="error"]').count();
    if (errMsgs === 0) {
      finding('major', url, formName, 'Пустая отправка не показывает сообщений об ошибке');
    } else {
      console.log(`    [OK] Валидация при пустой отправке: ${errMsgs} сообщений об ошибке`);
    }
    await shot(page, `${formName.toLowerCase().replace(/\s/g,'-')}-empty-validate`);
  }
}

// ─── 1. Register page deep dive ──────────────────────────────────────────────

async function auditRegisterDeep(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  console.log('\n══ /auth/register/user ══');
  await page.goto(`${BASE}/auth/register/user`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'REG-full-page', { fullPage: true });

  // Check actual placeholder content
  const inputs = await page.locator('input:not([type="hidden"])').all();
  for (const inp of inputs) {
    const name = await inp.getAttribute('name').catch(() => '?');
    const ph = await inp.getAttribute('placeholder').catch(() => null);
    const type = await inp.getAttribute('type').catch(() => 'text');
    const id = await inp.getAttribute('id').catch(() => null);
    const label = id ? (await page.locator(`label[for="${id}"]`).textContent().catch(() => null)) : null;
    console.log(`  field[${name}] type=${type} placeholder="${ph}" label="${label}"`);
    if (!ph && !label && type !== 'checkbox') {
      finding('minor', '/auth/register/user', `field[${name}]`, `Нет placeholder и label (type=${type})`);
    }
  }

  // Check all checkboxes and their labels
  const checkboxes = await page.locator('input[type="checkbox"]').all();
  for (const cb of checkboxes) {
    const name = await cb.getAttribute('name').catch(() => '?');
    const parentText = await cb.evaluate(el => {
      const label = el.closest('label') || el.parentElement;
      return label?.innerText?.trim() || '';
    }).catch(() => '');
    console.log(`  checkbox[${name}] label: "${parentText.slice(0, 80)}"`);
  }

  // Consent link check
  const privacyLink = page.locator('a[href*="privac"], a[href*="policy"], a[href*="agreement"], a:has-text("политик")');
  const privacyCount = await privacyLink.count();
  if (privacyCount === 0) {
    finding('major', '/auth/register/user', 'consent-link', 'Ссылка на политику конфиденциальности не найдена на странице');
  } else {
    console.log(`  [OK] Ссылка на политику: ${await privacyLink.first().getAttribute('href')}`);
  }

  await ctx.close();
}

// ─── 2. Profile pages ────────────────────────────────────────────────────────

async function auditProfileDeep(browser) {
  // Need auth — do quick login
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // Login
  await page.goto(`${BASE}/auth/login`);
  await page.waitForLoadState('networkidle').catch(() => {});

  // Find email/password fields
  const emailField = page.locator('input[type="email"], input[name="email"]').first();
  const pwField = page.locator('input[type="password"], input[name="password"]').first();
  const submitBtn = page.locator('button[type="submit"]').first();

  if (await emailField.isVisible().catch(() => false)) {
    // Register a fresh user first
    await page.goto(`${BASE}/auth/register/user`);
    await page.waitForLoadState('networkidle').catch(() => {});

    const ts = Date.now();
    const email = `profile_audit_${ts}@test.com`;
    const pw = 'AuditPass99!';

    const nameField = page.locator('input[name="fullName"]').first();
    const regEmail = page.locator('input[name="email"]').first();
    const regPw = page.locator('input[name="password"]').first();
    const consent = page.locator('input[type="checkbox"]').first();

    if (await nameField.isVisible().catch(() => false)) await nameField.fill('Profile Auditor');
    if (await regEmail.isVisible().catch(() => false)) await regEmail.fill(email);
    if (await regPw.isVisible().catch(() => false)) await regPw.fill(pw);
    if (await consent.isVisible().catch(() => false)) await consent.check();

    const regSubmit = page.locator('button[type="submit"]').first();
    await regSubmit.click();
    await page.waitForTimeout(2000);
  }

  // Now check profile pages
  console.log('\n══ /profile ══');
  await page.goto(`${BASE}/profile`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'PROFILE-overview-full', { fullPage: true });

  const url = page.url();
  if (!url.includes('/profile')) {
    finding('critical', '/profile', 'auth', `Не удалось войти, текущий URL: ${url}`);
    await ctx.close();
    return;
  }

  // Check visible page structure
  const pageText = await page.locator('body').innerText().catch(() => '');
  console.log('  Текст страницы (первые 500 символов):', pageText.slice(0, 500));

  // Check sidebar
  const sidebar = page.locator('aside, nav[aria-label*="profile" i], nav[aria-label*="профил" i], [data-sidebar]');
  const sidebarVisible = await sidebar.isVisible().catch(() => false);
  if (!sidebarVisible) {
    finding('major', '/profile', 'sidebar', 'Боковая навигация не найдена');
  }

  // Check sidebar links
  const sidebarLinks = await page.locator('aside a, nav a').all();
  console.log(`  Навигационных ссылок: ${sidebarLinks.length}`);
  for (const link of sidebarLinks) {
    const href = await link.getAttribute('href').catch(() => null);
    const text = await link.innerText().catch(() => '');
    const active = await link.getAttribute('aria-current').catch(() => null) ||
                   await link.getAttribute('data-active').catch(() => null);
    console.log(`    [${active ? 'ACTIVE' : '      '}] "${text.trim()}" → ${href}`);
  }

  // Check active link highlight
  const activeLink = await page.locator('aside a[aria-current="page"], aside a[data-active="true"], nav a[aria-current="page"]').count();
  if (activeLink === 0) {
    finding('minor', '/profile', 'sidebar', 'Активный пункт меню не подсвечивается (нет aria-current или data-active)');
  }

  // /profile/responses
  console.log('\n══ /profile/responses ══');
  await page.goto(`${BASE}/profile/responses`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'PROFILE-responses-full', { fullPage: true });

  const hasSearch = await page.locator('[type="search"], [name="search"], [placeholder*="поиск" i], input[placeholder*="Search" i]').count();
  const hasFilters = await page.locator('select[name*="status"], select[name*="type"], [data-filter], [role="combobox"]').count();
  const hasPagination = await page.locator('[aria-label*="pagination" i], nav[role="navigation"], button:has-text("Следующая"), button:has-text("Предыдущая")').count();
  const responseItems = await page.locator('[data-response-item], article, .response-card, [class*="response"]').count();

  console.log(`  Поиск: ${hasSearch}, Фильтры: ${hasFilters}, Пагинация: ${hasPagination}, Откликов: ${responseItems}`);

  if (hasSearch === 0) finding('minor', '/profile/responses', 'search', 'Строка поиска не найдена');
  if (hasFilters === 0) finding('minor', '/profile/responses', 'filters', 'Фильтры не найдены');

  // Empty state
  const emptyState = await page.locator('[data-empty], text=/нет откликов/i, text=/no responses/i, text=/список пуст/i').count();
  if (responseItems === 0 && emptyState === 0) {
    finding('minor', '/profile/responses', 'empty-state', 'Пустой список без empty-state компонента');
  }

  // /profile/settings
  console.log('\n══ /profile/settings ══');
  await page.goto(`${BASE}/profile/settings`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'PROFILE-settings-full', { fullPage: true });

  // Check all form fields in settings
  const settingsInputs = await page.locator('input:not([type="hidden"]):not([type="submit"]), textarea').all();
  console.log(`  Полей в настройках: ${settingsInputs.length}`);
  for (const inp of settingsInputs) {
    const name = await inp.getAttribute('name').catch(() => '?');
    const type = await inp.getAttribute('type').catch(() => 'text');
    const ph = await inp.getAttribute('placeholder').catch(() => null);
    const val = await inp.inputValue().catch(() => null);
    console.log(`    field[${name}] type=${type} ph="${ph}" val="${val?.slice(0, 30)}"`);
  }

  // Check save button state (should be disabled when no changes)
  const saveBtn = page.locator('button[type="submit"]:has-text("Сохранить"), button:has-text("Сохранить изменения"), button:has-text("Save")').first();
  if (await saveBtn.isVisible().catch(() => false)) {
    const disabled = await saveBtn.isDisabled().catch(() => false);
    console.log(`  Кнопка сохранения: disabled=${disabled}`);
    if (!disabled) {
      finding('minor', '/profile/settings', 'save-button', 'Кнопка "Сохранить" не задисейблена при отсутствии изменений');
    }
  } else {
    finding('major', '/profile/settings', 'save-button', 'Кнопка сохранения настроек не найдена');
  }

  // Mobile viewport tests
  console.log('\n══ Mobile 375px viewport ══');
  await page.setViewportSize({ width: 375, height: 812 });

  for (const route of ['/profile', '/profile/responses', '/profile/settings']) {
    await page.goto(`${BASE}${route}`);
    await page.waitForLoadState('networkidle').catch(() => {});
    const label = route.replace(/\//g, '-');
    await shot(page, `PROFILE-mobile${label}`, { fullPage: false });

    // Check for overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    if (hasOverflow) {
      finding('major', route, 'mobile-layout', 'Горизонтальный скролл на 375px (overflow-x)');
    }
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await ctx.close();
}

// ─── 3. Vacancies deep audit ─────────────────────────────────────────────────

async function auditVacanciesDeep(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  console.log('\n══ /vacancies — поиск формы подачи ══');
  await page.goto(`${BASE}/vacancies`);
  await page.waitForLoadState('networkidle').catch(() => {});

  // Look for any CTA buttons
  const allButtons = await page.locator('button, a[href*="submit"], a[href*="create"]').all();
  const ctaButtons = [];
  for (const btn of allButtons) {
    const text = await btn.innerText().catch(() => '');
    if (text.match(/подать|разместить|опубликовать|submit|create|добавить/i)) {
      ctaButtons.push(text.trim());
    }
  }
  console.log(`  CTA кнопки: ${JSON.stringify(ctaButtons)}`);

  // Try to find submission form via different triggers
  const triggers = ['Подать вакансию', 'Разместить вакансию', 'Опубликовать вакансию', 'Добавить вакансию', 'Submit vacancy'];
  for (const trigger of triggers) {
    const btn = page.locator(`button:has-text("${trigger}"), a:has-text("${trigger}")`).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(800);
      await shot(page, 'VACANCIES-form-modal');
      const form = page.locator('[role="dialog"] form, form').first();
      if (await form.isVisible().catch(() => false)) {
        console.log(`  [OK] Форма открылась после нажатия "${trigger}"`);
        await deepFormAudit(page, 'VacancySubmissionForm', '/vacancies', form);
      }
      break;
    }
  }

  // Check vacancy detail + response form
  const vacancyCards = page.locator('a[href^="/vacancies/"]').first();
  if (await vacancyCards.isVisible().catch(() => false)) {
    const href = await vacancyCards.getAttribute('href');
    console.log(`\n══ ${href} — форма отклика ══`);
    await page.goto(`${BASE}${href}`);
    await page.waitForLoadState('networkidle').catch(() => {});
    await shot(page, 'VACANCY-detail-full', { fullPage: true });

    // Find apply form or button
    const applyTriggers = ['Откликнуться', 'Отправить отклик', 'Подать заявку', 'Apply'];
    for (const trigger of applyTriggers) {
      const btn = page.locator(`button:has-text("${trigger}")`).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(1000);
        await shot(page, 'VACANCY-response-form-open');

        const dialog = page.locator('[role="dialog"]');
        const form = (await dialog.isVisible().catch(() => false))
          ? dialog.locator('form').first()
          : page.locator('form').first();

        if (await form.isVisible().catch(() => false)) {
          console.log(`  [OK] Форма отклика открылась`);
          await deepFormAudit(page, 'VacancyResponseForm', href, form);

          // File upload test
          const fileInput = page.locator('input[type="file"]').first();
          if (await fileInput.isVisible().catch(() => false)) {
            const accept = await fileInput.getAttribute('accept');
            console.log(`    [OK] File upload accept: ${accept}`);
          } else {
            finding('major', href, 'resume', 'Поле загрузки резюме (PDF/DOC) не найдено в форме отклика');
          }

          // Mobile
          await page.setViewportSize({ width: 375, height: 812 });
          // Reopen if modal closed
          const formMobile = page.locator('form').first();
          if (!await formMobile.isVisible().catch(() => false)) {
            const triggerBtn = page.locator(`button:has-text("${trigger}")`).first();
            if (await triggerBtn.isVisible().catch(() => false)) await triggerBtn.click();
            await page.waitForTimeout(600);
          }
          await shot(page, 'VACANCY-response-form-mobile', { fullPage: false });
          await page.setViewportSize({ width: 1280, height: 900 });
        }
        break;
      }
    }

    // Check if form is inline (not modal)
    const inlineForm = page.locator('form').first();
    if (await inlineForm.isVisible().catch(() => false)) {
      console.log('  [INFO] Инлайн форма на странице вакансии');
      await deepFormAudit(page, 'VacancyResponseInline', href, inlineForm);
    }
  }

  await ctx.close();
}

// ─── 4. Suppliers / Partners / Events deep audit ──────────────────────────────

async function auditSectionWithModal(browser, url, sectionName, triggers) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  console.log(`\n══ ${url} ══`);
  await page.goto(`${BASE}${url}`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, `${sectionName}-initial`, { fullPage: false });

  // Try all trigger phrases
  let formOpened = false;
  for (const trigger of triggers) {
    const btn = page.locator(`button:has-text("${trigger}"), a:has-text("${trigger}")`).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.scrollIntoViewIfNeeded().catch(() => {});
      await btn.click();
      await page.waitForTimeout(1000);
      await shot(page, `${sectionName}-form-open`);

      const dialog = page.locator('[role="dialog"]');
      const hasDialog = await dialog.isVisible().catch(() => false);
      const inlineForm = page.locator('form').first();
      const hasInline = await inlineForm.isVisible().catch(() => false);

      if (hasDialog || hasInline) {
        formOpened = true;
        const form = hasDialog ? dialog.locator('form').first() : inlineForm;
        if (await form.isVisible().catch(() => false)) {
          await deepFormAudit(page, sectionName, url, form);
        }
      }
      break;
    }
  }

  if (!formOpened) {
    // Check for inline forms on page
    const forms = await page.locator('form').count();
    if (forms > 0) {
      console.log(`  [INFO] Нашлось ${forms} инлайн форм`);
      const form = page.locator('form').first();
      await deepFormAudit(page, sectionName, url, form);
      formOpened = true;
    }
  }

  if (!formOpened) {
    finding('critical', url, sectionName, `Форма не найдена. Перебрали триггеры: ${triggers.join(', ')}`);
    // Dump all buttons for investigation
    const allBtns = await page.locator('button').all();
    const btnTexts = [];
    for (const b of allBtns.slice(0, 20)) {
      btnTexts.push(await b.innerText().catch(() => '?').then(t => t.trim()));
    }
    console.log(`  Кнопки на странице: ${JSON.stringify(btnTexts.filter(Boolean))}`);
  }

  // Check console errors
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  if (errors.length) {
    finding('major', url, sectionName, `Ошибки: ${errors.slice(0,3).join('; ')}`);
  }

  await ctx.close();
}

// ─── 5. Education forms ───────────────────────────────────────────────────────

async function auditEducationDeep(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  console.log('\n══ /education ══');
  await page.goto(`${BASE}/education`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'EDU-initial', { fullPage: false });

  // Look for tabs/sections
  const tabs = await page.locator('[role="tab"], [data-tab], button[aria-selected]').all();
  console.log(`  Табы: ${tabs.length}`);
  for (const tab of tabs) {
    const text = await tab.innerText().catch(() => '');
    console.log(`    Tab: "${text}"`);
  }

  // Look for form triggers
  const allBtns = await page.locator('button').all();
  const btnTexts = [];
  for (const b of allBtns.slice(0, 30)) {
    const t = await b.innerText().catch(() => '').then(t => t.trim());
    if (t) btnTexts.push(t);
  }
  console.log(`  Кнопки: ${JSON.stringify(btnTexts.slice(0, 20))}`);

  // Scroll down to find forms
  await page.keyboard.press('End');
  await page.waitForTimeout(500);
  await shot(page, 'EDU-scrolled-bottom', { fullPage: true });

  const formTriggers = [
    'Записаться', 'Подать заявку', 'Заявка на обучение', 'Получить сертификат',
    'Корпоративное обучение', 'Записаться на курс', 'Заказать обучение'
  ];
  let formsFound = 0;
  for (const trigger of formTriggers) {
    const btns = page.locator(`button:has-text("${trigger}"), a:has-text("${trigger}")`);
    const count = await btns.count();
    if (count > 0) {
      console.log(`  Триггер "${trigger}": ${count} кнопок`);
      await btns.first().scrollIntoViewIfNeeded().catch(() => {});
      await btns.first().click();
      await page.waitForTimeout(800);
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible().catch(() => false)) {
        formsFound++;
        await shot(page, `EDU-form-${formsFound}`);
        const form = dialog.locator('form').first();
        if (await form.isVisible().catch(() => false)) {
          await deepFormAudit(page, `EducationForm-${trigger}`, '/education', form);
        }
        // Close dialog
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
      }
    }
  }

  if (formsFound === 0) {
    finding('major', '/education', 'forms', 'Ни одна форма обучения не открылась после клика на триггеры');
  }
  console.log(`  Итого форм образования открыто: ${formsFound}`);

  await ctx.close();
}

// ─── 6. Contacts form detailed ────────────────────────────────────────────────

async function auditContactsDeep(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  console.log('\n══ /contacts ══');
  await page.goto(`${BASE}/contacts`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'CONTACTS-full', { fullPage: true });

  const form = page.locator('form').first();
  if (await form.isVisible().catch(() => false)) {
    // Topic selector
    const topicField = page.locator('[name="topic"], [id*="topic"]').first();
    if (await topicField.isVisible().catch(() => false)) {
      const tagName = await topicField.evaluate(el => el.tagName.toLowerCase());
      console.log(`  Поле topic — тип: ${tagName}`);
      if (tagName === 'select') {
        const options = await topicField.locator('option').count();
        console.log(`  topic options: ${options}`);
        if (options < 2) finding('major', '/contacts', 'topic', 'Выпадающий список темы обращения пуст');
      }
    } else {
      // Check for radix select / combobox
      const combobox = page.locator('[role="combobox"]').first();
      if (await combobox.isVisible().catch(() => false)) {
        console.log(`  Поле topic — radix combobox`);
      } else {
        finding('major', '/contacts', 'topic', 'Поле выбора темы обращения не найдено');
      }
    }

    await deepFormAudit(page, 'ContactForm', '/contacts', form);
  }

  await ctx.close();
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n=== BARSYNERGY Deep UX/UI Audit ===\n');
  const browser = await chromium.launch({ headless: true });

  await auditRegisterDeep(browser);
  await auditProfileDeep(browser);
  await auditVacanciesDeep(browser);

  await auditSectionWithModal(browser, '/suppliers', 'SupplierForm', [
    'Стать поставщиком', 'Подать заявку', 'Зарегистрироваться как поставщик', 'Стать партнёром'
  ]);
  await auditSectionWithModal(browser, '/partners', 'PartnerForm', [
    'Стать партнёром', 'Подать заявку', 'Партнёрство', 'Сотрудничество'
  ]);
  await auditSectionWithModal(browser, '/events', 'EventForm', [
    'Записаться', 'Подать заявку', 'Участвовать', 'Зарегистрироваться на событие', 'Заявка на событие'
  ]);

  await auditEducationDeep(browser);
  await auditContactsDeep(browser);

  await auditSectionWithModal(browser, '/consulting', 'ConsultingForm', [
    'Получить консультацию', 'Записаться на консультацию', 'Подать заявку', 'Заказать консультацию'
  ]);
  await auditSectionWithModal(browser, '/business', 'BusinessForm', [
    'Добавить заведение', 'Разместить бизнес', 'Подать заявку', 'Зарегистрировать бизнес'
  ]);

  await browser.close();

  // Summary
  console.log('\n\n══════════════════════════════════════════');
  console.log('ИТОГИ ГЛУБОКОГО АУДИТА');
  console.log('══════════════════════════════════════════\n');

  const bySeverity = { critical: [], major: [], minor: [], cosmetic: [] };
  for (const f of FINDINGS) bySeverity[f.severity]?.push(f);

  for (const [sev, items] of Object.entries(bySeverity)) {
    if (items.length === 0) continue;
    console.log(`[${sev.toUpperCase()}] — ${items.length} проблем`);
    items.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.page} / ${f.component}: ${f.description}`);
    });
    console.log('');
  }

  const report = { date: new Date().toISOString(), findings: FINDINGS };
  fs.writeFileSync(path.join(import.meta.dirname, 'deep-audit-report.json'), JSON.stringify(report, null, 2));
  console.log(`Отчёт: audit/deep-audit-report.json | Скриншоты: ${idx} шт.`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
