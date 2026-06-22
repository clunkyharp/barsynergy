import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { URL } from 'node:url';

async function readMultiSelectSource() {
  return readFile(new URL('../src/components/ui/multi-select.tsx', import.meta.url), 'utf8');
}

test('multi-select combobox trigger has proper ARIA attributes', async () => {
  const source = await readMultiSelectSource();
  assert.match(source, /role="combobox"/);
  assert.match(source, /aria-expanded/);
  assert.match(source, /aria-haspopup="listbox"/);
  assert.match(source, /aria-controls/);
});

test('multi-select chip remove buttons are keyboard accessible', async () => {
  const source = await readMultiSelectSource();
  assert.match(source, /role="button"/);
  assert.match(source, /tabIndex=\{-1\}/);
  assert.match(source, /aria-label=/);
  assert.match(source, /onKeyDown/);
  assert.match(source, /e\.key === 'Enter'/);
  assert.match(source, /e\.key === ' '/);
});

test('multi-select dropdown options are keyboard navigable', async () => {
  const source = await readMultiSelectSource();
  assert.match(source, /role="listbox"/);
  assert.match(source, /role="option"/);
  assert.match(source, /aria-selected/);
  assert.match(source, /onMouseEnter/);
});

test('multi-select menu has close button', async () => {
  const source = await readMultiSelectSource();
  assert.match(source, /Готово/);
  assert.match(source, /closeMenu/);
});

test('multi-select keyboard handlers cover standard keys', async () => {
  const source = await readMultiSelectSource();
  assert.match(source, /ArrowDown/);
  assert.match(source, /ArrowUp/);
  assert.match(source, /Escape/);
  assert.match(source, /Tab/);
  assert.match(source, /Enter/);
});
