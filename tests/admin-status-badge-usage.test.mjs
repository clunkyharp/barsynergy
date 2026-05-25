import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();
const adminRoot = join(repoRoot, 'src/app/admin');
const statusBadgePath = join(repoRoot, 'src/components/ui/status-badge.tsx');

function listFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return listFiles(fullPath);
    }

    return fullPath.endsWith('.tsx') ? [fullPath] : [];
  });
}

test('admin status badge exposes a stable shared component marker', () => {
  const source = readFileSync(statusBadgePath, 'utf8');
  assert.match(source, /data-component="admin-status-badge"/);
  assert.match(source, /export function StatusBadge/);
  assert.match(source, /export function AdminStatusChip/);
});

test('admin screens do not import the legacy Badge alias for status rendering', () => {
  const offenders = listFiles(adminRoot)
    .map((filePath) => ({
      filePath,
      source: readFileSync(filePath, 'utf8')
    }))
    .filter(({ source }) => source.includes("@/components/ui/badge") || source.includes('@/components/ui/badge'))
    .map(({ filePath }) => relative(repoRoot, filePath));

  assert.deepEqual(offenders, []);
});

test('admin status UI uses the shared status badge module', () => {
  const statusFiles = listFiles(adminRoot)
    .map((filePath) => ({
      filePath,
      source: readFileSync(filePath, 'utf8')
    }))
    .filter(({ source }) => /<StatusBadge|<AdminStatusChip|StatusBadgeVariant/.test(source));

  assert.ok(statusFiles.length > 0, 'expected admin screens to render shared status badges');

  const offenders = statusFiles
    .filter(({ source }) => !source.includes("@/components/ui/status-badge") && !source.includes('@/components/ui/status-badge'))
    .map(({ filePath }) => relative(repoRoot, filePath));

  assert.deepEqual(offenders, []);
});

test('admin screens do not define local semantic status pill token styles', () => {
  const offenders = listFiles(adminRoot)
    .map((filePath) => ({
      filePath,
      source: readFileSync(filePath, 'utf8')
    }))
    .filter(({ source }) => /success-bg|warning-bg|danger-bg|pending-bg/.test(source))
    .map(({ filePath }) => relative(repoRoot, filePath));

  assert.deepEqual(offenders, []);
});
