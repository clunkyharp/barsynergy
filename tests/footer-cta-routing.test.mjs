import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('site footer maps CTA copy to page intent instead of one generic company promo', () => {
  const source = readProjectFile('src/components/layout/site-footer.tsx');

  assert.match(source, /const footerCtaConfig: FooterCtaConfig \| null = \(\(\) => \{/);
  assert.match(source, /pathname\.startsWith\('\/vacancies'\)/);
  assert.match(source, /Разместить вакансию/);
  assert.match(source, /pathname\.startsWith\('\/suppliers'\)/);
  assert.match(source, /Добавьте компанию в профильный каталог/);
  assert.match(source, /pathname\.startsWith\('\/events'\)/);
  assert.match(source, /Предложить событие/);
  assert.match(source, /pathname\.startsWith\('\/education'\)/);
  assert.match(source, /Описать задачу обучения/);
  assert.match(source, /pathname === '\/' \|\| pathname\.startsWith\('\/articles'\) \|\| pathname\.startsWith\('\/search'\)/);
  assert.doesNotMatch(source, /const showFooterCta =/);
});
