import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('search page derives suggestion chips from weighted live content instead of hardcoded words', () => {
  const source = readProjectFile('src/app/(public)/search/page.tsx');

  assert.match(source, /const SEARCH_CHIP_STOP_WORDS = new Set/);
  assert.match(source, /type SearchChipSource = \{/);
  assert.match(source, /function addChipWeight/);
  assert.match(source, /function extractSearchChipCandidates/);
  assert.match(source, /const suggestionSources: SearchChipSource\[] = \[/);
  assert.match(source, /const suggestionChips = extractSearchChipCandidates\(suggestionSources\)/);
  assert.match(source, /suggestionChips\.slice\(0, 3\)\.map\(\(chip\) =>/);
  assert.match(source, /suggestionChips\.map\(\(chip\) =>/);
  assert.doesNotMatch(source, /\['бариста', 'поставщики', 'обучение'\]/);
  assert.doesNotMatch(source, /const SUGGESTION_CHIPS = \[/);
});
