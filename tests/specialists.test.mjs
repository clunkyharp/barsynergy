import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('GET /specialists — renders unified specialist page with mode tabs', () => {
  const source = readProjectFile('src/app/(public)/specialists/page.tsx');

  assert.match(source, /import.*SpecialistModeTabs/);
  assert.match(source, /mode.*job.*services.*teams/);
  assert.match(source, /getPublishedSpecialists/);
  assert.match(source, /mode.*seeking/);
  assert.match(source, /mode.*offering/);
  assert.match(source, /entityType.*INDIVIDUAL/);
  assert.match(source, /entityType.*BUSINESS/);
  assert.match(source, /PublishedContentSectionSpecialist/);
  assert.doesNotMatch(source, /redirect\('\/vacancies/);
});

test('GET /vacancies?view=specialists — redirects to /specialists?mode=job', () => {
  const source = readProjectFile('src/app/(public)/vacancies/page.tsx');

  assert.match(source, /view === 'specialists'/);
  assert.match(source, /redirect\('\/specialists\?mode=job'\)/);
});

test('GET /specialists/cv/[handle] — returns 200 for published profile and 404 for missing', () => {
  const source = readProjectFile('src/app/(public)/specialists/cv/[handle]/page.tsx');

  assert.match(source, /import.*notFound.*from 'next\/navigation'/);
  assert.match(source, /getPublishedResumeDetail\(handle\)/);
  assert.match(source, /if\s*\(!resume\)/);
  assert.match(source, /notFound\(\)/);
});

test('GET /specialists/svc/[slug] — permanent redirects to /masters/[slug]', () => {
  const source = readProjectFile('src/app/(public)/specialists/svc/[slug]/page.tsx');

  assert.match(source, /import.*permanentRedirect.*from 'next\/navigation'/);
  assert.match(source, /permanentRedirect\(`\/masters\/\$\{slug\}`\)/);
});

test('getPublishedSpecialists returns unified results with mode field', () => {
  const specialistsSource = readProjectFile('src/lib/public/content/specialists.ts');

  assert.match(specialistsSource, /mode:\s*'seeking'/);
  assert.match(specialistsSource, /mode:\s*'offering'/);
  assert.match(specialistsSource, /...seekingProfiles\.map\(seekingToCard\)/);
  assert.match(specialistsSource, /...offeringProfiles\.map\(offeringToCard\)/);
  assert.match(specialistsSource, /SpecialistCardItem/);
  assert.match(specialistsSource, /detailUrl: `\/specialists\/cv\/\$\{profile\.publicHandle!\}`/);
  assert.match(specialistsSource, /detailUrl: `\/masters\/\$\{master\.slug\}`/);

  const cardType = /mode: SpecialistMode;/;
  assert.match(specialistsSource, cardType);
});

test('sitemap includes both cv and svc specialist entries', () => {
  const sitemapSource = readProjectFile('src/app/sitemap.ts');

  assert.match(sitemapSource, /\/specialists\/cv\/\$\{record\.publicHandle\}/);
  assert.match(sitemapSource, /basePath: '\/specialists\/svc'/);
});
