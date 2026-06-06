import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('shared public contact fields include concrete placeholder examples', () => {
  const source = readProjectFile('src/components/public/application-form-section.tsx');

  assert.match(source, /placeholder="name@example\.com"/);
  assert.match(source, /placeholder="\+7 999 123 45 67"/);
  assert.match(source, /placeholder="@username"/);
});

test('auth and public request forms use example placeholders for key free-text fields', () => {
  const sources = [
    'src/app/auth/login/page.tsx',
    'src/app/auth/password-reset/page.tsx',
    'src/components/public/contact-application-form.tsx',
    'src/components/public/vacancy-application-forms.tsx',
    'src/components/public/education-application-forms.tsx',
    'src/components/public/supplier-application-form.tsx',
    'src/components/public/partner-application-form.tsx',
    'src/components/public/event-application-form.tsx'
  ].map(readProjectFile).join('\n');

  assert.match(sources, /placeholder="name@example\.com"/);
  assert.match(sources, /placeholder="Например, Coffee Point"/);
  assert.match(sources, /placeholder="Иван Иванов"/);
  assert.match(sources, /placeholder="https:\/\/example\.ru"/);
  assert.match(sources, /placeholder="Например: /);
});
