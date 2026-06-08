import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('register action persists email verification tokens through Prisma model helpers', () => {
  const source = readProjectFile('src/app/auth/register/actions.ts');

  assert.match(source, /userEmailVerificationToken\.updateMany/);
  assert.match(source, /userEmailVerificationToken\.create/);
  assert.doesNotMatch(source, /INSERT INTO "UserEmailVerificationToken"/);
});

test('verify-email resend persists email verification tokens through Prisma model helpers', () => {
  const source = readProjectFile('src/app/auth/verify-email/actions.ts');

  assert.match(source, /userEmailVerificationToken\.updateMany/);
  assert.match(source, /userEmailVerificationToken\.create/);
  assert.doesNotMatch(source, /INSERT INTO "UserEmailVerificationToken"/);
});

test('password reset flow uses the current Prisma token model name', () => {
  const source = readProjectFile('src/app/auth/password-reset/actions.ts');

  assert.match(source, /userPasswordResetToken\.create/);
  assert.match(source, /UPDATE "UserPasswordResetToken"/);
  assert.doesNotMatch(source, /INSERT INTO "PasswordResetToken"/);
  assert.doesNotMatch(source, /UPDATE "PasswordResetToken"/);
});
