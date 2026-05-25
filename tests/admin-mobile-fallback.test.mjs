import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const adminLayoutPath = join(process.cwd(), 'src/app/admin/layout.tsx');

test('admin layout exposes a mobile unsupported state and hides the work area below md', () => {
  const source = readFileSync(adminLayoutPath, 'utf8');

  assert.match(source, /function AdminMobileUnsupportedState/);
  assert.match(source, /Нужен широкий экран/);
  assert.match(source, /экран[а-яА-ЯёЁ\s]*от 768px/);
  assert.match(source, /md:hidden/);
  assert.match(source, /hidden gap-6 py-8 md:grid/);
});
