'use server';

import { redirect } from 'next/navigation';
import { ApplicationType } from '@prisma/client';
import { z } from 'zod';
import { createPublicApplication } from '@/lib/applications/create-public-application';
import {
  assertActiveCity,
  baseContactSchema,
  getPublicApplicationResultPath,
  getString,
  nullableString,
  optionalString,
  PERSONAL_DATA_CONSENT_TEXT,
  resolvePublicApplicationActionError,
  utmSchema
} from '@/lib/applications/public-form-helpers';
import {
  assertPublicApplicationFormsEnabled,
  assertPublicApplicationSubmissionAllowed,
  hasHoneypotValue
} from '@/lib/applications/public-submission-guards';

const SUPPLIERS_PATH = '/suppliers';

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

function redirectWithSuppliersResult(result: { type: 'success' | 'error'; message: string }): never {
  redirect(getPublicApplicationResultPath(SUPPLIERS_PATH, result));
}

export async function submitSupplierApplication(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      result = { type: 'success', message: 'Заявку поставщика получили.' };
      redirectWithSuppliersResult(result);
    }

    const parsed = supplierApplicationSchema.parse({
      companyName: getString(formData, 'companyName'),
      contactName: getString(formData, 'contactName'),
      email: optionalString(getString(formData, 'email')),
      phone: optionalString(getString(formData, 'phone')),
      telegram: optionalString(getString(formData, 'telegram')),
      cityId: optionalString(getString(formData, 'cityId')),
      websiteUrl: optionalString(getString(formData, 'websiteUrl')),
      serviceArea: getString(formData, 'serviceArea'),
      description: getString(formData, 'description'),
      consent: getString(formData, 'consent'),
      utmSource: optionalString(getString(formData, 'utmSource')),
      utmMedium: optionalString(getString(formData, 'utmMedium')),
      utmCampaign: optionalString(getString(formData, 'utmCampaign'))
    });

    const city = await assertActiveCity(parsed.cityId);
    await assertPublicApplicationSubmissionAllowed(ApplicationType.SUPPLIER_SUBMISSION);
    await createPublicApplication({
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
      payload: {
        companyName: parsed.companyName,
        websiteUrl: parsed.websiteUrl ?? null,
        serviceArea: parsed.serviceArea
      }
    });

    result = { type: 'success', message: 'Заявку поставщика получили.' };
  } catch (error) {
    result = { type: 'error', message: resolvePublicApplicationActionError('public:supplier-submission', error) };
  }

  redirectWithSuppliersResult(result);
}
