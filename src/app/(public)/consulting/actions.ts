'use server';

import { ApplicationType } from '@prisma/client';
import { z } from 'zod';
import { buildApplicationPayload } from '@/lib/applications/application-payloads';
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
  getString,
  nullableString,
  optionalString,
  PERSONAL_DATA_CONSENT_TEXT,
  type PublicApplicationResult,
  utmSchema
} from '@/lib/applications/public-form-helpers';
import { submitPublicApplicationAction } from '@/lib/applications/submit-public-application-action';

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

export async function submitConsultingRequest(_prevState: PublicApplicationResult | null, formData: FormData): Promise<PublicApplicationResult> {
  return submitPublicApplicationAction({
    actionName: 'public:consulting-request',
    applicationType: ApplicationType.CONSULTING_REQUEST,
    formData,
    successMessage: 'Заявку на консультацию получили.',
    parse: async (data) => {
      const parsed = consultingRequestSchema.parse({
        contactName: getString(data, 'contactName'),
        email: optionalString(getString(data, 'email')),
        phone: optionalString(getString(data, 'phone')),
        telegram: optionalString(getString(data, 'telegram')),
        cityId: optionalString(getString(data, 'cityId')),
        businessType: getString(data, 'businessType'),
        projectStage: getString(data, 'projectStage'),
        consultingDirection: getString(data, 'consultingDirection'),
        preferredExpert: optionalString(getString(data, 'preferredExpert')),
        taskDescription: getString(data, 'taskDescription'),
        consent: getString(data, 'consent'),
        utmSource: optionalString(getString(data, 'utmSource')),
        utmMedium: optionalString(getString(data, 'utmMedium')),
        utmCampaign: optionalString(getString(data, 'utmCampaign'))
      });
      const city = await assertActiveCity(parsed.cityId);
      const consultingDirectionLabel = getOptionLabel(consultingDirectionOptions, parsed.consultingDirection) ?? parsed.consultingDirection;
      const businessTypeLabel = getOptionLabel(consultingBusinessTypeOptions, parsed.businessType) ?? parsed.businessType;
      const projectStageLabel = getOptionLabel(consultingProjectStageOptions, parsed.projectStage) ?? parsed.projectStage;
      const preferredExpertLabel = getOptionLabel(consultingExpertOptions, parsed.preferredExpert);

      return {
        parsed,
        city,
        businessTypeLabel,
        consultingDirectionLabel,
        preferredExpertLabel,
        projectStageLabel
      };
    },
    buildApplication: ({
      parsed,
      city,
      businessTypeLabel,
      consultingDirectionLabel,
      preferredExpertLabel,
      projectStageLabel
    }) => ({
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
      payload: buildApplicationPayload(ApplicationType.CONSULTING_REQUEST, {
        source: 'public_form',
        businessType: parsed.businessType,
        businessTypeLabel,
        projectStage: parsed.projectStage,
        projectStageLabel,
        consultingDirection: parsed.consultingDirection,
        consultingDirectionLabel,
        preferredExpert: parsed.preferredExpert ?? null,
        preferredExpertLabel: preferredExpertLabel ?? null
      })
    })
  });
}
