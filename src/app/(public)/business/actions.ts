'use server';

import { ApplicationType } from '@prisma/client';
import { z } from 'zod';
import { buildApplicationPayload } from '@/lib/applications/application-payloads';
import {
  businessVenueTypeOptions,
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
const businessVenueTypeValues = businessVenueTypeOptions.map((option) => option.value) as [
  (typeof businessVenueTypeOptions)[number]['value'],
  ...(typeof businessVenueTypeOptions)[number]['value'][]
];

const businessSolutionSchema = baseContactSchema
  .merge(utmSchema)
  .extend({
    projectName: z.string().trim().min(2).max(180),
    contactName: z.string().trim().min(2).max(160),
    cityId: z.string().trim().min(1).max(120),
    solutionType: z.enum(businessVenueTypeValues),
    comment: z.string().trim().min(20).max(4000),
    consent: z.literal('accepted')
  })
  .refine((data) => data.email || data.phone || data.telegram, { message: 'contact is required' });

export async function submitBusinessSolutionRequest(_prevState: PublicApplicationResult | null, formData: FormData): Promise<PublicApplicationResult> {
  return submitPublicApplicationAction({
    actionName: 'public:business-solution',
    applicationType: ApplicationType.BUSINESS_SOLUTION,
    formData,
    successMessage: 'Заявку на размещение получили. Проверим данные и ответим в течение 2 рабочих дней.',
    parse: async (data) => {
      const parsed = businessSolutionSchema.parse({
        projectName: getString(data, 'projectName'),
        contactName: getString(data, 'contactName'),
        email: optionalString(getString(data, 'email')),
        phone: optionalString(getString(data, 'phone')),
        telegram: optionalString(getString(data, 'telegram')),
        cityId: optionalString(getString(data, 'cityId')),
        solutionType: getString(data, 'solutionType'),
        comment: getString(data, 'comment'),
        consent: getString(data, 'consent'),
        utmSource: optionalString(getString(data, 'utmSource')),
        utmMedium: optionalString(getString(data, 'utmMedium')),
        utmCampaign: optionalString(getString(data, 'utmCampaign'))
      });
      const city = await assertActiveCity(parsed.cityId);
      const solutionTypeLabel = getOptionLabel(businessVenueTypeOptions, parsed.solutionType) ?? parsed.solutionType;

      return { parsed, city, solutionTypeLabel };
    },
    buildApplication: ({ parsed, city, solutionTypeLabel }) => ({
      type: ApplicationType.BUSINESS_SOLUTION,
      subject: `Размещение в каталоге: ${parsed.projectName}`,
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
      payload: buildApplicationPayload(ApplicationType.BUSINESS_SOLUTION, {
        source: 'public_form',
        projectName: parsed.projectName,
        solutionType: parsed.solutionType,
        solutionTypeLabel
      })
    })
  });
}
