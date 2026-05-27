'use server';

import { redirect } from 'next/navigation';
import { ApplicationType } from '@prisma/client';
import { z } from 'zod';
import { buildApplicationPayload } from '@/lib/applications/application-payloads';
import {
  assertActiveCity,
  baseContactSchema,
  getPublicApplicationResultPath,
  getString,
  nullableString,
  optionalString,
  PERSONAL_DATA_CONSENT_TEXT,
  utmSchema
} from '@/lib/applications/public-form-helpers';
import { submitPublicApplicationAction } from '@/lib/applications/submit-public-application-action';

const EDUCATION_PATH = '/education';

function redirectWithEducationResult(result: { type: 'success' | 'error'; message: string }): never {
  redirect(getPublicApplicationResultPath(EDUCATION_PATH, result));
}

const courseApplicationSchema = baseContactSchema
  .merge(utmSchema)
  .extend({
    name: z.string().trim().min(2).max(160),
    cityId: z.string().trim().max(120).optional(),
    courseTitle: z.string().trim().min(2).max(180),
    goals: z.string().trim().min(10).max(3000),
    consent: z.literal('accepted')
  })
  .refine((data) => data.email || data.phone || data.telegram, { message: 'contact is required' });

const corporateTrainingSchema = baseContactSchema
  .merge(utmSchema)
  .extend({
    companyName: z.string().trim().min(2).max(180),
    contactName: z.string().trim().min(2).max(160),
    cityId: z.string().trim().max(120).optional(),
    teamSize: z.string().trim().min(1).max(80),
    requestDetails: z.string().trim().min(20).max(4000),
    consent: z.literal('accepted')
  })
  .refine((data) => data.email || data.phone || data.telegram, { message: 'contact is required' });

const certificateOrderSchema = baseContactSchema
  .merge(utmSchema)
  .extend({
    name: z.string().trim().min(2).max(160),
    cityId: z.string().trim().max(120).optional(),
    recipientName: z.string().trim().min(2).max(160),
    amountLabel: z.string().trim().min(1).max(120),
    message: z.string().trim().min(10).max(3000),
    consent: z.literal('accepted')
  })
  .refine((data) => data.email || data.phone || data.telegram, { message: 'contact is required' });

export async function submitCourseApplication(formData: FormData) {
  await submitPublicApplicationAction({
    actionName: 'public:course-application',
    applicationType: ApplicationType.COURSE_APPLICATION,
    formData,
    successMessage: 'Заявку на программу получили.',
    redirectWithResult: redirectWithEducationResult,
    parse: async (data) => {
      const parsed = courseApplicationSchema.parse({
        name: getString(data, 'name'),
        email: optionalString(getString(data, 'email')),
        phone: optionalString(getString(data, 'phone')),
        telegram: optionalString(getString(data, 'telegram')),
        cityId: optionalString(getString(data, 'cityId')),
        courseTitle: getString(data, 'courseTitle'),
        goals: getString(data, 'goals'),
        consent: getString(data, 'consent'),
        utmSource: optionalString(getString(data, 'utmSource')),
        utmMedium: optionalString(getString(data, 'utmMedium')),
        utmCampaign: optionalString(getString(data, 'utmCampaign'))
      });
      const city = await assertActiveCity(parsed.cityId);

      return { parsed, city };
    },
    buildApplication: ({ parsed, city }) => ({
      type: ApplicationType.COURSE_APPLICATION,
      subject: `Обучение: ${parsed.courseTitle}`,
      message: parsed.goals,
      name: parsed.name,
      email: nullableString(parsed.email),
      phone: nullableString(parsed.phone),
      telegram: nullableString(parsed.telegram),
      cityId: city?.id ?? null,
      cityName: city?.name,
      consentText: PERSONAL_DATA_CONSENT_TEXT,
      utm: {
        source: nullableString(parsed.utmSource),
        medium: nullableString(parsed.utmMedium),
        campaign: nullableString(parsed.utmCampaign)
      },
      payload: buildApplicationPayload(ApplicationType.COURSE_APPLICATION, {
        courseTitle: parsed.courseTitle
      })
    })
  });
}

