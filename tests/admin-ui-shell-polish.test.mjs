import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('admin list pages share status tabs and compact filters', () => {
  const controlsSource = readProjectFile('src/components/admin/content-admin-controls-filters.tsx');
  const articlesSource = readProjectFile('src/app/admin/articles/page.tsx');
  const eventsSource = readProjectFile('src/app/admin/events/page.tsx');
  const suppliersSource = readProjectFile('src/app/admin/suppliers/page.tsx');
  const applicationsSource = readProjectFile('src/app/admin/applications/page.tsx');

  assert.match(controlsSource, /export function AdminFilterBar/);
  assert.match(controlsSource, /export function AdminStatusTabs/);
  assert.match(controlsSource, /export function AdminContentStatusTabs/);
  assert.match(controlsSource, /className=\{cn\('admin-status-tab', item\.current && 'admin-filter-active'\)\}/);
  assert.match(controlsSource, /const content = <div className="admin-filter-toolbar">\{children\}<\/div>/);

  assert.match(articlesSource, /<AdminContentStatusTabs basePath=\{ADMIN_ARTICLES_PATH\} params=\{params\} \/>/);
  assert.match(articlesSource, /includeStatus=\{false\}/);
  assert.match(eventsSource, /<AdminContentStatusTabs basePath=\{ADMIN_EVENTS_PATH\} params=\{params\} \/>/);
  assert.match(suppliersSource, /<AdminContentStatusTabs basePath=\{ADMIN_SUPPLIERS_PATH\} params=\{params\} \/>/);
  assert.match(applicationsSource, /<AdminStatusTabs/);
  assert.doesNotMatch(applicationsSource, /htmlFor="status"/);
});

test('admin header keeps its identity block; business sidebar exposes only navigation', () => {
  const headerSource = readProjectFile('src/components/layout/admin-header.tsx');
  const businessSidebarSource = readProjectFile('src/components/layout/business-sidebar.tsx');

  assert.match(headerSource, /const adminHeaderSections = \[/);
  assert.match(headerSource, /admin-topbar-meta/);
  assert.match(headerSource, /На сайт/);
  assert.match(headerSource, /usePathname\(\)/);

  assert.doesNotMatch(businessSidebarSource, /companyName|activeRequestCount|Активен/, 'sidebar identity block must be removed');
  assert.match(businessSidebarSource, /aria-label="Разделы кабинета компании"/);
});
