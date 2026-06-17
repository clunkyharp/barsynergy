import assert from 'node:assert/strict';
import test from 'node:test';
import { ApplicationStatus, ApplicationType } from '@prisma/client';

const {
  canUpdateApplicationBusinessNotes,
  getApplicationStatusUpdate,
  getAvailableApplicationStatuses
} = await import('../src/lib/admin/application-transitions.ts');
const { appendApplicationInternalNote, getVacancyDraftFieldsFromApplication } = await import(
  '../src/lib/admin/vacancy-application-drafts.ts'
);
const {
  getPartnerPublicationFieldsFromApplication,
  getSupplierPublicationFieldsFromApplication,
  getVacancyPublicationFieldsFromApplication,
  isApplicationPublicationStatusAllowed
} = await import('../src/lib/admin/application-publication.ts');
const { arePublicApplicationFormsEnabled } = await import('../src/lib/applications/public-forms.ts');
const { getApplicationThrottleKeyHash, getClientIpFromHeaders, hasHoneypotValue } = await import(
  '../src/lib/applications/submission-guard-utils.ts'
);

test('public application forms are disabled by default in production', () => {
  assert.equal(
    arePublicApplicationFormsEnabled({
      NODE_ENV: 'production',
      APPLICATION_FORMS_ENABLED: undefined
    }),
    false
  );
  assert.equal(
    arePublicApplicationFormsEnabled({
      NODE_ENV: 'production',
      APPLICATION_FORMS_ENABLED: true
    }),
    true
  );
  assert.equal(
    arePublicApplicationFormsEnabled({
      NODE_ENV: 'development',
      APPLICATION_FORMS_ENABLED: undefined
    }),
    true
  );
});

test('forwarding is allowed only for vacancy responses with consent and vacancy link', () => {
  const now = new Date('2026-04-28T10:00:00.000Z');
  const update = getApplicationStatusUpdate({
    application: {
      type: ApplicationType.VACANCY_RESPONSE,
      status: ApplicationStatus.IN_REVIEW,
      vacancyId: 'vacancy-1',
      consentAcceptedAt: now
    },
    nextStatus: ApplicationStatus.FORWARDED_TO_EMPLOYER,
    userId: 'admin-1',
    now
  });

  assert.deepEqual(update, {
    status: ApplicationStatus.FORWARDED_TO_EMPLOYER,
    forwardedAt: now,
    forwardedById: 'admin-1'
  });

  assert.throws(
    () =>
      getApplicationStatusUpdate({
        application: {
          type: ApplicationType.VACANCY_SUBMISSION,
          status: ApplicationStatus.IN_REVIEW,
          vacancyId: 'vacancy-1',
          consentAcceptedAt: now
        },
        nextStatus: ApplicationStatus.FORWARDED_TO_EMPLOYER,
        userId: 'admin-1',
        now
      }),
    /forwarding requires vacancy response application/
  );
});

test('available statuses hide employer forwarding when transition policy rejects it', () => {
  const statuses = [
    ApplicationStatus.NEW,
    ApplicationStatus.IN_REVIEW,
    ApplicationStatus.FORWARDED_TO_EMPLOYER,
    ApplicationStatus.APPROVED
  ];

  assert.deepEqual(
    getAvailableApplicationStatuses(
      {
        type: ApplicationType.BUSINESS_SOLUTION,
        status: ApplicationStatus.NEW,
        vacancyId: null,
        consentAcceptedAt: null
      },
      statuses
    ),
    [ApplicationStatus.NEW, ApplicationStatus.IN_REVIEW, ApplicationStatus.APPROVED]
  );

  assert.deepEqual(
    getAvailableApplicationStatuses(
      {
        type: ApplicationType.VACANCY_RESPONSE,
        status: ApplicationStatus.IN_REVIEW,
        vacancyId: 'vacancy-1',
        consentAcceptedAt: new Date('2026-04-28T10:00:00.000Z')
      },
      statuses
    ),
    statuses
  );
});

test('available statuses keep current employer forwarding status for no-op saves', () => {
  const statuses = [
    ApplicationStatus.NEW,
    ApplicationStatus.IN_REVIEW,
    ApplicationStatus.FORWARDED_TO_EMPLOYER,
    ApplicationStatus.APPROVED
  ];

  assert.deepEqual(
    getAvailableApplicationStatuses(
      {
        type: ApplicationType.VACANCY_RESPONSE,
        status: ApplicationStatus.FORWARDED_TO_EMPLOYER,
        vacancyId: null,
        consentAcceptedAt: null
      },
      statuses
    ),
    [
      ApplicationStatus.NEW,
      ApplicationStatus.IN_REVIEW,
      ApplicationStatus.FORWARDED_TO_EMPLOYER,
      ApplicationStatus.APPROVED
    ]
  );
});

