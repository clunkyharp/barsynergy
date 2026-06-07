import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const guardedActionFiles = [
  'src/app/(public)/business/actions.ts',
  'src/app/(public)/consulting/actions.ts',
  'src/app/(public)/contacts/actions.ts',
  'src/app/(public)/education/actions.ts',
  'src/app/(public)/events/actions.ts',
  'src/app/(public)/partners/actions.ts',
  'src/app/(public)/suppliers/actions.ts',
  'src/app/(public)/vacancies/actions.ts',
  'src/app/admin/applications/business-access-actions.ts',
  'src/app/admin/applications/notes-actions.ts',
  'src/app/admin/applications/publication-actions.ts',
  'src/app/admin/applications/status-actions.ts',
  'src/app/admin/articles/actions.ts',
  'src/app/admin/courses/actions.ts',
  'src/app/admin/events/actions.ts',
  'src/app/admin/general-sponsors/actions.ts',
  'src/app/admin/homepage/actions.ts',
  'src/app/admin/partners/actions.ts',
  'src/app/admin/suppliers/actions.ts',
  'src/app/admin/tags/actions.ts',
  'src/app/admin/taxonomy/actions.ts',
  'src/app/admin/users/actions.ts',
  'src/app/admin/vacancies/actions.ts',
  'src/app/auth/login/actions.ts',
  'src/app/auth/register/actions.ts',
  'src/app/auth/verify-email/actions.ts',
  'src/app/auth/password-reset/actions.ts',
  'src/app/auth/business-activation/actions.ts',
  'src/lib/business/actions.ts'
];

test('high-risk server action files call same-origin guard', () => {
  for (const file of guardedActionFiles) {
    const source = readFileSync(file, 'utf8');
    const exportCount = [...source.matchAll(/export async function /g)].length;
    const guardedMutationCount =
      [...source.matchAll(/await assertSameOriginServerAction\(\)/g)].length +
      [...source.matchAll(/submitPublicApplicationAction\(/g)].length;

    assert.match(source, /assertSameOriginServerAction|submitPublicApplicationAction/);
    assert.equal(
      guardedMutationCount,
      exportCount,
      `${file} should guard each exported action`
    );
  }
});

test('admin application server action facade uses explicit async exports', () => {
  const file = 'src/app/admin/applications/actions.ts';
  const source = readFileSync(file, 'utf8');
  const expectedExports = [
    'updateApplicationProcessing',
    'updateApplicationStatus',
    'updateApplicationBusinessNotes',
    'updateApplicationInternalNotes',
    'createVacancyDraftFromApplication',
    'publishContentFromApplication',
    'prepareBusinessAccessAction'
  ];

  assert.match(source, /^'use server';/);
  assert.doesNotMatch(source, /^export\s*{/m);

  for (const exportName of expectedExports) {
    assert.match(
      source,
      new RegExp(`export async function ${exportName}\\(`),
      `${file} should explicitly export ${exportName}`
    );
  }
});
