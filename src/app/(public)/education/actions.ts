'use server';

import { redirect } from 'next/navigation';
import { ApplicationType } from '@prisma/client';
import { z } from 'zod';
import { createPublicApplication } from '@/lib/applications/create-public-application';
import {
  assertActiveCity,
  baseContactSchema,
  formatPublicApplicationActionError,
  getPublicApplicationResultPath,
  getString,
  nullableString,
  optionalString,
  PERSONAL_DATA_CONSENT_TEXT,
  utmSchema
} from '@/lib/applications/public-form-helpers';
import {
  assertPublicApplicationFormsEnabled,
  assertPublicApplicationSubmissionAllowed,
  hasHoneypotValue
} from '@/lib/applications/public-submission-guards';

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
  let result: { type: 'success' | 'error'; message: string };

  try {
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      result = { type: 'success', message: 'Заявка на программу отправлена.' };
      redirectWithEducationResult(result);
    }

    const parsed = courseApplicationSchema.parse({
      name: getString(formData, 'name'),
      email: optionalString(getString(formData, 'email')),
      phone: optionalString(getString(formData, 'phone')),
      telegram: optionalString(getString(formData, 'telegram')),
      cityId: optionalString(getString(formData, 'cityId')),
      courseTitle: getString(formData, 'courseTitle'),
      goals: getString(formData, 'goals'),
      consent: getString(formData, 'consent'),
      utmSource: optionalString(getString(formData, 'utmSource')),
      utmMedium: optionalString(getString(formData, 'utmMedium')),
      utmCampaign: optionalString(getString(formData, 'utmCampaign'))
    });

    const city = await assertActiveCity(parsed.cityId);
    await assertPublicApplicationSubmissionAllowed(ApplicationType.COURSE_APPLICATION);
    await createPublicApplication({
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
      payload: {
        courseTitle: parsed.courseTitle
      }
    });

    result = { type: 'success', message: 'Заявка на программу отправлена.' };
  } catch (error) {
    result = { type: 'error', message: formatPublicApplicationActionError(error) };
  }

  redirectWithEducationResult(result);
}

export async function submitCorporateTrainingApplication(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      result = { type: 'success', message: 'Запрос на корпоративное обучение отправлен.' };
      redirectWithEducationResult(result);
    }

    const parsed = corporateTrainingSchema.parse({
      companyName: getString(formData, 'companyName'),
      contactName: getString(formData, 'contactName'),
      email: optionalString(getString(formData, 'email')),
      phone: optionalString(getString(formData, 'phone')),
      telegram: optionalString(getString(formData, 'telegram')),
      cityId: optionalString(getString(formData, 'cityId')),
      teamSize: getString(formData, 'teamSize'),
      requestDetails: getString(formData, 'requestDetails'),
      consent: getString(formData, 'consent'),
      utmSource: optionalString(getString(formData, 'utmSource')),
      utmMedium: optionalString(getString(formData, 'utmMedium')),
      utmCampaign: optionalString(getString(formData, 'utmCampaign'))
    });

    const city = await assertActiveCity(parsed.cityId);
    await assertPublicApplicationSubmissionAllowed(ApplicationType.CORPORATE_TRAINING_APPLICATION);
    await createPublicApplication({
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
      payload: {
        companyName: parsed.companyName,
        teamSize: parsed.teamSize
      }
    });

    result = { type: 'success', message: 'Запрос на корпоративное обучение отправлен.' };
  } catch (error) {
    result = { type: 'error', message: formatPublicApplicationActionError(error) };
  }

  redirectWithEducationResult(result);
}

export async function submitCertificateOrderApplication(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      result = { type: 'success', message: 'Заказ сертификата отправлен.' };
      redirectWithEducationResult(result);
    }

    const parsed = certificateOrderSchema.parse({
      name: getString(formData, 'name'),
      email: optionalString(getString(formData, 'email')),
      phone: optionalString(getString(formData, 'phone')),
      telegram: optionalString(getString(formData, 'telegram')),
      cityId: optionalString(getString(formData, 'cityId')),
      recipientName: getString(formData, 'recipientName'),
      amountLabel: getString(formData, 'amountLabel'),
      message: getString(formData, 'message'),
      consent: getString(formData, 'consent'),
      utmSource: optionalString(getString(formData, 'utmSource')),
      utmMedium: optionalString(getString(formData, 'utmMedium')),
      utmCampaign: optionalString(getString(formData, 'utmCampaign'))
    });

    const city = await assertActiveCity(parsed.cityId);
    await assertPublicApplicationSubmissionAllowed(ApplicationType.CERTIFICATE_ORDER);
    await createPublicApplication({
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
      payload: {
        recipientName: parsed.recipientName,
        amountLabel: parsed.amountLabel
      }
    });

    result = { type: 'success', message: 'Заказ сертификата отправлен.' };
  } catch (error) {
    result = { type: 'error', message: formatPublicApplicationActionError(error) };
  }

  redirectWithEducationResult(result);
}
