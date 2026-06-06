/**
 * Targeted test for vacancy response form + education + suppliers + events
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:3000';
const OUT = path.join(import.meta.dirname, 'screenshots');
const FINDINGS = [];

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

let idx = 200;
async function shot(page, name, opts = {}) {
  const file = path.join(OUT, `${String(++idx).padStart(3, '0')}_${name}.png`);
  await page.screenshot({ path: file, fullPage: opts.fullPage ?? false });
  console.log(`  📸 ${name}`);
  return file;
}

function finding(severity, pageUrl, component, description) {
  FINDINGS.push({ severity, page: pageUrl, component, description });
  console.log(`  [${severity.toUpperCase()}] ${component}: ${description}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // ─── 1. Vacancy response form (disclosure pattern) ──────────────────────
  {
    console.log('\n══ VACANCY RESPONSE FORM ══');
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto(`${BASE}/vacancies`);
    await page.waitForLoadState('networkidle').catch(() => {});
    const firstVacancy = page.locator('a[href^="/vacancies/"]').first();
    const href = await firstVacancy.getAttribute('href').catch(() => null);

    if (!href) {
      finding('critical', '/vacancies', 'vacancy-list', 'Нет вакансий в списке');
      await ctx.close();
      goto_next: ;
    } else {
      await page.goto(`${BASE}${href}`);
      await page.waitForLoadState('networkidle').catch(() => {});
      await shot(page, 'VAC-loaded');

      // Check if form is immediately visible (disclosure defaultOpen)
      const formImmediate = await page.locator('form#vacancy-response-form').isVisible().catch(() => false);
      console.log(`  Form immediately visible: ${formImmediate}`);

      // Find disclosure trigger - could be a button OR an <a> tag
      const disclosureTrigger = page.locator('[aria-expanded]').filter({ hasText: 'Откликнуться' }).first();
      const hasTrigger = await disclosureTrigger.isVisible().catch(() => false);
      console.log(`  Disclosure trigger found: ${hasTrigger}`);

      if (hasTrigger) {
        const tagName = await disclosureTrigger.evaluate(el => el.tagName).catch(() => '?');
        const ariaExpanded = await disclosureTrigger.getAttribute('aria-expanded').catch(() => null);
        console.log(`  Trigger: <${tagName}> aria-expanded="${ariaExpanded}"`);

        await disclosureTrigger.click();
        await page.waitForTimeout(1000);
        await shot(page, 'VAC-after-trigger');

        const formVisible = await page.locator('form#vacancy-response-form').isVisible().catch(() => false);
        console.log(`  Form visible after trigger: ${formVisible}`);

        if (!formVisible) {
          // Try scrolling to #vacancy-response
          await page.evaluate(() => {
            document.getElementById('vacancy-response')?.scrollIntoView();
          });
          await page.waitForTimeout(500);
          const formAfterScroll = await page.locator('form#vacancy-response-form').isVisible().catch(() => false);
          console.log(`  Form visible after scroll: ${formAfterScroll}`);
          await shot(page, 'VAC-after-scroll');

          if (!formAfterScroll) {
            finding('critical', href, 'vacancy-response-form', 'Форма отклика не появляется после нажатия триггера');
          }
        } else {
          console.log(`  [OK] Форма отклика открылась`);

          // Audit the form
          const form = page.locator('form#vacancy-response-form');

          // Fields check
          const fields = await form.locator('input:not([type="hidden"]), textarea, select, [role="combobox"]').all();
          console.log(`  Полей: ${fields.length}`);
          for (const f of fields) {
            const name = await f.getAttribute('name').catch(() => null);
            const type = await f.getAttribute('type').catch(() => null);
            const ph = await f.getAttribute('placeholder').catch(() => null);
            const role = await f.getAttribute('role').catch(() => null);
            if (type !== 'checkbox') {
              console.log(`    [${name}] type=${type} role=${role} ph="${ph}"`);
            }
          }

          // File upload
          const fileInput = form.locator('input[type="file"]').first();
          if (await fileInput.isVisible().catch(() => false)) {
            const accept = await fileInput.getAttribute('accept');
            console.log(`  [OK] File upload: accept="${accept}"`);
          } else {
            finding('major', href, 'resume', 'Поле загрузки резюме не найдено');
          }

          // Honeypot
          const honeypot = form.locator('input[name="website"]').first();
          if (await honeypot.count() > 0) {
            const tabIdx = await honeypot.getAttribute('tabindex');
            const hidden = await honeypot.isHidden();
            console.log(`  Honeypot: tabindex=${tabIdx} hidden=${hidden}`);
            if (tabIdx !== '-1' && !hidden) finding('major', href, 'honeypot', 'Honeypot видим');
          }

          // Consent
          const consent = await form.locator('input[type="checkbox"]').count();
          console.log(`  Consent checkboxes: ${consent}`);
          if (consent === 0) finding('major', href, 'consent', 'Чекбокс согласия отсутствует');

          // Privacy link
          const privLink = await form.locator('a[href*="privacy"], a[href*="legal"]').count();
          console.log(`  Privacy links: ${privLink}`);

          // Empty submit
          const submitBtn = form.locator('button[type="submit"]').first();
          if (await submitBtn.isVisible().catch(() => false)) {
            await submitBtn.click();
            await page.waitForTimeout(800);
            const errCount = await page.locator('[role="alert"]').count();
            console.log(`  Ошибок при пустой отправке: ${errCount}`);
            if (errCount === 0) finding('major', href, 'validation', 'Пустая отправка без ошибок');
            await shot(page, 'VAC-RESPONSE-validate');
          }

          // Mobile
          await page.setViewportSize({ width: 375, height: 812 });
          // Reload and re-trigger on mobile
          await page.goto(`${BASE}${href}`);
          await page.waitForLoadState('networkidle').catch(() => {});
          const mobileTrigger = page.locator('[aria-expanded]').filter({ hasText: 'Откликнуться' }).first();
          if (await mobileTrigger.isVisible().catch(() => false)) {
            await mobileTrigger.click();
            await page.waitForTimeout(600);
          }
          await shot(page, 'VAC-RESPONSE-mobile');
          const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
          if (mobileOverflow) finding('major', href, 'mobile', 'Горизонтальный overflow на 375px');
          await page.setViewportSize({ width: 1280, height: 900 });
        }
      } else {
        // Check if form is inline without disclosure
        const allLinks = await page.locator('a, button').all();
        const respondLinks = [];
        for (const l of allLinks) {
          const t = await l.innerText().catch(() => '').then(t => t.trim());
          if (t.match(/отклик|заявк/i)) respondLinks.push(t);
        }
        console.log(`  Кнопки/ссылки с "отклик": ${JSON.stringify(respondLinks)}`);
        finding('critical', href, 'apply-trigger', 'Триггер раскрытия формы не найден');
      }

      // Console errors
      const critErrors = errors.filter(e => !e.includes('favicon') && !e.includes('net::'));
      if (critErrors.length > 0) {
        finding('major', href, 'console', critErrors[0].slice(0, 120));
      }

      await ctx.close();
    }
  }

  // ─── 2. Education — check if CTAs link to contacts form ──────────────────
  {
    console.log('\n══ EDUCATION — CTA links ══');
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();

    await page.goto(`${BASE}/education`);
    await page.waitForLoadState('networkidle').catch(() => {});
    await shot(page, 'EDU-audit', { fullPage: true });

    // Check all links with "education" CTAs
    const links = await page.locator('a[href*="contacts"], a[href*="education"]').all();
    console.log(`  Ссылок на /contacts: ${links.length}`);
    for (const link of links.slice(0, 10)) {
      const href = await link.getAttribute('href').catch(() => null);
      const text = (await link.innerText().catch(() => '')).trim();
      console.log(`    "${text.slice(0, 50)}" → ${href}`);
    }

    // Check if "Записаться на интенсив" links to contacts form
    const enrollBtn = page.locator('a:has-text("Записаться на интенсив"), button:has-text("Записаться на интенсив")').first();
    if (await enrollBtn.isVisible().catch(() => false)) {
      const tag = await enrollBtn.evaluate(el => el.tagName);
      const href = await enrollBtn.getAttribute('href').catch(() => null);
      console.log(`  "Записаться на интенсив" тег: <${tag}> href="${href}"`);
      if (href && href.includes('contacts')) {
        console.log(`  [OK] Редиректит на форму контактов (ожидаемое поведение)`);
      }
    }

    await ctx.close();
  }

  // ─── 3. Suppliers — confirm redirect to contacts ──────────────────────────
  {
    console.log('\n══ SUPPLIERS — CTA check ══');
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();

    await page.goto(`${BASE}/suppliers`);
    await page.waitForLoadState('networkidle').catch(() => {});

    const ctaLinks = await page.locator('a[href*="contacts"]').all();
    console.log(`  Ссылок на /contacts: ${ctaLinks.length}`);
    for (const link of ctaLinks) {
      const href = await link.getAttribute('href').catch(() => null);
      const text = (await link.innerText().catch(() => '')).trim();
      console.log(`    "${text}" → ${href}`);
    }

    if (ctaLinks.length > 0) {
      console.log(`  [OK] Поставщики → форма контактов (ожидаемое поведение)`);
    } else {
      finding('major', '/suppliers', 'cta', 'Нет CTA-ссылки на форму контактов');
    }

    await ctx.close();
  }

  // ─── 4. Events — confirm redirect to contacts ────────────────────────────
  {
    console.log('\n══ EVENTS — CTA check ══');
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();

    await page.goto(`${BASE}/events`);
    await page.waitForLoadState('networkidle').catch(() => {});

    const ctaLinks = await page.locator('a[href*="contacts"]').all();
    console.log(`  Ссылок на /contacts: ${ctaLinks.length}`);
    for (const link of ctaLinks) {
      const href = await link.getAttribute('href').catch(() => null);
      const text = (await link.innerText().catch(() => '')).trim();
      console.log(`    "${text}" → ${href}`);
    }

    if (ctaLinks.length > 0) {
      console.log(`  [OK] События → форма контактов (ожидаемое поведение)`);
    } else {
      finding('major', '/events', 'cta', 'Нет CTA-ссылки на форму контактов');
    }

    await ctx.close();
  }

  // ─── 5. Contacts form — city and topic select options ────────────────────
  {
    console.log('\n══ CONTACTS — select options ══');
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();

    await page.goto(`${BASE}/contacts`);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForSelector('#contactTopic', { timeout: 5000 }).catch(() => {});

    // Check native select for topic
    const topicSelect = page.locator('#contactTopic, select[name="topic"]');
    const topicOptions = await topicSelect.locator('option').count().catch(() => -1);
    console.log(`  #contactTopic options: ${topicOptions}`);

    if (topicOptions <= 1) {
      finding('critical', '/contacts', 'topic-select', `Поле темы обращения содержит ${topicOptions} опций (ожидалось 10+)`);
    } else {
      console.log(`  [OK] Тема обращения: ${topicOptions} вариантов`);
    }

    // Check city options
    const citySelect = page.locator('#contactCityId, select[name="cityId"]');
    const cityOptions = await citySelect.locator('option').count().catch(() => -1);
    console.log(`  #contactCityId options: ${cityOptions}`);

    if (cityOptions <= 1) {
      finding('major', '/contacts', 'city-select', `Поле города содержит ${cityOptions} опций (проверить базу)`);
    } else {
      console.log(`  [OK] Город: ${cityOptions} вариантов`);
    }

    // Check that custom Select visually shows correctly
    const comboboxes = await page.locator('[role="combobox"]').all();
    console.log(`  Combobox кнопок: ${comboboxes.length}`);
    for (const cb of comboboxes) {
      const text = await cb.innerText().catch(() => '');
      console.log(`    Combobox: "${text.slice(0, 40)}"`);
    }

    // Try opening combobox and checking items
    if (comboboxes.length > 0) {
      await comboboxes[0].click();
      await page.waitForTimeout(600);
      const options = await page.locator('[role="option"]').count();
      console.log(`  Опций после клика на первый combobox: ${options}`);
      if (options === 0) {
        // Try portal
        const portalOptions = await page.evaluate(() => document.querySelectorAll('[role="option"]').length);
        console.log(`  Опций через document.querySelectorAll: ${portalOptions}`);
        if (portalOptions === 0) {
          finding('critical', '/contacts', 'topic-combobox', 'Кастомный Select открывается пустым — нет опций в listbox');
        }
      } else {
        console.log(`  [OK] ${options} опций в combobox`);
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    await shot(page, 'CONTACTS-select-check');

    // Also check form URL with topic preset
    await page.goto(`${BASE}/contacts?topic=education-program&topicTitle=Интенсив+для+бариста#contact-form`);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(800);
    await shot(page, 'CONTACTS-education-preset');

    const topicVal = await page.locator('[name="topic"]').first().evaluate(el => el.value || el.innerText).catch(() => null);
    const topicTitleVal = await page.locator('[name="topicTitle"]').first().inputValue().catch(() => null);
    console.log(`  Pre-filled topic: "${topicVal}" topicTitle: "${topicTitleVal}"`);

    await ctx.close();
  }

  // ─── 6. Registration — deep check ─────────────────────────────────────────
  {
    console.log('\n══ REGISTRATION — detailed check ══');
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();

    await page.goto(`${BASE}/auth/register/user`);
    await page.waitForLoadState('networkidle').catch(() => {});
    await shot(page, 'REG-check', { fullPage: true });

    // Check fields have labels (visible above/beside)
    const nameField = page.locator('input[name="fullName"]').first();
    const nameLabel = page.locator('label[for]').filter({ hasText: 'Полное имя' }).first();
    const hasNameLabel = await nameLabel.isVisible().catch(() => false);
    console.log(`  fullName label visible: ${hasNameLabel}`);
    if (!hasNameLabel) finding('minor', '/auth/register/user', 'fullName-label', 'Label для fullName не виден');

    // Check placeholder on ALL inputs
    const inputs = await page.locator('input:not([type="hidden"])').all();
    for (const inp of inputs) {
      const name = await inp.getAttribute('name').catch(() => '?');
      const ph = await inp.getAttribute('placeholder').catch(() => null);
      const id = await inp.getAttribute('id').catch(() => null);
      const type = await inp.getAttribute('type').catch(() => 'text');
      if (type === 'checkbox') continue;

      const label = id ? page.locator(`label[for="${id}"]`).first() : null;
      const labelText = label ? await label.textContent().catch(() => null) : null;
      console.log(`  [${name}] label="${labelText?.trim()}" placeholder="${ph}"`);

      if (!ph && !labelText) {
        finding('minor', '/auth/register/user', `field[${name}]`, 'Нет placeholder и нет видимого label');
      }
    }

    // Check password hint (min length)
    const pwHint = await page.locator('text=/символов|минимум|characters|minimum|min/i').count();
    console.log(`  Password hint (min length): ${pwHint}`);
    if (pwHint === 0) {
      finding('minor', '/auth/register/user', 'password-hint', 'Нет подсказки о минимальной длине пароля');
    }

    // Test duplicate email
    const ts = Date.now();
    const email = `duptest_${ts}@test.com`;
    const pw = 'AuditPass99!';

    // First register
    await page.locator('input[name="fullName"]').fill('Dup Test');
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(pw);
    await page.locator('input[type="checkbox"]').check();
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // Try registering same email again
    await page.goto(`${BASE}/auth/register/user`);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.locator('input[name="fullName"]').fill('Dup Test 2');
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(pw);
    await page.locator('input[type="checkbox"]').check();
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    const dupErrorMsg = await page.locator('[role="alert"], .text-destructive').count();
    const stillOnRegister = page.url().includes('register');
    console.log(`  Дубль email: ошибок=${dupErrorMsg}, на странице регистрации=${stillOnRegister}`);
    if (dupErrorMsg === 0 && stillOnRegister) {
      finding('major', '/auth/register/user', 'duplicate-email', 'Повторная регистрация с тем же email не показывает ошибку');
    } else if (dupErrorMsg > 0) {
      console.log(`  [OK] Дубль email показывает ошибку`);
    }
    await shot(page, 'REG-dup-email');

    await ctx.close();
  }

  // ─── 7. Profile settings — website field visibility ───────────────────────
  {
    console.log('\n══ PROFILE SETTINGS — website field ══');
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();

    // Quick register
    const ts = Date.now();
    await page.goto(`${BASE}/auth/register/user`);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.locator('input[name="fullName"]').fill('Settings Checker').catch(() => {});
    await page.locator('input[name="email"]').fill(`settings_${ts}@test.com`).catch(() => {});
    await page.locator('input[name="password"]').fill('AuditPass99!').catch(() => {});
    await page.locator('input[type="checkbox"]').check().catch(() => {});
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    await page.goto(`${BASE}/profile/settings`);
    await page.waitForLoadState('networkidle').catch(() => {});

    // Check website field - should it be visible in settings? It's a honeypot in public forms, but in profile settings it might be a real field
    const websiteField = page.locator('input[name="website"]');
    const isVisible = await websiteField.isVisible().catch(() => false);
    const isHidden = await websiteField.isHidden().catch(() => false);
    const type = await websiteField.getAttribute('type').catch(() => null);
    console.log(`  website field: visible=${isVisible} hidden=${isHidden} type=${type}`);

    if (isVisible && type === 'url') {
      console.log(`  [OK] website поле видимо в настройках профиля (не honeypot в этом контексте)`);
    } else if (isHidden) {
      finding('minor', '/profile/settings', 'website-field', 'Поле website скрыто в настройках профиля (возможно honeypot конфликт)');
    }

    // Check save button - make a small change and verify it works
    const fullNameField = page.locator('input[name="fullName"]').first();
    if (await fullNameField.isVisible().catch(() => false)) {
      const currentValue = await fullNameField.inputValue();
      await fullNameField.fill(currentValue + ' Updated');
      const saveBtn = page.locator('button[type="submit"]').first();
      if (await saveBtn.isVisible().catch(() => false)) {
        const isDisabled = await saveBtn.isDisabled().catch(() => false);
        console.log(`  Save button disabled before change: was=${isDisabled} (should be false after change)`);
      }
    }

    await shot(page, 'SETTINGS-website');
    await ctx.close();
  }

  await browser.close();

  // Summary
  console.log('\n\n══════════════════════════════════════');
  console.log('ИТОГИ VACANCY/CONTACTS/EDUCATION AUDIT');
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
    path.join(import.meta.dirname, 'vacancy-audit-report.json'),
    JSON.stringify({ date: new Date().toISOString(), findings: FINDINGS }, null, 2)
  );
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
