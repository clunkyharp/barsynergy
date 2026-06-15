'use server';

import { ApplicationType, MasterEntityType } from '@prisma/client';
import { z } from 'zod';
import { buildApplicationPayload } from '@/lib/applications/application-payloads';
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
import { getPublishedMasterInquiryTarget } from '@/lib/public/content';

const masterInquirySchema = baseContactSchema
  .merge(utmSchema)
  .extend({
    masterId: z.string().trim().min(1),
    masterTitle: z.string().trim().min(2).max(180),
    name: z.string().trim().min(2).max(160),
    serviceType: z.string().trim().min(2).max(160),
    projectDetails: z.string().trim().min(10).max(2000),
    consent: z.literal('accepted')
  })
  .refine((data) => data.email || data.phone || data.telegram, { message: 'contact is required' });

const masterSubmissionSchema = baseContactSchema
  .merge(utmSchema)
  .extend({
    entityType: z.enum([MasterEntityType.INDIVIDUAL, MasterEntityType.BUSINESS]),
    title: z.string().trim().min(2).max(180),
    fullName: z.string().trim().max(160).optional(),
    companyName: z.string().trim().max(180).optional(),
    cityId: z.string().trim().max(120).optional(),
    serviceArea: z.string().trim().max(160).optional(),
    specializations: z.string().trim().min(2).max(300),
    rateLabel: z.string().trim().max(120).optional(),
    description: z.string().trim().min(20).max(4000),
    consent: z.literal('accepted')
  })
  .refine((data) => data.email || data.phone || data.telegram, { message: 'contact is required' })
  .refine((data) => data.entityType === MasterEntityType.BUSINESS ? Boolean(data.companyName?.trim()) : Boolean(data.fullName?.trim()), {
    message: 'master entity name is required'
  });

function splitSpecializations(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function submitMasterInquiry(
  _prevState: PublicApplicationResult | null,
  formData: FormData
): Promise<PublicApplicationResult> {
  return submitPublicApplicationAction({
    actionName: 'public:master-inquiry',
    applicationType: ApplicationType.MASTER_INQUIRY,
    formData,
    successMessage: 'Запрос мастеру получили.',
    parse: async (data) => {
      const parsed = masterInquirySchema.parse({
        masterId: getString(data, 'masterId'),
        masterTitle: getString(data, 'masterTitle'),
        name: getString(data, 'name'),
        email: optionalString(getString(data, 'email')),
        phone: optionalString(getString(data, 'phone')),
        telegram: optionalString(getString(data, 'telegram')),
        serviceType: getString(data, 'serviceType'),
        projectDetails: getString(data, 'projectDetails'),
        consent: getString(data, 'consent'),
        utmSource: optionalString(getString(data, 'utmSource')),
        utmMedium: optionalString(getString(data, 'utmMedium')),
        utmCampaign: optionalString(getString(data, 'utmCampaign'))
      });
      const master = await getPublishedMasterInquiryTarget(parsed.masterId);

      if (!master) {
        throw new Error('master is invalid');
      }

      return { parsed, master };
    },
    buildApplication: ({ parsed, master }) => ({
      type: ApplicationType.MASTER_INQUIRY,
      subject: `Запрос мастеру: ${master.title}`,
      message: parsed.projectDetails,
      name: parsed.name,
      email: nullableString(parsed.email),
      phone: nullableString(parsed.phone),
      telegram: nullableString(parsed.telegram),
      masterId: master.id,
      consentText: PERSONAL_DATA_CONSENT_TEXT,
      utm: {
        source: nullableString(parsed.utmSource),
        medium: nullableString(parsed.utmMedium),
        campaign: nullableString(parsed.utmCampaign)
      },
      payload: buildApplicationPayload(ApplicationType.MASTER_INQUIRY, {
        source: 'public_form',
        masterTitle: master.title,
        serviceType: parsed.serviceType,
        projectDetails: parsed.projectDetails,
        contactName: parsed.name,
        contactPhone: parsed.phone,
        contactEmail: parsed.email
      })
    })
  });
}

export async function submitMasterSubmission(
  _prevState: PublicApplicationResult | null,
  formData: FormData
): Promise<PublicApplicationResult> {
  return submitPublicApplicationAction({
    actionName: 'public:master-submission',
    applicationType: ApplicationType.MASTER_SUBMISSION,
    formData,
    successMessage: 'Заявку мастера получили.',
    parse: async (data) => {
      const parsed = masterSubmissionSchema.parse({
        entityType: getString(data, 'entityType'),
        title: getString(data, 'title'),
        fullName: optionalString(getString(data, 'fullName')),
        companyName: optionalString(getString(data, 'companyName')),
        email: optionalString(getString(data, 'email')),
        phone: optionalString(getString(data, 'phone')),
        telegram: optionalString(getString(data, 'telegram')),
        cityId: optionalString(getString(data, 'cityId')),
        serviceArea: optionalString(getString(data, 'serviceArea')),
        specializations: getString(data, 'specializations'),
        rateLabel: optionalString(getString(data, 'rateLabel')),
        description: getString(data, 'description'),
        consent: getString(data, 'consent'),
        utmSource: optionalString(getString(data, 'utmSource')),
        utmMedium: optionalString(getString(data, 'utmMedium')),
        utmCampaign: optionalString(getString(data, 'utmCampaign'))
      });
      const city = await assertActiveCity(parsed.cityId);

      return { parsed, city, specializations: splitSpecializations(parsed.specializations) };
    },
    buildApplication: ({ parsed, city, specializations }) => ({
      type: ApplicationType.MASTER_SUBMISSION,
      subject: `Мастер: ${parsed.title}`,
      message: parsed.description,
      name: parsed.fullName ?? parsed.companyName ?? parsed.title,
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
      payload: buildApplicationPayload(ApplicationType.MASTER_SUBMISSION, {
        source: 'public_form',
        entityType: parsed.entityType,
        fullName: parsed.fullName ?? null,
        companyName: parsed.companyName ?? null,
        title: parsed.title,
        serviceArea: parsed.serviceArea ?? null,
        specializations
      })
    })
  });
}
