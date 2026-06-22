import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

const readProjectFile = (path) => readFileSync(join(repoRoot, path), 'utf8');

const removedArticleDetailLinks = [
  '/articles/how-to-calculate-drink-cost',
  '/articles/what-to-include-in-vacancy',
  '/articles/how-to-choose-supplier',
  '/articles/how-to-prepare-guest-shift',
  '/articles/skfo-bar-industry-map'
];

test('articles index does not render hardcoded starter cards', () => {
  const articlesPage = readProjectFile('src/app/(public)/articles/page.tsx');

  for (const href of removedArticleDetailLinks) {
    assert.doesNotMatch(articlesPage, new RegExp(href));
  }

  assert.doesNotMatch(articlesPage, /starterReadingQueueItems/);
  assert.doesNotMatch(articlesPage, /KnowledgeStarterSection/);
  assert.doesNotMatch(articlesPage, /Стартовые материалы/);
});

test('articles index passes sidebar filters into the latest publications section', () => {
  const articlesPage = readProjectFile('src/app/(public)/articles/page.tsx');
  const articleGridSection = readProjectFile('src/components/public/article-grid-section.tsx');

  assert.match(articlesPage, /<ArticleGridSection/);
  assert.match(articlesPage, /featuredItem=\{featuredItem\}/);
  assert.match(articleGridSection, /CategoryPill/);
  assert.match(articleGridSection, /listingHref\(content, basePath, \{ category: null \}\)/);
  assert.match(articleGridSection, /listingHref\(content, basePath, \{ category: cat\.slug \}\)/);
  assert.match(articleGridSection, /Предложить тему/);
  assert.doesNotMatch(articlesPage, /knowledgeTopics/);
  assert.doesNotMatch(articlesPage, /<FilterChip/);
  assert.doesNotMatch(articleGridSection, /<PublicFilters/);
});

test('latest articles use the shared published content section', () => {
  const articlesPage = readProjectFile('src/app/(public)/articles/page.tsx');
  const articleGridSection = readProjectFile('src/components/public/article-grid-section.tsx');

  assert.match(articlesPage, /ArticleGridSection/);
  assert.match(articleGridSection, /const visibleItems = featuredItem/);
  assert.match(articleGridSection, /ArticleFeaturedCard/);
  assert.match(articleGridSection, /ArticleCard/);
  assert.match(articleGridSection, /ArticleListItem/);
  // Redesign: paginated list via numbered ListPagination instead of a load-more button.
  assert.match(articleGridSection, /function ListPagination/);
  assert.doesNotMatch(articlesPage, /PublishedContentSection/);
  assert.doesNotMatch(articleGridSection, /function ArticleEmptyResults/);
  assert.doesNotMatch(articleGridSection, /md:min-h-\[220px\]/);
});

test('articles index renders rubric-led discovery before the compact all-materials list', () => {
  const articlesPage = readProjectFile('src/app/(public)/articles/page.tsx');
  const articleGridSection = readProjectFile('src/components/public/article-grid-section.tsx');

  assert.match(articlesPage, /rubricSections=\{rubricSections\}/);
  assert.match(articlesPage, /getPublishedArticles\(\{ category: rubric\.slug, pageSize: '3'/);
  assert.match(articlesPage, /excludeId: excludedArticleIds/);
  assert.match(articleGridSection, /type ArticleRubricSection/);
  assert.match(articleGridSection, /Все в рубрике/);
  assert.match(articleGridSection, /Рубрики/);
  assert.match(articleGridSection, /Все материалы/);
});
