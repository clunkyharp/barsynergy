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
  assert.match(navClass, /text-\[13px\]/);
  assert.match(navClass, /min-w-0/);
  assert.match(navClass, /xl:flex/);
  assert.match(source, /xl:grid-cols-\[176px_minmax\(0,1fr\)_176px\]/);
  assert.match(source, /2xl:grid-cols-\[220px_minmax\(0,1fr\)_184px\]/);
  assert.match(source, /whitespace-nowrap/);
  assert.doesNotMatch(source, /href="\/contacts\?topic=other#contact-form"/);
  assert.doesNotMatch(source, /<ArrowUpRight/);
  assert.doesNotMatch(navClass, /text-\[12px\]/);
});

test('public desktop more menu opens on hover and closes predictably', () => {
  const source = readProjectFile('src/components/layout/site-header.tsx');
  const detailsStart = source.indexOf('<details');
  const detailsEnd = source.indexOf('</details>');
  const detailsSource = source.slice(detailsStart, detailsEnd);

  assert.match(source, /const \[isMoreNavOpen, setIsMoreNavOpen\] = useState\(false\)/);
  assert.match(source, /setIsMoreNavOpen\(false\);/);
  assert.match(detailsSource, /onMouseEnter=\{\(\) => setIsMoreNavOpen\(true\)\}/);
  assert.match(detailsSource, /onMouseLeave=\{\(\) => setIsMoreNavOpen\(false\)\}/);
  assert.match(detailsSource, /onToggle=\{\(event\) => setIsMoreNavOpen\(event\.currentTarget\.open\)\}/);
  assert.match(detailsSource, /open=\{isMoreNavOpen\}/);
  assert.match(detailsSource, /event\.key === 'Escape'/);
});

test('main public pages expose consistent breadcrumbs in their hero sections', () => {
  const primitiveSource = readProjectFile('src/components/public/public-primitives.tsx');
  const editorialSource = readProjectFile('src/components/public/editorial-public-page.tsx');

  assert.match(primitiveSource, /export function PublicBreadcrumbs/);
  assert.match(primitiveSource, /aria-label="Хлебные крошки"/);
  assert.match(primitiveSource, /aria-current="page"/);
  assert.match(primitiveSource, /label: 'Главная'/);
  assert.match(editorialSource, /<PublicBreadcrumbs current=\{breadcrumbLabel \?\? eyebrow\}/);

  const standalonePages = [
    ['src/app/(public)/events/page.tsx', /<PublicBreadcrumbs current="События"/],
    ['src/app/(public)/vacancies/page.tsx', /<PublicBreadcrumbs current="Вакансии"/],
    ['src/app/(public)/general-sponsors/page.tsx', /<PublicBreadcrumbs current="Спонсорство"/],
    ['src/app/(public)/about/page.tsx', /<PublicBreadcrumbs current="О проекте"/]
  ];

  for (const [file, pattern] of standalonePages) {
    assert.match(readProjectFile(file), pattern, file);
  }

  assert.match(readProjectFile('src/app/(public)/tools/cost-calculator/page.tsx'), /breadcrumbLabel="Калькулятор себестоимости"/);
});
