import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('page hero suppresses duplicate single-level breadcrumbs and eyebrow-title repeats', () => {
  const source = readProjectFile('src/components/public/page-hero/page-hero.tsx');
  const contactsSource = readProjectFile('src/app/(public)/contacts/page.tsx');

  assert.match(source, /function normalizeHeroText/);
  assert.match(source, /const shouldRenderBreadcrumbs = breadcrumbs\.length > 0 && !\(breadcrumbs\.length === 1 && normalizedLastBreadcrumbLabel === normalizedTitle\)/);
  assert.match(source, /const shouldRenderEyebrow = Boolean\(eyebrow\) && normalizedEyebrow !== normalizedTitle/);
  assert.match(source, /{shouldRenderBreadcrumbs \? \(/);
  assert.match(source, /{shouldRenderEyebrow \? \(/);
  assert.match(contactsSource, /breadcrumbs=\{\[\{ label: 'Контакты' \}\]\}/);
  assert.match(contactsSource, /eyebrow="Контакты"/);
  assert.match(contactsSource, /title="Связь с командой BARSYNERGY"/);
});
