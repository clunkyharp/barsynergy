import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';
import { readGlobalStyles } from './helpers/global-styles.mjs';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('general sponsor card exposes variant and lifecycle state hooks', () => {
  const source = readProjectFile('src/components/public/general-sponsor-card.tsx');

  assert.match(source, /function sponsorVisualState/);
  assert.match(source, /data-sponsor-state=\{visualState\}/);
  assert.match(source, /data-sponsor-variant="home"/);
  assert.match(source, /data-sponsor-variant="full"/);
  assert.match(source, /general-sponsor-description-text/);
  assert.match(source, /SponsorContactCompactLink/);
  assert.match(source, /sponsor-contact-compact-list/);
  assert.doesNotMatch(source, /SponsorPhoneCard/);
  assert.doesNotMatch(source, /SponsorChannelIcon/);
  assert.doesNotMatch(source, /max-h-\[5\.25rem\]/);
});

test('general sponsor card CSS covers hover, focus, archived and compact mobile states', () => {
  const css = readGlobalStyles();

  assert.match(css, /\.general-sponsor-card:hover/);
  assert.match(css, /\.general-sponsor-card:focus-within/);
  assert.match(css, /\.general-sponsor-card\[data-sponsor-state="archived"\]/);
  assert.match(css, /@media \(max-width: 480px\)/);
  assert.match(css, /@media \(max-width: 360px\)/);
  assert.match(css, /\.home-sponsor-actions \.home-sponsor-primary-action/);
  assert.match(css, /\.sponsor-contact-compact-link/);
  assert.match(css, /\.sponsor-contact-compact-action/);
  assert.doesNotMatch(css, /\.sponsor-phone-card/);
  assert.match(css, /overflow-wrap: anywhere/);
});
