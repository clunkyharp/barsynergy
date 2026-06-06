import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { ApplicationStatus, ApplicationType, BusinessAccountStatus, UserStatus } from '@prisma/client';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const {
  isBusinessAccessInviteActivationEligible,
  isBusinessAccessInvitePreparationStatusAllowed,
  shouldInvalidateBusinessAccessInvitesOnStatusChange
} = await import('../src/lib/auth/business-access-lifecycle.ts');
const {
  buildContentSecurityPolicy,
  isProtectedAppPath,
  shouldApplyCsp
} = await import('../src/lib/security/csp.ts');

function readProjectFile(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function getDirective(policy, name) {
  return policy
    .split(';')
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith(`${name} `));
}

test('admin draft delete actions filter by draft status in the delete query', () => {
  const draftDeleteActions = [
    ['src/app/admin/articles/actions.ts', 'articleId'],
    ['src/app/admin/events/actions.ts', 'eventId'],
    ['src/app/admin/courses/actions.ts', 'courseId'],
    ['src/app/admin/vacancies/actions.ts', 'vacancyId'],
    ['src/app/admin/suppliers/actions.ts', 'supplierId'],
    ['src/app/admin/partners/actions.ts', 'partnerId'],
    ['src/app/admin/general-sponsors/actions.ts', 'sponsorId']
  ];

  for (const [relativePath, idField] of draftDeleteActions) {
    const source = readProjectFile(relativePath);

    assert.match(
      source,
      new RegExp(
        `deleteMany\\(\\{[\\s\\S]*where:\\s*\\{[\\s\\S]*id:\\s*parsed\\.${idField},[\\s\\S]*status:\\s*ContentStatus\\.DRAFT`
      ),
      `${relativePath} must delete only matching draft records`
    );
  }
});

test('business access invite activation requires approved application and pending principals', () => {
  assert.equal(
    isBusinessAccessInviteActivationEligible({
      applicationStatus: ApplicationStatus.APPROVED,
      userStatus: UserStatus.PENDING,
      businessAccountStatus: BusinessAccountStatus.PENDING
    }),
    true
  );

  for (const applicationStatus of [
    ApplicationStatus.REJECTED,
    ApplicationStatus.ARCHIVED,
    ApplicationStatus.COMPLETED
  ]) {
    assert.equal(
      isBusinessAccessInviteActivationEligible({
        applicationStatus,
        userStatus: UserStatus.PENDING,
        businessAccountStatus: BusinessAccountStatus.PENDING
      }),
      false
    );
  }

  for (const userStatus of [UserStatus.ACTIVE, UserStatus.BLOCKED]) {
    assert.equal(
      isBusinessAccessInviteActivationEligible({
        applicationStatus: ApplicationStatus.APPROVED,
        userStatus,
        businessAccountStatus: BusinessAccountStatus.PENDING
      }),
      false
    );
  }

  for (const businessAccountStatus of [
    BusinessAccountStatus.ACTIVE,
    BusinessAccountStatus.BLOCKED,
    BusinessAccountStatus.ARCHIVED
  ]) {
    assert.equal(
      isBusinessAccessInviteActivationEligible({
        applicationStatus: ApplicationStatus.APPROVED,
        userStatus: UserStatus.PENDING,
        businessAccountStatus
      }),
      false
    );
  }
});

