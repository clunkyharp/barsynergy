import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readSrc(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('Sprint A [2] hero stats use the larger display size with tabular numbers', () => {
  const source = readSrc('src/components/public/homepage-hero.tsx');

  const heroBlock = source.slice(source.indexOf('function HomeStatsLine'), source.indexOf('export function HomeHeroRouter'));

  assert.match(heroBlock, /text-\[2\.4rem\]/, 'stat numbers must scale up to 2.4rem on mobile');
  assert.match(heroBlock, /md:text-\[3rem\]/, 'stat numbers must scale to 3rem on desktop');
  assert.match(heroBlock, /tabular-nums/, 'stat numbers must use tabular-nums');
  assert.doesNotMatch(heroBlock, /text-\[1\.55rem\]/, 'old undersized 1.55rem token must be removed');
  assert.doesNotMatch(heroBlock, /border-r/, 'vertical separator borders must be replaced with horizontal gap');
});

test('Sprint A [6] OpportunityListRow vacancy lead drops the ЗАРПЛАТА prefix label', () => {
  const source = readSrc('src/components/public/published-content-row-opportunity.tsx');

  const leadBlock = source.slice(source.indexOf('function vacancyLead'), source.indexOf('function opportunityDescription'));

  assert.doesNotMatch(leadBlock, /Зарплата/i, 'lead must not render the "Зарплата" prefix label');
  assert.doesNotMatch(leadBlock, /uppercase tracking-widest/, 'old uppercase prefix styling must be gone');
});

test('Sprint A [5p] OpportunityListRow exposes an actionLabel prop wired to the primary button', () => {
  const source = readSrc('src/components/public/published-content-row-opportunity.tsx');
  const section = readSrc('src/components/public/published-content-section.tsx');

  assert.match(source, /actionLabel\?:\s*string/, 'OpportunityListRow must accept actionLabel');
  assert.match(source, /ArrowUpRight/, 'primary CTA must include an ArrowUpRight icon');
  assert.match(
    section,
    /OpportunityListRow[^<]*\n[\s\S]*?actionLabel=\{props\.rowActionLabel/,
    'PublishedContentSectionOpportunity must forward rowActionLabel'
  );
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

test('Sprint A [8] article card uses 16:9 default and 21:9 featured aspect ratios', () => {
  const source = readSrc('src/components/public/article-grid-card.tsx');

  assert.match(source, /aspect-\[16\/9\]/, 'default card cover must use 16:9');
  assert.match(source, /aspect-\[21\/9\]/, 'featured card cover must use 21:9');
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
