import assert from 'node:assert/strict';
import test from 'node:test';

const { isSafeReturnTo } = await import('../src/lib/auth/safe-redirect.ts');

test('accepts in-app relative paths', () => {
  for (const value of [
    '/',
    '/profile',
    '/profile/settings',
    '/auth/login',
    '/business/cabinet',
    '/admin',
    '/vacancies?city=msk',
    '/articles/some-slug'
  ]) {
    assert.equal(isSafeReturnTo(value), true, `expected safe: ${value}`);
  }
});

test('rejects empty and non-rooted values', () => {
  for (const value of ['', 'profile', 'http://example.com', 'https://evil.example/profile']) {
    assert.equal(isSafeReturnTo(value), false, `expected unsafe: ${value}`);
  }
});

test('rejects protocol-relative and backslash open-redirect payloads', () => {
  for (const value of [
    '//evil.example/profile',
    '//evil.example/admin',
    '/\\evil.example/profile',
    '/%2fevil.example/profile',
    '/%2Fevil.example/profile',
    '/%5cevil.example/profile',
    '/%5Cevil.example/profile'
  ]) {
    assert.equal(isSafeReturnTo(value), false, `expected unsafe: ${value}`);
  }
});

test('rejects paths outside the allowlist', () => {
  for (const value of ['/secret', '/api/internal', '/random']) {
    assert.equal(isSafeReturnTo(value), false, `expected unsafe: ${value}`);
  }
});
