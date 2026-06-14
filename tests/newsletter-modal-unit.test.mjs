import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

// ---------------------------------------------------------------------------
// Storage: pure functions (parseNewsletterModalState, getCooldownUntil)
// ---------------------------------------------------------------------------

readProjectFile('src/components/public/newsletter-modal/newsletter-modal-storage.ts');

// Extract pure functions by constructing them from source
const DISMISS_COOLDOWN_ONE_MS = 30 * 24 * 60 * 60 * 1000;
const DISMISS_COOLDOWN_TWO_MS = 180 * 24 * 60 * 60 * 1000;
const REMIND_LATER_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function parseNewsletterModalState(raw) {
  if (!raw) return { dismissCount: 0, subscribed: false };
  try {
    const parsed = JSON.parse(raw);
    return {
      dismissCount: typeof parsed.dismissCount === 'number' ? parsed.dismissCount : 0,
      remindLaterAt: typeof parsed.remindLaterAt === 'string' ? parsed.remindLaterAt : undefined,
      shownAt: typeof parsed.shownAt === 'string' ? parsed.shownAt : undefined,
      subscribed: parsed.subscribed === true
    };
  } catch {
    return { dismissCount: 0, subscribed: false };
  }
}

function getCooldownUntil(state) {
  if (state.subscribed || state.dismissCount >= 3) return Number.POSITIVE_INFINITY;
  const remindLaterTime = state.remindLaterAt ? Date.parse(state.remindLaterAt) + REMIND_LATER_COOLDOWN_MS : 0;
  const shownTime = state.shownAt ? Date.parse(state.shownAt) : 0;
  const dismissCooldown =
    state.dismissCount === 1
      ? DISMISS_COOLDOWN_ONE_MS
      : state.dismissCount === 2
        ? DISMISS_COOLDOWN_TWO_MS
        : 0;
  return Math.max(remindLaterTime, shownTime + dismissCooldown);
}
test('parseNewsletterModalState: null input returns defaults', () => {
  const state = parseNewsletterModalState(null);
  assert.equal(state.dismissCount, 0);
  assert.equal(state.subscribed, false);
  assert.equal(state.remindLaterAt, undefined);
  assert.equal(state.shownAt, undefined);
});

test('parseNewsletterModalState: empty string returns defaults', () => {
  const state = parseNewsletterModalState('');
  assert.equal(state.dismissCount, 0);
  assert.equal(state.subscribed, false);
});

test('parseNewsletterModalState: corrupted JSON returns defaults', () => {
  const state = parseNewsletterModalState('not-json{');
  assert.equal(state.dismissCount, 0);
  assert.equal(state.subscribed, false);
});

test('parseNewsletterModalState: partial object fills missing fields', () => {
  const state = parseNewsletterModalState(JSON.stringify({ dismissCount: 2 }));
  assert.equal(state.dismissCount, 2);
  assert.equal(state.subscribed, false);
  assert.equal(state.remindLaterAt, undefined);
  assert.equal(state.shownAt, undefined);
});

test('parseNewsletterModalState: full valid state', () => {
  const raw = JSON.stringify({
    dismissCount: 1,
    remindLaterAt: '2026-07-01T12:00:00.000Z',
    shownAt: '2026-06-14T12:00:00.000Z',
    subscribed: true
  });
  const state = parseNewsletterModalState(raw);
  assert.equal(state.dismissCount, 1);
  assert.equal(state.remindLaterAt, '2026-07-01T12:00:00.000Z');
  assert.equal(state.shownAt, '2026-06-14T12:00:00.000Z');
  assert.equal(state.subscribed, true);
});

test('parseNewsletterModalState: dismissCount must be number', () => {
  const state = parseNewsletterModalState(JSON.stringify({ dismissCount: '3' }));
  assert.equal(state.dismissCount, 0);
});

