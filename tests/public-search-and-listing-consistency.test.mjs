import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('homepage hero does not duplicate global search', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');
  const heroStart = source.indexOf('function HomeHeroRouter');
  const heroEnd = source.indexOf('function HomeSectionCards');
  const heroSource = source.slice(heroStart, heroEnd);

  assert.doesNotMatch(heroSource, /home-hero-search/);
  assert.doesNotMatch(heroSource, /action="\/search"/);
  assert.doesNotMatch(heroSource, /aria-label="Глобальный поиск по платформе"/);
  assert.doesNotMatch(heroSource, /placeholder="Найдите вакансии, поставщиков, обучение или материалы/);
  assert.doesNotMatch(heroSource, /action="\/suppliers"/);
  assert.doesNotMatch(heroSource, /Поиск по каталогу поставщиков/);
});

test('global search route aggregates public content sections', () => {
  const routePath = join(repoRoot, 'src/app/(public)/search/page.tsx');

  assert.equal(existsSync(routePath), true);

  const source = readProjectFile('src/app/(public)/search/page.tsx');

  assert.match(source, /getPublishedVacancies/);
  assert.match(source, /getPublishedSuppliers/);
  assert.match(source, /getPublishedArticles/);
  assert.match(source, /getPublishedCourses/);
  assert.match(source, /getPublishedEvents/);
  assert.match(source, /getPublishedPartners/);
  assert.match(source, /SearchResultsClient/);
  assert.match(source, /basePath: '\/vacancies'/);
  assert.match(source, /basePath: '\/suppliers'/);
  assert.match(source, /basePath: '\/articles'/);
  assert.match(source, /basePath: '\/education'/);
  assert.match(source, /basePath: '\/events'/);
  assert.match(source, /basePath: '\/partners'/);
  assert.match(source, /flatItems: SearchResultItem\[]/);
});

