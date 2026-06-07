import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('public pages use route-specific metadata helper paths', () => {
  const pages = [
    ['src/app/(public)/page.tsx', '/'],
    ['src/app/(public)/about/page.tsx', '/about'],
    ['src/app/(public)/articles/page.tsx', '/articles'],
    ['src/app/(public)/events/page.tsx', '/events'],
    ['src/app/(public)/education/page.tsx', '/education'],
    ['src/app/(public)/vacancies/page.tsx', '/vacancies'],
    ['src/app/(public)/suppliers/page.tsx', '/suppliers'],
    ['src/app/(public)/partners/page.tsx', '/partners'],
    ['src/app/(public)/general-sponsors/page.tsx', '/general-sponsors'],
    ['src/app/(public)/business/page.tsx', '/business'],
    ['src/app/(public)/consulting/page.tsx', '/consulting'],
    ['src/app/(public)/tools/cost-calculator/page.tsx', '/tools/cost-calculator'],
    ['src/app/(public)/contacts/page.tsx', '/contacts']
  ];

  for (const [file, path] of pages) {
    const source = readProjectFile(file);

    assert.match(source, /buildPublicPageMetadata\(\{/);
    assert.match(source, new RegExp(`path: '${path.replace('/', '\\/')}'`), file);
  }

  const metadataSource = readProjectFile('src/lib/public/metadata.ts');
  assert.match(metadataSource, /twitter:\s*\{/);
  assert.match(metadataSource, /canonical: input\.path/);
  assert.match(metadataSource, /url: input\.path/);
});

test('private entry pages use noindex metadata helper', () => {
  const privatePages = [
    'src/app/auth/login/page.tsx',
    'src/app/auth/register/page.tsx',
    'src/app/profile/page.tsx',
    'src/app/(business-workspace)/business/cabinet/page.tsx',
    'src/app/(admin-auth)/admin/login/page.tsx'
  ];

  for (const file of privatePages) {
    assert.match(readProjectFile(file), /buildPrivatePageMetadata\(/, file);
  }

  const metadataSource = readProjectFile('src/lib/public/metadata.ts');
  assert.match(metadataSource, /index: false/);
  assert.match(metadataSource, /follow: false/);
});

test('sitemap includes static routes and published detail route sources only', () => {
  const source = readProjectFile('src/app/sitemap.ts');

  assert.match(source, /export default async function sitemap/);
  assert.match(source, /ContentStatus\.PUBLISHED/);
  assert.doesNotMatch(source, /lastModified:\s*new Date\(/);

  for (const basePath of ['/articles', '/events', '/education', '/vacancies', '/suppliers', '/partners']) {
    assert.match(source, new RegExp(`basePath: '${basePath}'`));
  }

  assert.doesNotMatch(source, /auth/);
  assert.doesNotMatch(source, /admin/);
  assert.doesNotMatch(source, /business\/cabinet/);
});

test('JSON-LD helpers cover site, breadcrumbs and public detail types', () => {
  const jsonLdSource = readProjectFile('src/components/seo/json-ld.tsx');
  const serverInsertedScriptSource = readProjectFile('src/components/seo/server-inserted-script.tsx');
  const structuredDataSource = readProjectFile('src/lib/public/structured-data.ts');
  const layoutSource = readProjectFile('src/app/layout.tsx');

  assert.match(jsonLdSource, /application\/ld\+json/);
  assert.match(jsonLdSource, /replace\(\/<\/g, '\\\\u003c'\)/);
  assert.match(jsonLdSource, /ServerInsertedScript/);
  assert.match(jsonLdSource, /jsonLdScriptId/);
  assert.doesNotMatch(jsonLdSource, /<script\s/);
  assert.match(serverInsertedScriptSource, /useServerInsertedHTML/);
  assert.match(serverInsertedScriptSource, /suppressHydrationWarning/);
  assert.doesNotMatch(layoutSource, /import Script from 'next\/script'/);
  assert.doesNotMatch(layoutSource, /<script\s/);
  assert.match(
    layoutSource,
    /<ServerInsertedScript[\s\S]*html=\{themeInitScript\}[\s\S]*id="barsynergy-theme-init"[\s\S]*nonce=\{nonce\}[\s\S]*\/>/,
    'theme bootstrap must be server-inserted so it keeps the nonce without participating in client hydration'
  );
  assert.match(layoutSource, /buildSiteJsonLd/);

  for (const schemaType of ['Organization', 'WebSite', 'BreadcrumbList', 'Article', 'Event', 'Course', 'JobPosting']) {
    assert.match(structuredDataSource, new RegExp(`'@type': '${schemaType}'`));
  }
});