test('saving the current status does not re-run transition requirements', () => {
  assert.deepEqual(
    getApplicationStatusUpdate({
      application: {
        type: ApplicationType.VACANCY_RESPONSE,
        status: ApplicationStatus.FORWARDED_TO_EMPLOYER,
        vacancyId: null,
        consentAcceptedAt: null
      },
      nextStatus: ApplicationStatus.FORWARDED_TO_EMPLOYER,
      userId: 'admin-1'
    }),
    {
      status: ApplicationStatus.FORWARDED_TO_EMPLOYER
    }
  );
});

test('business notes are editable only for applications linked to a business account', () => {
  assert.equal(
    canUpdateApplicationBusinessNotes({
      businessAccountId: 'business-1',
      status: ApplicationStatus.IN_REVIEW
    }),
    true
  );
  assert.equal(
    canUpdateApplicationBusinessNotes({
      businessAccountId: 'business-1',
      status: ApplicationStatus.ARCHIVED
    }),
    false
  );
  assert.equal(
    canUpdateApplicationBusinessNotes({
      businessAccountId: null,
      status: ApplicationStatus.IN_REVIEW
    }),
    false
  );
});

test('forwarding metadata is cleared when status moves back', () => {
  assert.deepEqual(
    getApplicationStatusUpdate({
      application: {
        type: ApplicationType.VACANCY_RESPONSE,
        status: ApplicationStatus.FORWARDED_TO_EMPLOYER,
        vacancyId: 'vacancy-1',
        consentAcceptedAt: new Date('2026-04-28T10:00:00.000Z')
      },
      nextStatus: ApplicationStatus.IN_REVIEW,
      userId: 'admin-1'
    }),
    {
      status: ApplicationStatus.IN_REVIEW,
      forwardedAt: null,
      forwardedById: null
    }
  );
});

test('public submission guard helpers detect honeypots and stable throttle keys', () => {
  assert.equal(hasHoneypotValue(''), false);
  assert.equal(hasHoneypotValue('https://spam.example'), true);

  const headers = new globalThis.Headers({
    'cf-connecting-ip': '192.0.2.55',
    'x-forwarded-for': '203.0.113.10, 10.0.0.1',
    'x-real-ip': '198.51.100.20'
  });
  assert.equal(getClientIpFromHeaders(headers), '198.51.100.20');

  const forwardedOnlyHeaders = new globalThis.Headers({
    'x-forwarded-for': '203.0.113.10, 10.0.0.1'
  });
  assert.equal(getClientIpFromHeaders(forwardedOnlyHeaders), '203.0.113.10');

  const hashA = getApplicationThrottleKeyHash({
    applicationType: ApplicationType.VACANCY_RESPONSE,
    ip: '203.0.113.10',
    userAgent: 'test-agent',
    secret: 'test-secret'
  });
  const hashB = getApplicationThrottleKeyHash({
    applicationType: ApplicationType.VACANCY_RESPONSE,
    ip: '203.0.113.10',
    userAgent: 'rotated-agent',
    secret: 'test-secret'
  });
  assert.equal(hashA, hashB);
  assert.match(hashA, /^[a-f0-9]{64}$/);
});

test('vacancy submission applications can produce safe vacancy draft fields', () => {
  const draft = getVacancyDraftFieldsFromApplication({
    type: ApplicationType.VACANCY_SUBMISSION,
    vacancyId: null,
    cityId: 'city-1',
    message: 'Full vacancy description for the admin draft.',
    name: 'Employer Contact',
    email: 'hr@example.test',
    phone: '+79990000000',
    telegram: '@hr',
    consentAcceptedAt: new Date('2026-04-28T10:00:00.000Z'),
    payload: {
      companyName: 'Test Bar',
      position: 'Бариста',
      employmentType: 'Full time',
      salaryLabel: '100000',
      experienceLabel: '2 years',
      shortDescription: 'Short public vacancy summary.'
    }
  });

  assert.equal(draft.status, 'DRAFT');
  assert.equal(draft.title, 'Бариста');
  assert.equal(draft.companyName, 'Test Bar');
  assert.equal(draft.cityId, 'city-1');
  assert.match(draft.contactMode, /hr@example\.test/);
  assert.equal(
    appendApplicationInternalNote('Existing note', 'Created draft.'),
    'Existing note\n\nCreated draft.'
  );

  assert.throws(
    () =>
      getVacancyDraftFieldsFromApplication({
        type: ApplicationType.VACANCY_RESPONSE,
        vacancyId: null,
        cityId: null,
        message: 'Message',
        name: null,
        email: null,
        phone: null,
        telegram: null,
        consentAcceptedAt: new Date('2026-04-28T10:00:00.000Z'),
        payload: {}
      }),
    /vacancy draft requires vacancy submission application/
  );
});

