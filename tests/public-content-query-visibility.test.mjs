import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

const publicQueryFiles = [
  'src/lib/public/content/articles.ts',
  'src/lib/public/content/education.ts',
  'src/lib/public/content/events.ts',
  'src/lib/public/content/suppliers.ts',
  'src/lib/public/content/partners.ts',
  'src/modules/content/vacancies/queries.ts'
];

test('public content queries re-apply published visibility when hydrating ids into records', () => {
  for (const file of publicQueryFiles) {
    const source = readProjectFile(file);

    assert.match(
      source,
      /where: \{ id: \{ in: ids \}, status: ContentStatus\.PUBLISHED \}/,
      `${file} should keep published-only visibility in the second findMany`
    );
  }
});
