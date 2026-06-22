import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

/* ───── Inline pure function implementations (no @/ alias) ───── */

function scoreRelevance(title, query) {
  if (!query) return 10;
  const lower = title.toLowerCase();
  const qLower = query.toLowerCase();
  if (lower === qLower) return 0;
  if (lower.startsWith(qLower)) return 1;
  if (lower.includes(qLower)) return 2;
  return 10;
}

function firstParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

function hasActivePublicContentParams(params, keys) {
  if (!keys) {
    keys = ['q', 'category', 'city', 'format', 'level', 'period', 'partnerType', 'featured', 'verified', 'employmentType'];
  }
  return keys.some((key) => {
    const value = params[key];
    if (Array.isArray(value)) {
      return value.some((item) => item.trim().length > 0);
    }
    return Boolean(value?.trim());
  });
}

function optionalParam(params, key) {
  const value = firstParam(params[key])?.trim();
  return value && value.length > 0 ? value : undefined;
}

function normalizeParams(params) {
  return Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          const values = value.map((item) => item.trim()).filter(Boolean);
          return values.length > 0 ? [key, values] : undefined;
        }
        const normalizedValue = value?.trim();
        return normalizedValue ? [key, normalizedValue] : undefined;
      })
      .filter(Boolean)
  );
}

function listResult(input) {
  return {
    ...input,
    params: normalizeParams(input.params),
    totalPages: Math.max(1, Math.ceil(input.total / input.pageSize))
  };
}

