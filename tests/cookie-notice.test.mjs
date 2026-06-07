import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('cookie notice stores a six-month localStorage choice and stays bottom-right', () => {
  const source = readProjectFile('src/components/public/cookie-notice.tsx');

  assert.match(source, /COOKIE_NOTICE_TTL_MS = 183 \* 24 \* 60 \* 60 \* 1000/);
  assert.match(source, /expiresAt: now \+ COOKIE_NOTICE_TTL_MS/);
  assert.match(source, /isCookieNoticeChoiceValid/);
  assert.match(source, /window\.localStorage\.setItem\(COOKIE_NOTICE_STORAGE_KEY, buildCookieNoticeChoice\(\)\)/);
  assert.match(source, /COOKIE_NOTICE_STORAGE_KEY = 'barsynergy_cookie_consent'/);
  assert.match(source, /LEGACY_COOKIE_NOTICE_STORAGE_KEY/);
  assert.match(source, /bottom-\[calc\(0\.75rem\+env\(safe-area-inset-bottom\)\)\] left-3 right-3 z-50 sm:bottom-\[calc\(1\.5rem\+env\(safe-area-inset-bottom\)\)\] sm:left-auto sm:right-6 sm:max-w-\[360px\]/);
  assert.doesNotMatch(source, /md:left-1\/2/);
  assert.doesNotMatch(source, /md:-translate-x-1\/2/);
});
