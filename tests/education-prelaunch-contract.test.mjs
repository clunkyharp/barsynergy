import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('education page uses the shared prelaunch section instead of a plain empty note', () => {
  const source = readProjectFile('src/app/(public)/education/page.tsx');

  assert.match(source, /import \{ PublicPrelaunchSection \} from '@\/components\/public\/public-prelaunch-section'/);
  assert.match(source, /<PublicPrelaunchSection/);
  assert.match(source, /title="Какие программы можно добавить"/);
  assert.match(source, /Интенсивы и мастер-классы/);
  assert.match(source, /Корпоративное обучение/);
  assert.match(source, /Онлайн и долгие программы/);
  assert.match(source, /label: 'Предложить программу'/);
  assert.doesNotMatch(source, /Конкретные программы с датами и записью скоро появятся/);
});
