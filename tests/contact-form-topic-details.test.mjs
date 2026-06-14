import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('contact form groups topic-specific fields into a dedicated revealed section', () => {
  const componentSource = readProjectFile('src/components/public/contact-application-form.tsx');
  const constantsSource = readProjectFile('src/components/public/contact-application-form-constants.ts');
  const stylesSource = readProjectFile('src/app/styles/forms.css');

  assert.match(componentSource, /const showTopicDetails =/);
  assert.match(componentSource, /const topicDetailsTitle =/);
  assert.match(componentSource, /const topicDetailsHint =/);
  assert.match(componentSource, /<FormSection title=\{topicDetailsTitle\}>/);
  assert.match(componentSource, /form-topic-details-panel grid gap-4 md:grid-cols-2/);
  assert.match(constantsSource, /Добавили поля:/);
  assert.match(stylesSource, /\.form-topic-details \{/);
  assert.match(stylesSource, /animation: form-section-reveal 180ms ease-out/);
  assert.match(stylesSource, /\.form-topic-details-panel \{/);
});
