import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { URL } from 'node:url';
import { readGlobalStyles } from './helpers/global-styles.mjs';

const { calculateCostSummary, calculateIngredientCost } = await import('../src/lib/calculator/cost-calculator.ts');

const demoIngredients = [
  { id: 'ingredient-1', name: 'Зерно для эспрессо', packagePrice: '1450', packageAmount: '1', packageUnit: 'kg', recipeAmount: '18', recipeUnit: 'g' },
  { id: 'ingredient-2', name: 'Молоко', packagePrice: '120', packageAmount: '1', packageUnit: 'l', recipeAmount: '180', recipeUnit: 'ml' },
  { id: 'ingredient-3', name: 'Ванильный сироп', packagePrice: '650', packageAmount: '1', packageUnit: 'l', recipeAmount: '15', recipeUnit: 'ml' }
];

function round(value) {
  return Math.round(value * 100) / 100;
}

async function readCalculatorComponentSources() {
  const files = [
    '../src/components/public/cost-calculator-client.tsx',
    '../src/components/public/cost-calculator/ingredient-editor.tsx',
    '../src/components/public/cost-calculator/ingredient-editor-internal.tsx',
    '../src/components/public/cost-calculator/result-rail.tsx',
    '../src/components/public/cost-calculator/use-cost-calculator-state.ts',
    '../src/components/public/cost-calculator/format.ts'
  ];

  return Promise.all(files.map((file) => readFile(new URL(file, import.meta.url), 'utf8'))).then((sources) => sources.join('\n'));
}

test('calculator formula returns expected recommended price for the demo recipe', () => {
  const summary = calculateCostSummary({
    foodCostPercent: '30',
    ingredients: demoIngredients,
    pricingMode: 'auto',
    salePrice: ''
  });

  assert.equal(round(summary.totalCost), 57.45);
  assert.equal(round(summary.recommendedPrice), 191.5);
  assert.equal(round(summary.actualFoodCostPercent), 30);
  assert.equal(summary.canShowRecommendedPrice, true);
  assert.equal(summary.canShowSalePrice, true);
  assert.equal(summary.rowErrors.length, 0);
});

test('calculator manual price returns expected margin and markup', () => {
  const summary = calculateCostSummary({
    foodCostPercent: '30',
    ingredients: demoIngredients,
    pricingMode: 'manual',
    salePrice: '250'
  });

  assert.equal(round(summary.totalCost), 57.45);
  assert.equal(round(summary.activeSalePrice), 250);
  assert.equal(round(summary.grossProfit), 192.55);
  assert.equal(round(summary.actualFoodCostPercent), 22.98);
  assert.equal(round(summary.grossMargin), 77.02);
  assert.equal(round(summary.markupPercent), 335.16);
});

test('calculator handles unit conversion and incompatible units without NaN', () => {
  const validRow = calculateIngredientCost({
    id: 'milk',
    name: 'Молоко',
    packagePrice: '120',
    packageAmount: '1',
    packageUnit: 'l',
    recipeAmount: '180',
    recipeUnit: 'ml'
  });

  assert.equal(round(validRow.cost), 21.6);
  assert.equal(validRow.error, null);

  const invalidRow = calculateIngredientCost({
    id: 'bad',
    name: 'Сироп',
    packagePrice: '650',
    packageAmount: '1',
    packageUnit: 'l',
    recipeAmount: '15',
    recipeUnit: 'g'
  });

  assert.equal(invalidRow.cost, null);
  assert.match(invalidRow.error, /одного типа/);
});

test('calculator rejects invalid percent and never exposes Infinity', () => {
  const zeroPercent = calculateCostSummary({
    foodCostPercent: '0',
    ingredients: demoIngredients,
    pricingMode: 'auto',
    salePrice: ''
  });

  assert.match(zeroPercent.foodCostError, /больше 0/);
  assert.equal(zeroPercent.recommendedPrice, 0);
  assert.equal(Number.isFinite(zeroPercent.recommendedPrice), true);

  const zeroRecipe = calculateCostSummary({
    foodCostPercent: '30',
    ingredients: [
      { id: 'zero', name: 'Лёд', packagePrice: '200', packageAmount: '1', packageUnit: 'kg', recipeAmount: '0', recipeUnit: 'g' }
    ],
    pricingMode: 'auto',
    salePrice: ''
  });

  assert.equal(zeroRecipe.totalCost, 0);
  assert.equal(zeroRecipe.canShowSalePrice, false);
  assert.equal(Number.isFinite(zeroRecipe.markupPercent), true);
});

