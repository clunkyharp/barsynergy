import assert from 'node:assert/strict';
import test from 'node:test';

const { parseCalculatorNumberInput } = await import('../src/lib/calculator/number-input.ts');

test('calculator number input accepts complete decimal numbers', () => {
  assert.equal(parseCalculatorNumberInput('100'), 100);
  assert.equal(parseCalculatorNumberInput(' 100 '), 100);
  assert.equal(parseCalculatorNumberInput('100.5'), 100.5);
  assert.equal(parseCalculatorNumberInput('100,5'), 100.5);
  assert.equal(parseCalculatorNumberInput('0'), 0);
});

test('calculator number input rejects empty, negative and noisy values', () => {
  assert.equal(parseCalculatorNumberInput(''), null);
  assert.equal(parseCalculatorNumberInput('   '), null);
  assert.equal(parseCalculatorNumberInput('-100'), null);
  assert.equal(parseCalculatorNumberInput('100abc'), null);
  assert.equal(parseCalculatorNumberInput('abc100'), null);
  assert.equal(parseCalculatorNumberInput('100,5abc'), null);
  assert.equal(parseCalculatorNumberInput('100.'), null);
  assert.equal(parseCalculatorNumberInput(',5'), null);
});
