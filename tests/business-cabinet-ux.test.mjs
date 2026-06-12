import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('business activation redirects into a welcome-guided cabinet flow', () => {
  const actionSource = readProjectFile('src/app/auth/business-activation/actions.ts');
  const pageSource = readProjectFile('src/app/(business-workspace)/business/cabinet/page.tsx');
  const componentSource = readProjectFile('src/components/business/business-cabinet.tsx');

  assert.match(actionSource, /\/business\/cabinet\?welcome=1&success=/);
  assert.match(pageSource, /const isWelcome =/);
  assert.match(pageSource, /Добро пожаловать в кабинет компании/);
  assert.match(pageSource, /Заполнить профиль/);
  assert.match(pageSource, /Создать заявку/);
  assert.match(pageSource, /Проверить отклики/);
  assert.match(pageSource, /id="business-profile"/);
  assert.match(componentSource, /emptyAction\?:/);
  assert.match(pageSource, /Создать первую заявку/);
});
