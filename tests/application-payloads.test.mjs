import assert from 'node:assert/strict';
import test from 'node:test';
import { ApplicationType } from '@prisma/client';

const {
  buildApplicationPayload,
  getApplicationPayloadText,
  parseApplicationPayload,
  safeParseApplicationPayload
} = await import('../src/lib/applications/application-payloads.ts');

test('application payload helpers validate and read payloads by application type', () => {
  const payload = buildApplicationPayload(ApplicationType.VACANCY_SUBMISSION, {
    companyName: 'Test Bar',
    position: 'Бариста',
    employmentType: null,
    salaryLabel: null,
    experienceLabel: null,
    shortDescription: 'Short vacancy summary.'
  });

  assert.equal(parseApplicationPayload(ApplicationType.VACANCY_SUBMISSION, payload).companyName, 'Test Bar');
  assert.equal(getApplicationPayloadText(ApplicationType.VACANCY_SUBMISSION, payload, ['companyName']), 'Test Bar');
  assert.equal(safeParseApplicationPayload(ApplicationType.VACANCY_RESPONSE, payload).success, false);
});
