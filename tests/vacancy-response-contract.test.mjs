import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('vacancy response action sets userId only for USER role', () => {
  const actionSource = readProjectFile('src/app/(public)/vacancies/actions.ts');

  assert.match(actionSource, /import.*UserRole/);
  assert.match(actionSource, /UserRole\.USER/);
  assert.match(actionSource, /currentUser\?\.role === UserRole\.USER \? currentUser\.id : null/);
  assert.doesNotMatch(actionSource, /userId: currentUser\?\.id \?\? null/);
});

test('vacancy response action still works for guest / non-USER users', () => {
  const actionSource = readProjectFile('src/app/(public)/vacancies/actions.ts');

  assert.match(actionSource, /getCurrentUser/);
  assert.match(actionSource, /currentUser\?\.role === UserRole\.USER \? currentUser\.id : null/);
});

test('profile layout blocks non-USER roles', () => {
  const layoutSource = readProjectFile('src/app/profile/layout.tsx');

  assert.match(layoutSource, /UserRole/);
  assert.match(layoutSource, /user\.role !== UserRole\.USER/);
  assert.match(layoutSource, /redirect\('\/'\)/);
});

test('profile responses detail page guards by userId ownership', () => {
  const detailSource = readProjectFile('src/app/profile/responses/[applicationId]/page.tsx');
  const querySource = readProjectFile('src/modules/profile/queries.ts');

  assert.match(detailSource, /getUserApplication\(applicationId, currentUser\.id\)/);
  assert.match(querySource, /export async function getUserApplication\(applicationId: string, userId: string\)/);
  assert.match(querySource, /where:\s*\{/);
  assert.match(querySource, /id: applicationId/);
  assert.match(querySource, /userId,/);
});

test('profile responses list queries by userId', () => {
  const listSource = readProjectFile('src/app/profile/responses/page.tsx');
  const querySource = readProjectFile('src/modules/profile/queries.ts');

  // Page passes the ownership filter; the where clause is built in the query module (A-01).
  assert.match(listSource, /userId: user\.id/);
  assert.match(listSource, /listUserResponses\(\{/);
  assert.match(querySource, /const where: Prisma\.ApplicationWhereInput = \{/);
  assert.match(querySource, /getUserResponses\(where, sort, page, pageSize\)/);
});

test('profile responses empty state uses plain signed-in account copy', () => {
  const listSource = readProjectFile('src/app/profile/responses/page.tsx');

  assert.match(listSource, /Отклики на вакансии появятся здесь после отправки из аккаунта/);
  assert.doesNotMatch(listSource, /отправленные без входа/);
});

test('account menu has role-based items (USER path)', () => {
  const menuSource = readProjectFile('src/components/layout/account-menu.tsx');

  assert.match(menuSource, /role === 'USER'/);
  assert.match(menuSource, /Профиль.*\/profile/);
  assert.match(menuSource, /Мои отклики.*\/profile\/responses/);
});

test('account menu has role-based items (BUSINESS path)', () => {
  const menuSource = readProjectFile('src/components/layout/account-menu.tsx');

  assert.match(menuSource, /role === 'BUSINESS'/);
  assert.match(menuSource, /Кабинет компании.*\/business\/cabinet/);
  assert.match(menuSource, /Заявки.*\/business\/cabinet\/requests/);
});

test('account menu has role-based items (ADMIN path)', () => {
  const menuSource = readProjectFile('src/components/layout/account-menu.tsx');

  assert.match(menuSource, /role === 'ADMIN' \|\| role === 'MODERATOR'/);
  assert.match(menuSource, /Админ-панель.*\/admin/);
});
