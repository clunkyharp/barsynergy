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


const supplierApplicationSchema = baseContactSchema
  .merge(utmSchema)
  .extend({
    companyName: z.string().trim().min(2).max(180),
    contactName: z.string().trim().min(2).max(160),
    cityId: z.string().trim().max(120).optional(),
    websiteUrl: z.string().trim().url().max(500).optional(),
    serviceArea: z.string().trim().min(2).max(160),
    description: z.string().trim().min(20).max(4000),
    consent: z.literal('accepted')
  })
  .refine((data) => data.email || data.phone || data.telegram, { message: 'contact is required' });

export async function submitSupplierApplication(_prevState: PublicApplicationResult | null, formData: FormData): Promise<PublicApplicationResult> {
  return submitPublicApplicationAction({
    actionName: 'public:supplier-submission',
    applicationType: ApplicationType.SUPPLIER_SUBMISSION,
    formData,
    successMessage: 'Заявку поставщика получили.',
    parse: async (data) => {
      const parsed = supplierApplicationSchema.parse({
        companyName: getString(data, 'companyName'),
        contactName: getString(data, 'contactName'),
        email: optionalString(getString(data, 'email')),
        phone: optionalString(getString(data, 'phone')),
        telegram: optionalString(getString(data, 'telegram')),
        cityId: optionalString(getString(data, 'cityId')),
        websiteUrl: optionalString(getString(data, 'websiteUrl')),
        serviceArea: getString(data, 'serviceArea'),
        description: getString(data, 'description'),
        consent: getString(data, 'consent'),
        utmSource: optionalString(getString(data, 'utmSource')),
        utmMedium: optionalString(getString(data, 'utmMedium')),
        utmCampaign: optionalString(getString(data, 'utmCampaign'))
      });
      const city = await assertActiveCity(parsed.cityId);

      return { parsed, city };
    },
    buildApplication: ({ parsed, city }) => ({
      type: ApplicationType.SUPPLIER_SUBMISSION,
      subject: `Поставщик: ${parsed.companyName}`,
      message: parsed.description,
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
      payload: buildApplicationPayload(ApplicationType.SUPPLIER_SUBMISSION, {
        companyName: parsed.companyName,
        websiteUrl: parsed.websiteUrl ?? null,
        serviceArea: parsed.serviceArea
      })
    })
  });
}

const supplierLeadSchema = z.object({
  companyName: z.string().trim().min(2, 'Укажите название компании').max(180),
  category: z.string().trim().min(1, 'Выберите категорию').max(120),
  city: z.string().trim().max(120).optional(),
  website: z.string().trim().max(500).optional(),
  contact: z.string().trim().min(2, 'Укажите контакт для связи').max(200),
  comment: z.string().trim().max(4000).optional(),
  consent: z.literal('accepted')
});

export type SupplierLeadActionResult = { type: 'success'; message: string } | { type: 'error'; message: string } | null;

export async function submitSupplierLead(
  _prevState: SupplierLeadActionResult,
  formData: FormData
): Promise<SupplierLeadActionResult> {
  try {
    await assertSameOriginServerAction();
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      return { type: 'success', message: 'Заявка поставщика отправлена. Команда BARSYNERGY свяжется с вами.' };
    }

    const turnstileToken = getString(formData, 'turnstileToken');
    if (turnstileToken) {
      await assertTurnstilePassed(turnstileToken);
    }
    await assertPublicApplicationSubmissionAllowed(ApplicationType.SUPPLIER_SUBMISSION);

    const parsed = supplierLeadSchema.parse({
      companyName: getString(formData, 'companyName'),
      category: getString(formData, 'category'),
      city: optionalString(getString(formData, 'city')),
      website: optionalString(getString(formData, 'website')),
      contact: getString(formData, 'contact'),
      comment: optionalString(getString(formData, 'comment')),
      consent: getString(formData, 'consent')
    });

    const subject = `Поставщик: ${parsed.companyName} (${parsed.category})`;
    const message = [
      `Компания: ${parsed.companyName}`,
      `Категория: ${parsed.category}`,
      parsed.city ? `Город / регион: ${parsed.city}` : null,
      parsed.website ? `Сайт: ${parsed.website}` : null,
      `Контакт: ${parsed.contact}`,
      parsed.comment ? `Комментарий: ${parsed.comment}` : null
    ]
      .filter(Boolean)
      .join('\n');

    await createPublicApplication({
      type: ApplicationType.SUPPLIER_SUBMISSION,
      subject,
      message,
      name: parsed.companyName,
      consentText: PERSONAL_DATA_CONSENT_TEXT
    });

    return {
      type: 'success',
      message: 'Заявка поставщика отправлена. Команда BARSYNERGY свяжется с вами.'
    };
  } catch (error) {
    if (error instanceof Error) {
      return { type: 'error', message: formatPublicApplicationActionError(error) };
    }
    return { type: 'error', message: 'Не удалось отправить заявку. Попробуйте ещё раз.' };
  }
}
