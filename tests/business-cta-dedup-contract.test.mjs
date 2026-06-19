import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('business page keeps a single jump-to-form CTA in the upper sections', () => {
  const source = readProjectFile('src/app/(public)/business/page.tsx');

  assert.equal((source.match(/Перейти к форме/g) ?? []).length, 1);
  assert.doesNotMatch(source, /label: 'Заполнить заявку'/);
  assert.match(source, /label: 'Смотреть поставщиков'/);
});
