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
  assert.match(source, /SearchResultsSection/);
  assert.match(source, /basePath: '\/vacancies'/);
  assert.match(source, /basePath: '\/suppliers'/);
  assert.match(source, /basePath: '\/articles'/);
  assert.match(source, /basePath: '\/education'/);
  assert.match(source, /basePath: '\/events'/);
  assert.match(source, /section\.content\.total > 0/);
});

test('homepage avoids hardcoded live stats and sponsor descriptions', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');
  const statsStart = source.indexOf('function HomeStatsLine');
  const statsEnd = source.indexOf('function HomeHeroRouter');
  const statsSource = source.slice(statsStart, statsEnd);

  assert.match(statsSource, /value: stats\.vacancies/);
  assert.match(statsSource, /value: stats\.suppliers/);
  assert.match(statsSource, /value: stats\.articles/);
  assert.doesNotMatch(statsSource, /stats\.vacancies \|\| 2/);
  assert.doesNotMatch(statsSource, /stats\.suppliers \|\| 3/);
  assert.doesNotMatch(statsSource, /stats\.articles \|\| 5/);
  assert.doesNotMatch(source, /sponsorDescriptions/);
  assert.doesNotMatch(source, /Hustle Brew':/);
  assert.doesNotMatch(source, /Gelabo:/);
});

test('public listing pages share headers, filters and pagination primitives', () => {
  const articlesSource = readProjectFile('src/app/(public)/articles/page.tsx');
  const vacanciesSource = readProjectFile('src/app/(public)/vacancies/page.tsx');
  const eventsSource = readProjectFile('src/app/(public)/events/page.tsx');
  const educationSource = readProjectFile('src/app/(public)/education/page.tsx');

  assert.match(articlesSource, /PublishedContentSection/);
  assert.doesNotMatch(articlesSource, /function ArticleGridSection/);
  assert.doesNotMatch(articlesSource, /canonicalArticleSearchParams/);
  assert.doesNotMatch(articlesSource, /redirect\(/);

  assert.match(vacanciesSource, /<EditorialPublicPage/);
  assert.doesNotMatch(vacanciesSource, /<PublicDisplayTitle/);

  assert.match(eventsSource, /<EditorialPublicPage/);
  assert.match(eventsSource, /eyebrow="События"/);
  assert.match(eventsSource, /contextItems=\{selectedPeriod \? \[\] : \[\{ label: 'Дата', value: 'Предстоящие' \}\]\}/);
  assert.doesNotMatch(eventsSource, /<PublicDisplayTitle/);

  assert.match(articlesSource, /variant="sidebar"/);
  assert.match(eventsSource, /variant="sidebar"/);
  assert.match(educationSource, /variant="sidebar"/);
  assert.doesNotMatch(articlesSource, /variant="toolbar"/);
  assert.doesNotMatch(eventsSource, /variant="toolbar"/);
  assert.doesNotMatch(educationSource, /variant="toolbar"/);
  assert.match(educationSource, /const featuredItem = !hasActiveFilters && content\.page === 1 \? content\.items\[0\] : undefined/);
});

test('vacancy and supplier rows use an HH-like public card contract', () => {
  const sectionSource = readProjectFile('src/components/public/published-content-section.tsx');
  const rowSource = readProjectFile('src/components/ui/editorial-list-row.tsx');
  const filtersSource = readProjectFile('src/components/public/public-filters.tsx');

  assert.match(sectionSource, /function buildOpportunityActions/);
  assert.match(sectionSource, /function buildVacancyLead/);
  assert.match(sectionSource, /function buildSupplierLead/);
  assert.match(sectionSource, /rowVariant === 'opportunity'/);
  assert.match(sectionSource, /rowVariant === 'directory'/);
  assert.match(sectionSource, /Подробнее/);
  assert.match(sectionSource, /Связаться/);
  assert.match(sectionSource, /Профиль/);
  assert.doesNotMatch(sectionSource, /label: 'Откликнуться'/);
  assert.match(rowSource, /public-list-row-shell-hh/);
  assert.match(rowSource, /public-list-row-actions/);
  assert.match(rowSource, /public-list-row-primary-action/);
  assert.match(filtersSource, /Показать параметры/);
  assert.match(filtersSource, /defaultCollapsed = resolvedVariant === 'sidebar'/);
  assert.match(filtersSource, /useState\(defaultCollapsed\)/);
  assert.match(filtersSource, /whitespace-nowrap/);
  assert.match(filtersSource, /toolbar-search-row/);
  assert.doesNotMatch(filtersSource, />Показать</);
});

test('public visible copy avoids internal vague labels', () => {
  const source = [
    'src/components/public/editorial-public-page.tsx',
    'src/components/public/public-content-detail-page.tsx',
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
