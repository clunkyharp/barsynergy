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
  const filterStart = articlesPage.indexOf('<PublicFilters');
  const latestStart = articlesPage.indexOf('<PublishedContentSection');
  const sectionStart = articlesPage.indexOf('filters={filters}');

  assert.ok(filterStart > -1);
  assert.ok(latestStart > filterStart);
  assert.ok(sectionStart > latestStart);
  assert.match(articlesPage, /placeholder="Название, тема или описание\.\.\."/);
  assert.match(articlesPage, /categoryAllLabel="Все темы"/);
  assert.match(articlesPage, /embedded/);
  assert.match(articlesPage, /filters=\{filters\}/);
  assert.match(articlesPage, /rowActionLabel="Читать материал"/);
  assert.doesNotMatch(articlesPage, /knowledgeTopics/);
  assert.doesNotMatch(articlesPage, /<FilterChip/);
  assert.doesNotMatch(articlesPage, /<Suspense/);
});

test('latest articles use the shared published content section', () => {
  const articlesPage = readProjectFile('src/app/(public)/articles/page.tsx');

  assert.match(articlesPage, /PublishedContentSection/);
  assert.match(articlesPage, /excludedItemIds=\{featuredItem \? \[featuredItem\.id\] : \[\]\}/);
  assert.match(articlesPage, /showSidebarTitle=\{false\}/);
  assert.match(articlesPage, /secondaryEmptyTitle="Других материалов пока нет"/);
  assert.doesNotMatch(articlesPage, /function ArticleGridSection/);
  assert.doesNotMatch(articlesPage, /function ArticleEmptyResults/);
  assert.doesNotMatch(articlesPage, /md:min-h-\[220px\]/);
});
