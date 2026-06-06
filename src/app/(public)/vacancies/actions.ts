'use server';

import { redirect } from 'next/navigation';
import { ApplicationType, ContentStatus, UserRole } from '@prisma/client';
import { z } from 'zod';
import { deleteUploadedFileIfUnused } from '@/lib/admin/content-utils';
import { buildApplicationPayload } from '@/lib/applications/application-payloads';
import { createPublicApplication } from '@/lib/applications/create-public-application';
import { submitPublicApplicationAction } from '@/lib/applications/submit-public-application-action';
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
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { vacancyPositionValues } from '@/lib/vacancies/positions';
import { getCurrentUser } from '@/lib/auth/current-user';

const VACANCIES_PATH = '/vacancies';

export type VacancyResponseActionResult = { type: 'success' | 'error'; message: string } | null;

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

function redirectWithApplicationResult(
  result: { type: 'success' | 'error'; message: string },
  basePath = VACANCIES_PATH
): never {
  redirect(getPublicApplicationResultPath(basePath, result));
}

export async function submitVacancyPlacementApplication(formData: FormData) {
  await submitPublicApplicationAction({
    actionName: 'public:vacancy-submission',
    applicationType: ApplicationType.VACANCY_SUBMISSION,
    formData,
    successMessage: 'Заявку на размещение вакансии получили.',
    redirectWithResult: redirectWithApplicationResult,
    parse: async (data) => {
      const parsed = vacancySubmissionSchema.parse({
        companyName: getString(data, 'companyName'),
        contactName: getString(data, 'contactName'),
        email: optionalString(getString(data, 'email')),
        phone: optionalString(getString(data, 'phone')),
        telegram: optionalString(getString(data, 'telegram')),
        cityId: optionalString(getString(data, 'cityId')),
        position: getString(data, 'position'),
        employmentType: optionalString(getString(data, 'employmentType')),
        salaryLabel: optionalString(getString(data, 'salaryLabel')),
        experienceLabel: optionalString(getString(data, 'experienceLabel')),
        shortDescription: getString(data, 'shortDescription'),
        details: getString(data, 'details'),
        consent: getString(data, 'consent'),
        utmSource: optionalString(getString(data, 'utmSource')),
        utmMedium: optionalString(getString(data, 'utmMedium')),
        utmCampaign: optionalString(getString(data, 'utmCampaign'))
      });
      const city = await assertActiveCity(parsed.cityId);

      return { parsed, city };
    },
    buildApplication: ({ parsed, city }) => ({
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
      payload: buildApplicationPayload(ApplicationType.VACANCY_SUBMISSION, {
        companyName: parsed.companyName,
        position: parsed.position,
        employmentType: parsed.employmentType ?? null,
        salaryLabel: parsed.salaryLabel ?? null,
        experienceLabel: parsed.experienceLabel ?? null,
        shortDescription: parsed.shortDescription
      })
    })
  });
}

export async function submitVacancyResponseApplication(
  prevState: VacancyResponseActionResult,
  formData: FormData
): Promise<VacancyResponseActionResult> {
  let uploadedResumeFileId: string | null = null;

  try {
    await assertSameOriginServerAction();
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      return { type: 'success', message: 'Отклик отправлен.' };
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

    const currentUser = await getCurrentUser();

    await createPublicApplication({
      type: ApplicationType.VACANCY_RESPONSE,
      userId: currentUser?.role === UserRole.USER ? currentUser.id : null,
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
      payload: buildApplicationPayload(ApplicationType.VACANCY_RESPONSE, {
        roleSummary: parsed.roleSummary,
        resumeUrl: parsed.resumeUrl ?? null,
        employerCompanyName: vacancy.companyName
      })
    });

    return { type: 'success', message: 'Отклик отправлен.' };
  } catch (error) {
    await deleteUploadedFileIfUnused(uploadedResumeFileId);
    return { type: 'error', message: resolvePublicApplicationActionError('public:vacancy-response', error) };
  }
}
