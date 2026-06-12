import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('events page uses the same prelaunch section pattern as suppliers for true empty state', () => {
  const source = readProjectFile('src/app/(public)/events/page.tsx');

  assert.match(source, /const isPrelaunchEmpty = isEmpty && !hasActiveSearch/);
  assert.match(source, /<PublicPrelaunchSection/);
  assert.match(source, /title="Какие события можно добавить"/);
  assert.match(source, /Каппинги и дегустации/);
  assert.match(source, /Чемпионаты и конкурсы/);
  assert.match(source, /Лекции и мастер-классы/);
  assert.match(source, /label: 'Добавить событие'/);
  assert.match(source, /label: 'Связаться с нами', variant: 'secondary'/);
  assert.doesNotMatch(source, /Первые события готовятся к публикации/);
});
