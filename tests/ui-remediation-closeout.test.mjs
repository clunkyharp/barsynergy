import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('root layout installs the shared toast provider', () => {
  const source = readProjectFile('src/app/layout.tsx');

  assert.match(source, /@\/components\/ui\/toast/);
  assert.match(source, /<ToastProvider>/);
  assert.match(source, /<\/ToastProvider>/);
});

test('file upload exposes an adjacent error state without glow styling', () => {
  const componentSource = readProjectFile('src/components/ui/file-upload.tsx');
  const cssSource = readProjectFile('src/app/globals.css');

  assert.match(componentSource, /error\?: string/);
  assert.match(componentSource, /aria-invalid=\{error \? true : ariaInvalid\}/);
  assert.match(componentSource, /file-upload-error/);
  assert.match(cssSource, /\.file-upload\.is-invalid \.file-upload-panel/);
  assert.match(cssSource, /border-color: var\(--danger\)/);
  assert.doesNotMatch(cssSource.match(/\.file-upload\.is-invalid[\s\S]*?}/)?.[0] ?? '', /box-shadow/);
});

test('dialog overlay can be marked for composed overlay ownership', () => {
  const source = readProjectFile('src/components/ui/dialog.tsx');

  assert.match(source, /overlayProps\?: DialogOverlayProps/);
  assert.match(source, /\.\.\.overlayProps/);
  assert.match(source, /overlayProps\?\.onMouseDown/);
});
