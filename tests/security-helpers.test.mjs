import assert from 'node:assert/strict';
import test from 'node:test';

const {
  buildContentSecurityPolicy,
  createCspNonce,
  isProtectedAppPath,
  shouldApplyCsp
} = await import('../src/lib/security/csp.ts');
const { getClientIpFromHeaders } = await import('../src/lib/security/request-identity.ts');
const { isSameOriginBrowserRequest, isSameOriginRequest } = await import('../src/lib/security/same-origin.ts');
const { consumeThrottleWindowAtomically, getPersistentThrottleKeyHash } = await import(
  '../src/lib/security/throttle-window.ts'
);

function getDirective(policy, name) {
  return policy
    .split(';')
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith(`${name} `));
}

test('CSP nonces are base64 encoded random 16 byte values', () => {
  const nonces = new Set(Array.from({ length: 8 }, () => createCspNonce()));

  assert.equal(nonces.size, 8);
  for (const nonce of nonces) {
    assert.match(nonce, /^[A-Za-z0-9+/]{22}==$/);
  }
});

test('CSP builder separates production hardening from development allowances', () => {
  const productionPolicy = buildContentSecurityPolicy({
    nonce: 'prod-nonce',
    isDevelopment: false
  });

  assert.equal(getDirective(productionPolicy, 'default-src'), "default-src 'self'");
  assert.equal(getDirective(productionPolicy, 'base-uri'), "base-uri 'self'");
  assert.equal(getDirective(productionPolicy, 'form-action'), "form-action 'self'");
  assert.equal(getDirective(productionPolicy, 'frame-ancestors'), "frame-ancestors 'none'");
  assert.equal(getDirective(productionPolicy, 'object-src'), "object-src 'none'");
  assert.match(getDirective(productionPolicy, 'script-src'), /'nonce-prod-nonce'/);
  assert.match(getDirective(productionPolicy, 'script-src'), /'strict-dynamic'/);
  assert.doesNotMatch(getDirective(productionPolicy, 'script-src'), /'unsafe-eval'/);
  assert.equal(getDirective(productionPolicy, 'style-src'), "style-src 'self' 'unsafe-inline'");
  assert.equal(getDirective(productionPolicy, 'font-src'), "font-src 'self' data:");
  assert.equal(getDirective(productionPolicy, 'connect-src'), "connect-src 'self'");
  assert.match(productionPolicy, /upgrade-insecure-requests/);

  const developmentPolicy = buildContentSecurityPolicy({
    nonce: 'dev-nonce',
    isDevelopment: true
  });

  assert.match(getDirective(developmentPolicy, 'script-src'), /'nonce-dev-nonce'/);
  assert.match(getDirective(developmentPolicy, 'script-src'), /'unsafe-eval'/);
  assert.match(getDirective(developmentPolicy, 'connect-src'), /ws:/);
  assert.match(getDirective(developmentPolicy, 'connect-src'), /http:\/\/localhost:\*/);
  assert.match(getDirective(developmentPolicy, 'connect-src'), /http:\/\/127\.0\.0\.1:\*/);
  assert.doesNotMatch(developmentPolicy, /upgrade-insecure-requests/);
});

test('CSP path helpers distinguish app routes from static assets', () => {
  assert.equal(isProtectedAppPath('/admin'), true);
  assert.equal(isProtectedAppPath('/admin/articles'), true);
  assert.equal(isProtectedAppPath('/business'), false);
  assert.equal(isProtectedAppPath('/business/cabinet'), true);
  assert.equal(isProtectedAppPath('/business/cabinet/requests'), true);
  assert.equal(isProtectedAppPath('/administrator'), false);
  assert.equal(isProtectedAppPath('/businesses'), false);

  assert.equal(shouldApplyCsp('/'), true);
  assert.equal(shouldApplyCsp('/admin/uploads/content-image'), true);
  assert.equal(shouldApplyCsp('/_next/static/chunk.js'), false);
  assert.equal(shouldApplyCsp('/_next/image'), false);
  assert.equal(shouldApplyCsp('/favicon.ico'), false);
  assert.equal(shouldApplyCsp('/robots.txt'), false);
  assert.equal(shouldApplyCsp('/sitemap.xml'), false);
  assert.equal(shouldApplyCsp('/assets/logo.svg'), false);
});

