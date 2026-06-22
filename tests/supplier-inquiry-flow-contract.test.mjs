import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('supplier model is owned by business account without backfill assumptions', () => {
  const schema = readProjectFile('prisma/schema.prisma');
  const migration = readProjectFile('prisma/migrations/20260617000000_add_supplier_business_account/migration.sql');

  assert.match(schema, /suppliers\s+Supplier\[\]/);
  assert.match(schema, /businessAccountId String\?/);
  assert.match(schema, /businessAccount BusinessAccount\? @relation\(fields: \[businessAccountId\]/);
  assert.match(schema, /@@index\(\[businessAccountId\]\)/);
  assert.match(migration, /ALTER TABLE "Supplier" ADD COLUMN "businessAccountId" TEXT/);
  assert.doesNotMatch(migration, /UPDATE "Supplier"/);
});

test('supplier publication maps owner and structured contacts from application', () => {
  const source = readProjectFile('src/lib/admin/application-publication.ts');

  assert.match(source, /businessAccountId: application\.businessAccountId \?\? null/);
  assert.match(source, /contactLabel: application\.name/);
  assert.match(source, /contactPhone: application\.phone/);
  assert.match(source, /contactTelegram: application\.telegram/);
  assert.match(source, /contactWhatsapp: null/);
});

test('supplier inquiry links business account and queues business notification', () => {
  const source = readProjectFile('src/lib/messaging/supplier-inquiry-action.ts');

  assert.match(source, /businessAccount:\s*\{/);
  assert.match(source, /businessAccountId: input\.supplier\.businessAccount\?\.id \?\? null/);
  assert.match(source, /hasUnreadForBusiness: Boolean\(input\.supplier\.businessAccount\)/);
  assert.match(source, /ApplicationNotificationChannel\.BUSINESS_MESSAGE_EMAIL/);
  assert.match(source, /threadUrl: `\/business\/cabinet\/responses\/\$\{application\.id\}`/);
});

test('admin supplier forms support manual business-account linking', () => {
  const actions = readProjectFile('src/app/admin/suppliers/actions.ts');
  const createPage = readProjectFile('src/app/admin/suppliers/create/page.tsx');
  const editPage = readProjectFile('src/app/admin/suppliers/[supplierId]/page.tsx');

  assert.match(actions, /businessAccountId: z\.string\(\)\.trim\(\)\.optional\(\)/);
  assert.match(actions, /businessAccountId: nullableString\(parsed\.businessAccountId\)/);
  assert.match(createPage, /getActiveBusinessAccounts/);
  assert.match(createPage, /name="businessAccountId"/);
  assert.match(editPage, /getActiveBusinessAccounts/);
  assert.match(editPage, /defaultValue=\{supplier\.businessAccountId \?\? ''\}/);
});

test('business inbox accepts vacancy responses and owned supplier inquiries', () => {
  const businessQueries = readProjectFile('src/modules/business/queries.ts');
  const sendMessage = readProjectFile('src/lib/messaging/send-message.ts');
  const listPage = readProjectFile('src/app/(business-workspace)/business/cabinet/responses/page.tsx');
  const detailPage = readProjectFile('src/app/(business-workspace)/business/cabinet/responses/[applicationId]/page.tsx');

  assert.match(businessQueries, /type: ApplicationType\.VACANCY_RESPONSE/);
  assert.match(businessQueries, /type: ApplicationType\.SUPPLIER_INQUIRY/);
  assert.match(businessQueries, /businessAccountId/);
  assert.match(sendMessage, /businessAccount: \{ ownerId: userId \}/);
  assert.match(sendMessage, /queueMessageNotifications/);
  assert.match(listPage, /response\.type === ApplicationType\.SUPPLIER_INQUIRY/);
  assert.match(detailPage, /isSupplierInquiry/);
  assert.match(detailPage, /Открыть поставщика/);
});

test('profile inquiry uses supplier interlocutor only for linked supplier owner', () => {
  const query = readProjectFile('src/modules/profile/queries.ts');
  const inquiryPage = readProjectFile('src/app/profile/inquiries/[applicationId]/page.tsx');
  const responsePage = readProjectFile('src/app/profile/responses/[applicationId]/page.tsx');

  assert.match(query, /businessAccountId: true/);
  assert.match(inquiryPage, /application\.supplier\?\.businessAccountId/);
  assert.match(inquiryPage, /application\.supplier\.title/);
  assert.match(inquiryPage, /Платформа BARSYNERGY/);
  assert.doesNotMatch(responsePage, /ApplicationType\.SUPPLIER_INQUIRY/);
});

test('supplier hero does not render direct contact dump', () => {
  const hero = readProjectFile('src/components/public/supplier-detail-hero.tsx');
  const page = readProjectFile('src/app/(public)/suppliers/[slug]/page.tsx');
  const body = readProjectFile('src/components/public/supplier-detail-body.tsx');

  assert.doesNotMatch(hero, /VacancyDirectContacts/);
  assert.doesNotMatch(hero, /contactLabel/);
  assert.doesNotMatch(page, /facts\.find\(\(f\) => f\.label === 'Контакты'\)/);
  assert.match(page, /contactLabel=\{supplier\.contactLabel\}/);
  assert.match(body, /Контакты поставщика/);
  assert.match(body, /DirectContactLinks/);
  assert.match(body, /parseSupplierContactRows/);
  assert.match(body, /Запросить условия/);
});
