import assert from 'node:assert/strict';
import test from 'node:test';

const { slugify } = await import('../src/lib/utils/slugify.ts');

test('slugify transliterates Cyrillic including composed й and ё', () => {
  assert.equal(
    slugify('Настройки приготовления эспрессо в specialty сегменте, с учётом всех важных параметров:'),
    'nastroyki-prigotovleniya-espresso-v-specialty-segmente-s-uchyotom-vsekh-vazhnykh-parametrov'
  );
});

test('slugify keeps separators compact and trims outer dashes', () => {
  assert.equal(slugify('  Gelabo / Hustle Brew  '), 'gelabo-hustle-brew');
  assert.equal(slugify('---Новый  материал---'), 'novyy-material');
});

test('slugify produces only lowercase ascii with dashes', () => {
  const result = slugify('Барная карта 2024: всё о ликёрах');
  assert.match(result, /^[a-z0-9-]+$/);
});
