import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { URL } from 'node:url';

const { calculateCostSummary, calculateIngredientCost } = await import('../src/lib/calculator/cost-calculator.ts');

const demoIngredients = [
  { id: 'ingredient-1', name: 'Зерно для эспрессо', packagePrice: '1450', packageAmount: '1', packageUnit: 'kg', recipeAmount: '18', recipeUnit: 'g' },
  { id: 'ingredient-2', name: 'Молоко', packagePrice: '120', packageAmount: '1', packageUnit: 'l', recipeAmount: '180', recipeUnit: 'ml' },
  { id: 'ingredient-3', name: 'Ванильный сироп', packagePrice: '650', packageAmount: '1', packageUnit: 'l', recipeAmount: '15', recipeUnit: 'ml' }
];

function round(value) {
  return Math.round(value * 100) / 100;
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
  const componentSource = await readFile(new URL('../src/components/public/cost-calculator-client.tsx', import.meta.url), 'utf8');
  const stylesSource = await readFile(new URL('../src/app/globals.css', import.meta.url), 'utf8');

  assert.match(componentSource, /eyebrow: 'Автоматически'/);
  assert.match(componentSource, /label: 'Рассчитать цену'/);
  assert.match(componentSource, /description: 'От целевой доли себестоимости\.'/);
  assert.match(componentSource, /eyebrow: 'Ручной ввод'/);
  assert.match(componentSource, /label: 'Проверить свою цену'/);
  assert.match(componentSource, /description: 'Введите цену продажи и посмотрите маржу\.'/);
  assert.doesNotMatch(componentSource, /label: 'Авто'/);
  assert.doesNotMatch(componentSource, /label: 'Вручную'/);
  assert.match(stylesSource, /\.cost-sheet \.calculator-mode-control \{\n\s+display: grid;\n\s+grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(stylesSource, /\.cost-sheet \.calculator-mode-control \.choice-card \{\n\s+min-height: 6\.75rem;/);
});

test('calculator ingredient actions keep breathing room inside the table', async () => {
  const componentSource = await readFile(new URL('../src/components/public/cost-calculator-client.tsx', import.meta.url), 'utf8');

  assert.match(componentSource, /grid-cols-\[minmax\(130px,1fr\)_72px_minmax\(132px,0\.85fr\)_minmax\(132px,0\.85fr\)_88px_96px\]/);
  assert.doesNotMatch(componentSource, /minmax\(145px,1\.05fr\)_minmax\(80px,0\.5fr\)_minmax\(150px,0\.8fr\)_minmax\(150px,0\.8fr\)_minmax\(94px,0\.58fr\)_104px/);
  assert.match(componentSource, /lg:flex lg:justify-center/);
  assert.match(componentSource, /className="text-center">Действия/);
});

test('calculator field cards keep input text away from card edges', async () => {
  const stylesSource = await readFile(new URL('../src/app/globals.css', import.meta.url), 'utf8');

  assert.match(stylesSource, /\.calculator-field-card \.field-base \{\n\s+border-color: transparent;\n\s+padding-inline: 12px;\n\}/);
  assert.doesNotMatch(stylesSource, /\.calculator-field-card \.field-base \{\n\s+border-color: transparent;\n\s+padding-right: 0;\n\s+padding-left: 0;\n\}/);
});

test('calculator does not render the redundant row subtotal strip', async () => {
  const componentSource = await readFile(new URL('../src/components/public/cost-calculator-client.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(componentSource, /function CalculatorSubtotalStrip/);
  assert.doesNotMatch(componentSource, /<CalculatorSubtotalStrip/);
  assert.doesNotMatch(componentSource, /Итого по строкам/);
  assert.doesNotMatch(componentSource, /Ошибок нет/);
});
