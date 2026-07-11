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
  const source = readProjectFile('src/components/public/homepage-current.tsx');
  const featuredCardStart = source.indexOf('export function EditorialFeatured');
  const featuredCardEnd = source.indexOf('export function EditorialSupportCard');
  const featuredCardSource = source.slice(featuredCardStart, featuredCardEnd);

  assert.match(source, /function extractReadingTime\(meta: string\[\]\): string \| undefined/);
  assert.match(source, /function buildFeaturedFooterMeta\(card: HomepageLiveCard\): string/);
  assert.match(source, /const kindLabels: Record<string, string>/);
  assert.match(source, /function supportMetaText\(card: HomepageLiveCard\)/);
  assert.match(featuredCardSource, /const footerMeta = buildFeaturedFooterMeta\(card\)/);
  assert.match(featuredCardSource, /editorial-featured/);
  assert.match(featuredCardSource, /\{card\.actionLabel\}/);
  assert.match(featuredCardSource, /ArrowUpRight/);
  assert.match(featuredCardSource, /\{footerMeta\}/);
  assert.doesNotMatch(featuredCardSource, /const footerMeta = compactMeta\(card\)/);
  assert.doesNotMatch(featuredCardSource, /featured-now-footnote/);
  assert.doesNotMatch(featuredCardSource, /justify-between/);
});

test('homepage featured card CSS has scoped density and mobile wrapping rules', () => {
  const css = readGlobalStyles();

  assert.match(css, /\.editorial-featured/);
  assert.match(css, /\.editorial-featured-content/);
  assert.match(css, /\.editorial-featured-footer/);
  assert.match(css, /overflow-wrap: anywhere/);
  assert.doesNotMatch(css, /\.featured-now-footnote/);
  assert.match(css, /@media \(min-width: 640px\)/);
});

