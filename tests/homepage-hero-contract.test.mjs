import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('homepage hero exposes stats and primary CTAs', () => {
  const source = readProjectFile('src/components/public/homepage-hero.tsx');

  assert.match(source, /Смотреть вакансии/);
  assert.match(source, /Для бизнеса/);
  assert.match(source, /export function HomeHeroRouter/);
  assert.match(source, /statItems\.length >= 2/);
});
