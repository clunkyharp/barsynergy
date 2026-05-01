'use server';

import { redirect } from 'next/navigation';
import { ApplicationType, ContentStatus } from '@prisma/client';
import { z } from 'zod';
import { deleteUploadedFileIfUnused } from '@/lib/admin/content-utils';
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
  utmSchema,
  VACANCY_RESPONSE_CONSENT_TEXT
} from '@/lib/applications/public-form-helpers';
import { uploadPrivateResumeFromFormData } from '@/lib/applications/private-resume-files';
import {
  assertPublicApplicationFormsEnabled,
  assertPublicApplicationSubmissionAllowed,
  hasHoneypotValue
} from '@/lib/applications/public-submission-guards';
import { prisma } from '@/lib/db/prisma';
import { vacancyPositionValues } from '@/lib/vacancies/positions';

const VACANCIES_PATH = '/vacancies';

const vacancySubmissionSchema = baseContactSchema
  .merge(utmSchema)
  .extend({
    companyName: z.string().trim().min(2).max(180),
    contactName: z.string().trim().min(2).max(160),
    cityId: z.string().trim().max(120).optional(),
    position: z.enum(vacancyPositionValues),
    employmentType: z.string().trim().max(100).optional(),
    salaryLabel: z.string().trim().max(120).optional(),
    experienceLabel: z.string().trim().max(120).optional(),
    shortDescription: z.string().trim().min(10).max(500),
    details: z.string().trim().min(20).max(4000),
    consent: z.literal('accepted')
  })
  .refine((data) => data.email || data.phone || data.telegram, { message: 'contact is required' });

const vacancyResponseSchema = baseContactSchema
  .merge(utmSchema)
  .extend({
    vacancyId: z.string().trim().min(1),
    candidateName: z.string().trim().min(2).max(160),
    cityId: z.string().trim().max(120).optional(),
    roleSummary: z.string().trim().min(4).max(500),
    message: z.string().trim().min(10).max(3000),
    resumeUrl: z.string().trim().url().max(500).optional(),
    consent: z.literal('accepted')
  })
  .refine((data) => data.email || data.phone || data.telegram, { message: 'contact is required' });

function redirectWithApplicationResult(result: { type: 'success' | 'error'; message: string }): never {
  redirect(getPublicApplicationResultPath(VACANCIES_PATH, result));
}

export async function submitVacancyPlacementApplication(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      result = { type: 'success', message: 'Заявку на размещение вакансии получили.' };
      redirectWithApplicationResult(result);
    }

    const parsed = vacancySubmissionSchema.parse({
      companyName: getString(formData, 'companyName'),
      contactName: getString(formData, 'contactName'),
      email: optionalString(getString(formData, 'email')),
      phone: optionalString(getString(formData, 'phone')),
      telegram: optionalString(getString(formData, 'telegram')),
      cityId: optionalString(getString(formData, 'cityId')),
      position: getString(formData, 'position'),
      employmentType: optionalString(getString(formData, 'employmentType')),
      salaryLabel: optionalString(getString(formData, 'salaryLabel')),
      experienceLabel: optionalString(getString(formData, 'experienceLabel')),
      shortDescription: getString(formData, 'shortDescription'),
      details: getString(formData, 'details'),
      consent: getString(formData, 'consent'),
      utmSource: optionalString(getString(formData, 'utmSource')),
      utmMedium: optionalString(getString(formData, 'utmMedium')),
      utmCampaign: optionalString(getString(formData, 'utmCampaign'))
    });

    const city = await assertActiveCity(parsed.cityId);
    await assertPublicApplicationSubmissionAllowed(ApplicationType.VACANCY_SUBMISSION);
    await createPublicApplication({
      type: ApplicationType.VACANCY_SUBMISSION,
      subject: `${parsed.companyName}: ${parsed.position}`,
      message: parsed.details,
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
        position: parsed.position,
        employmentType: parsed.employmentType ?? null,
        salaryLabel: parsed.salaryLabel ?? null,
        experienceLabel: parsed.experienceLabel ?? null,
        shortDescription: parsed.shortDescription
      }
    });

    result = { type: 'success', message: 'Заявку на размещение вакансии получили.' };
  } catch (error) {
    result = { type: 'error', message: resolvePublicApplicationActionError('public:vacancy-submission', error) };
  }

  redirectWithApplicationResult(result);
}

export async function submitVacancyResponseApplication(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };
  let uploadedResumeFileId: string | null = null;

  try {
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      result = { type: 'success', message: 'Отклик отправлен.' };
      redirectWithApplicationResult(result);
    }

    const parsed = vacancyResponseSchema.parse({
      vacancyId: getString(formData, 'vacancyId'),
      candidateName: getString(formData, 'candidateName'),
      email: optionalString(getString(formData, 'email')),
      phone: optionalString(getString(formData, 'phone')),
      telegram: optionalString(getString(formData, 'telegram')),
      cityId: optionalString(getString(formData, 'cityId')),
      roleSummary: getString(formData, 'roleSummary'),
      message: getString(formData, 'message'),
      resumeUrl: optionalString(getString(formData, 'resumeUrl')),
      consent: getString(formData, 'consent'),
      utmSource: optionalString(getString(formData, 'utmSource')),
      utmMedium: optionalString(getString(formData, 'utmMedium')),
      utmCampaign: optionalString(getString(formData, 'utmCampaign'))
    });

    const [vacancy, city] = await Promise.all([
      prisma.vacancy.findFirst({
        where: { id: parsed.vacancyId, status: ContentStatus.PUBLISHED },
        select: { id: true, title: true, companyName: true }
      }),
      assertActiveCity(parsed.cityId)
    ]);

    if (!vacancy) {
      throw new Error('vacancy is invalid');
    }

    await assertPublicApplicationSubmissionAllowed(ApplicationType.VACANCY_RESPONSE);
    const uploadedResume = await uploadPrivateResumeFromFormData(formData, 'resumeFile');
    uploadedResumeFileId = uploadedResume?.id ?? null;

    await createPublicApplication({
      type: ApplicationType.VACANCY_RESPONSE,
      subject: `Отклик: ${vacancy.title}`,
      message: parsed.message,
      name: parsed.candidateName,
      email: nullableString(parsed.email),
      phone: nullableString(parsed.phone),
      telegram: nullableString(parsed.telegram),
      cityId: city?.id ?? null,
      cityName: city?.name,
      vacancyId: vacancy.id,
      resumeFileId: uploadedResume?.id ?? null,
      consentText: VACANCY_RESPONSE_CONSENT_TEXT,
      utm: {
        source: nullableString(parsed.utmSource),
        medium: nullableString(parsed.utmMedium),
        campaign: nullableString(parsed.utmCampaign)
      },
      payload: {
        roleSummary: parsed.roleSummary,
        resumeUrl: parsed.resumeUrl ?? null,
        employerCompanyName: vacancy.companyName
      }
    });

    result = { type: 'success', message: 'Отклик отправлен.' };
  } catch (error) {
    await deleteUploadedFileIfUnused(uploadedResumeFileId);
    result = { type: 'error', message: resolvePublicApplicationActionError('public:vacancy-response', error) };
  }

  redirectWithApplicationResult(result);
}
