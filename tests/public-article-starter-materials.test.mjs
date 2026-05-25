import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

const readProjectFile = (path) => readFileSync(join(repoRoot, path), 'utf8');

const starterMaterials = [
  'how-to-calculate-drink-cost',
  'what-to-include-in-vacancy',
  'how-to-choose-supplier',
  'how-to-prepare-guest-shift',
  'skfo-bar-industry-map'
];

test('starter article cards point to seeded test materials', () => {
  const articlesPage = readProjectFile('src/app/(public)/articles/page.tsx');
  const demoSeed = readProjectFile('scripts/seed-demo-screens.mjs');

  for (const slug of starterMaterials) {
    assert.match(articlesPage, new RegExp(`href: '/articles/${slug}'`));
    assert.match(demoSeed, new RegExp(`slug: '${slug}'`));
  }

  assert.match(demoSeed, /status: ContentStatus\.PUBLISHED/);
  assert.match(demoSeed, /type: CategoryType\.ARTICLE/);
  assert.match(demoSeed, /Published test articles:/);
});

test('articles index exposes search before the latest publications list', () => {
  const articlesPage = readProjectFile('src/app/(public)/articles/page.tsx');
  const filterStart = articlesPage.indexOf('<PublicFilters');
  const latestStart = articlesPage.indexOf('<ArticleGridSection');

  assert.ok(filterStart > -1);
  assert.ok(latestStart > filterStart);
  assert.match(articlesPage, /placeholder="Название, тема или описание…"/);
  assert.match(articlesPage, /categoryAllLabel="Все темы"/);
  assert.doesNotMatch(articlesPage, /knowledgeTopics/);
  assert.doesNotMatch(articlesPage, /<FilterChip/);
});

test('latest article cards keep a compact editorial reference layout', () => {
  const articlesPage = readProjectFile('src/app/(public)/articles/page.tsx');
  const gridStart = articlesPage.indexOf('function ArticleGridSection');
  const gridEnd = articlesPage.indexOf('function ArticleEmptyResults');
  const gridSource = articlesPage.slice(gridStart, gridEnd);

  assert.match(gridSource, /md:grid md:gap-6/);
  assert.match(gridSource, /md:flex md:h-full md:flex-col/);
  assert.match(gridSource, /md:aspect-\[1\.55\/1\]/);
  assert.match(gridSource, /BARSYNERGY/);
  assert.match(gridSource, /Знания/);
  assert.match(gridSource, /md:line-clamp-3/);
  assert.match(gridSource, /md:mt-auto md:pt-5/);
  assert.doesNotMatch(gridSource, /md:min-h-\[220px\]/);
});
