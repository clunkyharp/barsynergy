import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('vacancies and suppliers expose sort controls and sticky filter summary', () => {
  const vacanciesSource = readProjectFile('src/app/(public)/vacancies/page.tsx');
  const suppliersSource = readProjectFile('src/app/(public)/suppliers/page.tsx');
  const vacancyQuerySource = readProjectFile('src/modules/content/vacancies/queries.ts');
  const supplierQuerySource = readProjectFile('src/lib/public/content/suppliers.ts');
  const filtersSource = readProjectFile('src/components/public/public-filters-variant-sidebar.tsx');
  const sectionSource = readProjectFile('src/components/public/published-content-section.tsx');
  const formsCss = readProjectFile('src/app/styles/forms.css');

  assert.match(vacanciesSource, /const vacancySortOptions = \[/);
  assert.match(vacanciesSource, /name: 'sort', label: 'Сортировка', allLabel: 'По умолчанию'/);
  assert.match(vacanciesSource, /sortLabel=\{getVacancySortLabel\(selectedSort\)\}/);

  assert.match(suppliersSource, /const supplierSortOptions = \[/);
  assert.match(suppliersSource, /name: 'sort'/);
  assert.match(suppliersSource, /sortLabel=\{getSupplierSortLabel\(selectedSort\)\}/);

  assert.match(vacancyQuerySource, /function getVacancyOrderBy/);
  assert.match(vacancyQuerySource, /const sort = optionalParam\(params, 'sort'\)/);
  assert.match(supplierQuerySource, /function getSupplierOrderBy/);
  assert.match(supplierQuerySource, /const sort = optionalParam\(params, 'sort'\)/);

  assert.match(filtersSource, /PublicFiltersActiveChip/);
  assert.match(filtersSource, /activeSummaryCountLabel \?\? title/);
  assert.match(sectionSource, /<aside className="public-catalog-sidebar min-w-0">/);
  assert.match(sectionSource, /showSidebarTitle \? \(/, 'visible catalog title must stay outside the sidebar/list grid');
  assert.match(sectionSource, /public-catalog-layout container grid/, 'catalog sidebar and list must share one explicit layout grid');
  assert.match(sectionSource, /xl:items-start/, 'catalog sidebar and list must align from the top edge');
  assert.match(formsCss, /\.public-catalog-layout\s*\{[\s\S]*?align-items: start;/, 'catalog layout needs a CSS fallback for top alignment');
});
