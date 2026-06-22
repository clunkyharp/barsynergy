import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('public login keeps a minimal credential form without role selection', () => {
  const pageSource = readProjectFile('src/app/auth/login/page.tsx');
  const formSource = readProjectFile('src/app/auth/login/_components/login-form.tsx');
  const roleCardSource = readProjectFile('src/components/ui/auth-role-card.tsx');

  assert.doesNotMatch(pageSource, /AuthRoleCard/);
  assert.doesNotMatch(pageSource, /publicLoginRoles/);
  assert.doesNotMatch(formSource, /name="role"/);
  assert.doesNotMatch(pageSource, /id: 'admin'/);
  assert.doesNotMatch(pageSource, /id: 'moderator'/);
  assert.match(formSource, /<FormField htmlFor="email" label="Email"/);
  assert.match(formSource, /<FormField htmlFor="password" label="Пароль"/);
  assert.match(formSource, /<PublicFormValidation \/>/);
  assert.match(formSource, /noValidate/);
  assert.match(formSource, /data-public-validation="true"/);
  assert.match(formSource, /Войти/);
  assert.match(roleCardSource, /aria-current=\{selected \? 'page' : undefined\}/);
  assert.match(roleCardSource, /data-state=\{disabled \? 'disabled' : selected \? 'selected' : 'idle'\}/);
});

test('public login has mobile, loading, error and request-sent state hooks', () => {
  const pageSource = readProjectFile('src/app/auth/login/page.tsx');
  const formSource = readProjectFile('src/app/auth/login/_components/login-form.tsx');
  const layoutSource = readProjectFile('src/components/auth/auth-split-layout.tsx');

  assert.match(layoutSource, /auth-login-screen/);
  assert.match(layoutSource, /w-\[176px\] theme-logo-light md:w-\[198px\]/);
  assert.match(layoutSource, /ArrowLeft/);
  assert.match(layoutSource, /На сайт/);
  assert.match(formSource, /auth-login-submit/);
  assert.match(formSource, /pendingText="Входим…"/);
  assert.match(pageSource, /InlineAlert/);
  assert.match(pageSource, /business-request-created/);
  assert.match(pageSource, /logged-out/);
  assert.match(pageSource, /password-reset/);
  assert.match(formSource, /errorCode/);
  assert.match(pageSource, /topSuccess/);
});

test('admin login uses the same custom validation contract', () => {
  const pageSource = readProjectFile('src/app/(admin-auth)/admin/login/_components/admin-login-form.tsx');

  assert.match(pageSource, /import \{ PublicFormValidation \} from '@\/components\/public\/public-form-validation'/);
  assert.match(pageSource, /<PublicFormValidation \/>/);
  assert.match(pageSource, /noValidate/);
  assert.match(pageSource, /data-public-validation="true"/);
});
