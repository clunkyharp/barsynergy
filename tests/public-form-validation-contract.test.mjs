import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('public form validation does not show required-field errors on first blur', () => {
  const source = readProjectFile('src/components/public/public-form-validation.tsx');

  assert.match(source, /export function validatePublicForm\(form: HTMLFormElement/);
  assert.match(source, /form\.dataset\.publicValidationSubmitted = 'true';/);
  assert.match(source, /function hasSubmittedAttempt\(\)/);
  assert.match(source, /if \(!hasSubmittedAttempt\(\) && !event\.target\.dataset\.publicValidationActive\) \{\s*return;\s*\}/);
  assert.match(source, /function validateForm\(\) \{\s*return validatePublicForm\(formElement\);/);
});
