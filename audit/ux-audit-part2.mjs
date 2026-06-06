/**
 * BARSYNERGY UX Audit Part 2 — profile responses, settings, public forms
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:3000';
const OUT = path.join(import.meta.dirname, 'screenshots');
const FINDINGS = [];

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

let idx = 100;
async function shot(page, name, opts = {}) {
  const file = path.join(OUT, `${String(++idx).padStart(3, '0')}_${name}.png`);
  await page.screenshot({ path: file, fullPage: opts.fullPage ?? true });
  console.log(`  📸 ${name}`);
  return file;
}

function finding(severity, pageUrl, component, description) {
  FINDINGS.push({ severity, page: pageUrl, component, description });
  console.log(`  [${severity.toUpperCase()}] ${component}: ${description}`);
}

// ─── Register fresh user ──────────────────────────────────────────────────────
async function registerUser(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  const ts = Date.now();
  const email = `audit2_${ts}@test.com`;
  const pw = 'AuditPass99!';

  await page.goto(`${BASE}/auth/register/user`);
  await page.waitForLoadState('networkidle').catch(() => {});

  await page.locator('input[name="fullName"]').fill('Audit User 2').catch(() => {});
  await page.locator('input[name="email"]').fill(email).catch(() => {});
  await page.locator('input[name="password"]').fill(pw).catch(() => {});
  await page.locator('input[type="checkbox"]').check().catch(() => {});
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);

  return { page, ctx };
}

// ─── Profile Responses deep audit ────────────────────────────────────────────
async function auditResponses(page) {
  console.log('\n══ /profile/responses ══');
  await page.goto(`${BASE}/profile/responses`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'RESP-full', { fullPage: true });

  // Check search field explicitly
  const searchField = await page.locator('input[type="search"]').count() +
                      await page.locator('input[placeholder*="поиск" i]').count() +
                      await page.locator('input[placeholder*="search" i]').count() +
                      await page.locator('input[name="search"]').count() +
                      await page.locator('input[name="q"]').count();
  console.log(`  Строк поиска: ${searchField}`);
  if (searchField === 0) finding('minor', '/profile/responses', 'search', 'Строка поиска отсутствует');

  // Check all filter controls
  const comboboxes = await page.locator('[role="combobox"]').all();
  const selects = await page.locator('select').all();
  console.log(`  Combobox фильтров: ${comboboxes.length}, Select: ${selects.length}`);
  for (const cb of comboboxes) {
    const text = await cb.innerText().catch(() => '');
    const placeholder = await cb.getAttribute('placeholder').catch(() => null);
    console.log(`    combobox: "${text.trim()}" placeholder="${placeholder}"`);
  }

  // Check sort controls
  const sortBtns = await page.locator('button:has-text("Сорт"), button:has-text("Дата"), [data-sort]').count();
  console.log(`  Кнопки сортировки: ${sortBtns}`);

  // Empty state check
  const bodyText = await page.locator('body').innerText();
  const hasEmptyMsg = bodyText.includes('откли') || bodyText.includes('пусто') || bodyText.includes('нет') || bodyText.includes('empty');
  console.log(`  Empty state текст присутствует: ${hasEmptyMsg}`);
  if (!hasEmptyMsg) finding('minor', '/profile/responses', 'empty-state', 'Нет понятного сообщения о пустом списке откликов');

  // Pagination
  const paginationButtons = await page.locator('button[aria-label*="страни" i], button[aria-label*="page" i], nav[aria-label*="pagination" i]').count();
  console.log(`  Пагинация: ${paginationButtons}`);

  await shot(page, 'RESP-full-scroll', { fullPage: true });
}

// ─── Profile Settings deep audit ──────────────────────────────────────────────
async function auditSettings(page) {
  console.log('\n══ /profile/settings ══');
  await page.goto(`${BASE}/profile/settings`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'SETTINGS-full', { fullPage: true });

  const pageText = await page.locator('body').innerText();

  // Check for profile edit form
  const profileForm = page.locator('form').first();
  if (!await profileForm.isVisible().catch(() => false)) {
    finding('critical', '/profile/settings', 'profile-form', 'Форма редактирования профиля не найдена');
    return;
  }

  // Check all inputs
  const inputs = await page.locator('input:not([type="hidden"]):not([type="submit"]), textarea, select, [role="combobox"]').all();
  console.log(`  Полей ввода: ${inputs.length}`);
  const fieldNames = [];
  for (const inp of inputs) {
    const name = await inp.getAttribute('name').catch(() => null);
    const ph = await inp.getAttribute('placeholder').catch(() => null);
    const val = await inp.inputValue().catch(() => null);
    const type = await inp.getAttribute('type').catch(() => 'text');
    const tagName = await inp.evaluate(el => el.tagName).catch(() => '');
    fieldNames.push(name || tagName);
    console.log(`    [${name || tagName}] type=${type} ph="${ph}" val="${(val||'').slice(0,30)}"`);
  }

  // Check expected fields
  const expectedFields = ['fullName', 'phone', 'telegram', 'bio'];
  for (const f of expectedFields) {
    if (!fieldNames.includes(f)) {
      finding('major', '/profile/settings', `field[${f}]`, `Поле "${f}" не найдено в форме профиля`);
    }
  }

  // Check city selector
  const cityCombo = await page.locator('[name="cityId"], [id*="city"], [aria-label*="город" i]').count();
  console.log(`  City selector: ${cityCombo}`);
  if (cityCombo === 0) finding('major', '/profile/settings', 'cityId', 'Поле выбора города не найдено');

  // Check save/submit button states
  const forms = await page.locator('form').all();
  console.log(`  Форм на странице: ${forms.length}`);

  // Check password change form
  const pwFields = await page.locator('input[type="password"], input[name*="password" i], input[name*="Password"]').all();
  console.log(`  Полей пароля: ${pwFields.length}`);
  if (pwFields.length < 2) {
    finding('major', '/profile/settings', 'password-form', `Форма смены пароля: ожидалось минимум 2 поля, найдено ${pwFields.length}`);
  }

  // Check validation - empty profile submit
  const saveBtn = page.locator('button[type="submit"]').first();
  if (await saveBtn.isVisible().catch(() => false)) {
    // Clear required field and try submit
    const nameField = page.locator('input[name="fullName"]').first();
    if (await nameField.isVisible().catch(() => false)) {
      await nameField.fill('');
      await saveBtn.click();
      await page.waitForTimeout(600);
      const errMsgs = await page.locator('[role="alert"], .text-destructive, p.text-sm.text-red-500').count();
      console.log(`  Ошибок валидации после очистки fullName: ${errMsgs}`);
      if (errMsgs === 0) finding('major', '/profile/settings', 'validation', 'Пустой fullName не показывает ошибки валидации');
      await shot(page, 'SETTINGS-validation');
    }
  }

  // Mobile
  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();
  await page.waitForLoadState('networkidle').catch(() => {});
  const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log(`  [375px] horizontal overflow: ${overflowX}`);
  if (overflowX) finding('major', '/profile/settings', 'mobile', 'Горизонтальный overflow на 375px');
  await shot(page, 'SETTINGS-mobile', { fullPage: false });
  await page.setViewportSize({ width: 1280, height: 900 });
}

// ─── Form deep audit helper ───────────────────────────────────────────────────
async function deepAuditForm(page, url, formName) {
  const form = page.locator('form').first();
  const dialog = page.locator('[role="dialog"]');
  const hasDialog = await dialog.isVisible().catch(() => false);
  const activeForm = hasDialog ? dialog.locator('form').first() : form;
  const hasForm = await activeForm.isVisible().catch(() => false);

  if (!hasForm) {
    finding('critical', url, formName, 'Форма не найдена (ни inline, ни в диалоге)');
    return false;
  }

  // Fields
  const inputs = await activeForm.locator('input:not([type="hidden"]):not([type="submit"]), textarea, select').all();
  console.log(`    Полей: ${inputs.length}`);

  // Consent
  const consent = await activeForm.locator('input[type="checkbox"]').count();
  console.log(`    Чекбоксов: ${consent}`);
  if (consent === 0) {
    finding('major', url, 'consent', 'Чекбокс согласия с обработкой данных отсутствует');
  } else {
    const consentText = await activeForm.evaluate(f => {
      const checkboxes = f.querySelectorAll('input[type="checkbox"]');
      return Array.from(checkboxes).map(cb => cb.closest('label, div')?.innerText?.trim() || '');
    });
    const hasPrivacyText = consentText.some(t => t.match(/политик|персональн|обработ/i));
    if (!hasPrivacyText) finding('minor', url, 'consent-text', 'Чекбокс не упоминает политику обработки данных');

    // Check privacy link nearby
    const privLink = await activeForm.locator('a[href*="privacy"], a[href*="legal"], a:has-text("политик")').count();
    console.log(`    Ссылок на политику: ${privLink}`);
    if (privLink === 0) finding('minor', url, 'privacy-link', 'Нет ссылки на политику конфиденциальности рядом с формой');
  }

  // Honeypot
  const honeypot = await activeForm.locator('input[name="website"]').count();
  if (honeypot > 0) {
    const honeypotEl = activeForm.locator('input[name="website"]').first();
    const tabIdx = await honeypotEl.getAttribute('tabindex').catch(() => null);
    const isHidden = await honeypotEl.isHidden().catch(() => false);
    const style = await honeypotEl.getAttribute('style').catch(() => null);
    console.log(`    Honeypot: tabindex=${tabIdx} hidden=${isHidden} style="${style}"`);
    if (tabIdx !== '-1' && !isHidden) {
      finding('major', url, 'honeypot', `Honeypot поле видимо: tabindex=${tabIdx}, hidden=${isHidden}`);
    } else {
      console.log(`    [OK] Honeypot скрыт`);
    }
  }

  // File upload
  const fileInput = await activeForm.locator('input[type="file"]').count();
  if (fileInput > 0) {
    const accept = await activeForm.locator('input[type="file"]').first().getAttribute('accept').catch(() => null);
    console.log(`    File upload accept="${accept}"`);
    if (!accept) finding('minor', url, 'file-upload', 'Атрибут accept на file input не задан');
  }

  // Empty submit
  const submitBtn = activeForm.locator('button[type="submit"], button:not([type])').last();
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
    await page.waitForTimeout(700);
    const errCount = await page.locator('[role="alert"], .text-destructive, p.text-sm:text("обязательн"), p.text-sm:text("required")').count();
    const errCountAlt = await page.evaluate(() => document.querySelectorAll('[class*="error"], [class*="invalid"]').length);
    console.log(`    Ошибок валидации (пустая отправка): alert=${errCount}, error-class=${errCountAlt}`);
    if (errCount === 0 && errCountAlt === 0) {
      finding('major', url, formName, 'Пустая отправка не показывает ошибок валидации');
    }
    await shot(page, `${formName.replace(/\W/g,'-')}-empty-validate`);
  }

  return true;
}

// ─── Audit each public page ───────────────────────────────────────────────────
async function auditPage(browser, url, formName, triggers) {
  console.log(`\n══ ${url} (${formName}) ══`);
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', e => consoleErrors.push(e.message));

  await page.goto(`${BASE}${url}`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, `${formName}-page`, { fullPage: false });

  // Scroll to find any forms or trigger buttons
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(300);

  // Check inline forms first
  const inlineForms = await page.locator('form').count();
  let formFound = false;

  if (inlineForms > 0) {
    console.log(`  Инлайн форм: ${inlineForms}`);
    await page.evaluate(() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' }));
    await page.waitForTimeout(400);
    await shot(page, `${formName}-inline-form`);
    formFound = await deepAuditForm(page, url, formName);
  }

  // Try trigger buttons for modal forms
  if (!formFound) {
    for (const trigger of triggers) {
      const btn = page.locator(`button:has-text("${trigger}"), a:has-text("${trigger}")`).first();
      if (await btn.isVisible().catch(() => false)) {
        console.log(`  Клик по триггеру: "${trigger}"`);
        await btn.scrollIntoViewIfNeeded().catch(() => {});
        await btn.click();
        await page.waitForTimeout(1000);
        await shot(page, `${formName}-modal-open`);
        formFound = await deepAuditForm(page, url, formName);
        break;
      }
    }
  }

  if (!formFound) {
    // Dump all buttons text for investigation
    const buttons = await page.locator('button').all();
    const btTexts = [];
    for (const b of buttons.slice(0, 20)) {
      btTexts.push((await b.innerText().catch(() => '')).trim());
    }
    console.log(`  Кнопки на странице: ${JSON.stringify(btTexts.filter(Boolean))}`);
    finding('critical', url, formName, `Форма не найдена. Кнопки: ${btTexts.filter(Boolean).slice(0,5).join(', ')}`);
  }

  // Mobile
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE}${url}`);
  await page.waitForLoadState('networkidle').catch(() => {});
  const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (overflowX) finding('major', url, 'mobile-layout', 'Горизонтальный overflow на 375px');
  await shot(page, `${formName}-mobile`, { fullPage: false });

  // Console errors
  if (consoleErrors.length > 0) {
    console.log(`  Console errors: ${consoleErrors.length}`);
    consoleErrors.slice(0, 5).forEach(e => console.log(`    ${e.slice(0, 120)}`));
    const critical = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('hydrat'));
    if (critical.length > 0) finding('major', url, 'console', `JS ошибки: ${critical[0].slice(0, 100)}`);
  }

  await ctx.close();
}

// ─── Vacancy page + response form ────────────────────────────────────────────
async function auditVacancyPage(browser) {
  console.log('\n══ /vacancies/[slug] — форма отклика ══');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  await page.goto(`${BASE}/vacancies`);
  await page.waitForLoadState('networkidle').catch(() => {});

  const firstVacancy = page.locator('a[href^="/vacancies/"]').first();
  if (!await firstVacancy.isVisible().catch(() => false)) {
    finding('critical', '/vacancies/[slug]', 'list', 'Нет вакансий для тестирования');
    await ctx.close();
    return;
  }

  const href = await firstVacancy.getAttribute('href');
  console.log(`  Открываем: ${href}`);
  await page.goto(`${BASE}${href}`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'VAC-DETAIL-full', { fullPage: true });

  // Check actions panel
  const actionsPanel = await page.locator('text=ДЕЙСТВИЯ, text=Actions').count();
  console.log(`  Панель действий: ${actionsPanel}`);

  // Find application form section
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await shot(page, 'VAC-DETAIL-bottom');

  // Check for inline form at bottom
  const inlineForm = page.locator('form').first();
  const hasInline = await inlineForm.isVisible().catch(() => false);
  console.log(`  Inline форма: ${hasInline}`);

  // Check for response button in sidebar
  const applyBtns = await page.locator('button').all();
  const applyBtnTexts = [];
  for (const b of applyBtns) {
    const t = await b.innerText().catch(() => '').then(t => t.trim());
    if (t) applyBtnTexts.push(t);
  }
  console.log(`  Все кнопки: ${JSON.stringify(applyBtnTexts)}`);

  // Check sidebar action buttons
  const sidebarArea = page.locator('aside, [class*="sidebar"], [class*="actions"]');
  const sidebarBtns = await sidebarArea.locator('button').all();
  for (const btn of sidebarBtns) {
    const text = await btn.innerText().catch(() => '').then(t => t.trim());
    console.log(`  Сайдбар кнопка: "${text}"`);
  }

  // Click respond button
  const respondTriggers = ['Откликнуться', 'Отправить отклик', 'Подать заявку', 'Apply', 'Respond'];
  let responseFormOpened = false;
  for (const trigger of respondTriggers) {
    const btn = page.locator(`button:has-text("${trigger}")`).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1000);
      await shot(page, 'VAC-RESPONSE-form-open');

      const dialog = page.locator('[role="dialog"]');
      const hasDialog = await dialog.isVisible().catch(() => false);
      if (hasDialog) {
        responseFormOpened = true;
        console.log(`  [OK] Диалог открылся после "${trigger}"`);

        // Audit the form
        const form = dialog.locator('form').first();
        if (await form.isVisible().catch(() => false)) {
          const inputs = await form.locator('input:not([type="hidden"]), textarea').all();
          console.log(`  Полей в форме отклика: ${inputs.length}`);

          // File upload
          const fileInput = form.locator('input[type="file"]').first();
          if (await fileInput.isVisible().catch(() => false)) {
            const accept = await fileInput.getAttribute('accept');
            const maxSizeText = await dialog.locator('text=/8\s*[Мм][Бб]|8MB|8\s*mb/i').count();
            console.log(`  [OK] File upload: accept="${accept}", 8MB hint: ${maxSizeText > 0}`);
            if (!accept || (!accept.includes('pdf') && !accept.includes('doc'))) {
              finding('minor', href, 'file-upload', `Неподходящий accept: "${accept}"`);
            }
            if (maxSizeText === 0) finding('minor', href, 'file-upload', 'Подсказка об ограничении 8MB не найдена');
          } else {
            finding('major', href, 'resume', 'Поле загрузки резюме не найдено в форме отклика');
          }

          // Consent
          const consent = await form.locator('input[type="checkbox"]').count();
          if (consent === 0) finding('major', href, 'consent', 'Чекбокс согласия в форме отклика отсутствует');

          // Honeypot
          const honeypot = await form.locator('input[name="website"]').count();
          if (honeypot > 0) {
            const tabIdx = await form.locator('input[name="website"]').getAttribute('tabindex');
            const isHidden = await form.locator('input[name="website"]').isHidden();
            console.log(`  Honeypot: tabindex=${tabIdx} hidden=${isHidden}`);
          } else {
            finding('minor', href, 'honeypot', 'Honeypot поле (website) не найдено в форме отклика');
          }

          // Empty submit
          const submitBtn = form.locator('button[type="submit"]').first();
          if (await submitBtn.isVisible().catch(() => false)) {
            await submitBtn.click();
            await page.waitForTimeout(800);
            const errMsgs = await page.locator('[role="alert"], .text-destructive').count();
            console.log(`  Ошибок при пустой отправке: ${errMsgs}`);
            if (errMsgs === 0) finding('major', href, 'validation', 'Пустая отправка формы отклика без ошибок валидации');
            await shot(page, 'VAC-RESPONSE-empty-validate');
          }

          // Mobile
          await page.setViewportSize({ width: 375, height: 812 });
          await shot(page, 'VAC-RESPONSE-mobile', { fullPage: false });
          await page.setViewportSize({ width: 1280, height: 900 });
        }
      }
      break;
    }
  }

  if (!responseFormOpened && !hasInline) {
    finding('critical', href, 'response-form', 'Форма отклика недоступна (ни диалог, ни inline)');
  }

  if (consoleErrors.length > 0) {
    const sig = consoleErrors.filter(e => !e.includes('favicon'));
    if (sig.length > 0) finding('major', href, 'console', `JS: ${sig[0].slice(0,100)}`);
  }

  await ctx.close();
}

// ─── Education forms ──────────────────────────────────────────────────────────
async function auditEducation(browser) {
  console.log('\n══ /education ══');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/education`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, 'EDU-full', { fullPage: true });

  // Find all CTA buttons
  const allBtns = await page.locator('button, a[href]').all();
  const relevantBtns = [];
  for (const b of allBtns) {
    const t = await b.innerText().catch(() => '').then(t => t.trim());
    if (t.match(/запис|заявк|участ|обучени|сертифик|курс|корпорат/i)) {
      relevantBtns.push(t);
    }
  }
  console.log(`  Релевантные кнопки: ${JSON.stringify(relevantBtns.slice(0,15))}`);

  // Try each type of education form trigger
  const formTriggers = [
    'Записаться на курс', 'Записаться', 'Заявка на обучение',
    'Корпоративное обучение', 'Получить сертификат', 'Подать заявку',
    'Заказать обучение', 'Хочу учиться'
  ];

  let formsFound = 0;
  const foundTriggers = new Set();

  for (const trigger of formTriggers) {
    const btns = page.locator(`button:has-text("${trigger}")`);
    const cnt = await btns.count().catch(() => 0);
    if (cnt > 0 && !foundTriggers.has(trigger)) {
      foundTriggers.add(trigger);
      await btns.first().scrollIntoViewIfNeeded().catch(() => {});
      await btns.first().click();
      await page.waitForTimeout(1000);

      const dialog = page.locator('[role="dialog"]');
      const hasDialog = await dialog.isVisible().catch(() => false);
      if (hasDialog) {
        formsFound++;
        console.log(`  [OK] Форма ${formsFound}: триггер "${trigger}"`);
        await shot(page, `EDU-form-${formsFound}`);

        const form = dialog.locator('form').first();
        if (await form.isVisible().catch(() => false)) {
          await deepAuditForm(page, `/education#${trigger}`, `EducationForm-${formsFound}`);
        }
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }
  }

  if (formsFound === 0) {
    // Scroll and dump all buttons
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const allBtnsAfterScroll = await page.locator('button').all();
    const allBtnTexts = [];
    for (const b of allBtnsAfterScroll.slice(0, 30)) {
      allBtnTexts.push((await b.innerText().catch(() => '')).trim());
    }
    console.log(`  Все кнопки после скролла: ${JSON.stringify(allBtnTexts.filter(Boolean))}`);
    finding('major', '/education', 'forms', `Ни одна форма образования не открылась. Кнопки: ${allBtnTexts.filter(Boolean).slice(0,8).join(', ')}`);
  } else {
    console.log(`  Итого форм открыто: ${formsFound}`);
    if (formsFound < 3) finding('minor', '/education', 'forms', `Открылось ${formsFound} из 3 ожидаемых форм`);
  }

  await ctx.close();
}

// ─── Consulting + Business inline forms ──────────────────────────────────────

async function auditSelectFields(browser, url, formName) {
  console.log(`\n══ ${url} — select/combobox поля ══`);
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(`${BASE}${url}`);
  await page.waitForLoadState('networkidle').catch(() => {});

  // Find all combobox/select elements
  const comboboxes = await page.locator('[role="combobox"], select').all();
  for (const cb of comboboxes) {
    const name = await cb.getAttribute('name').catch(() => null);
    const tagName = await cb.evaluate(el => el.tagName).catch(() => '');
    const text = await cb.innerText().catch(() => '');
    const ariaLabel = await cb.getAttribute('aria-label').catch(() => null);

    // Find associated label
    const id = await cb.getAttribute('id').catch(() => null);
    const labelEl = id ? page.locator(`label[for="${id}"]`) : null;
    const labelText = labelEl ? await labelEl.textContent().catch(() => null) : null;

    console.log(`  [${tagName}] name="${name}" ariaLabel="${ariaLabel}" label="${labelText}" text="${text.slice(0,30)}"`);
    if (!ariaLabel && !labelText && !name) {
      finding('minor', url, `combobox[${name}]`, 'Combobox без label, aria-label или name');
    }

    // Try to open and check options
    if (tagName === 'BUTTON' || await cb.getAttribute('role') === 'combobox') {
      await cb.click().catch(() => {});
      await page.waitForTimeout(400);
      const options = await page.locator('[role="option"], [data-radix-select-item]').count();
      console.log(`    Опций в выпадающем: ${options}`);
      if (options === 0) finding('major', url, `combobox[${name}]`, 'Combobox открылся пустым — нет опций');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  }

  await ctx.close();
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== BARSYNERGY UX Audit Part 2 ===\n');
  const browser = await chromium.launch({ headless: true });

  // Profile pages (authenticated)
  const { page, ctx } = await registerUser(browser);
  await auditResponses(page);
  await auditSettings(page);
  await ctx.close();

  // Vacancy detail + response form
  await auditVacancyPage(browser);

  // Education forms
  await auditEducation(browser);

  // Public pages
  await auditPage(browser, '/vacancies', 'VacancySubmissionForm', [
    'Подать вакансию', 'Разместить вакансию', 'Опубликовать вакансию', 'Добавить вакансию'
  ]);
  await auditPage(browser, '/suppliers', 'SupplierForm', [
    'Стать поставщиком', 'Подать заявку поставщика', 'Зарегистрироваться', 'Оставить заявку'
  ]);
  await auditPage(browser, '/partners', 'PartnerForm', [
    'Стать партнёром', 'Партнёрство', 'Подать заявку', 'Сотрудничество'
  ]);
  await auditPage(browser, '/events', 'EventForm', [
    'Записаться', 'Участвовать', 'Заявка на событие', 'Подать заявку', 'Хочу участвовать'
  ]);
  await auditPage(browser, '/contacts', 'ContactForm', [
    'Отправить', 'Написать'
  ]);
  await auditPage(browser, '/consulting', 'ConsultingForm', [
    'Получить консультацию', 'Записаться на консультацию', 'Заказать консультацию', 'Подать заявку'
  ]);
  await auditPage(browser, '/business', 'BusinessForm', [
    'Добавить заведение', 'Разместить бизнес', 'Зарегистрировать бизнес', 'Подать заявку'
  ]);

  // Check select fields in consulting/business
  await auditSelectFields(browser, '/consulting', 'ConsultingForm');
  await auditSelectFields(browser, '/business', 'BusinessForm');
  await auditSelectFields(browser, '/contacts', 'ContactForm');

  await browser.close();

  // Summary
  console.log('\n\n══════════════════════════════════════');
  console.log('ИТОГИ PART 2');
  console.log('══════════════════════════════════════\n');

  const bySev = { critical: [], major: [], minor: [], cosmetic: [] };
  for (const f of FINDINGS) bySev[f.severity]?.push(f);
  for (const [sev, items] of Object.entries(bySev)) {
    if (!items.length) continue;
    console.log(`[${sev.toUpperCase()}] — ${items.length}`);
    items.forEach((f, i) => console.log(`  ${i+1}. ${f.page} / ${f.component}: ${f.description}`));
    console.log('');
  }

  fs.writeFileSync(
    path.join(import.meta.dirname, 'part2-report.json'),
    JSON.stringify({ date: new Date().toISOString(), findings: FINDINGS }, null, 2)
  );
}

// Standalone deepAuditForm2 for part2 (avoids redeclaration)
async function deepAuditForm2(page, url, formName) {
  const dialog = page.locator('[role="dialog"]');
  const hasDialog = await dialog.isVisible().catch(() => false);
  const form = hasDialog ? dialog.locator('form').first() : page.locator('form').first();
  const hasForm = await form.isVisible().catch(() => false);

  if (!hasForm) {
    finding('critical', url, formName, 'Форма не найдена');
    return false;
  }

  const inputs = await form.locator('input:not([type="hidden"]):not([type="submit"]), textarea, select').all();
  console.log(`    Полей: ${inputs.length}`);

  const consent = await form.locator('input[type="checkbox"]').count();
  if (consent === 0) finding('major', url, 'consent', 'Чекбокс согласия отсутствует');

  const honeypot = await form.locator('input[name="website"]').count();
  if (honeypot > 0) {
    const tabIdx = await form.locator('input[name="website"]').first().getAttribute('tabindex').catch(() => null);
    const isHidden = await form.locator('input[name="website"]').first().isHidden().catch(() => false);
    if (tabIdx !== '-1' && !isHidden) finding('major', url, 'honeypot', `Honeypot видим: tabindex=${tabIdx}`);
    else console.log(`    [OK] Honeypot скрыт (tabindex=${tabIdx}, hidden=${isHidden})`);
  }

  const fileInput = await form.locator('input[type="file"]').count();
  if (fileInput > 0) {
    const accept = await form.locator('input[type="file"]').first().getAttribute('accept');
    console.log(`    File: accept="${accept}"`);
  }

  const submitBtn = form.locator('button[type="submit"]').last();
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
    await page.waitForTimeout(700);
    const errCount = await page.evaluate(() =>
      document.querySelectorAll('[role="alert"], [class*="error"], [class*="destructive"]').length
    );
    console.log(`    Ошибок валидации: ${errCount}`);
    if (errCount === 0) finding('major', url, formName, 'Пустая отправка без ошибок валидации');
    await shot(page, `${formName.replace(/\W/g,'-')}-validate`);
  }

  return true;
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
