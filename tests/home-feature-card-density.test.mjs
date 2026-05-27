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

test('homepage featured card keeps metadata only in the top badge row', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');
  const featuredCardStart = source.indexOf('function FeaturedNowCard');
  const featuredCardEnd = source.indexOf('const homepageFaqItems');
  const featuredCardSource = source.slice(featuredCardStart, featuredCardEnd);

  assert.match(source, /function getVisibleFeaturedMeta\(card: HomepageLiveCard\)/);
  assert.match(source, /const hiddenMeta = new Set\(\['Открытый доступ', card\.eyebrow\]\.map\(normalizedMetaKey\)\)/);
  assert.match(source, /seenMeta\.has\(key\)/);
  assert.match(featuredCardSource, /const visibleMeta = getVisibleFeaturedMeta\(card\)/);
  assert.match(featuredCardSource, /featured-now-card/);
  assert.match(featuredCardSource, /featured-now-meta-row/);
  assert.match(featuredCardSource, /featured-now-footer/);
  assert.match(featuredCardSource, /featured-now-action/);
  assert.doesNotMatch(featuredCardSource, /const footerMeta = compactMeta\(card\)/);
  assert.doesNotMatch(featuredCardSource, /featured-now-footnote/);
  assert.doesNotMatch(featuredCardSource, /justify-between/);
});

test('homepage featured card CSS has scoped density and mobile wrapping rules', () => {
  const css = readGlobalStyles();

  assert.match(css, /\.featured-now-card/);
  assert.match(css, /\.featured-now-content/);
  assert.match(css, /\.featured-now-footer/);
  assert.match(css, /overflow-wrap: anywhere/);
  assert.doesNotMatch(css, /\.featured-now-footnote/);
  assert.match(css, /@media \(max-width: 480px\)/);
});

test('homepage hero explains the product without top action buttons', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');
  const heroStart = source.indexOf('function HomeHeroRouter');
  const heroEnd = source.indexOf('function HomeRoleRouter');
  const heroSource = source.slice(heroStart, heroEnd);

  assert.match(heroSource, /accentFont\.className/);
  assert.match(heroSource, /BARSYNERGY/);
  assert.match(heroSource, /max-w-\[55rem\]/);
  assert.match(heroSource, /leading-\[1\.04\]/);
  assert.doesNotMatch(heroSource, /max-w-\[19ch\]/);
  assert.doesNotMatch(heroSource, /max-w-\[13ch\]/);
  assert.doesNotMatch(heroSource, /leading-\[0\.98\]/);
  assert.match(heroSource, /Платформа, которая объединяет людей индустрии кофе и бара/);
  assert.match(heroSource, /Обучение, события, вакансии, поставщики/);
  assert.doesNotMatch(heroSource, /Выбрать направление/);
  assert.doesNotMatch(heroSource, /Написать команде/);
  assert.doesNotMatch(heroSource, /Посмотреть события/);
  assert.doesNotMatch(heroSource, /\/contacts\?topic=other#contact-form/);
  assert.doesNotMatch(heroSource, /href="#home-role-router"/);
  assert.doesNotMatch(heroSource, /href="\/events"/);
  assert.doesNotMatch(heroSource, /Связаться с нами/);
  assert.doesNotMatch(heroSource, /Выбрать раздел/);
  assert.doesNotMatch(heroSource, /Здесь можно найти/);
  assert.doesNotMatch(heroSource, /Специалисты записываются на программы и события/);

  assert.doesNotMatch(readGlobalStyles(), /\.home-hero-copy/);
});

test('homepage hero removes the side visual panel', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');
  const css = readGlobalStyles();
  const heroStart = source.indexOf('function HomeHeroRouter');
  const heroEnd = source.indexOf('function HomeRoleRouter');
  const heroSource = source.slice(heroStart, heroEnd);

  assert.doesNotMatch(heroSource, /home-hero-visual-panel/);
  assert.doesNotMatch(heroSource, /hero-collage\.jpg/);
  assert.doesNotMatch(heroSource, /Барная команда за рабочей стойкой/);
  assert.doesNotMatch(heroSource, /<aside/);
  assert.doesNotMatch(css, /\.home-hero-visual-panel/);
  assert.doesNotMatch(css, /grid-template-columns: minmax\(0, 1fr\) minmax\(13rem, 0\.42fr\)/);
  assert.doesNotMatch(source, /const heroMetricRows = \[/);
  assert.doesNotMatch(heroSource, /home-hero-signal/);
  assert.doesNotMatch(heroSource, /home-hero-mark-panel/);
  assert.doesNotMatch(heroSource, /barsynergy-mark\.svg/);
  assert.doesNotMatch(heroSource, /lg:grid-cols-\[minmax\(0,0\.95fr\)_minmax\(21rem,0\.62fr\)\]/);
});