test('homepage avoids hardcoded live stats and sponsor descriptions', () => {
  const statsSource = readProjectFile('src/components/public/homepage-hero.tsx');
  const sponsorsSource = readProjectFile('src/components/public/homepage-sponsors.tsx');

  assert.match(statsSource, /value: stats\.vacancies/);
  assert.match(statsSource, /value: stats\.suppliers/);
  assert.match(statsSource, /value: stats\.articles/);
  assert.doesNotMatch(statsSource, /stats\.vacancies \|\| 2/);
  assert.doesNotMatch(statsSource, /stats\.suppliers \|\| 3/);
  assert.doesNotMatch(statsSource, /stats\.articles \|\| 5/);
  assert.doesNotMatch(sponsorsSource, /sponsorDescriptions/);
  assert.doesNotMatch(sponsorsSource, /Hustle Brew':/);
  assert.doesNotMatch(sponsorsSource, /Gelabo:/);
});

test('public listing pages share headers, filters and pagination primitives', () => {
  const articlesSource = readProjectFile('src/app/(public)/articles/page.tsx');
  const vacanciesSource = readProjectFile('src/app/(public)/vacancies/page.tsx');
  const eventsSource = readProjectFile('src/app/(public)/events/page.tsx');
  const educationSource = readProjectFile('src/app/(public)/education/page.tsx');

  assert.match(articlesSource, /ArticleGridSection/);
  assert.doesNotMatch(articlesSource, /canonicalArticleSearchParams/);
  assert.doesNotMatch(articlesSource, /redirect\(/);

  assert.match(vacanciesSource, /<PageHero/);
  assert.doesNotMatch(vacanciesSource, /<PublicDisplayTitle/);

  assert.match(eventsSource, /<PageHero/);
  assert.match(eventsSource, /EventsSearchBar/);
  assert.match(eventsSource, /<EventAgendaSection/);
  assert.match(eventsSource, /cityName=\{selectedCityOption\?\.name\}/);
  assert.doesNotMatch(eventsSource, /<PublicDisplayTitle/);
  assert.doesNotMatch(eventsSource, /<EditorialPublicPage/);

  assert.match(vacanciesSource, /variant="sidebar"/);
  assert.match(educationSource, /EducationFilterBar/);
  assert.doesNotMatch(vacanciesSource, /variant="toolbar"/);
  assert.doesNotMatch(eventsSource, /variant="sidebar"/);
  assert.doesNotMatch(eventsSource, /variant="toolbar"/);
  assert.match(educationSource, /const featuredItems = !hasActiveFilters && content\.page === 1/);
  assert.match(educationSource, /content\.items\.slice\(0, FEATURED_COUNT\)/);
});

test('public catalog and listing pages use the same graphite hero tone', () => {
  const pagePaths = [
    'src/app/(public)/vacancies/page.tsx',
    'src/app/(public)/suppliers/page.tsx',
    'src/app/(public)/events/page.tsx',
    'src/app/(public)/education/page.tsx',
    'src/app/(public)/articles/page.tsx',
    'src/app/(public)/partners/page.tsx',
    'src/app/(public)/consulting/page.tsx',
    'src/app/(public)/general-sponsors/page.tsx',
    'src/app/(public)/contacts/page.tsx',
    'src/app/(public)/business/page.tsx',
    'src/app/(public)/search/page.tsx'
  ];

  for (const pagePath of pagePaths) {
    assert.match(readProjectFile(pagePath), /<PageHero[\s\S]*tone="graphite"/, pagePath);
  }
});

test('hero action modals share the numbered step primitive', () => {
  const actionFiles = [
    'src/app/(public)/vacancies/vacancies-hero-actions.tsx',
    'src/app/(public)/suppliers/suppliers-hero-actions.tsx',
    'src/app/(public)/events/events-hero-actions.tsx'
  ];

  for (const filePath of actionFiles) {
    const source = readProjectFile(filePath);
    assert.match(source, /NumberedHeroStep/, filePath);
    assert.doesNotMatch(source, /rounded-full bg-\[var\(--accent\)\]/, filePath);
  }
});

test('published content list sections do not expose the deprecated rowVariant API', () => {
  const sectionSource = readProjectFile('src/components/public/published-content-section.tsx');

  assert.doesNotMatch(sectionSource, /rowVariant/);
  assert.doesNotMatch(sectionSource, /export function PublishedContentSection\(/);
});

test('vacancy and supplier rows use an HH-like public card contract', () => {
  const opportunityRowSource = readProjectFile('src/components/public/published-content-row-opportunity.tsx');
  const directoryRowSource = readProjectFile('src/components/public/published-content-row-directory.tsx');
  const filtersSource = readProjectFile('src/components/public/public-filters-content.tsx');
  const sidebarVariantSource = readProjectFile('src/components/public/public-filters-variant-sidebar.tsx');
  const toolbarVariantSource = readProjectFile('src/components/public/public-filters-variant-toolbar.tsx');

  assert.match(opportunityRowSource, /function opportunityActions/);
  assert.match(opportunityRowSource, /function vacancyLead/);
  assert.match(directoryRowSource, /function directoryLead/);
  assert.match(directoryRowSource, /Связаться/);
  assert.match(directoryRowSource, /Профиль/);
  assert.doesNotMatch(opportunityRowSource, /label: 'Откликнуться'/);
  assert.match(`${opportunityRowSource}\n${directoryRowSource}`, /public-list-row-shell-hh/);
  assert.match(`${opportunityRowSource}\n${directoryRowSource}`, /public-list-row-actions/);
  assert.match(`${opportunityRowSource}\n${directoryRowSource}`, /public-list-row-primary-action/);
  assert.match(filtersSource, /const defaultCollapsed = defaultCollapsedProp \?\? \(resolvedVariant === 'sidebar'\)/);
  assert.match(filtersSource, /useState\(defaultCollapsed\)/);
  assert.match(sidebarVariantSource, /areSidebarFieldsCollapsed \? expandLabel : collapseLabel/);
  assert.match(sidebarVariantSource, /whitespace-nowrap/);
  assert.match(toolbarVariantSource, /toolbar-search-row/);
  assert.doesNotMatch(sidebarVariantSource, />Показать</);
});

test('public listing accent hierarchy uses shared markers, tracking tokens and stable lead numbers', () => {
  const opportunityRowSource = readProjectFile('src/components/public/published-content-row-opportunity.tsx');
  const directoryRowSource = readProjectFile('src/components/public/published-content-row-directory.tsx');
  const articleCardSource = readProjectFile('src/components/public/article-grid-card.tsx');
  const publicUiSource = readProjectFile('src/components/public/public-prelaunch-section.tsx');
  const tokensSource = readProjectFile('src/app/styles/tokens.css');

  assert.match(tokensSource, /--tracking-eyebrow-md: 0\.16em;/);
  assert.match(tokensSource, /--tracking-eyebrow-sm: 0\.08em;/);
  assert.match(tokensSource, /--tracking-marker: 0\.12em;/);

  assert.match(opportunityRowSource, /tabular-nums text-\[1\.35rem\] font-semibold text-\[var\(--accent\)\]/);
  assert.match(directoryRowSource, /tabular-nums text-\[1\.35rem\] font-semibold text-\[var\(--accent\)\]/);
  assert.match(`${opportunityRowSource}\n${directoryRowSource}`, /AvatarFallback/);
  assert.match(`${opportunityRowSource}\n${directoryRowSource}\n${articleCardSource}`, /HighlightChip/);
  assert.doesNotMatch(`${opportunityRowSource}\n${directoryRowSource}`, /bg-\[var\(--warning-bg\)\].*tracking-\[0\.12em\]/);
  assert.match(`${opportunityRowSource}\n${directoryRowSource}`, /tracking-\[var\(--tracking-eyebrow-sm\)\]/);
  assert.doesNotMatch(`${opportunityRowSource}\n${directoryRowSource}\n${articleCardSource}\n${publicUiSource}`, /tracking-\[(?:0\.06|0\.07|0\.08|0\.1|0\.11|0\.12|0\.13|0\.14|0\.16|0\.18)em\]/);
  assert.match(directoryRowSource, /const priority =/);
  assert.doesNotMatch(directoryRowSource, /\.slice\(0, 3\)/);
});

test('public visible copy avoids internal vague labels', () => {
  const source = [
    'src/components/public/editorial-public-page.tsx',
    'src/components/public/public-content-detail-page.tsx',
    'src/components/public/public-content-detail-page-helpers.ts',
    'src/components/public/published-content-row-default.tsx',
    'src/app/(public)/search/page.tsx',
    'src/components/public/public-filters.tsx'
  ].map(readProjectFile).join('\n');

  assert.doesNotMatch(source, /Ключевые параметры/);
  assert.doesNotMatch(source, /Что здесь можно сделать/);
  assert.doesNotMatch(source, /BARSYNERGY \/ поставщики/);
  assert.doesNotMatch(source, /item\.label \?\? 'Запись'/);
  assert.match(source, /Параметры вакансии/);
  assert.match(source, /Направления/);
  assert.match(source, /Материал/);
});

test('article materials search preserves category filters and resets page', () => {
  const sectionSource = readProjectFile('src/components/public/article-grid-section.tsx');
  const utilsSource = readProjectFile('src/components/public/article-grid-utils.ts');

  assert.match(utilsSource, /export function listingHref\(/);
  assert.match(utilsSource, /params\.delete\('page'\)/);
  assert.match(sectionSource, /useSearchParams\(\)/);
  assert.match(sectionSource, /router\.push\(query \? `\$\{pathname\}\?\$\{query\}` : pathname, \{ scroll: false \}\)/);
  assert.match(sectionSource, /href=\{listingHref\(content, basePath, \{ category: null \}\)\}/);
  assert.match(sectionSource, /href=\{listingHref\(content, basePath, \{ category: cat\.slug \}\)\}/);
});