function getPage(params) {
  const value = Number.parseInt(firstParam(params.page) ?? '1', 10);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function getPageSize(params) {
  const value = Number.parseInt(firstParam(params.pageSize) ?? '12', 10);
  if (!Number.isFinite(value) || value <= 0) {
    return 12;
  }
  return Math.min(value, 24);
}

async function listResultWithRelevance(query, page, pageSize, getIdQuery, fetchRecords) {
  if (!query) {
    const { ids, total } = await getIdQuery({ idsOnly: false });
    const paginatedIds = ids.slice((page - 1) * pageSize, page * pageSize).map((item) => item.id);
    const items = paginatedIds.length > 0 ? await fetchRecords(paginatedIds) : [];
    const order = new Map(paginatedIds.map((id, i) => [id, i]));
    items.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    return { items, total };
  }

  const { ids, total } = await getIdQuery({ idsOnly: true });
  const qLower = query.toLowerCase();

  const scored = ids
    .map((item) => ({ id: item.id, score: scoreRelevance(item.title, qLower) }))
    .sort((a, b) => a.score - b.score);

  const paginatedIds = scored
    .slice((page - 1) * pageSize, page * pageSize)
    .map((s) => s.id);

  const items = paginatedIds.length > 0 ? await fetchRecords(paginatedIds) : [];
  const order = new Map(paginatedIds.map((id, i) => [id, i]));
  items.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

  return { items, total };
}

/* ───── Pure function tests ───── */

test('scoreRelevance orders exact > prefix > contains > no match', () => {
  const q = 'кофейня';

  assert.equal(scoreRelevance('кофейня', q), 0, 'exact match must score 0');
  assert.equal(scoreRelevance('кофейня москва', q), 1, 'prefix/starts-with must score 1');
  assert.equal(scoreRelevance('каппинг кофейня', q), 2, 'contains must score 2');
  assert.equal(scoreRelevance('ресторан', q), 10, 'no match must score 10');
  assert.ok(scoreRelevance('кофейня', q) < scoreRelevance('кофейня москва', q), 'exact < prefix');
  assert.ok(scoreRelevance('кофейня москва', q) < scoreRelevance('каппинг кофейня', q), 'prefix < contains');
  assert.ok(scoreRelevance('каппинг кофейня', q) < scoreRelevance('ресторан', q), 'contains < no match');
});

test('scoreRelevance is case-insensitive', () => {
  assert.equal(scoreRelevance('Кофейня', 'кофейня'), 0, 'title uppercase, query lowercase');
  assert.equal(scoreRelevance('кофейня', 'КОФЕЙНЯ'), 0, 'title lowercase, query uppercase');
  assert.equal(scoreRelevance('Кофейня На Выезде', 'кофейня'), 1, 'prefix with mixed case');
});

test('scoreRelevance handles empty query gracefully', () => {
  assert.equal(typeof scoreRelevance('кофейня', ''), 'number', 'empty query returns a number');
  assert.equal(scoreRelevance('', 'кофейня'), 10, 'empty title returns no-match score');
  assert.equal(scoreRelevance('', ''), 10, 'both empty returns no-match score');
});

test('hasActivePublicContentParams filters whitespace-only and empty values', () => {
  assert.equal(hasActivePublicContentParams({ q: '   ' }), false, 'whitespace-only q is inactive');
  assert.equal(hasActivePublicContentParams({ q: '' }), false, 'empty q is inactive');
  assert.equal(hasActivePublicContentParams({}), false, 'no params is inactive');
  assert.equal(hasActivePublicContentParams({ category: '' }), false, 'empty category is inactive');
  assert.equal(hasActivePublicContentParams({ q: 'кофейня' }), true, 'real q is active');
  assert.equal(hasActivePublicContentParams({ category: 'coffee' }), true, 'real category is active');
  assert.equal(hasActivePublicContentParams({ q: 'кофейня', period: 'upcoming' }, ['q', 'period']), true, 'q active with period key');

  assert.equal(
    hasActivePublicContentParams({ period: 'upcoming' }, ['q', 'period']),
    true,
    'period active when in keys'
  );
  assert.equal(
    hasActivePublicContentParams({ period: 'upcoming' }, ['q']),
    false,
    'period not active when not in keys'
  );
});

test('hasActivePublicContentParams handles array values', () => {
  assert.equal(hasActivePublicContentParams({ q: ['', '   '] }), false, 'array of empty/whitespace is inactive');
  assert.equal(hasActivePublicContentParams({ q: ['кофейня', ''] }), true, 'array with valid value is active');
});

test('optionalParam trims and returns undefined for whitespace', () => {
  assert.equal(optionalParam({ q: 'кофейня' }, 'q'), 'кофейня');
  assert.equal(optionalParam({ q: '  кофейня  ' }, 'q'), 'кофейня');
  assert.equal(optionalParam({ q: '' }, 'q'), undefined);
  assert.equal(optionalParam({ q: '   ' }, 'q'), undefined);
  assert.equal(optionalParam({}, 'q'), undefined);
  assert.equal(optionalParam({ q: ['кофейня', 'бар'] }, 'q'), 'кофейня');
});

test('listResult normalizes query params (strips whitespace-only)', () => {
  const result = listResult({
    items: [],
    page: 1,
    pageSize: 12,
    total: 0,
    params: { q: '   ', category: 'coffee', city: '', period: 'all' }
  });

  assert.deepEqual(result.params, { category: 'coffee', period: 'all' });
  assert.equal(result.totalPages, 1);
});

test('getPage and getPageSize handle invalid input gracefully', () => {
  assert.equal(getPage({ page: 'abc' }), 1, 'non-numeric page defaults to 1');
  assert.equal(getPage({ page: '-5' }), 1, 'negative page defaults to 1');
  assert.equal(getPage({ page: '0' }), 1, 'zero page defaults to 1');
  assert.equal(getPage({}), 1, 'missing page defaults to 1');
  assert.equal(getPage({ page: '2' }), 2, 'valid page parsed');

  assert.equal(getPageSize({ pageSize: 'abc' }), 12, 'non-numeric pageSize defaults to 12');
  assert.equal(getPageSize({ pageSize: '0' }), 12, 'zero pageSize defaults to 12');
  assert.equal(getPageSize({ pageSize: '999' }), 24, 'pageSize capped at max');
  assert.equal(getPageSize({ pageSize: '6' }), 6, 'valid pageSize used');
});

/* ───── listResultWithRelevance ───── */

test('listResultWithRelevance returns items in relevance order with pagination', async () => {
  const items = [
    { id: '1', title: 'Бариста в кофейню' },
    { id: '2', title: 'кофейня ищет бариста' },
    { id: '3', title: 'Управляющий рестораном' },
    { id: '4', title: 'кофейня' },
  ];

  const getIdQuery = async () => ({ ids: items, total: 4 });
  const fetchRecords = async (ids) => items.filter((item) => ids.includes(item.id));

  const result = await listResultWithRelevance('кофейня', 1, 10, getIdQuery, fetchRecords);

  assert.equal(result.total, 4);
  assert.equal(result.items.length, 4);
  assert.equal(result.items[0].id, '4', 'exact title match first');
  assert.equal(result.items[1].id, '2', 'prefix match second');
  assert.equal(result.items[2].id, '1', 'contains match third');
});

test('listResultWithRelevance paginates correctly', async () => {
  const items = [
    { id: '1', title: 'кофейня А' },
    { id: '2', title: 'кофейня Б' },
    { id: '3', title: 'кофейня В' },
    { id: '4', title: 'кофейня Г' },
  ];

  const getIdQuery = async () => ({ ids: items, total: 4 });
  const fetchRecords = async (ids) => items.filter((item) => ids.includes(item.id));

  const page1 = await listResultWithRelevance('кофейня', 1, 2, getIdQuery, fetchRecords);
  assert.equal(page1.items.length, 2);
  assert.equal(page1.total, 4);

  const page2 = await listResultWithRelevance('кофейня', 2, 2, getIdQuery, fetchRecords);
  assert.equal(page2.items.length, 2);
  assert.equal(page2.total, 4);

  const page3 = await listResultWithRelevance('кофейня', 3, 2, getIdQuery, fetchRecords);
  assert.equal(page3.items.length, 0);
  assert.equal(page3.total, 4);
});

test('listResultWithRelevance preserves editorial order when no query', async () => {
  const ids = [
    { id: 'c', title: 'Gamma' },
    { id: 'a', title: 'Alpha' },
    { id: 'b', title: 'Beta' },
  ];

  const getIdQuery = async () => ({ ids, total: 3 });
  const fetchRecords = async (ids) => ids.map((id) => ({ id, title: 'item' }));

  const result = await listResultWithRelevance(undefined, 1, 10, getIdQuery, fetchRecords);

  assert.equal(result.items.length, 3);
  assert.equal(result.items[0].id, 'c', 'preserves original order from ids');
  assert.equal(result.items[1].id, 'a');
  assert.equal(result.items[2].id, 'b');
});

/* ───── Static analysis: field coverage ───── */

test('events search covers locationName, address and city name', () => {
  const source = readProjectFile('src/lib/public/content/events.ts');

  assert.match(source, /locationName/);
  assert.match(source, /address/);
  assert.match(source, /city.*name/);
  assert.match(source, /eventSearchFields/);
});

test('vacancies search covers companyName, position and city name', () => {
  const source = readProjectFile('src/modules/content/vacancies/queries.ts');

  assert.match(source, /companyName/);
  assert.match(source, /position/);
  assert.match(source, /city.*name/);
  assert.match(source, /vacancySearchFields/);
});

test('suppliers search covers companyName, serviceArea, contactLabel and city name', () => {
  const source = readProjectFile('src/lib/public/content/suppliers.ts');

  assert.match(source, /companyName/);
  assert.match(source, /serviceArea/);
  assert.match(source, /contactLabel/);
  assert.match(source, /city.*name/);
  assert.match(source, /supplierSearchFields/);
});

test('partners search covers companyName', () => {
  const source = readProjectFile('src/lib/public/content/partners.ts');

  assert.match(source, /companyName/);
  assert.match(source, /partnerSearchFields/);
});

test('education search covers instructorName and city name', () => {
  const source = readProjectFile('src/lib/public/content/education.ts');

  assert.match(source, /instructorName/);
  assert.match(source, /city.*name/);
  assert.match(source, /courseSearchFields/);
});

test('all entity queries use listResultWithRelevance for search', () => {
  const events = readProjectFile('src/lib/public/content/events.ts');
  const vacancies = readProjectFile('src/modules/content/vacancies/queries.ts');
  const suppliers = readProjectFile('src/lib/public/content/suppliers.ts');
  const partners = readProjectFile('src/lib/public/content/partners.ts');
  const articles = readProjectFile('src/lib/public/content/articles.ts');
  const education = readProjectFile('src/lib/public/content/education.ts');

  assert.match(events, /listResultWithRelevance/);
  assert.match(vacancies, /listResultWithRelevance/);
  assert.match(suppliers, /listResultWithRelevance/);
  assert.match(partners, /listResultWithRelevance/);
  assert.match(articles, /listResultWithRelevance/);
  assert.match(education, /listResultWithRelevance/);
});

test('all entity queries avoid bare textSearch in where clause', () => {
  const events = readProjectFile('src/lib/public/content/events.ts');
  const vacancies = readProjectFile('src/modules/content/vacancies/queries.ts');
  const suppliers = readProjectFile('src/lib/public/content/suppliers.ts');
  const partners = readProjectFile('src/lib/public/content/partners.ts');
  const articles = readProjectFile('src/lib/public/content/articles.ts');
  const education = readProjectFile('src/lib/public/content/education.ts');

  assert.doesNotMatch(events, /textSearch\(q\)/);
  assert.doesNotMatch(vacancies, /textSearch\(q\)/);
  assert.doesNotMatch(suppliers, /textSearch\(q\)/);
  assert.doesNotMatch(partners, /textSearch\(q\)/);
  assert.doesNotMatch(articles, /textSearch\(q\)/);
  assert.doesNotMatch(education, /textSearch\(q\)/);
});

/* ───── Static analysis: /search page includes partners ───── */

test('global search route now aggregates partners section', () => {
  const source = [
    'src/app/(public)/search/page.tsx',
    'src/components/public/search-results-client.tsx'
  ].map(readProjectFile).join('\n');

  assert.match(source, /getPublishedPartners/);
  assert.match(source, /basePath: '\/partners'/);
  assert.match(source, /label: 'Партнёры'/);
});

test('global search route still aggregates all 6 content types', () => {
  const source = readProjectFile('src/app/(public)/search/page.tsx');

  assert.match(source, /getPublishedVacancies/);
  assert.match(source, /getPublishedSuppliers/);
  assert.match(source, /getPublishedArticles/);
  assert.match(source, /getPublishedCourses/);
  assert.match(source, /getPublishedEvents/);
  assert.match(source, /getPublishedPartners/);
});

/* ───── Static analysis: admin application search ───── */

test('admin application search covers businessAccount and payload fields', () => {
  const source = readProjectFile('src/lib/admin/application-page-helpers.ts');

  assert.match(source, /businessAccount/);
  assert.match(source, /companyName/);
  assert.match(source, /employerCompanyName/);
  assert.match(source, /projectName/);
});

test('admin application search still covers basic fields', () => {
  const source = readProjectFile('src/lib/admin/application-page-helpers.ts');

  assert.match(source, /subject/);
  assert.match(source, /name/);
  assert.match(source, /email/);
  assert.match(source, /phone/);
  assert.match(source, /telegram/);
});

/* ───── Static analysis: /events hasActiveSearch ───── */

test('events page uses hasActivePublicContentParams for active search detection', () => {
  const source = readProjectFile('src/app/(public)/events/page.tsx');

  assert.match(source, /hasActivePublicContentParams\(contentParams/);
  assert.doesNotMatch(source, /Boolean\(\s*contentParams\.q \|\| contentParams\.category/);
});

/* ───── Static analysis: public filters content ───── */

test('public filters always show active chip even for invalid/removed values', () => {
  const source = readProjectFile('src/components/public/public-filters-active.ts');

  assert.match(source, /category\?\.name \?\? currentCategory/);
  assert.match(source, /city\?\.name \?\? currentCity/);
  assert.match(source, /option\?\.label \?\? value/);
});
