'use server';

import { redirect } from 'next/navigation';
import { ApplicationType } from '@prisma/client';
import { z } from 'zod';
import { createPublicApplication } from '@/lib/applications/create-public-application';
import {
  consultingBusinessTypeOptions,
  consultingDirectionOptions,
  consultingExpertOptions,
  consultingProjectStageOptions,
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

const CONSULTING_PATH = '/consulting';
const consultingBusinessTypeValues = consultingBusinessTypeOptions.map((option) => option.value) as [
  (typeof consultingBusinessTypeOptions)[number]['value'],
  ...(typeof consultingBusinessTypeOptions)[number]['value'][]
];
const consultingProjectStageValues = consultingProjectStageOptions.map((option) => option.value) as [
  (typeof consultingProjectStageOptions)[number]['value'],
  ...(typeof consultingProjectStageOptions)[number]['value'][]
];
const consultingDirectionValues = consultingDirectionOptions.map((option) => option.value) as [
  (typeof consultingDirectionOptions)[number]['value'],
  ...(typeof consultingDirectionOptions)[number]['value'][]
];
const consultingExpertValues = consultingExpertOptions.map((option) => option.value) as [
  (typeof consultingExpertOptions)[number]['value'],
  ...(typeof consultingExpertOptions)[number]['value'][]
];

const consultingRequestSchema = baseContactSchema
  .merge(utmSchema)
  .extend({
    contactName: z.string().trim().min(2).max(160),
    cityId: z.string().trim().min(1).max(120),
    businessType: z.enum(consultingBusinessTypeValues),
    projectStage: z.enum(consultingProjectStageValues),
    consultingDirection: z.enum(consultingDirectionValues),
    preferredExpert: z.enum(consultingExpertValues).optional(),
    taskDescription: z.string().trim().min(20).max(4000),
    consent: z.literal('accepted')
  })
  .refine((data) => data.email || data.phone || data.telegram, { message: 'contact is required' });

function redirectWithConsultingResult(result: { type: 'success' | 'error'; message: string }): never {
  redirect(getPublicApplicationResultPath(CONSULTING_PATH, result, 'consulting-request'));
}

export async function submitConsultingRequest(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      result = { type: 'success', message: 'Заявку на консультацию получили.' };
      redirectWithConsultingResult(result);
    }

    const parsed = consultingRequestSchema.parse({
      contactName: getString(formData, 'contactName'),
      email: optionalString(getString(formData, 'email')),
      phone: optionalString(getString(formData, 'phone')),
      telegram: optionalString(getString(formData, 'telegram')),
      cityId: optionalString(getString(formData, 'cityId')),
      businessType: getString(formData, 'businessType'),
      projectStage: getString(formData, 'projectStage'),
      consultingDirection: getString(formData, 'consultingDirection'),
      preferredExpert: optionalString(getString(formData, 'preferredExpert')),
      taskDescription: getString(formData, 'taskDescription'),
      consent: getString(formData, 'consent'),
      utmSource: optionalString(getString(formData, 'utmSource')),
      utmMedium: optionalString(getString(formData, 'utmMedium')),
      utmCampaign: optionalString(getString(formData, 'utmCampaign'))
    });
    const city = await assertActiveCity(parsed.cityId);
    const consultingDirectionLabel = getOptionLabel(consultingDirectionOptions, parsed.consultingDirection) ?? parsed.consultingDirection;
    const businessTypeLabel = getOptionLabel(consultingBusinessTypeOptions, parsed.businessType) ?? parsed.businessType;
    const projectStageLabel = getOptionLabel(consultingProjectStageOptions, parsed.projectStage) ?? parsed.projectStage;
    const preferredExpertLabel = getOptionLabel(consultingExpertOptions, parsed.preferredExpert);

    await assertPublicApplicationSubmissionAllowed(ApplicationType.CONSULTING_REQUEST);
    await createPublicApplication({
      type: ApplicationType.CONSULTING_REQUEST,
      subject: `Консалтинг: ${consultingDirectionLabel}`,
      message: parsed.taskDescription,
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
        businessType: parsed.businessType,
        businessTypeLabel,
        projectStage: parsed.projectStage,
        projectStageLabel,
        consultingDirection: parsed.consultingDirection,
        consultingDirectionLabel,
        preferredExpert: parsed.preferredExpert ?? null,
        preferredExpertLabel: preferredExpertLabel ?? null
      }
    });

    result = { type: 'success', message: 'Заявку на консультацию получили.' };
  } catch (error) {
    result = { type: 'error', message: resolvePublicApplicationActionError('public:consulting-request', error) };
  }

  redirectWithConsultingResult(result);
}
