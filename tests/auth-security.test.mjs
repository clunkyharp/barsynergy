import assert from 'node:assert/strict';
import test from 'node:test';

const { getAuthThrottleKeyHash } = await import('../src/lib/auth/auth-rate-limit-helpers.ts');

test('auth throttle keys are stable and secret-backed', () => {
  const hashA = getAuthThrottleKeyHash({
    scope: 'loginEmail',
    identifier: 'USER@Example.Test',
    secret: 'test-secret'
  });
  const hashB = getAuthThrottleKeyHash({
    scope: 'loginEmail',
    identifier: 'user@example.test',
    secret: 'test-secret'
  });
  const hashC = getAuthThrottleKeyHash({
    scope: 'registerEmail',
    identifier: 'user@example.test',
    secret: 'test-secret'
  });

  assert.equal(hashA, hashB);
  assert.notEqual(hashA, hashC);
  assert.match(hashA, /^[a-f0-9]{64}$/);
});
