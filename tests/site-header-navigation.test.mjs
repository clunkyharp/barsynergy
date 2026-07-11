import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('public desktop header navigation is readable and keeps overlap guards', () => {
  const source = readProjectFile('src/components/layout/site-header.tsx');
  const navClass = source.match(/<nav className="([^"]+)"/)?.[1] ?? '';

  assert.match(source, /<div className="container">/);
  assert.doesNotMatch(source, /w-\[min\(1840px,calc\(100vw-40px\)\)\]/);
  assert.match(navClass, /text-\[11px\]/);
  assert.match(navClass, /tracking-\[0\.06em\]/);
  assert.match(navClass, /min-w-0/);
  assert.match(navClass, /2xl:gap-2/);
  assert.match(navClass, /2xl:text-\[12px\]/);
  assert.match(source, /lg:grid-cols-\[176px_minmax\(0,1fr\)_max-content\]/);
  assert.match(source, /2xl:grid-cols-\[220px_minmax\(0,1fr\)_max-content\]/);
  assert.match(source, /src="\/brand\/barsynergy-lockup-light\.svg"/);
  assert.match(source, /whitespace-nowrap/);
  assert.doesNotMatch(source, /href="\/contacts\?topic=other#contact-form"/);
  assert.doesNotMatch(source, /<ArrowUpRight/);
  assert.match(source, /lg:gap-x-6/);
  assert.match(source, /xl:min-w-\[176px\]/);
  const typesSource = readProjectFile('src/components/layout/site-header-types.ts');
  assert.match(typesSource, /export const desktopPrimaryNavItems/);
  assert.match(typesSource, /export const desktopDropdownGroups/);
  assert.match(typesSource, /export const desktopMoreGroups/);
  assert.match(typesSource, /'\/articles'/);
  assert.match(typesSource, /'\/vacancies'/);
  assert.match(typesSource, /'\/specialists'/);
  assert.match(source, /lg:inline-flex/);
  assert.doesNotMatch(source, /href="\/vacancies#vacancy-form"/);
  assert.match(typesSource, /href: '\/contacts'/);
});

test('public desktop dropdown menus open by click and close predictably', () => {
  const source = readProjectFile('src/components/layout/site-header.tsx');

  assert.match(source, /function NavDropdown/);
  assert.match(source, /aria-controls=\{id\}/);
  assert.match(source, /aria-expanded=\{isOpen\}/);
  assert.match(source, /role="menu"/);
  assert.match(source, /role="menuitem"/);
  assert.match(source, /onToggle=\{\(event\) => onToggle\(event\.currentTarget\.open\)\}/);
  assert.match(source, /open=\{isOpen\}/);
  assert.match(source, /event\.key === 'Escape'/);
  assert.match(source, /summaryRef\.current\?\.focus/);
  assert.match(source, /ArrowDown/);
  assert.doesNotMatch(source, /onMouseEnter/);
  assert.doesNotMatch(source, /onMouseLeave/);
});

test('main public pages expose consistent breadcrumbs in their hero sections', () => {
  const primitiveSource = readProjectFile('src/components/public/public-primitives.tsx');
  const editorialSource = readProjectFile('src/components/public/editorial-public-page.tsx');

  assert.match(primitiveSource, /export function PublicBreadcrumbs/);
  assert.match(primitiveSource, /aria-label="Хлебные крошки"/);
  assert.match(primitiveSource, /aria-current="page"/);
  assert.match(primitiveSource, /label: 'Главная'/);
  assert.match(editorialSource, /<PublicBreadcrumbs current=\{breadcrumbLabel \?\? eyebrow\}/);

  // About page uses a bespoke landing hero (no PageHero/breadcrumbs) after the
  // Open Design redesign, so it is intentionally excluded here.
  const standalonePages = [
    ['src/app/(public)/general-sponsors/page.tsx', /<PageHero[\s\S]*breadcrumbs=\{\[\{ label: 'Спонсорство' \}\]\}/]
  ];

  for (const [file, pattern] of standalonePages) {
    assert.match(readProjectFile(file), pattern, file);
  }

  assert.match(readProjectFile('src/components/public/events-page-header.tsx'), /<PublicBreadcrumbs current="События" \/>/);
  assert.match(readProjectFile('src/app/(public)/vacancies/page.tsx'), /<PageHero[\s\S]*title="Вакансии"/);
  assert.match(readProjectFile('src/app/(public)/tools/cost-calculator/page.tsx'), /<PageHero[\s\S]*breadcrumbs=\{\[/);
});