test('business access invite preparation and invalidation follow the approved lifecycle', () => {
  for (const status of [
    ApplicationStatus.NEW,
    ApplicationStatus.IN_REVIEW,
    ApplicationStatus.CONTACTED,
    ApplicationStatus.APPROVED
  ]) {
    assert.equal(isBusinessAccessInvitePreparationStatusAllowed(status), true);
  }

  for (const status of [
    ApplicationStatus.DRAFT,
    ApplicationStatus.FORWARDED_TO_EMPLOYER,
    ApplicationStatus.PAYMENT_PENDING,
    ApplicationStatus.PAID_MANUALLY,
    ApplicationStatus.REJECTED,
    ApplicationStatus.COMPLETED,
    ApplicationStatus.ARCHIVED
  ]) {
    assert.equal(isBusinessAccessInvitePreparationStatusAllowed(status), false);
  }

  assert.equal(
    shouldInvalidateBusinessAccessInvitesOnStatusChange({
      applicationType: ApplicationType.BUSINESS_ACCOUNT_REQUEST,
      previousStatus: ApplicationStatus.APPROVED,
      nextStatus: ApplicationStatus.REJECTED
    }),
    true
  );
  assert.equal(
    shouldInvalidateBusinessAccessInvitesOnStatusChange({
      applicationType: ApplicationType.BUSINESS_ACCOUNT_REQUEST,
      previousStatus: ApplicationStatus.NEW,
      nextStatus: ApplicationStatus.REJECTED
    }),
    false
  );
  assert.equal(
    shouldInvalidateBusinessAccessInvitesOnStatusChange({
      applicationType: ApplicationType.BUSINESS_ACCOUNT_REQUEST,
      previousStatus: ApplicationStatus.APPROVED,
      nextStatus: ApplicationStatus.APPROVED
    }),
    false
  );
  assert.equal(
    shouldInvalidateBusinessAccessInvitesOnStatusChange({
      applicationType: ApplicationType.VACANCY_RESPONSE,
      previousStatus: ApplicationStatus.APPROVED,
      nextStatus: ApplicationStatus.REJECTED
    }),
    false
  );
});

test('CSP builder emits strict script policy while preserving current asset sources', () => {
  const productionPolicy = buildContentSecurityPolicy({
    nonce: 'test-nonce',
    isDevelopment: false
  });
  const productionScriptSource = getDirective(productionPolicy, 'script-src');

  assert.match(productionScriptSource, /'nonce-test-nonce'/);
  assert.doesNotMatch(productionScriptSource, /'unsafe-inline'/);
  assert.doesNotMatch(productionScriptSource, /'unsafe-eval'/);
  assert.match(productionPolicy, /img-src 'self' data: blob: https:\/\/s3\.twcstorage\.ru https:\/\/images\.unsplash\.com https:\/\/picsum\.photos/);
  assert.match(productionPolicy, /font-src 'self' data:/);
  assert.match(productionPolicy, /connect-src 'self'/);

  const developmentPolicy = buildContentSecurityPolicy({
    nonce: 'dev-nonce',
    isDevelopment: true
  });
  const developmentScriptSource = getDirective(developmentPolicy, 'script-src');

  assert.match(developmentScriptSource, /'nonce-dev-nonce'/);
  assert.match(developmentScriptSource, /'unsafe-eval'/);
  assert.doesNotMatch(developmentScriptSource, /'unsafe-inline'/);

  assert.equal(isProtectedAppPath('/admin'), true);
  assert.equal(isProtectedAppPath('/business'), false);
  assert.equal(isProtectedAppPath('/business/cabinet/settings'), true);
  assert.equal(isProtectedAppPath('/articles'), false);
  assert.equal(shouldApplyCsp('/'), true);
  assert.equal(shouldApplyCsp('/_next/static/chunk.js'), false);
  assert.equal(shouldApplyCsp('/favicon.ico'), false);
});

test('middleware keeps auth routing edge-safe and preserves login returnTo redirects', () => {
  const source = readProjectFile('src/middleware.ts');

  assert.match(source, /from '@\/lib\/auth\/session-constants'/);
  assert.doesNotMatch(source, /from '@\/lib\/auth\/session'/);
  assert.match(source, /request\.nextUrl\.pathname === '\/profile' \|\| request\.nextUrl\.pathname\.startsWith\('\/profile\/'\)/);
  assert.match(source, /loginUrl\.searchParams\.set\('returnTo', request\.nextUrl\.pathname\)/);
  assert.match(
    source,
    /request\.nextUrl\.pathname === '\/business\/cabinet'[\s\S]*request\.nextUrl\.pathname\.startsWith\('\/business\/cabinet\/'\)[\s\S]*loginUrl\.searchParams\.set\('returnTo', '\/business\/cabinet'\)/
  );
  assert.match(source, /request\.nextUrl\.pathname === '\/admin' \|\| request\.nextUrl\.pathname\.startsWith\('\/admin\/'\)/);
  assert.match(source, /NextResponse\.json\(\{ error: 'Unauthorized\.' \}, \{ status: 401 \}\)/);
});