test('homepage hero explains the product with one primary action and no search', () => {
  const heroSource = readProjectFile('src/components/public/homepage-hero.tsx');

  assert.match(heroSource, /accentFont\.className/);
  assert.match(heroSource, /BARSYNERGY/);
  assert.match(heroSource, /max-w-\[52rem\]/);
  assert.match(heroSource, /leading-\[1\.08\]/);
  assert.match(heroSource, /Люди, события, вакансии, поставщики, обучение и материалы/);
  assert.match(heroSource, /BARSYNERGY \/ Кофейная индустрия СКФО/);
  assert.match(heroSource, /Изучить платформу/);
  assert.match(heroSource, /Для бизнеса/);
  assert.doesNotMatch(heroSource, /home-hero-search/);
  assert.doesNotMatch(heroSource, /action="\/search"/);
  assert.doesNotMatch(heroSource, /Глобальный поиск по платформе/);
  assert.match(heroSource, /export function HomeHeroRouter/);
  assert.doesNotMatch(heroSource, /\/contacts\?topic=other#contact-form/);
  assert.doesNotMatch(heroSource, /href="#home-role-router"/);
  assert.doesNotMatch(heroSource, /Связаться с нами/);
  assert.doesNotMatch(heroSource, /Выбрать раздел/);
  assert.doesNotMatch(heroSource, /Здесь можно найти/);
  assert.doesNotMatch(heroSource, /Специалисты записываются на программы и события/);

  assert.doesNotMatch(readGlobalStyles(), /\.home-hero-copy/);
});

test('homepage stats render when at least two items exist', () => {
  const statsSource = readProjectFile('src/components/public/homepage-hero.tsx');

  assert.match(statsSource, /const allItems = \[/);
  assert.match(statsSource, /\.filter\(\(item\) => item\.value >= 1\)/);
  assert.match(statsSource, /statItems\.length >= 2/);
  assert.doesNotMatch(statsSource, /IntersectionObserver/);
  assert.doesNotMatch(statsSource, /requestAnimationFrame/);
  assert.doesNotMatch(statsSource, /setDisplayValues/);
  assert.match(statsSource, /aria-label=\{`\$\{item\.value\} \$\{item\.label\}`\}/);
});

test('public viewport reveal applies only to inner sections and staggered cards', () => {
  const revealSource = readProjectFile('src/components/public/viewport-reveal.tsx');
  const layoutSource = readProjectFile('src/app/layout.tsx');
  const css = readGlobalStyles();

  assert.match(layoutSource, /<ViewportReveal \/>/);
  assert.match(revealSource, /SECTION_SELECTOR = '.site-main > section, .site-main > div > section'/);
  assert.match(revealSource, /CHILD_SELECTOR/);
  assert.match(revealSource, /\.home-section-card/);
  assert.match(revealSource, /\.public-card-shell/);
  assert.match(revealSource, /index > 0/);
  assert.match(revealSource, /background-zone-hero/);
  assert.match(revealSource, /IntersectionObserver/);
  assert.match(revealSource, /data-reveal-state/);
  assert.match(revealSource, /Math\.min\(index % 4, 3\) \* 100/);
  assert.match(css, /\[data-reveal-state="pending"\]/);
  assert.match(css, /transform: translateY\(20px\)/);
  assert.match(css, /opacity var\(--motion-duration-panel\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test('homepage mobile rules keep the first screen and scannable cards phone-native', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');
  const heroSource = readProjectFile('src/components/public/homepage-hero.tsx');
  const headerSource = readProjectFile('src/components/layout/site-header.tsx');
  const menuSource = readProjectFile('src/components/layout/mobile-site-menu.tsx');
  const css = readGlobalStyles();

  assert.match(heroSource, /flex items-center justify-center/);
  assert.match(heroSource, /md:min-h-\[720px\] lg:min-h-\[760px\]/);
  assert.match(source, /editorial-current-section scroll-mt-28 border-b border-white\/8 py-12 md:py-20/);
  assert.match(source, /editorial-current-support-row grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-5/);
  assert.match(source, /grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3/);
  assert.match(headerSource, /min-h-\[56px\]/);
  assert.match(headerSource, /lg:min-h-\[64px\]/);
  assert.match(menuSource, /fixed inset-0/);
  assert.match(menuSource, /text-\[24px\]/);
  assert.match(menuSource, /grid gap-6/);
  assert.match(menuSource, /group\.label/);
  assert.doesNotMatch(menuSource, /ThemeSegmentedToggle/);
  assert.match(menuSource, /Telegram/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*line-height: 1\.65/);
});

test('homepage section badges and inline icons use the filled square accent treatment', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');

  assert.match(source, /<EditorialSupportCard/);
  assert.match(source, /actionLabel=\{/);
  assert.match(source, /label="Вакансии"/);
  assert.doesNotMatch(source, /rounded-full bg-\[var\(--accent-soft\)\] text-\[var\(--accent\)\]/);
});

test('homepage hero removes the side visual panel', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');
  const css = readGlobalStyles();
  const heroStart = source.indexOf('function HomeHeroRouter');
  const heroEnd = source.indexOf('function HomeSectionCards');
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

test('homepage removes duplicate role router cards', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');
  const css = readGlobalStyles();
  const renderStart = source.indexOf('export function HomepageClient');
  const renderSource = source.slice(renderStart);

  assert.doesNotMatch(source, /function HomeRoleRouter/);
  assert.doesNotMatch(source, /roleRouterCards/);
  assert.doesNotMatch(renderSource, /<HomeRoleRouter \/>/);
  assert.doesNotMatch(source, /home-role-card/);
  assert.doesNotMatch(css, /\.home-role-card/);
  assert.doesNotMatch(css, /\.home-role-card-thumb/);
  assert.doesNotMatch(css, /\.home-role-grid/);
});

test('homepage fresh section replaces duplicate reading and current blocks', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');
  const sectionStart = source.indexOf('id="home-fresh"');
  const sectionEnd = source.indexOf('<HomeEventsStrip');
  const sectionSource = source.slice(sectionStart, sectionEnd);

  assert.match(sectionSource, /Актуальное/);
  assert.match(sectionSource, /editorial-current-layout/);
  assert.match(sectionSource, /editorial-current-support-row/);
  assert.match(sectionSource, /sm:grid-cols-3/);
  assert.doesNotMatch(source, /function HomeReadingSection/);
  assert.doesNotMatch(source, /id="home-reading"/);
  assert.doesNotMatch(source, /id="home-current"/);
  assert.doesNotMatch(sectionSource, /home-reading/);
});

test('homepage calculator teaser uses existing steps and a compact CTA rail', () => {
  const teaserSource = readProjectFile('src/components/public/platform-ui-tool-teaser.tsx');

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

test('homepage removes the digital-solutions service promo block', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');

  assert.doesNotMatch(source, /const businessDigitalServices/);
  assert.doesNotMatch(source, /BusinessDigitalSolutionsSection/);
  assert.doesNotMatch(source, /home-digital-solutions/);
  assert.doesNotMatch(source, /Сайты, боты и автоматизация для бизнеса/);
  assert.doesNotMatch(source, /Наши услуги/);
});

test('homepage sponsors render as a compact logo strip', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');
  const sectionSource = readProjectFile('src/components/public/homepage-sponsors.tsx');
  const currentSectionIndex = source.indexOf('id="home-fresh"');
  const sponsorsRenderIndex = source.indexOf('<HomeSponsorLogoStrip');
  const faqRenderIndex = source.indexOf('<HomeCtaFaqSection');

  assert.match(sectionSource, /export function HomeSponsorLogoStrip/);
  assert.match(sectionSource, /Генеральные спонсоры сезона/);
  assert.match(sectionSource, /sponsor\.shortDescription/);
  assert.match(sectionSource, /Смотреть профиль →/);
  assert.match(sectionSource, /justify-items-center/);
  assert.match(sectionSource, /max-h-36/);
  assert.match(sectionSource, /max-w-\[18rem\]/);
  assert.match(sectionSource, /sponsor\.logoSrc/);
  assert.doesNotMatch(sectionSource, /Кофе, какао и поставки для баров и кофеен СКФО/);
  assert.ok(currentSectionIndex < sponsorsRenderIndex);
  assert.ok(sponsorsRenderIndex < faqRenderIndex);
  assert.doesNotMatch(source, /<GeneralSponsorCard/);
  assert.doesNotMatch(source, /variant="home"/);
});

test('homepage help CTA has a direct contact heading', () => {
  const sectionSource = readProjectFile('src/components/public/home-cta-faq-section.tsx');

  assert.match(sectionSource, /Напишите команде/);
  assert.match(sectionSource, /Ответим на вопрос, примем идею события или поможем выбрать нужный раздел\./);
  assert.doesNotMatch(sectionSource, /Соберите маршрут/);
  assert.match(sectionSource, /href="\/contacts#contact-form"/);
  assert.doesNotMatch(sectionSource, /isCtaHovered/);
});

test('homepage help FAQ keeps accordion expansion inside a stable column', () => {
  const sectionSource = readProjectFile('src/components/public/home-cta-faq-section.tsx');
  const css = readGlobalStyles();

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

test('events empty agenda state guides users to formats and submission', () => {
  const sectionSource = readProjectFile('src/components/public/platform-ui-event-agenda.tsx');
  const emptyStateStart = sectionSource.indexOf('isTrueUpcomingEmpty ? (');
  const emptyStateEnd = sectionSource.indexOf(') : (', emptyStateStart);
  const emptyStateSource = sectionSource.slice(emptyStateStart, emptyStateEnd);

  assert.match(sectionSource, /background-zone background-zone-graphite border-b border-\[var\(--line\)\] py-10 md:py-14/);
  assert.match(emptyStateSource, /CalendarDays/);
  assert.match(emptyStateSource, /События появятся совсем скоро/);
  assert.match(emptyStateSource, /интенсив или каппинг/);
  assert.match(emptyStateSource, /Подписаться на анонсы/);
  assert.match(emptyStateSource, /Хотите провести своё\?/);
  assert.match(emptyStateSource, /<Button/);
  assert.doesNotMatch(emptyStateSource, /Предложить тему/);
  assert.doesNotMatch(emptyStateSource, /Партнёрский контакт/);
  assert.doesNotMatch(emptyStateSource, /форму ниже/);
});
