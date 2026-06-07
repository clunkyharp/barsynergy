import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('published content section assigns a stable React key to each rendered row', () => {
  const source = readProjectFile('src/components/public/published-content-section.tsx');

  assert.match(source, /\{visibleItems\.map\(\(item\) => <[^>]+ key=\{item\.id\}[^>]*>\{renderRow\(item\)\}<\/[^>]+>\)\}/);
});
