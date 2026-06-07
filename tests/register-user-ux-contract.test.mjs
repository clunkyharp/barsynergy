import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('register user action preserves flash values and uses a dedicated account-check flow', () => {
  const source = readProjectFile('src/app/auth/register/actions.ts');

  assert.match(source, /REGISTER_USER_FLASH_COOKIE/);
  assert.match(source, /setRegisterUserFlashCookie/);
  assert.match(source, /getRegisterUserFlash/);
  assert.match(source, /redirectForExistingUserRegistration/);
  assert.match(source, /code: 'account-check'/);
  assert.match(source, /sendUserVerificationEmail/);
});

test('register user page reads flash defaults and shows actionable account-check guidance', () => {
  const source = readProjectFile('src/app/auth/register/user/page.tsx');

  assert.match(source, /cookies\(\)/);
  assert.match(source, /REGISTER_USER_FLASH_COOKIE/);
  assert.match(source, /account-check/);
  assert.match(source, /Письмо для подтверждения отправлено повторно|письмо для подтверждения отправлено повторно/i);
  assert.match(source, /Попробовать вход/);
  assert.match(source, /Восстановить доступ/);
  assert.match(source, /defaults=\{storedDefaults \?\? undefined\}/);
});

test('register user form accepts server-provided defaults for fullName and email', () => {
  const source = readProjectFile('src/components/public/register-user-form.tsx');

  assert.match(source, /defaults\?:/);
  assert.match(source, /defaultValue=\{defaults\?\.fullName \?\? ''\}/);
  assert.match(source, /defaultValue=\{defaults\?\.email \?\? ''\}/);
});
