import assert from 'node:assert/strict';
import test from 'node:test';
import { ApplicationType } from '@prisma/client';

const { buildBusinessApplicationPayload, parseBusinessApplicationInput } = await import(
  '../src/lib/applications/business-request.ts'
);

test('business vacancy submission requires vacancy-specific fields', () => {
  assert.throws(
    () =>
      parseBusinessApplicationInput({
        type: ApplicationType.VACANCY_SUBMISSION,
        title: 'Бариста в команду',
        details: 'Подробное описание роли и условий работы.',
        consent: 'accepted'
      }),
    /Invalid input/
  );

  const parsed = parseBusinessApplicationInput({
    type: ApplicationType.VACANCY_SUBMISSION,
    title: 'Бариста в команду',
    details: 'Подробное описание роли и условий работы.',
    position: 'Бариста',
    shortDescription: 'Короткое описание вакансии для публикации.',
    consent: 'accepted'
  });

  assert.equal(parsed.type, ApplicationType.VACANCY_SUBMISSION);
  assert.equal(parsed.position, 'Бариста');
});

test('business non-vacancy requests require their own fields', () => {
  assert.throws(
    () =>
      parseBusinessApplicationInput({
        type: ApplicationType.SUPPLIER_SUBMISSION,
        title: 'Новый поставщик',
        details: 'Описание предложения для заведений.',
        consent: 'accepted'
      }),
    /Invalid input/
  );

  assert.throws(
    () =>
      parseBusinessApplicationInput({
        type: ApplicationType.CERTIFICATE_ORDER,
        title: 'Подарочный сертификат',
        details: 'Нужен сертификат для корпоративного подарка.',
        consent: 'accepted'
      }),
    /Invalid input/
  );

  const supplier = parseBusinessApplicationInput({
    type: ApplicationType.SUPPLIER_SUBMISSION,
    title: 'Новый поставщик',
    details: 'Описание предложения для заведений.',
    serviceArea: 'Кофе и сиропы',
    consent: 'accepted'
  });
  const certificate = parseBusinessApplicationInput({
    type: ApplicationType.CERTIFICATE_ORDER,
    title: 'Подарочный сертификат',
    details: 'Нужен сертификат для корпоративного подарка.',
    recipientName: 'Иван Иванов',
    amountLabel: '5000',
    consent: 'accepted'
  });

  assert.equal(supplier.type, ApplicationType.SUPPLIER_SUBMISSION);
  assert.equal(certificate.type, ApplicationType.CERTIFICATE_ORDER);
});

test('business request payload stores only fields relevant to request type', () => {
  const payload = buildBusinessApplicationPayload({
    type: ApplicationType.CERTIFICATE_ORDER,
    title: 'Подарочный сертификат',
    details: 'Нужен сертификат для корпоративного подарка.',
    recipientName: 'Иван Иванов',
    amountLabel: '5000',
    consent: 'accepted',
    companyName: 'Bar Test'
  });

  assert.deepEqual(payload, {
    source: 'business_cabinet',
    companyName: 'Bar Test',
    title: 'Подарочный сертификат',
    recipientName: 'Иван Иванов',
    amountLabel: '5000'
  });
});
