'use server';

import { ApplicationType } from '@prisma/client';
import { z } from 'zod';
import { buildApplicationPayload } from '@/lib/applications/application-payloads';
import {
  assertActiveCity,
  baseContactSchema,
  formatPublicApplicationActionError,
  getString,
  nullableString,
  optionalString,
  PERSONAL_DATA_CONSENT_TEXT,
  type PublicApplicationResult,
  utmSchema
} from '@/lib/applications/public-form-helpers';
import { createPublicApplication } from '@/lib/applications/create-public-application';
import { submitPublicApplicationAction } from '@/lib/applications/submit-public-application-action';
import {
  assertPublicApplicationFormsEnabled,
  assertPublicApplicationSubmissionAllowed,
  hasHoneypotValue
} from '@/lib/applications/public-submission-guards';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { assertTurnstilePassed } from '@/lib/security/turnstile';

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

export async function submitCourseApplication(_prevState: PublicApplicationResult | null, formData: FormData): Promise<PublicApplicationResult> {
  return submitPublicApplicationAction({
    actionName: 'public:course-application',
    applicationType: ApplicationType.COURSE_APPLICATION,
    formData,
    successMessage: 'Заявку на программу получили.',
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

export async function submitCorporateTrainingApplication(_prevState: PublicApplicationResult | null, formData: FormData): Promise<PublicApplicationResult> {
  return submitPublicApplicationAction({
    actionName: 'public:corporate-training',
    applicationType: ApplicationType.CORPORATE_TRAINING_APPLICATION,
    formData,
    successMessage: 'Запрос на корпоративное обучение получили.',
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

export async function submitCertificateOrderApplication(_prevState: PublicApplicationResult | null, formData: FormData): Promise<PublicApplicationResult> {
  return submitPublicApplicationAction({
    actionName: 'public:certificate-order',
    applicationType: ApplicationType.CERTIFICATE_ORDER,
    formData,
    successMessage: 'Заказ сертификата получили.',
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

const educationLeadSchema = z.object({
  name: z.string().trim().min(2, 'Укажите имя').max(160),
  contact: z.string().trim().min(2, 'Укажите контакт для связи').max(200),
  role: z.string().trim().min(1, 'Выберите роль'),
  format: z.string().trim().min(1, 'Выберите или укажите формат').max(180),
  comment: z.string().trim().max(4000).optional(),
  consent: z.literal('accepted')
});

export type EducationLeadActionResult = { type: 'success'; message: string } | { type: 'error'; message: string } | null;

export async function submitEducationLead(
  _prevState: EducationLeadActionResult,
  formData: FormData
): Promise<EducationLeadActionResult> {
  try {
    await assertSameOriginServerAction();
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      return { type: 'success', message: 'Заявка на программу отправлена. Команда BARSYNERGY свяжется с вами.' };
    }

    await assertTurnstilePassed(getString(formData, 'turnstileToken'));
    await assertPublicApplicationSubmissionAllowed(ApplicationType.COURSE_APPLICATION);

    const parsed = educationLeadSchema.parse({
      name: getString(formData, 'name'),
      contact: getString(formData, 'contact'),
      role: getString(formData, 'role'),
      format: getString(formData, 'format'),
      comment: optionalString(getString(formData, 'comment')),
      consent: getString(formData, 'consent')
    });

    const subject = `Обучение: ${parsed.name} (${parsed.role})`;
    const message = [
      `Роль: ${parsed.role}`,
      `Формат: ${parsed.format}`,
      `Контакт: ${parsed.contact}`,
      parsed.comment ? `Комментарий: ${parsed.comment}` : null
    ]
      .filter(Boolean)
      .join('\n');

    await createPublicApplication({
      type: ApplicationType.COURSE_APPLICATION,
      subject,
      message,
      name: parsed.name,
      consentText: PERSONAL_DATA_CONSENT_TEXT
    });

    return {
      type: 'success',
      message: 'Заявка на программу отправлена. Команда BARSYNERGY свяжется с вами.'
    };
  } catch (error) {
    if (error instanceof Error) {
      return { type: 'error', message: formatPublicApplicationActionError(error) };
    }
    return { type: 'error', message: 'Не удалось отправить заявку. Попробуйте ещё раз.' };
  }
}
