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
  assert.deepEqual(
    buildBusinessApplicationPayload({
      type: ApplicationType.VACANCY_SUBMISSION,
      title: 'Бариста в команду',
      details: 'Подробное описание роли и условий работы.',
      position: 'Бариста',
      employmentType: 'Полная занятость',
      salaryLabel: '100000',
      experienceLabel: '2 года',
      shortDescription: 'Короткое описание вакансии для публикации.',
      consent: 'accepted',
      companyName: 'Bar Test'
    }),
    {
      source: 'business_cabinet',
      companyName: 'Bar Test',
      title: 'Бариста в команду',
      position: 'Бариста',
      employmentType: 'Полная занятость',
      salaryLabel: '100000',
      experienceLabel: '2 года',
      shortDescription: 'Короткое описание вакансии для публикации.'
    }
  );

  assert.deepEqual(
    buildBusinessApplicationPayload({
      type: ApplicationType.SUPPLIER_SUBMISSION,
      title: 'Новый поставщик',
      details: 'Описание предложения для заведений.',
      serviceArea: 'Кофе и сиропы',
      consent: 'accepted',
      companyName: 'Bar Test'
    }),
    {
      source: 'business_cabinet',
      companyName: 'Bar Test',
      title: 'Новый поставщик',
      serviceArea: 'Кофе и сиропы'
    }
  );

  assert.deepEqual(
    buildBusinessApplicationPayload({
      type: ApplicationType.PARTNER_APPLICATION,
      title: 'Партнерство',
      details: 'Описание партнерского формата.',
      partnerType: 'Площадка',
      consent: 'accepted',
      companyName: 'Bar Test'
    }),
    {
      source: 'business_cabinet',
      companyName: 'Bar Test',
      title: 'Партнерство',
      partnerType: 'Площадка'
    }
  );

  assert.deepEqual(
    buildBusinessApplicationPayload({
      type: ApplicationType.CORPORATE_TRAINING_APPLICATION,
      title: 'Обучение команды',
      details: 'Нужно обучение для команды бара.',
      teamSize: '12',
      consent: 'accepted',
      companyName: 'Bar Test'
    }),
    {
      source: 'business_cabinet',
      companyName: 'Bar Test',
      title: 'Обучение команды',
      teamSize: '12'
    }
  );

  assert.deepEqual(
    buildBusinessApplicationPayload({
      type: ApplicationType.CERTIFICATE_ORDER,
      title: 'Подарочный сертификат',
      details: 'Нужен сертификат для корпоративного подарка.',
      recipientName: 'Иван Иванов',
      amountLabel: '5000',
      consent: 'accepted',
      companyName: 'Bar Test'
    }),
    {
      source: 'business_cabinet',
      companyName: 'Bar Test',
      title: 'Подарочный сертификат',
      recipientName: 'Иван Иванов',
      amountLabel: '5000'
    }
  );
});
