import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('password reset confirm action preserves token in error redirects and keeps success redirect outside catchable path', () => {
  const source = readProjectFile('src/app/auth/password-reset/actions.ts');

  assert.match(source, /export type PasswordResetConfirmResult = \{ type: 'error'; code: string \} \| null/);
  assert.match(source, /const token = getString\(formData, 'token'\)/);
  assert.match(source, /return \{ type: 'error', code: 'invalid' \}/);
  assert.match(source, /return \{ type: 'error', code: 'failed' \}/);
  assert.match(source, /redirect\('\/auth\/login\?success=password-reset'\)/);
});

test('password reset request action surfaces rate limit separately from generic failure', () => {
  const actionsSource = readProjectFile('src/app/auth/password-reset/actions.ts');
  const formSource = readProjectFile('src/app/auth/password-reset/_components/password-reset-forms.tsx');

  assert.match(actionsSource, /AuthRateLimitError/);
  assert.match(actionsSource, /return \{ type: 'error', code: 'rate-limited' \}/);
  assert.match(actionsSource, /return \{ type: 'success', code: 'reset-sent' \}/);
  assert.match(formSource, /'rate-limited': 'Слишком много попыток за короткое время\. Повторите позже\.'/);
});
