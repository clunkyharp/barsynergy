import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('public form validation uses explicit Russian copy for required and length errors', () => {
  const source = readProjectFile('src/components/public/public-form-validation.tsx');

  assert.match(source, /Заполните поле «\$\{label\}»\./);
  assert.match(source, /В поле «\$\{label\}» нужно минимум \$\{control\.minLength\} символов\./);
  assert.match(source, /В поле «\$\{label\}» можно использовать максимум \$\{control\.maxLength\} символов\./);
  assert.match(source, /Проверьте формат поля «\$\{label\}»\./);
  assert.match(source, /if \(validity\.customError\)/);
  assert.match(source, /return customMessage;/);
});

test('business request first step validates through the shared public validation helper before step advance', () => {
  const source = readProjectFile('src/components/public/business-request-form.tsx');

  assert.match(source, /validatePublicForm/);
  assert.match(source, /const stepOneControls = \['registerEmail', 'registerContactPerson'\]/);
  assert.match(source, /if \(validatePublicForm\(form, stepOneControls\)\) \{/);
  assert.doesNotMatch(source, /disabled=\{!email\.trim\(\) \|\| !contactPerson\.trim\(\)\}/);
});
