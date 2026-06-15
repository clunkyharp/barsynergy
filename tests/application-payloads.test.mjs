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

test('master application payloads validate inquiry and submission fields', () => {
  const inquiryPayload = buildApplicationPayload(ApplicationType.MASTER_INQUIRY, {
    source: 'public_form',
    masterTitle: 'Сервис барного оборудования',
    serviceType: 'Настройка кофемашины',
    projectDetails: 'Нужно провести диагностику и настроить помол.',
    contactName: 'Иван',
    contactPhone: '+79990000000'
  });
  const submissionPayload = buildApplicationPayload(ApplicationType.MASTER_SUBMISSION, {
    source: 'public_form',
    entityType: 'BUSINESS',
    fullName: null,
    companyName: 'Service Lab',
    title: 'Запуск барной карты',
    serviceArea: 'Москва',
    specializations: ['барная карта', 'обучение']
  });

  assert.equal(parseApplicationPayload(ApplicationType.MASTER_INQUIRY, inquiryPayload).masterTitle, 'Сервис барного оборудования');
  assert.equal(parseApplicationPayload(ApplicationType.MASTER_SUBMISSION, submissionPayload).companyName, 'Service Lab');
  assert.equal(getApplicationPayloadText(ApplicationType.MASTER_SUBMISSION, submissionPayload, ['title']), 'Запуск барной карты');
  assert.equal(safeParseApplicationPayload(ApplicationType.MASTER_SUBMISSION, { specializations: ['ok'] }).success, false);
});
