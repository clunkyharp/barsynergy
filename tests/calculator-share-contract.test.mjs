import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

const {
  buildCalculatorExportFilename,
  buildCalculatorShareUrl,
  createCalculatorSharePayload,
  parseCalculatorSharePayload,
  serializeCalculatorSharePayload,
} = await import('../src/lib/calculator/cost-calculator-share.ts');

test('calculator share payload serializes and restores recipe state safely', () => {
  const payload = createCalculatorSharePayload({
    itemName: 'Ванильный латте',
    foodCostPercent: '30',
    pricingMode: 'auto',
    salePrice: '',
    roundingMode: 'none',
    customMarkupPercent: '',
    ingredients: [
      {
        id: 'ingredient-1',
        name: 'Зерно',
        packagePrice: '1450',
        packageAmount: '1',
        packageUnit: 'kg',
        recipeAmount: '18',
        recipeUnit: 'g'
      }
    ],
    additionalCosts: [{ id: 'ac-1', name: 'Аренда', amount: '12' }],
    drinkParams: { drinkVolume: '200', drinkYield: '36', prepMethod: 'espresso' }
  });

  const encoded = serializeCalculatorSharePayload(payload);
  const restored = parseCalculatorSharePayload(encoded);
  const url = buildCalculatorShareUrl('https://example.com/tools/cost-calculator', payload);

  assert.ok(encoded.length > 20);
  assert.deepEqual(restored, payload);
  assert.match(url, /preset=/);
  assert.equal(buildCalculatorExportFilename('Эспрессо тоник'), 'barsynergy-recipe-эспрессо-тоник.json');
});

test('calculator client exposes real share and export actions in toolbar', () => {
  const clientSource = readProjectFile('src/components/public/cost-calculator-client.tsx');
  const stateSource = readProjectFile('src/components/public/cost-calculator/use-cost-calculator-state.ts');

  assert.match(clientSource, /handleShareRecipe/);
  assert.match(stateSource, /async function shareRecipe/);
  assert.match(stateSource, /function exportRecipe/);
  assert.match(stateSource, /const preset = new URL\(window\.location\.href\)\.searchParams\.get\('preset'\)/);
});
