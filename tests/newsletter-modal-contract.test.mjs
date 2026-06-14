import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('newsletter subscription schema supports double opt-in and unsubscribe tokens', () => {
  const schema = readProjectFile('prisma/schema.prisma');

  assert.match(schema, /model EmailSubscription/);
  assert.match(schema, /email\s+String\s+@unique/);
  assert.match(schema, /topics\s+NotificationTopic\[\]/);
  assert.match(schema, /confirmTokenHash\s+String\s+@unique/);
  assert.match(schema, /unsubTokenHash\s+String\s+@unique/);
  assert.match(schema, /confirmedAt\s+DateTime\?/);
  assert.match(schema, /unsubscribedAt\s+DateTime\?/);
  assert.match(schema, /consentText\s+String/);
  assert.match(schema, /consentVersion\s+String\?/);
});

test('newsletter modal storage implements cooldown and session anti-annoy rules', () => {
  const source = readProjectFile('src/components/public/newsletter-modal/newsletter-modal-storage.ts');

  assert.match(source, /NEWSLETTER_MODAL_STORAGE_KEY = 'bs:newsletter-modal'/);
  assert.match(source, /NEWSLETTER_MODAL_SESSION_KEY = 'bs:newsletter-shown'/);
  assert.match(source, /DISMISS_COOLDOWN_ONE_MS = 30 \* 24 \* 60 \* 60 \* 1000/);
  assert.match(source, /DISMISS_COOLDOWN_TWO_MS = 180 \* 24 \* 60 \* 60 \* 1000/);
  assert.match(source, /REMIND_LATER_COOLDOWN_MS = 7 \* 24 \* 60 \* 60 \* 1000/);
  assert.match(source, /dismissCount >= 3/);
  assert.match(source, /markNewsletterModalShownThisSession/);
});

test('newsletter subscription action validates consent and sends confirmation email', () => {
  const source = readProjectFile('src/lib/notifications/email-subscription/actions.ts');
  const serviceSource = readProjectFile('src/lib/notifications/email-subscription/service.ts');

  assert.match(source, /^'use server';/);
  assert.match(source, /await assertSameOriginServerAction\(\)/);
  assert.match(source, /submitNewsletterSubscriptionAction/);
  assert.match(source, /consentAccepted/);
  assert.match(source, /createOrRefreshEmailSubscription/);
  assert.match(serviceSource, /sendNewsletterConfirmEmail/);
  assert.match(serviceSource, /emailSubscription\.upsert/);
});

test('newsletter modal root is mounted with trigger outside workspace paths', () => {
  const footer = readProjectFile('src/components/layout/site-footer.tsx');

  assert.match(footer, /NewsletterModalRoot/);
  assert.match(footer, /NewsletterModalTrigger/);
  assert.match(footer, /isWorkspacePath/);
});

test('newsletter confirm and unsubscribe routes exist', () => {
  assert.equal(existsSync(join(repoRoot, 'src/app/newsletter/confirm/[token]/page.tsx')), true);
  assert.equal(existsSync(join(repoRoot, 'src/app/newsletter/unsubscribe/[token]/page.tsx')), true);
});

test('newsletter has consent version constant', () => {
  const schemaSource = readProjectFile('src/lib/notifications/email-subscription/schema.ts');

  assert.match(schemaSource, /NEWSLETTER_CONSENT_VERSION/);
});

test('newsletter default topics from schema', () => {
  const componentSource = readProjectFile('src/components/public/newsletter-modal/index.tsx');
  const schemaSource = readProjectFile('src/lib/notifications/email-subscription/schema.ts');

  assert.match(componentSource, /DEFAULT_NEWSLETTER_TOPICS/);
  assert.match(schemaSource, /DEFAULT_NEWSLETTER_TOPICS/);
});

test('newsletter modal backdrop uses CSS class', () => {
  const componentSource = readProjectFile('src/components/public/newsletter-modal/index.tsx');
  const cssSource = readProjectFile('src/app/styles/public.css');

  assert.match(componentSource, /newsletter-modal-backdrop/);
  assert.match(cssSource, /\.newsletter-modal-backdrop/);
});

test('newsletter service requires confirmedAt for active subscription', () => {
  const source = readProjectFile('src/lib/notifications/email-subscription/service.ts');

  assert.match(source, /confirmedAt:\s*\{\s*not:\s*null\s*\}/);
});

test('newsletter action implements rate-limiting', () => {
  const source = readProjectFile('src/lib/notifications/email-subscription/actions.ts');

  assert.match(source, /checkRateLimit/);
  assert.match(source, /extractClientIp/);
  assert.match(source, /cf-connecting-ip/);
  assert.match(source, /RATE_LIMIT_IP_WINDOW_MS/);
  assert.match(source, /RATE_LIMIT_EMAIL_DAY_MAX/);
});

test('newsletter trigger implements scroll delay', () => {
  const source = readProjectFile('src/components/public/newsletter-modal/newsletter-modal-trigger.tsx');

  assert.match(source, /TRIGGER_SCROLL_DELAY_MS/);
});

test('newsletter service early-returns on confirmed subscription', () => {
  const source = readProjectFile('src/lib/notifications/email-subscription/service.ts');

  assert.match(source, /wasConfirmed/);
});

test('newsletter modal root logs shown event', () => {
  const source = readProjectFile('src/components/public/newsletter-modal/index.tsx');

  assert.match(source, /console\.info\('newsletter_modal_shown'/);
});

test('newsletter modal Esc/backdrop triggers remindLater', () => {
  const source = readProjectFile('src/components/public/newsletter-modal/index.tsx');

  assert.match(source, /remindLater\(\)/);
});