export async function submitCorporateTrainingApplication(formData: FormData) {
  await submitPublicApplicationAction({
    actionName: 'public:corporate-training',
    applicationType: ApplicationType.CORPORATE_TRAINING_APPLICATION,
    formData,
    successMessage: 'Запрос на корпоративное обучение получили.',
    redirectWithResult: redirectWithEducationResult,
    parse: async (data) => {
      const parsed = corporateTrainingSchema.parse({
        companyName: getString(data, 'companyName'),
        contactName: getString(data, 'contactName'),
        email: optionalString(getString(data, 'email')),
        phone: optionalString(getString(data, 'phone')),
        telegram: optionalString(getString(data, 'telegram')),
        cityId: optionalString(getString(data, 'cityId')),
        teamSize: getString(data, 'teamSize'),
        requestDetails: getString(data, 'requestDetails'),
        consent: getString(data, 'consent'),
        utmSource: optionalString(getString(data, 'utmSource')),
        utmMedium: optionalString(getString(data, 'utmMedium')),
        utmCampaign: optionalString(getString(data, 'utmCampaign'))
      });
      const city = await assertActiveCity(parsed.cityId);

      return { parsed, city };
    },
    buildApplication: ({ parsed, city }) => ({
      type: ApplicationType.CORPORATE_TRAINING_APPLICATION,
      subject: `Корпоративное обучение: ${parsed.companyName}`,
      message: parsed.requestDetails,
      name: parsed.contactName,
      email: nullableString(parsed.email),
      phone: nullableString(parsed.phone),
      telegram: nullableString(parsed.telegram),
      cityId: city?.id ?? null,
      cityName: city?.name,
      consentText: PERSONAL_DATA_CONSENT_TEXT,
      utm: {
        source: nullableString(parsed.utmSource),
        medium: nullableString(parsed.utmMedium),
        campaign: nullableString(parsed.utmCampaign)
      },
      payload: buildApplicationPayload(ApplicationType.CORPORATE_TRAINING_APPLICATION, {
        companyName: parsed.companyName,
        teamSize: parsed.teamSize
      })
    })
  });
}

export async function submitCertificateOrderApplication(formData: FormData) {
  await submitPublicApplicationAction({
    actionName: 'public:certificate-order',
    applicationType: ApplicationType.CERTIFICATE_ORDER,
    formData,
    successMessage: 'Заказ сертификата получили.',
    redirectWithResult: redirectWithEducationResult,
    parse: async (data) => {
      const parsed = certificateOrderSchema.parse({
        name: getString(data, 'name'),
        email: optionalString(getString(data, 'email')),
        phone: optionalString(getString(data, 'phone')),
        telegram: optionalString(getString(data, 'telegram')),
        cityId: optionalString(getString(data, 'cityId')),
        recipientName: getString(data, 'recipientName'),
        amountLabel: getString(data, 'amountLabel'),
        message: getString(data, 'message'),
        consent: getString(data, 'consent'),
        utmSource: optionalString(getString(data, 'utmSource')),
        utmMedium: optionalString(getString(data, 'utmMedium')),
        utmCampaign: optionalString(getString(data, 'utmCampaign'))
      });
      const city = await assertActiveCity(parsed.cityId);

      return { parsed, city };
    },
    buildApplication: ({ parsed, city }) => ({
      type: ApplicationType.CERTIFICATE_ORDER,
      subject: 'Заказ сертификата',
      message: parsed.message,
      name: parsed.name,
      email: nullableString(parsed.email),
      phone: nullableString(parsed.phone),
      telegram: nullableString(parsed.telegram),
      cityId: city?.id ?? null,
      cityName: city?.name,
      consentText: PERSONAL_DATA_CONSENT_TEXT,
      utm: {
        source: nullableString(parsed.utmSource),
        medium: nullableString(parsed.utmMedium),
        campaign: nullableString(parsed.utmCampaign)
      },
      payload: buildApplicationPayload(ApplicationType.CERTIFICATE_ORDER, {
        recipientName: parsed.recipientName,
        amountLabel: parsed.amountLabel
      })
    })
  });
}