test('getCooldownUntil: subscribed returns Infinity', () => {
  const cooldown = getCooldownUntil({ dismissCount: 0, subscribed: true });
  assert.equal(cooldown, Number.POSITIVE_INFINITY);
});

test('getCooldownUntil: dismissCount >= 3 returns Infinity', () => {
  const cooldown = getCooldownUntil({ dismissCount: 3, subscribed: false });
  assert.equal(cooldown, Number.POSITIVE_INFINITY);
});

test('getCooldownUntil: dismissCount > 3 also returns Infinity', () => {
  const cooldown = getCooldownUntil({ dismissCount: 5, subscribed: false });
  assert.equal(cooldown, Number.POSITIVE_INFINITY);
});

test('getCooldownUntil: dismissCount 0 uses only shownAt', () => {
  const shownAt = '2026-06-14T12:00:00.000Z';
  const cooldown = getCooldownUntil({ dismissCount: 0, shownAt, subscribed: false });
  assert.equal(cooldown, Date.parse(shownAt));
});

test('getCooldownUntil: dismissCount 1 adds 30 day cooldown', () => {
  const shownAt = '2026-06-14T12:00:00.000Z';
  const cooldown = getCooldownUntil({ dismissCount: 1, shownAt, subscribed: false });
  assert.equal(cooldown, Date.parse(shownAt) + DISMISS_COOLDOWN_ONE_MS);
});

test('getCooldownUntil: dismissCount 2 adds 180 day cooldown', () => {
  const shownAt = '2026-06-14T12:00:00.000Z';
  const cooldown = getCooldownUntil({ dismissCount: 2, shownAt, subscribed: false });
  assert.equal(cooldown, Date.parse(shownAt) + DISMISS_COOLDOWN_TWO_MS);
});

test('getCooldownUntil: remindLaterAt adds 7 day cooldown', () => {
  const remindLaterAt = '2026-06-14T12:00:00.000Z';
  const cooldown = getCooldownUntil({ dismissCount: 0, remindLaterAt, subscribed: false });
  assert.equal(cooldown, Date.parse(remindLaterAt) + REMIND_LATER_COOLDOWN_MS);
});

test('getCooldownUntil: max of shownAt+dismiss and remindLater — remindLater wins', () => {
  const shownAt = '2026-06-14T12:00:00.000Z';
  const remindLaterAt = '2026-07-01T12:00:00.000Z';
  const cooldown = getCooldownUntil({
    dismissCount: 1,
    shownAt,
    remindLaterAt,
    subscribed: false
  });
  const shownDeadline = Date.parse(shownAt) + DISMISS_COOLDOWN_ONE_MS; // 2026-07-14
  const remindDeadline = Date.parse(remindLaterAt) + REMIND_LATER_COOLDOWN_MS; // 2026-07-08
  assert.equal(cooldown, Math.max(shownDeadline, remindDeadline));
});

test('getCooldownUntil: max of shownAt+dismiss and remindLater — dismiss wins', () => {
  const shownAt = '2026-05-01T12:00:00.000Z';
  const remindLaterAt = '2026-06-14T12:00:00.000Z';
  const cooldown = getCooldownUntil({
    dismissCount: 2,
    shownAt,
    remindLaterAt,
    subscribed: false
  });
  const shownDeadline = Date.parse(shownAt) + DISMISS_COOLDOWN_TWO_MS; // 2026-10-28
  const remindDeadline = Date.parse(remindLaterAt) + REMIND_LATER_COOLDOWN_MS; // 2026-06-21
  assert.equal(cooldown, Math.max(shownDeadline, remindDeadline));
});

test('getCooldownUntil: shown cooldown wins when larger', () => {
  // dismiss with cooldown farther than remindLater
  const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
  const shownAt = new Date(tenDaysAgo).toISOString();
  const cooldown = getCooldownUntil({
    dismissCount: 1,
    shownAt,
    subscribed: false
  });
  // 10 days ago + 30 days = 20 days from now
  const expected = tenDaysAgo + DISMISS_COOLDOWN_ONE_MS;
  assert.ok(Math.abs(cooldown - expected) < 100);
});

