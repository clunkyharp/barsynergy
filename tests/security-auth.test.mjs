import assert from 'node:assert/strict';
import test from 'node:test';
import { UserRole } from '@prisma/client';

const { canAccessAdminSection, canPrepareBusinessAccess } = await import('../src/lib/auth/permissions.ts');
const { isSameOriginRequest } = await import('../src/lib/security/same-origin.ts');
const { getPersistentThrottleKeyHash } = await import('../src/lib/security/throttle-window.ts');

test('business access preparation is admin-only', () => {
  assert.equal(canAccessAdminSection(UserRole.MODERATOR, 'applications'), true);
  assert.equal(canPrepareBusinessAccess(UserRole.ADMIN), true);
  assert.equal(canPrepareBusinessAccess(UserRole.MODERATOR), false);
  assert.equal(canPrepareBusinessAccess(UserRole.BUSINESS), false);
  assert.equal(canPrepareBusinessAccess(null), false);
});

test('persistent throttle keys isolate admin upload user and IP scopes', () => {
  const userHash = getPersistentThrottleKeyHash({
    scope: 'adminContentImageUploadUser',
    identifier: 'USER-1',
    secret: 'test-secret'
  });
  const sameUserHash = getPersistentThrottleKeyHash({
    scope: 'adminContentImageUploadUser',
    identifier: 'user-1',
    secret: 'test-secret'
  });
  const ipHash = getPersistentThrottleKeyHash({
    scope: 'adminContentImageUploadIp',
    identifier: '198.51.100.20',
    secret: 'test-secret'
  });

  assert.equal(userHash, sameUserHash);
  assert.notEqual(userHash, ipHash);
  assert.match(userHash, /^[a-f0-9]{64}$/);
});

test('same-origin check accepts Origin matching APP_URL and local request URL fallback', () => {
  assert.equal(
    isSameOriginRequest({
      requestUrl: 'http://internal.local/admin/uploads/content-image',
      appUrl: 'https://bars.example',
      origin: 'https://bars.example'
    }),
    true
  );

  assert.equal(
    isSameOriginRequest({
      requestUrl: 'http://127.0.0.1:3000/admin/uploads/content-image',
      appUrl: 'http://localhost:3000',
      origin: 'http://127.0.0.1:3000'
    }),
    true
  );
});

test('same-origin check rejects request URL origin when APP_URL is production origin', () => {
  assert.equal(
    isSameOriginRequest({
      requestUrl: 'https://spoofed-host.example/admin/uploads/content-image',
      appUrl: 'https://bars.example',
      origin: 'https://spoofed-host.example'
    }),
    false
  );
});

test('same-origin check falls back to Referer only when Origin is absent', () => {
  assert.equal(
    isSameOriginRequest({
      requestUrl: 'https://bars.example/admin/uploads/content-image',
      appUrl: 'https://bars.example',
      referer: 'https://bars.example/admin/articles'
    }),
    true
  );

  assert.equal(
    isSameOriginRequest({
      requestUrl: 'https://bars.example/admin/uploads/content-image',
      appUrl: 'https://bars.example',
      origin: 'https://evil.example',
      referer: 'https://bars.example/admin/articles'
    }),
    false
  );
});

test('same-origin check rejects cross-origin, invalid and missing headers', () => {
  assert.equal(
    isSameOriginRequest({
      requestUrl: 'https://bars.example/admin/uploads/content-image',
      appUrl: 'https://bars.example',
      origin: 'https://evil.example'
    }),
    false
  );

  assert.equal(
    isSameOriginRequest({
      requestUrl: 'https://bars.example/admin/uploads/content-image',
      appUrl: 'https://bars.example',
      origin: 'null'
    }),
    false
  );

  assert.equal(
    isSameOriginRequest({
      requestUrl: 'https://bars.example/admin/uploads/content-image',
      appUrl: 'https://bars.example',
      referer: 'not a url'
    }),
    false
  );

  assert.equal(
    isSameOriginRequest({
      requestUrl: 'https://bars.example/admin/uploads/content-image',
      appUrl: 'https://bars.example'
    }),
    false
  );
});
