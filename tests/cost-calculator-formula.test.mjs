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
    '../src/components/public/cost-calculator/format.ts',
    '../src/components/public/cost-calculator-sections.tsx'
  ];

  return Promise.all(files.map((file) => readFile(new URL(file, import.meta.url), 'utf8'))).then((sources) => sources.join('\n'));
}

test('calculator formula returns expected recommended price for the demo recipe', () => {
  const summary = calculateCostSummary({
    foodCostPercent: '30',
    ingredients: demoIngredients,
    additionalCosts: [],
    pricingMode: 'auto',
    roundingMode: 'none',
    customMarkupPercent: '',
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
    additionalCosts: [],
    pricingMode: 'manual',
    roundingMode: 'none',
    customMarkupPercent: '',
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

const defaultOptions = { additionalCosts: [], roundingMode: 'none', customMarkupPercent: '' };

test('calculator rejects invalid percent and never exposes Infinity', () => {
  const zeroPercent = calculateCostSummary({
    foodCostPercent: '0',
    ingredients: demoIngredients,
    ...defaultOptions,
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
    ...defaultOptions,
    pricingMode: 'auto',
    salePrice: ''
  });

  assert.equal(zeroRecipe.totalCost, 0);
  assert.equal(zeroRecipe.canShowSalePrice, false);
  assert.equal(Number.isFinite(zeroRecipe.markupPercent), true);
});

test('calculator pricing mode control uses explicit separated options', async () => {
  const componentSource = await readCalculatorComponentSources();

  assert.match(componentSource, /label: 'Рассчитать цену'/);
  assert.match(componentSource, /label: 'Проверить цену'/);
  assert.doesNotMatch(componentSource, /label: 'Авто'/);
  assert.doesNotMatch(componentSource, /label: 'Вручную'/);
  assert.match(componentSource, /desc: 'Укажите целевой food cost — калькулятор предложит цену меню\.'/);
  assert.match(componentSource, /desc: 'Введите цену продажи и проверьте маржу\.'/);
});

test('calculator ingredient actions keep breathing room inside the table', async () => {
  const componentSource = await readCalculatorComponentSources();

  assert.match(componentSource, /ingredientDesktopGridClassName/);
  assert.match(componentSource, /lg:grid-cols-\[minmax\(60px,1fr\)_64px\]/);
  assert.doesNotMatch(componentSource, /grid-cols-\[minmax\(130px,1fr\)_72px_minmax\(132px,0\.85fr\)_minmax\(132px,0\.85fr\)_88px_96px\]/);
  assert.match(componentSource, /lg:flex lg:justify-center/);
  assert.match(componentSource, /ingredientDesktopGridClassName/);
  assert.match(componentSource, /text-right.*tabular-nums/);
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

  assert.match(componentSource, /calculator-input-group-title/);
  assert.doesNotMatch(componentSource, /calculator-field-card/);
  assert.match(stylesSource, /\.calculator-parameter-fields \{\n\s+min-width: 0;\n\s+align-items: start;\n\}/);
  assert.doesNotMatch(stylesSource, /\.calculator-field-card/);
});

test('calculator result rail keeps secondary metrics inside details', async () => {
  const componentSource = await readCalculatorComponentSources();

  assert.match(componentSource, /calculator-mobile-result-strip-value/);
  assert.match(componentSource, /calculator-mobile-result-strip/);
});

test('calculator exposes a mobile sticky result strip before ingredients', async () => {
  const componentSource = await readCalculatorComponentSources();
  const stylesSource = readGlobalStyles();

  assert.match(componentSource, /function CalculatorMobileResultStrip/);
  assert.match(componentSource, /Цена \$\{money\(summary\.activeSalePrice\)\} · себестоимость \$\{money\(summary\.totalCost\)\}/);
  assert.match(componentSource, /CalculatorMobileResultStrip/);
  assert.match(stylesSource, /\.calculator-mobile-result-strip \{\n\s+position: sticky;/);
});

test('calculator formula help is collapsed across breakpoints', async () => {
  const componentSource = await readCalculatorComponentSources();

  assert.match(componentSource, /calculator-formula-help-summary/);
  assert.match(componentSource, /calculator-formula-help-icon/);
});

test('calculator page avoids redundant hero self-scroll CTA and labels help as instruction', async () => {
  const pageSource = await readFile(new URL('../src/app/(public)/tools/cost-calculator/page.tsx', import.meta.url), 'utf8');
  const componentSource = await readCalculatorComponentSources();

  assert.doesNotMatch(pageSource, /primaryLink=\{\{ label: 'Рассчитать себестоимость', href: '#calculator' \}\}/);
  assert.match(componentSource, /Режим/);
});

test('calculator ingredient names are constrained against long text overflow', async () => {
  const componentSource = await readCalculatorComponentSources();

  assert.match(componentSource, /calculator-ingredient-name-input/);
  assert.match(componentSource, /truncate/);
});

test('calculator workspace exposes a simpler grouped reading order', async () => {
  const componentSource = await readCalculatorComponentSources();
  const stylesSource = readGlobalStyles();

  assert.match(componentSource, /h3.*Режим/);
  assert.match(componentSource, /h3.*Параметры/);
  assert.match(componentSource, /calculator-input-group-title/);
  assert.match(componentSource, /label="Food cost, %"/);
  assert.match(componentSource, /label="Своя цена, ₽"/);
  assert.match(stylesSource, /\.calculator-input-group-title \{/);
});

test('calculator does not render the redundant row subtotal strip', async () => {
  const componentSource = await readCalculatorComponentSources();

  assert.doesNotMatch(componentSource, /function CalculatorSubtotalStrip/);
  assert.doesNotMatch(componentSource, /<CalculatorSubtotalStrip/);
  assert.doesNotMatch(componentSource, /Итого по строкам/);
  assert.doesNotMatch(componentSource, /Ошибок нет/);
});
