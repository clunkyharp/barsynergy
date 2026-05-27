import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';
import { readGlobalStyles } from './helpers/global-styles.mjs';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('public login keeps role intent visual states without exposing admin roles', () => {
  const pageSource = readProjectFile('src/app/auth/login/page.tsx');
  const roleCardSource = readProjectFile('src/components/ui/auth-role-card.tsx');

  assert.match(pageSource, /id: 'participant'/);
  assert.match(pageSource, /id: 'business'/);
  assert.doesNotMatch(pageSource, /id: 'admin'/);
  assert.doesNotMatch(pageSource, /id: 'moderator'/);
  assert.match(roleCardSource, /aria-current=\{selected \? 'page' : undefined\}/);
  assert.match(roleCardSource, /data-state=\{disabled \? 'disabled' : selected \? 'selected' : 'idle'\}/);
});

test('public login has mobile, loading, error and request-sent state hooks', () => {
  const pageSource = readProjectFile('src/app/auth/login/page.tsx');
  const cssSource = readGlobalStyles();

  assert.match(pageSource, /auth-login-screen/);
  assert.match(pageSource, /w-\[176px\] md:w-\[198px\]/);
  assert.match(pageSource, /import \{ ArrowLeft \} from 'lucide-react'/);
  assert.match(pageSource, /className="auth-login-back rounded-\[var\(--radius-md\)\] px-4" href="\/" size="sm" variant="secondary"/);
  assert.match(pageSource, /auth-login-submit/);
  assert.match(pageSource, /pendingText="Входим…"/);
  assert.match(pageSource, /auth-access-notice/);
  assert.match(pageSource, /data-state=\{sent \? 'sent' : 'idle'\}/);
  assert.match(cssSource, /@media \(max-width: 360px\)/);
  assert.match(cssSource, /\.auth-login-logo img \{\n {4}width: 156px;/);
  assert.match(cssSource, /\.auth-login-submit\[aria-busy="true"\]/);
  assert.match(cssSource, /\[data-auth-role-card\]\[data-state="selected"\]/);
  assert.match(cssSource, /\.auth-access-notice\[data-state="sent"\]/);
});
