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

const PARTNERS_PATH = '/partners';

const partnerApplicationSchema = baseContactSchema
  .merge(utmSchema)
  .extend({
    companyName: z.string().trim().min(2).max(180),
    contactName: z.string().trim().min(2).max(160),
    cityId: z.string().trim().max(120).optional(),
    partnerType: z.string().trim().min(2).max(160),
    websiteUrl: z.string().trim().url().max(500).optional(),
    proposal: z.string().trim().min(20).max(4000),
    consent: z.literal('accepted')
  })
  .refine((data) => data.email || data.phone || data.telegram, { message: 'contact is required' });

function redirectWithPartnersResult(result: { type: 'success' | 'error'; message: string }): never {
  redirect(getPublicApplicationResultPath(PARTNERS_PATH, result));
}

export async function submitPartnerApplication(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      result = { type: 'success', message: 'Заявку на партнёрство получили.' };
      redirectWithPartnersResult(result);
    }

    const parsed = partnerApplicationSchema.parse({
      companyName: getString(formData, 'companyName'),
      contactName: getString(formData, 'contactName'),
      email: optionalString(getString(formData, 'email')),
      phone: optionalString(getString(formData, 'phone')),
      telegram: optionalString(getString(formData, 'telegram')),
      cityId: optionalString(getString(formData, 'cityId')),
      partnerType: getString(formData, 'partnerType'),
      websiteUrl: optionalString(getString(formData, 'websiteUrl')),
      proposal: getString(formData, 'proposal'),
      consent: getString(formData, 'consent'),
      utmSource: optionalString(getString(formData, 'utmSource')),
      utmMedium: optionalString(getString(formData, 'utmMedium')),
      utmCampaign: optionalString(getString(formData, 'utmCampaign'))
    });

    const city = await assertActiveCity(parsed.cityId);
    await assertPublicApplicationSubmissionAllowed(ApplicationType.PARTNER_APPLICATION);
    await createPublicApplication({
      type: ApplicationType.PARTNER_APPLICATION,
      subject: `Партнерство: ${parsed.companyName}`,
      message: parsed.proposal,
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
        partnerType: parsed.partnerType,
        websiteUrl: parsed.websiteUrl ?? null
      }
    });

    result = { type: 'success', message: 'Заявку на партнёрство получили.' };
  } catch (error) {
    result = { type: 'error', message: resolvePublicApplicationActionError('public:partner-application', error) };
  }

  redirectWithPartnersResult(result);
}
