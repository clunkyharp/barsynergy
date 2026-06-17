import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('homepage hero exposes audience routing and a no-data fallback strip', () => {
  const source = readProjectFile('src/components/public/homepage-hero.tsx');

  assert.match(source, /Выберите свою роль/);
  assert.match(source, /Я специалист/);
  assert.match(source, /Смотреть вакансии/);
  assert.match(source, /Создать профиль/);
  assert.match(source, /У меня компания/);
  assert.match(source, /Открыть для бизнеса/);
  assert.match(source, /Открыть для бизнеса/);
  assert.match(source, /const fallbackTrustMarkers = \[/);
  assert.match(source, /Что уже есть на платформе/);
  assert.match(source, /if \(statItems\.length < 2\)/);
  assert.doesNotMatch(source, /item\.value >= 10/);
});
