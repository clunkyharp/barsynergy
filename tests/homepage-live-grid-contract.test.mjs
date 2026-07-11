import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('homepage replaces the platform link grid with live support cards', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');

  assert.match(source, /const materialsCard: HomepageLiveCard/);
  assert.match(source, /<EditorialFeatured card=\{data\.article\}/);
  assert.match(source, /Платформа для работы/);
  assert.doesNotMatch(source, /Свежее на платформе/);
  assert.doesNotMatch(source, /Живые карточки из вакансий, поставщиков, событий, обучения и материалов/);
  assert.match(source, /<EditorialSupportCard/);
  assert.match(source, /const workSections/);
  assert.doesNotMatch(source, /const platformTools = \[/);
  assert.doesNotMatch(source, /Разделы платформы/);
});

test('homepage work sections use compact uniform cards without artificial bento spans', () => {
  const source = readProjectFile('src/components/public/homepage-client.tsx');
  const cardSource = readProjectFile('src/components/public/homepage-current.tsx');
  const sectionStart = source.indexOf('id="home-tools"');
  const sectionEnd = source.indexOf('{data.generalSponsors.length');
  const sectionSource = source.slice(sectionStart, sectionEnd);

  assert.match(sectionSource, /grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3/);
  assert.match(sectionSource, /work-section-card/);
  assert.doesNotMatch(sectionSource, /wideIndexes/);
  assert.doesNotMatch(sectionSource, /lg:col-span-2/);
  assert.match(cardSource, /density = 'default'/);
  assert.match(cardSource, /density === 'compact'/);
});

test('homepage steps use varied visual cards without fixed heights', () => {
  const source = readProjectFile('src/components/public/homepage-steps.tsx');

  assert.match(source, /const stepVisuals/);
  assert.match(source, /data-step-tone=\{visual\.tone\}/);
  assert.match(source, /home-step-card-visual/);
  assert.match(source, /SectionIcon/);
  assert.doesNotMatch(source, /min-h-\[/);
  assert.doesNotMatch(source, /h-\[/);
});
