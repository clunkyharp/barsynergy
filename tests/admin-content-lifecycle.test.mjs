import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

const lifecycleActionFiles = [
  'src/app/admin/articles/actions.ts',
  'src/app/admin/events/actions.ts',
  'src/app/admin/courses/actions.ts',
  'src/app/admin/vacancies/actions.ts',
  'src/app/admin/suppliers/actions.ts',
  'src/app/admin/partners/actions.ts',
  'src/app/admin/general-sponsors/actions.ts'
];

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('admin content lifecycle helper owns shared status and draft-delete transactions', () => {
  const source = readProjectFile('src/lib/admin/content-lifecycle.ts');

  assert.match(source, /export async function updateContentStatus/);
  assert.match(source, /export async function deleteContentDraft/);
  assert.match(source, /prisma\.\$transaction/);
  assert.match(source, /statusTransitionDates\(status, current\.publishedAt\)/);
  assert.match(source, /deletion\.count !== 1/);
  assert.doesNotMatch(source, /prisma\[[^\]]+\]/);
});

test('admin content actions use the shared lifecycle helper for repeated mutations', () => {
  for (const file of lifecycleActionFiles) {
    const source = readProjectFile(file);

    assert.match(source, /deleteContentDraft, updateContentStatus/, `${file} should import both lifecycle helpers`);
    assert.match(source, /await updateContentStatus\(\{/, `${file} should delegate status transitions`);
    assert.match(source, /await deleteContentDraft\(\{/, `${file} should delegate draft delete transaction checks`);
    assert.match(source, /deleteDraft: \(tx\) =>[\s\S]*deleteMany\(\{[\s\S]*status: ContentStatus\.DRAFT/, `${file} should keep draft-only delete filter`);
  }
});
