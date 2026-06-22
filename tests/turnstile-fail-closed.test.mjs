import assert from 'node:assert/strict';
import process from 'node:process';
import test from 'node:test';

const { assertTurnstilePassed, TurnstileError } = await import('../src/lib/security/turnstile.ts');

const SECRET = 'TURNSTILE_SECRET_KEY';
const SITE = 'NEXT_PUBLIC_TURNSTILE_SITE_KEY';

function withEnv(values, fn) {
  const prev = {};
  for (const key of Object.keys(values)) {
    prev[key] = process.env[key];
    if (values[key] === undefined) delete process.env[key];
    else process.env[key] = values[key];
  }
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const key of Object.keys(prev)) {
        if (prev[key] === undefined) delete process.env[key];
        else process.env[key] = prev[key];
      }
    });
}

test('no keys configured: captcha disabled, passes', async () => {
  await withEnv({ [SECRET]: undefined, [SITE]: undefined }, async () => {
    await assert.doesNotReject(assertTurnstilePassed(''));
  });
});

test('site key set but secret missing: fail closed', async () => {
  await withEnv({ [SECRET]: undefined, [SITE]: 'public-key' }, async () => {
    await assert.rejects(assertTurnstilePassed('any-token'), TurnstileError);
  });
});

test('secret set but token missing: fail closed', async () => {
  await withEnv({ [SECRET]: 'server-secret', [SITE]: 'public-key' }, async () => {
    await assert.rejects(assertTurnstilePassed(''), TurnstileError);
  });
});
