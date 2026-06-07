import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';
import { readGlobalStyles } from './helpers/global-styles.mjs';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('shared public detail page exposes type-specific labels and stable runtime hooks', () => {
  const componentSource = readProjectFile('src/components/public/public-content-detail-page.tsx');
  const cssSource = readGlobalStyles();

  assert.match(componentSource, /type DetailKind = 'article' \| 'event' \| 'course' \| 'vacancy' \| 'supplier' \| 'partner'/);
  assert.match(componentSource, /data-detail-kind=\{detailKind\}/);
  assert.match(componentSource, /Текст материала/);
  assert.match(componentSource, /Программа обучения/);
  assert.match(componentSource, /Профиль компании/);
  assert.match(componentSource, /Параметры вакансии/);
  assert.doesNotMatch(componentSource, />Метки</);
  assert.doesNotMatch(componentSource, /justify-between gap-3 border-b border-\[var\(--line\)\] pb-5/);
  assert.match(componentSource, /<Panel className="mt-5 overflow-hidden border-\[var\(--border-default\)\] bg-\[var\(--surface\)\] p-0 md:mt-6"/);
  assert.match(cssSource, /\.public-detail-page/);
  assert.match(cssSource, /@media \(max-width: 360px\)/);
});

test('public detail data builders provide type-specific section blocks', () => {
  const source = readProjectFile('src/lib/public/content-details.ts');

  for (const title of [
    'В материале',
    'Параметры программы',
    'Условия',
    'Профиль поставщика',
    'Формат партнёрства'
  ]) {
    assert.match(source, new RegExp(title));
  }

  assert.match(source, /Контакт для отклика/);
  assert.match(source, /Следующий шаг/);
  assert.ok(source.includes('sections: ['));
});

test('public detail routes pass type-specific sections into the shared template', () => {
  const routeFiles = [
    'src/app/(public)/articles/[slug]/page.tsx',
    'src/app/(public)/education/[slug]/page.tsx',
    'src/app/(public)/vacancies/[slug]/page.tsx',
    'src/app/(public)/suppliers/[slug]/page.tsx',
    'src/app/(public)/partners/[slug]/page.tsx'
  ];

  for (const file of routeFiles) {
    assert.match(readProjectFile(file), /sections=\{[a-z]+\.sections\}/, file);
  }
});

test('nested muted public rows keep visible separation in dark zones', () => {
  const primitiveSource = readProjectFile('src/components/public/editorial-display-primitives.tsx');
  const cardSource = readProjectFile('src/components/public/public-card-patterns.tsx');

  assert.match(primitiveSource, /border border-\[var\(--border-subtle\)\].*bg-\[var\(--surface-card-muted\)\]/);
  assert.match(cardSource, /border border-\[var\(--border-subtle\)\].*bg-\[var\(--surface-card-muted\)\]/);
});