test('supplier and partner applications can produce published content fields', () => {
  const consentAcceptedAt = new Date('2026-05-17T10:00:00.000Z');
  const supplier = getSupplierPublicationFieldsFromApplication({
    type: ApplicationType.SUPPLIER_SUBMISSION,
    status: ApplicationStatus.APPROVED,
    vacancyId: null,
    supplierId: null,
    partnerId: null,
    businessAccountId: 'business-1',
    cityId: 'city-1',
    message: 'Поставляем оборудование, расходники и сервис для заведений.',
    name: 'Supplier Contact',
    email: 'supplier@example.test',
    phone: '+79990000000',
    telegram: '@supplier',
    consentAcceptedAt,
    payload: {
      companyName: 'Test Supplier',
      websiteUrl: 'https://supplier.example.test',
      serviceArea: 'Оборудование и расходники'
    }
  });

  assert.equal(supplier.status, 'PUBLISHED');
  assert.equal(supplier.title, 'Test Supplier');
  assert.equal(supplier.companyName, 'Test Supplier');
  assert.equal(supplier.cityId, 'city-1');
  assert.equal(supplier.businessAccountId, 'business-1');
  assert.equal(supplier.websiteUrl, 'https://supplier.example.test/');
  assert.equal(supplier.contactLabel, 'Supplier Contact');
  assert.equal(supplier.contactPhone, '+79990000000');
  assert.equal(supplier.contactTelegram, '@supplier');
  assert.equal(supplier.contactWhatsapp, null);
  assert.equal(supplier.isVerified, false);

  const partner = getPartnerPublicationFieldsFromApplication({
    type: ApplicationType.PARTNER_APPLICATION,
    status: ApplicationStatus.IN_REVIEW,
    vacancyId: null,
    supplierId: null,
    partnerId: null,
    cityId: null,
    message: 'Готовы поддержать отраслевые события и образовательные программы.',
    name: 'Partner Contact',
    email: 'partner@example.test',
    phone: null,
    telegram: null,
    consentAcceptedAt,
    payload: {
      companyName: 'Test Partner',
      partnerType: 'Бренд',
      websiteUrl: 'https://partner.example.test'
    }
  });

  assert.equal(partner.status, 'PUBLISHED');
  assert.equal(partner.title, 'Test Partner');
  assert.equal(partner.companyName, 'Test Partner');
  assert.equal(partner.websiteUrl, 'https://partner.example.test/');
  assert.equal(partner.partnerType, 'Бренд');
  assert.equal(partner.isFeatured, false);
});

test('application publication requires submitted review status, consent and no linked record', () => {
  assert.equal(isApplicationPublicationStatusAllowed(ApplicationStatus.NEW), true);
  assert.equal(isApplicationPublicationStatusAllowed(ApplicationStatus.APPROVED), true);
  assert.equal(isApplicationPublicationStatusAllowed(ApplicationStatus.DRAFT), false);
  assert.equal(isApplicationPublicationStatusAllowed(ApplicationStatus.REJECTED), false);

  assert.throws(
    () =>
      getSupplierPublicationFieldsFromApplication({
        type: ApplicationType.SUPPLIER_SUBMISSION,
        status: ApplicationStatus.DRAFT,
        vacancyId: null,
        supplierId: null,
        partnerId: null,
        cityId: null,
        message: 'Поставляем оборудование для заведений.',
        name: null,
        email: null,
        phone: null,
        telegram: null,
        consentAcceptedAt: new Date('2026-05-17T10:00:00.000Z'),
        payload: {
          companyName: 'Draft Supplier',
          serviceArea: 'Оборудование'
        }
      }),
    /application publication requires review status/
  );

  assert.throws(
    () =>
      getPartnerPublicationFieldsFromApplication({
        type: ApplicationType.PARTNER_APPLICATION,
        status: ApplicationStatus.APPROVED,
        vacancyId: null,
        supplierId: null,
        partnerId: 'partner-1',
        cityId: null,
        message: 'Партнёрская заявка.',
        name: null,
        email: null,
        phone: null,
        telegram: null,
        consentAcceptedAt: new Date('2026-05-17T10:00:00.000Z'),
        payload: {
          companyName: 'Existing Partner',
          partnerType: 'Бренд'
        }
      }),
    /partner publication already exists for application/
  );

  assert.equal(
    getVacancyPublicationFieldsFromApplication({
      type: ApplicationType.VACANCY_SUBMISSION,
      status: ApplicationStatus.CONTACTED,
      vacancyId: null,
      supplierId: null,
      partnerId: null,
      cityId: 'city-1',
      message: 'Full vacancy description for publication.',
      name: 'Employer Contact',
      email: 'hr@example.test',
      phone: null,
      telegram: null,
      consentAcceptedAt: new Date('2026-05-17T10:00:00.000Z'),
      payload: {
        companyName: 'Test Bar',
        position: 'Бариста',
        shortDescription: 'Short public vacancy summary.'
      }
    }).status,
    'PUBLISHED'
  );
});
