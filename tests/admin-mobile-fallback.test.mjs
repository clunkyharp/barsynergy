import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const adminLayoutPath = join(process.cwd(), 'src/app/admin/layout.tsx');
const adminShellFramePath = join(process.cwd(), 'src/components/layout/admin-shell-frame.tsx');

test('admin layout exposes a mobile unsupported state and hides the work area below md', () => {
  const source = readFileSync(adminLayoutPath, 'utf8');

  assert.match(source, /function AdminMobileUnsupportedState/);
  assert.match(source, /Нужен широкий экран/);
  assert.match(source, /экран[а-яА-ЯёЁ\s]*от 768px/);
  assert.match(source, /md:hidden/);
  assert.match(source, /<AdminShellFrame role=\{user\.role\}>/);

  const shellFrameSource = readFileSync(adminShellFramePath, 'utf8');

  assert.match(shellFrameSource, /admin-layout-grid hidden min-h-screen md:grid/);
  assert.match(shellFrameSource, /data-sidebar-state=\{isCollapsed \? 'collapsed' : 'expanded'\}/);
});
