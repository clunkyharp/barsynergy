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

  assert.match(source, /function redirectWithPasswordResetConfirmResult/);
  assert.match(source, /url\.searchParams\.set\('token', token\)/);
  assert.match(source, /redirectWithPasswordResetConfirmResult\(token, \{ type: 'error', code: 'invalid' \}\)/);
  assert.match(source, /redirectWithPasswordResetConfirmResult\(parsed\.data\.token, \{ type: 'error', code: 'failed' \}\)/);
  assert.match(source, /redirectWithAuthResult\('\/auth\/login', \{ type: 'success', code: 'password-reset' \}\)/);
});

test('password reset request action surfaces rate limit separately from generic failure', () => {
  const actionsSource = readProjectFile('src/app/auth/password-reset/actions.ts');
  const pageSource = readProjectFile('src/app/auth/password-reset/page.tsx');

  assert.match(actionsSource, /AuthRateLimitError/);
  assert.match(actionsSource, /let requestAccepted = false/);
  assert.match(actionsSource, /requestAccepted = true/);
  assert.match(actionsSource, /redirectWithAuthResult\('\/auth\/password-reset', \{ type: 'error', code: 'rate-limited' \}\)/);
  assert.match(actionsSource, /if \(requestAccepted\) \{\s*redirectWithAuthResult\('\/auth\/password-reset', \{ type: 'success', code: 'reset-sent' \}\)/);
  assert.match(pageSource, /'rate-limited': 'Слишком много попыток за короткое время\. Повторите позже\.'/);
});
