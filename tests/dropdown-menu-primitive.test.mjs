import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();
const dropdownMenuPath = join(repoRoot, 'src/components/ui/dropdown-menu.tsx');
const adminActionMenuPath = join(repoRoot, 'src/components/ui/admin-action-menu.tsx');

test('shared dropdown menu primitive owns portal positioning and keyboard dismissal', () => {
  const source = readFileSync(dropdownMenuPath, 'utf8');

  assert.match(source, /export function DropdownMenu/);
  assert.match(source, /export function DropdownMenuTrigger/);
  assert.match(source, /export function DropdownMenuContent/);
  assert.match(source, /getOverlayPosition/);
  assert.match(source, /createPortal/);
  assert.match(source, /event\.key === 'Escape'/);
  assert.match(source, /focusFirstElement/);
});

test('admin action menu composes the shared dropdown primitive', () => {
  const source = readFileSync(adminActionMenuPath, 'utf8');

  assert.match(source, /@\/components\/ui\/dropdown-menu/);
  assert.match(source, /@\/components\/ui\/dialog/);
  assert.match(source, /<DropdownMenu/);
  assert.match(source, /<DropdownMenuTrigger/);
  assert.match(source, /<DropdownMenuContent/);
  assert.match(source, /<Dialog/);
  assert.match(source, /data-admin-action-confirm/);
});
