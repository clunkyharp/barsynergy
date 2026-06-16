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

test('verify-email token consumption returns status before redirecting', () => {
  const source = readProjectFile('src/lib/auth/email-verification.ts');
  const actionFile = readProjectFile('src/app/auth/verify-email/actions.ts');
  const actionSource = actionFile.slice(
    actionFile.indexOf('export async function verifyUserEmailAction'),
    actionFile.indexOf('async function resendUserVerificationEmail')
  );

  assert.match(source, /export async function verifyUserEmailToken/);
  assert.match(source, /return result && result\.length > 0 \? 'verified' : 'invalid'/);
  assert.match(source, /\$\{'active'\}::"UserStatus"/);
  assert.match(source, /\$\{'pending'\}::"UserStatus"/);
  assert.match(actionFile, /import \{ verifyUserEmailToken \} from '@\/lib\/auth\/email-verification'/);
  assert.match(actionSource, /if \(result === 'verified'\)[\s\S]*redirectWithAuthResult\('\/auth\/login'/);
  assert.doesNotMatch(actionSource, /try \{/);
});

test('verify-email server action file exports only guarded actions', () => {
  const source = readProjectFile('src/app/auth/verify-email/actions.ts');
  const actionSource = source.slice(
    source.indexOf('export async function verifyUserEmailAction')
  );

  assert.doesNotMatch(source, /export async function verifyUserEmailToken/);
  assert.match(actionSource, /await assertSameOriginServerAction\(\)/);
});

test('verify-email resend redirects outside the mailer try/catch path', () => {
  const source = readProjectFile('src/app/auth/verify-email/actions.ts');
  const actionSource = source.slice(source.indexOf('export async function resendUserVerificationAction'));

  assert.match(source, /async function resendUserVerificationEmail/);
  assert.match(source, /return 'verification-resent'/);
  assert.match(actionSource, /const result = await resendUserVerificationEmail\(email\)/);
  assert.match(actionSource, /if \(result === 'verification-resent'\)[\s\S]*redirectWithAuthResult\('\/auth\/verify-email'/);
  assert.doesNotMatch(actionSource, /try \{/);
});

test('password reset flow uses the current Prisma token model name', () => {
  const source = readProjectFile('src/app/auth/password-reset/actions.ts');

  assert.match(source, /userPasswordResetToken\.create/);
  assert.match(source, /UPDATE "UserPasswordResetToken"/);
  assert.doesNotMatch(source, /INSERT INTO "PasswordResetToken"/);
  assert.doesNotMatch(source, /UPDATE "PasswordResetToken"/);
});