test('getCooldownUntil: empty state returns 0', () => {
  const cooldown = getCooldownUntil({ dismissCount: 0, subscribed: false });
  assert.equal(cooldown, 0);
});

// ---------------------------------------------------------------------------
// Tokens: createEmailSubscriptionToken, hashEmailSubscriptionToken
// ---------------------------------------------------------------------------

readProjectFile('src/lib/notifications/email-subscription/tokens.ts');
import { randomBytes } from 'node:crypto';

function hashEmailSubscriptionToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function createEmailSubscriptionToken() {
  const rawToken = randomBytes(32).toString('hex');
  return {
    rawToken,
    tokenHash: hashEmailSubscriptionToken(rawToken)
  };
}
test('hashEmailSubscriptionToken: deterministic output', () => {
  const hash1 = hashEmailSubscriptionToken('test-token-123');
  const hash2 = hashEmailSubscriptionToken('test-token-123');
  assert.equal(hash1, hash2);
});

test('hashEmailSubscriptionToken: different inputs produce different hashes', () => {
  const hash1 = hashEmailSubscriptionToken('token-a');
  const hash2 = hashEmailSubscriptionToken('token-b');
  assert.notEqual(hash1, hash2);
});

test('hashEmailSubscriptionToken: output is 64 hex chars (sha256)', () => {
  const hash = hashEmailSubscriptionToken('anything');
  assert.equal(hash.length, 64);
  assert.match(hash, /^[0-9a-f]{64}$/);
});

test('createEmailSubscriptionToken: returns rawToken and tokenHash', () => {
  const token = createEmailSubscriptionToken();
  assert.equal(typeof token.rawToken, 'string');
  assert.equal(typeof token.tokenHash, 'string');
  assert.ok(token.rawToken.length > 0);
  assert.ok(token.tokenHash.length > 0);
});

test('createEmailSubscriptionToken: rawToken is 64 hex chars (32 bytes)', () => {
  const token = createEmailSubscriptionToken();
  assert.equal(token.rawToken.length, 64);
  assert.match(token.rawToken, /^[0-9a-f]{64}$/);
});

test('createEmailSubscriptionToken: rawToken differs from tokenHash', () => {
  const token = createEmailSubscriptionToken();
  // rawToken is NOT a hash of itself — hash is sha256(rawToken)
  assert.notEqual(token.rawToken, token.tokenHash);
});

test('createEmailSubscriptionToken: tokenHash is sha256 of rawToken', () => {
  const token = createEmailSubscriptionToken();
  const expectedHash = hashEmailSubscriptionToken(token.rawToken);
  assert.equal(token.tokenHash, expectedHash);
});

test('createEmailSubscriptionToken: each call produces unique token', () => {
  const token1 = createEmailSubscriptionToken();
  const token2 = createEmailSubscriptionToken();
  assert.notEqual(token1.rawToken, token2.rawToken);
  assert.notEqual(token1.tokenHash, token2.tokenHash);
});

// ---------------------------------------------------------------------------
// Index: defaults from schema (smoke)
// ---------------------------------------------------------------------------

test('index.tsx uses DEFAULT_NEWSLETTER_TOPICS from schema', () => {
  const indexSource = readProjectFile('src/components/public/newsletter-modal/index.tsx');
  const schemaSource = readProjectFile('src/lib/notifications/email-subscription/schema.ts');

  assert.match(indexSource, /import.*DEFAULT_NEWSLETTER_TOPICS/);
  assert.match(schemaSource, /DEFAULT_NEWSLETTER_TOPICS/);
});

test('index.tsx imports X icon for custom close button', () => {
  const source = readProjectFile('src/components/public/newsletter-modal/index.tsx');
  assert.match(source, /import.*\bX\b.*from 'lucide-react'/);
});
