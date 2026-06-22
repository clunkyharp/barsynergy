import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readSrc(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('Sprint A [2] hero stats use the display size with tabular numbers', () => {
  const source = readSrc('src/components/public/homepage-hero.tsx');

  assert.match(source, /text-\[1\.75rem\]/, 'stat numbers must use the 1.75rem display size');
  assert.match(source, /tabular-nums/, 'stat numbers must use tabular-nums');
  assert.doesNotMatch(source, /text-\[1\.55rem\]/, 'old undersized 1.55rem token must be removed');
  assert.doesNotMatch(source, /border-r/, 'vertical separator borders must be replaced with horizontal gap');
});

test('Sprint A [6] OpportunityListRow vacancy lead drops the ЗАРПЛАТА prefix label', () => {
  const source = readSrc('src/components/public/published-content-row-opportunity.tsx');

  const leadBlock = source.slice(source.indexOf('function vacancyLead'), source.indexOf('function opportunityDescription'));

  assert.doesNotMatch(leadBlock, /Зарплата/i, 'lead must not render the "Зарплата" prefix label');
  assert.doesNotMatch(leadBlock, /uppercase tracking-widest/, 'old uppercase prefix styling must be gone');
});

test('Sprint A [5p] OpportunityListRow is a fully clickable card linking to the detail page', () => {
  const source = readSrc('src/components/public/published-content-row-opportunity.tsx');

  // Redesign: the whole row is a link (title AppLink with an inset ::after
  // overlay) instead of a separate primary CTA button.
  assert.match(source, /<AppLink/, 'row title must be an AppLink to the detail page');
  assert.match(source, /href=\{detailHref\(basePath, item\.slug\)\}/, 'link must target the detail href');
  assert.match(source, /after:absolute after:inset-0/, 'card must expose a full-card click overlay');
});

test('Sprint A [4] profile page collapses salary/employment/visibility into one panel', () => {
  const source = readSrc('src/app/profile/page.tsx');
  const conditionsBlock = source.slice(source.indexOf('Условия поиска'), source.indexOf("profile?.profileSkills"));

  assert.doesNotMatch(conditionsBlock, /md:grid-cols-3/, 'three-column salary/format/visibility grid must be gone');
  assert.match(source, /Условия поиска/, 'merged panel must use a single explicit heading');
  assert.match(
    conditionsBlock,
    /Желаемая зарплата[\s\S]*?Формат/,
    'salary and employment values must appear inside the same merged block'
  );
  assert.doesNotMatch(conditionsBlock, /Видимость:/, 'visibility-only state must not make the search conditions panel appear');
});

test('Sprint A [8] article card covers use balanced fixed heights, not banner aspect ratios', () => {
  const source = readSrc('src/components/public/article-grid-card.tsx');

  // Redesign: covers use cover-fit fixed heights instead of aspect-ratio banners.
  assert.match(source, /bg-cover bg-center/, 'covers must use cover-fit background images');
  assert.match(source, /h-\[180px\]/, 'default card cover must use the 180px height');
  assert.match(source, /min-h-\[220px\]/, 'featured card cover must use the taller min height');
  assert.doesNotMatch(source, /aspect-\[3\/1\]/, 'old 3:1 aspect ratio must be removed');
  assert.doesNotMatch(source, /aspect-\[4\/1\]/, 'old 4:1 aspect ratio must be removed');
  assert.doesNotMatch(source, /aspect-\[6\/1\]/, 'old 6:1 featured aspect ratio must be removed');
});

test('Sprint A [7p] DirectoryListRow logo is visible on mobile', () => {
  const source = readSrc('src/components/public/published-content-row-directory.tsx');

  const mediaStart = source.indexOf('const media =');
  const mediaEnd = source.indexOf('return (', mediaStart);
  const mediaBlock = source.slice(mediaStart, mediaEnd);

  assert.doesNotMatch(mediaBlock, /hidden sm:block/, 'logo container must not be hidden on mobile');
});
