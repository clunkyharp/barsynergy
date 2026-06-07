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
  await submitPublicApplicationAction({
    actionName: 'public:supplier-submission',
    applicationType: ApplicationType.SUPPLIER_SUBMISSION,
    formData,
    successMessage: 'Заявку поставщика получили.',
    redirectWithResult: redirectWithSuppliersResult,
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
