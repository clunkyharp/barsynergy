import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('homepage replaces the platform link grid with live support cards', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');

  assert.match(source, /const liveSectionCards = \[data\.vacancy, data\.supplier, data\.event, data\.course, data\.article, materialsCard\]/);
  assert.match(source, /Что нового/);
  assert.match(source, /Разделы для работы/);
  assert.doesNotMatch(source, /Свежее на платформе/);
  assert.doesNotMatch(source, /Живые карточки из вакансий, поставщиков, событий, обучения и материалов/);
  assert.match(source, /<EditorialSupportCard/);
  assert.match(source, /liveSectionCards\.map\(\(card, index\) =>/);
  assert.doesNotMatch(source, /const platformTools = \[/);
  assert.doesNotMatch(source, /Разделы платформы/);
});