test('homepage role router uses editorial rows without card-grid tiles', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');
  const css = readGlobalStyles();
  const sectionStart = source.indexOf('function HomeRoleRouter');
  const sectionEnd = source.indexOf('const businessDigitalServices');
  const sectionSource = source.slice(sectionStart, sectionEnd);

  assert.match(sectionSource, /<ul className="home-role-list border-t border-\[var\(--line\)\]"/);
  assert.match(sectionSource, />Разделы<\/p>/);
  assert.doesNotMatch(sectionSource, /Куда перейти/);
  assert.match(sectionSource, /home-role-row/);
  assert.match(sectionSource, /border-b border-\[var\(--line\)\]/);
  assert.doesNotMatch(sectionSource, /public-card-shell/);
  assert.doesNotMatch(sectionSource, /h-full min-h-\[13\.5rem\]/);
  assert.match(sectionSource, /home-role-card-nav/);
  assert.match(sectionSource, /aria-label=\{`Перейти в раздел: \$\{card\.title\}`\}/);
  assert.doesNotMatch(sectionSource, /<span>\{index \+ 1\}<\/span>/);
  assert.doesNotMatch(sectionSource, /padStart\(2, '0'\)/);
  assert.doesNotMatch(sectionSource, /card\.actionLabel/);
  assert.doesNotMatch(sectionSource, /mt-auto/);
  assert.match(css, /\.home-role-row/);
  assert.match(css, /\.home-role-row-icon/);
  assert.match(css, /\.home-role-card-nav/);
  assert.doesNotMatch(css, /\.home-role-grid/);
  assert.doesNotMatch(css, /\.home-role-card\s*\{/);
});

test('homepage current section uses a filled support row under the featured card', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');
  const sectionStart = source.indexOf('id="home-current"');
  const sectionEnd = source.indexOf('{data.calculatorTeaser');
  const sectionSource = source.slice(sectionStart, sectionEnd);

  assert.match(sectionSource, /home-current-layout grid gap-4/);
  assert.match(sectionSource, /home-current-support-grid/);
  assert.match(sectionSource, /xl:grid-cols-3/);
  assert.match(source, /sm:min-h-\[11\.5rem\]/);
  assert.doesNotMatch(sectionSource, /xl:grid-cols-\[minmax\(0,1\.08fr\)_minmax\(20rem,0\.62fr\)\]/);
  assert.doesNotMatch(sectionSource, /xl:grid-cols-1/);
});

test('homepage calculator teaser uses existing steps and a compact CTA rail', () => {
  const source = readProjectFile('src/components/public/platform-ui.tsx');
  const teaserStart = source.indexOf('export function ToolTeaser');
  const teaserEnd = source.indexOf('function pageHref');
  const teaserSource = source.slice(teaserStart, teaserEnd);

  assert.match(teaserSource, /const steps = teaser\.steps\.filter\(Boolean\)\.slice\(0, 3\)/);
  assert.match(teaserSource, /<PublicEyebrow>\{teaser\.eyebrow\}<\/PublicEyebrow>/);
  assert.match(teaserSource, /home-tool-teaser-rail/);
  assert.match(teaserSource, /home-tool-step-list/);
  assert.match(teaserSource, /home-tool-step-index/);
  assert.match(teaserSource, /<span className="home-tool-step-index">\{index \+ 1\}<\/span>/);
  assert.match(teaserSource, /\{teaser\.cardEyebrow\}/);
  assert.doesNotMatch(teaserSource, /padStart\(2, '0'\)/);
  assert.doesNotMatch(teaserSource, /Практическая польза/);
  assert.doesNotMatch(teaserSource, /lg:items-center/);
});

test('homepage calculator teaser CSS keeps the utility block dense and responsive', () => {
  const css = readGlobalStyles();

  assert.match(css, /\.home-tool-teaser/);
  assert.match(css, /\.home-tool-teaser-grid/);
  assert.match(css, /\.home-tool-teaser-rail/);
  assert.match(css, /\.home-tool-step-list/);
  assert.match(css, /\.home-tool-step-index/);
  assert.match(css, /@media \(min-width: 1024px\)/);
  assert.match(css, /@media \(max-width: 480px\)/);
});

