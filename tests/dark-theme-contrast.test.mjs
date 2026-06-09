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

test('dark public form shells use tokenized inverse and card surfaces', () => {
  const css = readGlobalStyles();
  const publicPrimitives = readProjectFile('src/components/public/public-primitives.tsx');
  const businessForm = readProjectFile('src/components/public/business-solution-form.tsx');
  const consultingForm = readProjectFile('src/components/public/consulting-request-form.tsx');
  const partnerForm = readProjectFile('src/components/public/partner-application-form.tsx');

  assert.match(css, /:root\[data-theme="dark"\] \.editorial-form-shell \{/);
  assert.match(css, /background: var\(--surface-card\);/);
  assert.match(css, /:root\[data-theme="dark"\] \.editorial-form-shell\.public-form-shell \{/);
  assert.match(publicPrimitives, /tone === 'inverse' && 'text-white\/85'/);
  assert.match(consultingForm, /bg-\[var\(--editorial-dark-surface\)\]/);
  assert.match(businessForm, /bg-\[var\(--editorial-dark-surface\)\]/);
  assert.doesNotMatch(`${businessForm}\n${consultingForm}\n${partnerForm}`, /bg-\[#171311\]/);
  assert.doesNotMatch(`${businessForm}\n${consultingForm}\n${partnerForm}`, /text-white\/7[0-9]/);
});

test('dark gray zones and public cards use the derived Miro neutrals instead of coffee-bar graphite', () => {
  const css = readGlobalStyles();
  const darkGrayBlock = css.slice(
    css.indexOf(':root[data-theme="dark"] .background-zone-gray {'),
    css.indexOf(':root[data-theme="dark"] .background-zone-social {')
  );

  assert.match(css, /:root\[data-theme="dark"\] \.background-zone-gray \{\n\s+--zone-surface: linear-gradient\(180deg, #14161b, #1b1f26\);/);
  assert.match(css, /:root\[data-theme="dark"\] \.public-card-shell \{/);
  assert.match(css, /background: var\(--surface-card\);/);
  assert.doesNotMatch(darkGrayBlock, /#11100e/);
});

test('business benefits section is light while consulting keeps the dark contrast band', () => {
  const css = readGlobalStyles();
  const businessPage = readProjectFile('src/app/(public)/business/page.tsx');
  const consultingPage = readProjectFile('src/app/(public)/consulting/page.tsx');

  assert.match(css, /\.public-contrast-services-section \{\n\s+--zone-surface: linear-gradient\(180deg, #1d2230 0%, #161920 100%\);/);
  assert.match(css, /\.public-contrast-services-section::before \{/);
  assert.match(businessPage, /home-services-section background-zone background-zone-beige/);
  assert.doesNotMatch(businessPage, /public-contrast-services-section home-services-section background-zone background-zone-graphite/);
  assert.match(consultingPage, /public-contrast-services-section home-services-section background-zone background-zone-graphite/);
});

test('consulting service icons use filled square accent badges', () => {
  const css = readGlobalStyles();

  assert.match(css, /\.home-service-icon \{\n\s+display: inline-grid;/);
  assert.match(css, /border-radius: var\(--radius-sm\);/);
  assert.match(css, /background: var\(--accent\);/);
  assert.match(css, /color: white;/);
  assert.doesNotMatch(css, /\.home-service-icon \{[\s\S]*border: 1px solid var\(--home-service-chip-border\);/);
});
