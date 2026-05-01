import assert from 'node:assert/strict';
import test from 'node:test';

const { getRenderableExternalUrl, normalizeExternalUrlInput } = await import('../src/lib/validation/external-url.ts');

test('external URL helper accepts only explicit http/https links', () => {
  assert.equal(normalizeExternalUrlInput('https://example.com/path'), 'https://example.com/path');
  assert.equal(normalizeExternalUrlInput('http://example.com'), 'http://example.com/');

  assert.throws(() => normalizeExternalUrlInput('javascript:alert(1)'), /External URL must use http or https/);
  assert.throws(() => normalizeExternalUrlInput('data:text/html,<svg/onload=alert(1)>'), /External URL must use http or https/);
  assert.throws(() => normalizeExternalUrlInput('ftp://example.com/file.txt'), /External URL must use http or https/);
  assert.throws(() => normalizeExternalUrlInput('https://user:pass@example.com'), /External URL must use http or https/);
});

test('render helper silently drops unsafe or malformed external URLs', () => {
  assert.equal(getRenderableExternalUrl('https://example.com/path'), 'https://example.com/path');
  assert.equal(getRenderableExternalUrl('javascript:alert(1)'), undefined);
  assert.equal(getRenderableExternalUrl('data:text/html,<svg/onload=alert(1)>'), undefined);
  assert.equal(getRenderableExternalUrl('not a url'), undefined);
  assert.equal(getRenderableExternalUrl(''), undefined);
});