test('same-origin helper normalizes default ports and local development origins', () => {
  assert.equal(
    isSameOriginRequest({
      requestUrl: 'https://bars.example/admin/uploads/content-image',
      appUrl: 'https://bars.example:443',
      origin: 'https://BARS.example'
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

  assert.equal(
    isSameOriginRequest({
      requestUrl: 'https://bars.example/admin/uploads/content-image',
      origin: 'https://bars.example'
    }),
    true
  );

  assert.equal(
    isSameOriginRequest({
      requestUrl: 'not a url',
      origin: 'https://bars.example'
    }),
    false
  );
});

test('same-origin browser wrapper reads Origin before Referer', () => {
  const refererOnlyRequest = new globalThis.Request('https://bars.example/admin/uploads/content-image', {
    headers: {
      referer: 'https://bars.example/admin/articles'
    }
  });

  assert.equal(isSameOriginBrowserRequest(refererOnlyRequest, 'https://bars.example'), true);

  const mismatchedOriginRequest = new globalThis.Request('https://bars.example/admin/uploads/content-image', {
    headers: {
      origin: 'https://evil.example',
      referer: 'https://bars.example/admin/articles'
    }
  });

  assert.equal(isSameOriginBrowserRequest(mismatchedOriginRequest, 'https://bars.example'), false);
});

test('request identity prefers trusted real IP and skips unknown forwarded candidates', () => {
  assert.equal(
    getClientIpFromHeaders(
      new globalThis.Headers({
        'x-real-ip': ' [198.51.100.20] ',
        'x-forwarded-for': '203.0.113.10'
      })
    ),
    '198.51.100.20'
  );

  assert.equal(
    getClientIpFromHeaders(
      new globalThis.Headers({
        'x-real-ip': 'unknown',
        'x-forwarded-for': 'unknown, [2001:db8::1], 203.0.113.10'
      })
    ),
    '2001:db8::1'
  );

  assert.equal(getClientIpFromHeaders(new globalThis.Headers()), 'unknown');
});

test('persistent throttle hash and atomic consume helper expose stable boundary behavior', async () => {
  const normalizedHash = getPersistentThrottleKeyHash({
    scope: ' AdminContentImageUploadUser ',
    identifier: ' USER-1 ',
    secret: 'test-secret'
  });
  const sameHash = getPersistentThrottleKeyHash({
    scope: 'admincontentimageuploaduser',
    identifier: 'user-1',
    secret: 'test-secret'
  });
  const otherSecretHash = getPersistentThrottleKeyHash({
    scope: 'admincontentimageuploaduser',
    identifier: 'user-1',
    secret: 'other-secret'
  });

  assert.equal(normalizedHash, sameHash);
  assert.notEqual(normalizedHash, otherSecretHash);
  assert.match(normalizedHash, /^[a-f0-9]{64}$/);

  const now = new Date('2026-05-17T10:00:00.000Z');
  const windowBoundary = new Date('2026-05-17T09:45:00.000Z');
  const returnedSlot = { count: 2, windowStartedAt: now };
  const calls = [];
  const client = {
    async $queryRaw(query) {
      calls.push(query);
      return [returnedSlot];
    }
  };

  assert.equal(
    await consumeThrottleWindowAtomically(client, {
      table: 'applicationSubmission',
      keyHash: normalizedHash,
      now,
      windowBoundary,
      maxAttempts: 3
    }),
    returnedSlot
  );
  assert.equal(calls.length, 1);

  const limitedClient = {
    async $queryRaw() {
      return [];
    }
  };

  assert.equal(
    await consumeThrottleWindowAtomically(limitedClient, {
      table: 'authAttempt',
      keyHash: normalizedHash,
      now,
      windowBoundary,
      maxAttempts: 1
    }),
    null
  );
});
