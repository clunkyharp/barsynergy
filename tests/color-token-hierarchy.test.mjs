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

function srgbToLinear(channel) {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const value = hex.replace('#', '');
  const rgb = [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16));
  const [r, g, b] = rgb.map(srgbToLinear);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground, background) {
  const first = luminance(foreground);
  const second = luminance(background);
  const [lighter, darker] = first > second ? [first, second] : [second, first];

  return (lighter + 0.05) / (darker + 0.05);
}

test('runtime color contract uses Miro yellow accent with neutral light and dark surfaces', () => {
  const stylesSource = readGlobalStyles();

  assert.match(stylesSource, /--accent:\s*#ffd02f;/);
  assert.match(stylesSource, /--accent-strong:\s*#fcb900;/);
  assert.match(stylesSource, /--accent-soft:\s*#fff4c4;/);
  assert.match(stylesSource, /--accent-contrast:\s*#1c1c1e;/);
  assert.match(stylesSource, /--background:\s*#ffffff;/);
  assert.match(stylesSource, /--surface:\s*#f7f8fa;/);
  assert.match(stylesSource, /--border-default:\s*#e0e2e8;/);
  assert.match(stylesSource, /--text:\s*#1c1c1e;/);
  assert.match(stylesSource, /--muted:\s*#555a6a;/);
  assert.match(stylesSource, /:root\[data-theme="dark"\]\s*\{\n[\s\S]*--background:\s*#14161b;/);
  assert.match(stylesSource, /:root\[data-theme="dark"\]\s*\{\n[\s\S]*--surface:\s*#1b1e25;/);
  assert.match(stylesSource, /:root\[data-theme="dark"\]\s*\{\n[\s\S]*--text:\s*#f5f7fb;/);
  assert.match(stylesSource, /--support-coral:\s*#ffc6c6;/);
  assert.match(stylesSource, /--support-aqua:\s*#c3faf5;/);
  assert.match(stylesSource, /--background-accent-glow:/);
  assert.doesNotMatch(stylesSource, /--warm-tint/);
  assert.doesNotMatch(stylesSource, /--accent-burgundy/);
  assert.doesNotMatch(stylesSource, /--action:/);
  assert.doesNotMatch(stylesSource, /--action-strong:/);
  assert.doesNotMatch(stylesSource, /--action-soft:/);
});

test('admin shells and dark editorial zones use shared yellow accent without amber or red overrides', () => {
  const baseCss = readProjectFile('src/app/styles/base.css');
  const adminCss = readProjectFile('src/app/styles/admin.css');

  assert.match(baseCss, /\.background-zone-graphite,[\s\S]*--accent:\s*#ffd02f;/);
  assert.match(baseCss, /\.background-zone-graphite,[\s\S]*--focus-ring:\s*rgb\(255 208 47 \/ 0\.22\);/);
  assert.doesNotMatch(baseCss, /warm-tint-rgb/);
  assert.doesNotMatch(adminCss, /#c8842a/);
  assert.doesNotMatch(adminCss, /#b20d12/);
});

test('interactive consumers use shared accent instead of legacy action aliases', () => {
  const themeToggle = readProjectFile('src/components/layout/theme-toggle.tsx');
  const homepageClient = readProjectFile('src/components/public/homepage-client.tsx');

  assert.doesNotMatch(themeToggle, /var\(--action\)/);
  assert.match(themeToggle, /selected \? 'bg-\[var\(--accent\)\] text-\[var\(--accent-contrast\)\]'/);
  assert.doesNotMatch(homepageClient, /accent-burgundy/);
  assert.match(homepageClient, /border-\[var\(--accent\)\] bg-\[var\(--accent\)\] text-\[var\(--accent-contrast\)\]/);
});

test('filled accent states keep AA contrast in both themes', () => {
  assert.ok(contrast('#ffd02f', '#1c1c1e') >= 4.5);
});
