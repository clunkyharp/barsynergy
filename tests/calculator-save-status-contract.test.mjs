import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('calculator toolbar announces local save status politely', () => {
  const source = readProjectFile('src/components/public/cost-calculator-client.tsx');

  assert.match(source, /<span aria-live="polite" className="text-\[11px\] leading-none text-\[var\(--muted\)\]">/);
  assert.match(source, /Сохранено локально · \{formatTime\(lastSavedAt\)\}/);
});