test('calculator pricing mode control uses explicit separated options', async () => {
  const componentSource = await readCalculatorComponentSources();
  const stylesSource = readGlobalStyles();

  assert.match(componentSource, /label: 'Рассчитать цену по доле себестоимости'/);
  assert.match(componentSource, /description: 'Введите целевую долю, и калькулятор покажет цену меню\.'/);
  assert.match(componentSource, /label: 'Проверить введённую цену'/);
  assert.match(componentSource, /description: 'Укажите цену продажи, чтобы проверить себестоимость и маржу\.'/);
  assert.doesNotMatch(componentSource, /label: 'Авто'/);
  assert.doesNotMatch(componentSource, /label: 'Вручную'/);
  assert.match(stylesSource, /\.cost-sheet \.calculator-mode-control \{\n\s+display: grid;\n\s+grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(stylesSource, /\.cost-sheet \.calculator-mode-control \.choice-card\[data-selected="true"\] \{\n\s+border-color: var\(--accent\);\n\s+background: var\(--surface\);\n\s+color: var\(--text\);/);
  assert.match(stylesSource, /@media \(max-width: 520px\) \{\n\s+\.cost-sheet \.calculator-mode-control \{\n\s+grid-template-columns: 1fr;/);
});

test('calculator ingredient actions keep breathing room inside the table', async () => {
  const componentSource = await readCalculatorComponentSources();

  assert.match(componentSource, /ingredientDesktopGridClassName =\s+'\s*lg:grid-cols-\[minmax\(178px,1\.35fr\)_78px_minmax\(132px,0\.86fr\)_minmax\(132px,0\.86fr\)_104px_88px\]'/);
  assert.match(componentSource, /lg:grid-cols-\[minmax\(60px,1fr\)_64px\]/);
  assert.doesNotMatch(componentSource, /grid-cols-\[minmax\(130px,1fr\)_72px_minmax\(132px,0\.85fr\)_minmax\(132px,0\.85fr\)_88px_96px\]/);
  assert.match(componentSource, /lg:flex lg:justify-center/);
  assert.match(componentSource, /className="truncate text-center">Действия/);
  assert.match(componentSource, /className="truncate text-right">Цена, ₽/);
  assert.match(componentSource, /className="truncate text-right">Себестоимость/);
  assert.match(componentSource, /const duplicateLabel = `Дублировать ингредиент: \$\{ingredient\.name \|\| `строка \$\{index \+ 1\}`\}`;/);
  assert.match(componentSource, /const removeLabel = `Удалить ингредиент: \$\{ingredient\.name \|\| `строка \$\{index \+ 1\}`\}`;/);
  assert.match(componentSource, /aria-label=\{duplicateLabel\}/);
  assert.match(componentSource, /title=\{duplicateLabel\}/);
  assert.match(componentSource, /aria-label=\{removeLabel\}/);
  assert.match(componentSource, /title=\{removeLabel\}/);
});

test('calculator parameters render as a plain field group', async () => {
  const componentSource = await readCalculatorComponentSources();
  const stylesSource = readGlobalStyles();

  assert.match(componentSource, /calculator-parameter-fields grid gap-4/);
  assert.doesNotMatch(componentSource, /calculator-field-card/);
  assert.match(stylesSource, /\.calculator-parameter-fields \{\n\s+min-width: 0;\n\s+align-items: start;\n\}/);
  assert.doesNotMatch(stylesSource, /\.calculator-field-card/);
});

test('calculator result rail keeps secondary metrics inside details', async () => {
  const componentSource = await readCalculatorComponentSources();

  assert.match(componentSource, /<ResultMetricCard tone="accent" label="Себестоимость"/);
  assert.match(componentSource, /<ResultMetricCard label="Маржа" value=\{marginValue\}/);
  assert.match(componentSource, /<details className="calculator-result-details mt-4">/);
  assert.match(componentSource, /<summary>Подробности<\/summary>/);
  assert.match(componentSource, /<ResultDetailRow label="Доля себестоимости"/);
  assert.match(componentSource, /<ResultDetailRow label="Наценка"/);
  assert.match(componentSource, /<ResultDetailRow label="Валовая прибыль"/);
  assert.doesNotMatch(componentSource, /<ResultMetricCard label="Наценка"/);
  assert.doesNotMatch(componentSource, /<ResultMetricCard label="Валовая прибыль"/);
});

test('calculator exposes a mobile sticky result strip before ingredients', async () => {
  const componentSource = await readCalculatorComponentSources();
  const stylesSource = readGlobalStyles();

  assert.match(componentSource, /function CalculatorMobileResultStrip/);
  assert.match(componentSource, /Цена \$\{money\(summary\.activeSalePrice\)\} · себестоимость \$\{money\(summary\.totalCost\)\}/);
  assert.match(componentSource, /<CalculatorMobileResultStrip summary=\{calculator\.summary\} \/>/);
  assert.match(stylesSource, /\.calculator-mobile-result-strip \{\n\s+position: sticky;/);
});

test('calculator formula help is collapsed across breakpoints', async () => {
  const componentSource = await readCalculatorComponentSources();
  const stylesSource = readGlobalStyles();

  assert.match(componentSource, /<details className="calculator-formula-help border-b border-\[var\(--line\)\]/);
  assert.match(componentSource, /<summary className="calculator-formula-help-summary/);
  assert.match(componentSource, /<FormulaHelpGrid className="calculator-formula-help-grid grid gap-4 border-t border-\[var\(--line\)\] px-4 py-4 md:grid-cols-3 md:px-5" \/>/);
  assert.doesNotMatch(componentSource, /<FormulaHelpGrid className="hidden gap-3 border-b border-\[var\(--line\)\]/);
  assert.doesNotMatch(componentSource, /text-\[var\(--muted\)\] md:hidden/);
  assert.match(stylesSource, /\.calculator-formula-help\[open\] \.calculator-formula-help-icon \{\n\s+transform: rotate\(45deg\);/);
});

test('calculator page avoids redundant hero self-scroll CTA and labels help as instruction', async () => {
  const pageSource = await readFile(new URL('../src/app/(public)/tools/cost-calculator/page.tsx', import.meta.url), 'utf8');
  const componentSource = await readCalculatorComponentSources();

  assert.doesNotMatch(pageSource, /primaryLink=\{\{ label: 'Рассчитать себестоимость', href: '#calculator' \}\}/);
  assert.match(componentSource, /Инструкция/);
});

test('calculator ingredient names are constrained against long text overflow', async () => {
  const componentSource = await readCalculatorComponentSources();

  assert.match(componentSource, /calculator-ingredient-name-input/);
  assert.match(componentSource, /truncate/);
});

test('calculator workspace exposes a simpler grouped reading order', async () => {
  const componentSource = await readCalculatorComponentSources();
  const fieldsStart = componentSource.indexOf('function PricingModeFields');
  const fieldsEnd = componentSource.indexOf('function CalculatorMobileResultStrip');
  const fieldsSource = componentSource.slice(fieldsStart, fieldsEnd);
  const stylesSource = readGlobalStyles();

  assert.match(fieldsSource, /<section className="calculator-input-group" aria-labelledby="calculator-mode-title">/);
  assert.match(fieldsSource, /<h3 id="calculator-mode-title"/);
  assert.match(fieldsSource, /<section className="calculator-input-group" aria-labelledby="calculator-fields-title">/);
  assert.match(fieldsSource, /<h3 id="calculator-fields-title"/);
  assert.match(fieldsSource, /label="Целевая доля себестоимости, %"/);
  assert.match(fieldsSource, /Если себестоимость занимает 30% от цены/);
  assert.match(fieldsSource, /label="Своя цена продажи"/);
  assert.match(fieldsSource, /Если хотите задать цену вручную/);
  assert.doesNotMatch(fieldsSource, /label="Доля себестоимости"/);
  assert.doesNotMatch(fieldsSource, /label="Ручная цена продажи, ₽"/);
  assert.match(stylesSource, /\.calculator-input-group \{/);
  assert.match(stylesSource, /\.calculator-input-group-title \{/);
});

test('calculator does not render the redundant row subtotal strip', async () => {
  const componentSource = await readCalculatorComponentSources();

  assert.doesNotMatch(componentSource, /function CalculatorSubtotalStrip/);
  assert.doesNotMatch(componentSource, /<CalculatorSubtotalStrip/);
  assert.doesNotMatch(componentSource, /Итого по строкам/);
  assert.doesNotMatch(componentSource, /Ошибок нет/);
});
