import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';
import { readGlobalStyles } from './helpers/global-styles.mjs';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('about page uses narrative story, visual facts, timeline, and focused final CTA', () => {
  const source = readProjectFile('src/app/(public)/about/page.tsx');
  const css = readGlobalStyles();

  assert.match(source, /breadcrumbs=\{\[\{ label: 'О проекте' \}\]\}/);
  assert.doesNotMatch(source, /<p className="mt-5 inline-flex[\s\S]*О проекте[\s\S]*<\/p>/);
  assert.match(source, /Бариста искали обучение в чатах/);
  assert.match(source, /половина профессионального круга узнала уже постфактум/);
  assert.match(source, /обучение, афиша, вакансии, материалы и каталог поставщиков/);
  assert.match(source, /Ближайшее направление развития/);
  assert.match(source, /<blockquote/);
  assert.match(source, /const insidePlatform:/);
  assert.match(source, /hero-coffee-counter-haberdoedas/);
  assert.match(source, /about-timeline grid/);
  assert.doesNotMatch(source, /about-timeline grid gap-0 border-y/);
  assert.doesNotMatch(source, /about-timeline-item relative grid gap-3 border-b/);
  assert.match(css, /\.about-timeline-item::before/);
  assert.match(source, /Связаться с командой/);
  assert.match(source, /Предложить событие/);
  assert.match(source, /Стать партнёром/);
  assert.match(source, /xl:grid-cols-\[minmax\(0,0\.62fr\)_minmax\(18rem,0\.38fr\)\]/);
});

test('editorial public page hero does not duplicate breadcrumb as eyebrow', () => {
  const source = readProjectFile('src/components/public/editorial-public-page.tsx');
  const generalSponsorsSource = readProjectFile('src/app/(public)/general-sponsors/page.tsx');

  const heroSource = source.slice(source.indexOf('<section'), source.indexOf('{hasDetails ?'));

  assert.match(heroSource, /<PublicBreadcrumbs current=\{breadcrumbLabel \?\? eyebrow\} \/>/);
  assert.doesNotMatch(heroSource, /<PublicEyebrow className="mt-2" tone="muted">\{eyebrow\}<\/PublicEyebrow>/);
  assert.doesNotMatch(heroSource, /<PublicEyebrow className="mt-5" tone="muted">\{eyebrow\}<\/PublicEyebrow>/);
  assert.match(generalSponsorsSource, /breadcrumbs=\{\[\{ label: 'Спонсорство' \}\]\}/);
  assert.doesNotMatch(generalSponsorsSource, /<PublicEyebrow className="mt-6">Спонсорство<\/PublicEyebrow>/);
});

test('contacts page exposes concrete routing topics and direct first-screen copy', () => {
  const pageSource = readProjectFile('src/app/(public)/contacts/page.tsx');
  const formSource = readProjectFile('src/components/public/contact-application-form.tsx');
  const constantsSource = readProjectFile('src/components/public/contact-application-form-constants.ts');
  const actionSource = readProjectFile('src/app/(public)/contacts/actions.ts');

  assert.match(pageSource, /title="Связь с командой BARSYNERGY"/);
  assert.match(pageSource, /Пишите по любой задаче/);
  assert.match(formSource, /title="Опишите задачу — ответим на ваш контакт"/);
  assert.match(constantsSource, /Консалтинг/);
  assert.match(constantsSource, /Хочу стать партнёром/);
  assert.match(constantsSource, /Что-то сломалось/);
  assert.match(constantsSource, /Другое/);
  assert.match(formSource, /label="Контакт"/);
  assert.match(formSource, /name="contact"/);
  assert.doesNotMatch(formSource, /contact-channels-panel/);
  assert.doesNotMatch(formSource, /<ContactChannelFieldset/);
  assert.match(actionSource, /'bug-report'/);
  assert.match(actionSource, /'supplier'/);
});

test('legal pages include short summaries, sticky toc, related links, date and 65ch text width', () => {
  const documentSource = readProjectFile('src/lib/legal/legal-documents.ts');
  const pageSource = readProjectFile('src/components/public/legal-draft-page.tsx');
  const css = readGlobalStyles();

  assert.match(documentSource, /summary: string\[\]/);
  assert.match(documentSource, /Собираем только данные/);
  assert.match(documentSource, /Передаёте данные добровольно/);
  assert.match(documentSource, /Используйте сайт для рабочих запросов/);
  assert.match(documentSource, /Используем cookies для входа/);
  assert.match(pageSource, /<PublicEyebrow>Коротко<\/PublicEyebrow>/);
  assert.match(pageSource, /updatedAt=\{updatedAt\}/);
  assert.match(pageSource, /<aside className="hidden xl:block">/);
  assert.match(pageSource, /Связанные документы/);
  assert.match(pageSource, /minmax\(0,65ch\)/);
  assert.match(css, /\.legal-document-body/);
  assert.match(css, /line-height: 1\.7/);
});

test('auth surfaces use minimal login, progressive register and admin dark mode', () => {
  const loginSource = readProjectFile('src/app/auth/login/page.tsx');
  const loginFormSource = readProjectFile('src/app/auth/login/_components/login-form.tsx');
  const authLayoutSource = readProjectFile('src/components/auth/auth-split-layout.tsx');
  const registerSource = readProjectFile('src/app/auth/register/business/page.tsx');
  const activateSource = readProjectFile('src/app/auth/activate/page.tsx');
  const adminSource = readProjectFile('src/app/(admin-auth)/admin/login/page.tsx');

  assert.match(loginSource, /<AuthSplitLayout>/);
  assert.match(authLayoutSource, /auth-login-screen/);
  assert.match(authLayoutSource, /Вернуться на сайт/);
  assert.doesNotMatch(authLayoutSource, /auth-split-photo/);
  assert.doesNotMatch(loginSource, /Хороший эспрессо начинается с правильной экстракции/);
  assert.doesNotMatch(loginSource, /AuthRoleCard/);
  assert.doesNotMatch(loginSource, /publicLoginRoles/);
  assert.doesNotMatch(loginSource, /name="role"/);
  assert.match(loginSource, /Вход в кабинет/);
  assert.match(loginFormSource, /Проблемы с доступом\?/);
  assert.match(loginFormSource, /Написать команде/);
  assert.match(registerSource, /BusinessRequestForm/);
  assert.match(registerSource, /Шаг 1/);
  assert.match(registerSource, /Шаг 2/);
  assert.doesNotMatch(registerSource, /Я работаю в баре/);
  assert.doesNotMatch(registerSource, /Я владею заведением или представляю бренд/);
  assert.match(activateSource, /ShieldCheck/);
  assert.match(adminSource, /bg-\[var\(--background\)\]/);
  assert.match(adminSource, /bg-\[var\(--surface-muted\)\]/);
});
