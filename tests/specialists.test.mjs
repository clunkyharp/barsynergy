import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('GET /vacancies?view=specialists — page renders specialist list section', () => {
  const source = readProjectFile('src/app/(public)/vacancies/page.tsx');

  assert.match(source, /view === 'specialists'/);
  assert.match(source, /getPublishedSpecialists\(contentParams\)/);
  assert.match(source, /SpecialistListSection/);
  assert.doesNotMatch(source, /notFound\(\)/);
});

test('GET /specialists — redirects 301 to /vacancies?view=specialists', () => {
  const source = readProjectFile('src/app/(public)/specialists/page.tsx');

  assert.match(source, /import.*redirect.*from 'next\/navigation'/);
  assert.match(source, /redirect\('\/vacancies\?view=specialists'\)/);
});

test('GET /specialists/cv/[handle] — returns 200 for published profile and 404 for missing', () => {
  const source = readProjectFile('src/app/(public)/specialists/cv/[handle]/page.tsx');

  assert.match(source, /import.*notFound.*from 'next\/navigation'/);
  assert.match(source, /getPublishedResumeDetail\(handle\)/);
  assert.match(source, /if\s*\(!resume\)/);
  assert.match(source, /notFound\(\)/);
});

test('GET /specialists/svc/[slug] — returns 200 for published master and 404 for missing', () => {
  const source = readProjectFile('src/app/(public)/specialists/svc/[slug]/page.tsx');

  assert.match(source, /import.*notFound.*from 'next\/navigation'/);
  assert.match(source, /getPublishedMasterDetail\(slug\)/);
  assert.match(source, /if\s*\(!master\)/);
  assert.match(source, /notFound\(\)/);
});

test('getPublishedSpecialists returns unified results with mode field', () => {
  const specialistsSource = readProjectFile('src/lib/public/content/specialists.ts');

  assert.match(specialistsSource, /mode:\s*'seeking'/);
  assert.match(specialistsSource, /mode:\s*'offering'/);
  assert.match(specialistsSource, /...seekingProfiles\.map\(seekingToCard\)/);
  assert.match(specialistsSource, /...offeringProfiles\.map\(offeringToCard\)/);
  assert.match(specialistsSource, /SpecialistCardItem/);
  assert.match(specialistsSource, /detailUrl: `\/specialists\/cv\/\$\{profile\.publicHandle!\}`/);
  assert.match(specialistsSource, /detailUrl: `\/specialists\/svc\/\$\{master\.slug\}`/);

  const cardType = /mode: SpecialistMode;/;
  assert.match(specialistsSource, cardType);
});

test('sitemap includes both cv and svc specialist entries', () => {
  const sitemapSource = readProjectFile('src/app/sitemap.ts');

  assert.match(sitemapSource, /\/specialists\/cv\/\$\{record\.publicHandle\}/);
  assert.match(sitemapSource, /basePath: '\/specialists\/svc'/);
});
