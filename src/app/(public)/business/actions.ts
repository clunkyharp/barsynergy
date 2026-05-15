'use server';

import { redirect } from 'next/navigation';
import { ApplicationType } from '@prisma/client';
import { z } from 'zod';
import { createPublicApplication } from '@/lib/applications/create-public-application';
import {
  businessSolutionTypeOptions,
  getOptionLabel
} from '@/lib/applications/b2b-request-options';
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

const BUSINESS_PATH = '/business';
const businessSolutionTypeValues = businessSolutionTypeOptions.map((option) => option.value) as [
  (typeof businessSolutionTypeOptions)[number]['value'],
  ...(typeof businessSolutionTypeOptions)[number]['value'][]
];

const businessSolutionSchema = baseContactSchema
  .merge(utmSchema)
  .extend({
    projectName: z.string().trim().min(2).max(180),
    contactName: z.string().trim().min(2).max(160),
    cityId: z.string().trim().min(1).max(120),
    solutionType: z.enum(businessSolutionTypeValues),
    comment: z.string().trim().min(20).max(4000),
    consent: z.literal('accepted')
  })
  .refine((data) => data.email || data.phone || data.telegram, { message: 'contact is required' });

function redirectWithBusinessResult(result: { type: 'success' | 'error'; message: string }): never {
  redirect(getPublicApplicationResultPath(BUSINESS_PATH, result, 'business-request'));
}

export async function submitBusinessSolutionRequest(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      result = { type: 'success', message: 'Заявку получили. Если понадобится уточнение, команда свяжется с вами.' };
      redirectWithBusinessResult(result);
    }

    const parsed = businessSolutionSchema.parse({
      projectName: getString(formData, 'projectName'),
      contactName: getString(formData, 'contactName'),
      email: optionalString(getString(formData, 'email')),
      phone: optionalString(getString(formData, 'phone')),
      telegram: optionalString(getString(formData, 'telegram')),
      cityId: optionalString(getString(formData, 'cityId')),
      solutionType: getString(formData, 'solutionType'),
      comment: getString(formData, 'comment'),
      consent: getString(formData, 'consent'),
      utmSource: optionalString(getString(formData, 'utmSource')),
      utmMedium: optionalString(getString(formData, 'utmMedium')),
      utmCampaign: optionalString(getString(formData, 'utmCampaign'))
    });
    const city = await assertActiveCity(parsed.cityId);
    const solutionTypeLabel = getOptionLabel(businessSolutionTypeOptions, parsed.solutionType) ?? parsed.solutionType;

    await assertPublicApplicationSubmissionAllowed(ApplicationType.BUSINESS_SOLUTION);
    await createPublicApplication({
      type: ApplicationType.BUSINESS_SOLUTION,
      subject: `Бизнес-решение: ${parsed.projectName}`,
      message: parsed.comment,
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
        source: 'public_form',
        projectName: parsed.projectName,
        solutionType: parsed.solutionType,
        solutionTypeLabel
      }
    });

    result = { type: 'success', message: 'Заявку получили. Если понадобится уточнение, команда свяжется с вами.' };
  } catch (error) {
    result = { type: 'error', message: resolvePublicApplicationActionError('public:business-solution', error) };
  }

  redirectWithBusinessResult(result);
}
