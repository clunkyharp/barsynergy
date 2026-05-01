import assert from 'node:assert/strict';
import test from 'node:test';

const { hasErrorMessage, resolveServerActionError } = await import('../src/lib/actions/server-action-errors.ts');

test('resolveServerActionError rethrows redirect-style control flow', () => {
  const redirectError = {
    digest: 'NEXT_REDIRECT;push;/auth/login;307;'
  };

  assert.throws(
    () =>
      resolveServerActionError({
        action: 'test:redirect',
        error: redirectError,
        fallbackMessage: 'failed'
      }),
    (error) => error === redirectError
  );
});

test('resolveServerActionError returns known and zod-safe messages without fallback logging', async () => {
  const { z } = await import('zod');

  assert.equal(
    resolveServerActionError({
      action: 'test:zod',
      error: new z.ZodError([]),
      zodMessage: 'invalid',
      fallbackMessage: 'failed'
    }),
    'invalid'
  );

  assert.equal(
    resolveServerActionError({
      action: 'test:known',
      error: new Error('draft is invalid'),
      known: [
        {
          matches: (candidate) => hasErrorMessage(candidate, 'draft is invalid'),
          message: 'known'
        }
      ],
      fallbackMessage: 'failed'
    }),
    'known'
  );
});

test('resolveServerActionError falls back for unexpected errors', () => {
  const originalConsoleError = globalThis.console.error;
  const loggedCalls = [];
  globalThis.console.error = (...args) => {
    loggedCalls.push(args);
  };

  try {
    assert.equal(
      resolveServerActionError({
        action: 'test:fallback',
        error: new Error('boom'),
        fallbackMessage: 'failed'
      }),
      'failed'
    );
  } finally {
    globalThis.console.error = originalConsoleError;
  }

  assert.equal(loggedCalls.length, 1);
  assert.equal(loggedCalls[0][0], '[test:fallback] Unexpected server action error.');
});