test('homepage digital solutions fills the left column with a static process block', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');
  const sectionStart = source.indexOf('const businessDigitalServices');
  const sectionEnd = source.indexOf('const channelDetailsByVariant');
  const sectionSource = source.slice(sectionStart, sectionEnd);

  assert.match(sectionSource, /const businessDigitalProcessSteps = \[/);
  assert.match(sectionSource, /value: '1'/);
  assert.match(sectionSource, /value: '3'/);
  assert.match(sectionSource, /home-digital-intro flex min-w-0 flex-col/);
  assert.match(sectionSource, /lg:items-stretch/);
  assert.match(sectionSource, /От задачи к запуску/);
  assert.match(sectionSource, /Оставить заявку/);
  assert.doesNotMatch(sectionSource, /Обсудить задачу/);
  assert.match(sectionSource, /home-digital-process mt-9/);
  assert.doesNotMatch(sectionSource, /lg:mt-auto/);
  assert.match(sectionSource, /home-digital-process-step/);
  assert.doesNotMatch(sectionSource, /value: '0[1-9]'/);
  assert.doesNotMatch(sectionSource, /carousel|slider|autoplay|setInterval/i);
  assert.doesNotMatch(sectionSource, /\['сайт', 'бот', 'Mini App', 'процесс'\]/);
  assert.doesNotMatch(sectionSource, /Услуга/);
});

test('homepage digital solutions CSS exposes scoped responsive process styling', () => {
  const css = readGlobalStyles();

  assert.match(css, /\.home-digital-intro/);
  assert.match(css, /\.home-digital-process/);
  assert.match(css, /\.home-digital-process-step/);
  assert.match(css, /\.home-digital-process-index/);
  assert.match(css, /@media \(min-width: 1024px\)/);
  assert.match(css, /@media \(max-width: 480px\)/);
});

test('homepage help CTA has a direct contact heading', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');
  const sectionStart = source.indexOf('function HomeCtaFaqSection');
  const sectionEnd = source.indexOf('export function HomepageClient');
  const sectionSource = source.slice(sectionStart, sectionEnd);

  assert.match(sectionSource, /Напишите команде/);
  assert.match(sectionSource, /Ответим на вопрос, примем идею события или поможем выбрать нужный раздел\./);
  assert.doesNotMatch(sectionSource, /Соберите маршрут/);
  assert.doesNotMatch(sectionSource, /href="\/contacts\?topic=other#contact-form"/);
  assert.doesNotMatch(sectionSource, /isCtaHovered/);
});

test('homepage help FAQ keeps accordion expansion inside a stable column', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');
  const css = readGlobalStyles();
  const sectionStart = source.indexOf('function HomeCtaFaqSection');
  const sectionEnd = source.indexOf('export function HomepageClient');
  const sectionSource = source.slice(sectionStart, sectionEnd);

  assert.match(sectionSource, /home-help-faq-list/);
  assert.match(sectionSource, /home-help-faq-item/);
  assert.match(sectionSource, /data-active=\{isActive \? 'true' : 'false'\}/);
  assert.match(sectionSource, /home-help-faq-answer/);
  assert.match(css, /\.home-help-faq-list/);
  assert.match(css, /\.home-help-faq-item\[data-active="true"\]/);
  assert.match(css, /height: 30\.625rem/);
  assert.match(css, /min-height: 30\.625rem/);
  assert.match(css, /@media \(max-width: 900px\)/);
});

test('events empty agenda state stays compact', () => {
  const source = readProjectFile('src/components/public/platform-ui.tsx');
  const sectionStart = source.indexOf('export function EventAgendaSection');
  const sectionEnd = source.indexOf('<div className="mt-8 grid gap-10">');
  const sectionSource = source.slice(sectionStart, sectionEnd);
  const emptyStateStart = sectionSource.indexOf('content.items.length === 0');
  const emptyStateEnd = sectionSource.indexOf(') : (', emptyStateStart);
  const emptyStateSource = sectionSource.slice(emptyStateStart, emptyStateEnd);

  assert.match(sectionSource, /event-empty-state grid gap-4 p-5 md:p-6/);
  assert.match(sectionSource, /padding="none"/);
  assert.match(emptyStateSource, /text-xl font-semibold leading-7/);
  assert.doesNotMatch(emptyStateSource, /<Button/);
  assert.doesNotMatch(emptyStateSource, /Смотреть архив/);
  assert.doesNotMatch(emptyStateSource, /Предложить событие/);
  assert.doesNotMatch(emptyStateSource, /Предложить тему/);
  assert.doesNotMatch(emptyStateSource, /Партнёрский контакт/);
  assert.doesNotMatch(emptyStateSource, /форму ниже/);
  assert.doesNotMatch(emptyStateSource, /md:grid-cols-\[minmax\(0,1fr\)_auto\]/);
  assert.doesNotMatch(emptyStateSource, /space-y-4/);
  assert.doesNotMatch(sectionSource, /padding="lg"/);
});
