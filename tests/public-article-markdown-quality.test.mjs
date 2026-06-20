import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();
const seedSource = readFileSync(join(repoRoot, 'scripts/seed-demo-screens.mjs'), 'utf8');

function assertNoSourceMatch(pattern, label) {
  const match = seedSource.match(pattern);
  assert.equal(match, null, label);
}

test('published article seed markdown does not contain known broken heading patterns', () => {
  assertNoSourceMatch(/###[0-9]/, 'Found a markdown heading without a space after ###.');
});

test('espresso gadgets article keeps readable Russian copy and markdown lists', () => {
  assertNoSourceMatch(/темпеоа/, 'Found the known typo in the espresso gadgets article.');
  assertNoSourceMatch(/'WDT-игла — да,[^']*\\nPuck screen — да,/, 'Found a collapsed checklist without markdown list markers.');
});
