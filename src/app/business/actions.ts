'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ApplicationStatus, ApplicationType } from '@prisma/client';
import { z } from 'zod';
import { hasErrorMessage, resolveServerActionError } from '@/lib/actions/server-action-errors';
import { getString, nullableString, optionalString } from '@/lib/admin/content-utils';
import {
  buildBusinessApplicationPayload,
  parseBusinessApplicationInput
} from '@/lib/applications/business-request';
import { PERSONAL_DATA_CONSENT_TEXT } from '@/lib/applications/public-form-helpers';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { prisma } from '@/lib/db/prisma';

const BUSINESS_PATH = '/business';
const BUSINESS_REQUESTS_PATH = '/business/requests';

const businessProfileSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  contactPerson: z.string().trim().min(2).max(120),
  cityId: z.string().trim().optional(),
  phone: z.string().trim().max(80).optional(),
  telegram: z.string().trim().max(80).optional(),
  websiteUrl: z.string().trim().url().max(240).optional().or(z.literal('')),
  description: z.string().trim().max(1000).optional()
});

const applicationIdSchema = z.object({
  applicationId: z.string().trim().min(1)
});

function businessResultPath(path: string, result: { type: 'success' | 'error'; message: string }) {
  const url = new URL(path, 'http://localhost');
  url.searchParams.delete('success');
  url.searchParams.delete('error');
  url.searchParams.set(result.type, result.message);
  return `${url.pathname}${url.search}`;
}

function redirectWithBusinessResult(path: string, result: { type: 'success' | 'error'; message: string }): never {
  redirect(businessResultPath(path, result));
}

async function assertActiveCity(cityId?: string | null) {
  if (!cityId) {
    return null;
  }

  const city = await prisma.city.findFirst({
    where: { id: cityId, isActive: true },
    select: { id: true, name: true }
  });

  if (!city) {
    throw new Error('city is invalid');
  }

  return city;
}

function getApplicationSubject(input: { type: ApplicationType; companyName: string; title: string }) {
  if (input.type === ApplicationType.VACANCY_SUBMISSION) {
    return `${input.companyName}: ${input.title}`;
  }

  if (input.type === ApplicationType.SUPPLIER_SUBMISSION) {
    return `Поставщик: ${input.companyName}`;
  }

  if (input.type === ApplicationType.PARTNER_APPLICATION) {
    return `Партнерство: ${input.companyName}`;
  }

  if (input.type === ApplicationType.CORPORATE_TRAINING_APPLICATION) {
    return `Корпоративное обучение: ${input.companyName}`;
  }

  return `Заказ сертификата: ${input.companyName}`;
}

function getBusinessApplicationFormData(formData: FormData) {
  return {
    applicationId: optionalString(getString(formData, 'applicationId')),
    type: getString(formData, 'type'),
    title: getString(formData, 'title'),
    cityId: optionalString(getString(formData, 'cityId')),
    details: getString(formData, 'details'),
    position: optionalString(getString(formData, 'position')),
    employmentType: optionalString(getString(formData, 'employmentType')),
    salaryLabel: optionalString(getString(formData, 'salaryLabel')),
    experienceLabel: optionalString(getString(formData, 'experienceLabel')),
    shortDescription: optionalString(getString(formData, 'shortDescription')),
    serviceArea: optionalString(getString(formData, 'serviceArea')),
    partnerType: optionalString(getString(formData, 'partnerType')),
    teamSize: optionalString(getString(formData, 'teamSize')),
    recipientName: optionalString(getString(formData, 'recipientName')),
    amountLabel: optionalString(getString(formData, 'amountLabel')),
    consent: getString(formData, 'consent')
  };
}

function resolveBusinessActionError(
  action: string,
  error: unknown,
  messages: {
    zod: string;
    fallback: string;
    city?: string;
    draft?: string;
    application?: string;
  }
) {
  return resolveServerActionError({
    action,
    error,
    zodMessage: messages.zod,
    known: [
      ...(messages.city
        ? [
            {
              matches: (candidate: Error) => hasErrorMessage(candidate, 'city is invalid'),
              message: messages.city
            }
          ]
        : []),
      ...(messages.draft
        ? [
            {
              matches: (candidate: Error) => hasErrorMessage(candidate, 'draft is invalid'),
              message: messages.draft
            }
          ]
        : []),
      ...(messages.application
        ? [
            {
              matches: (candidate: Error) => hasErrorMessage(candidate, 'application is invalid'),
              message: messages.application
            }
          ]
        : [])
    ],
    fallbackMessage: messages.fallback
  });
}

export async function updateBusinessProfile(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    const { businessAccount } = await requireBusinessAccountAccess();
    const parsed = businessProfileSchema.parse({
      companyName: getString(formData, 'companyName'),
      contactPerson: getString(formData, 'contactPerson'),
      cityId: optionalString(getString(formData, 'cityId')),
      phone: optionalString(getString(formData, 'phone')),
      telegram: optionalString(getString(formData, 'telegram')),
      websiteUrl: getString(formData, 'websiteUrl'),
      description: optionalString(getString(formData, 'description'))
    });
    const city = await assertActiveCity(parsed.cityId);

    await prisma.businessAccount.update({
      where: { id: businessAccount.id },
      data: {
        companyName: parsed.companyName,
        contactPerson: parsed.contactPerson,
        cityId: city?.id ?? null,
        phone: nullableString(parsed.phone),
        telegram: nullableString(parsed.telegram),
        websiteUrl: nullableString(parsed.websiteUrl),
        description: nullableString(parsed.description)
      }
    });

    revalidatePath(BUSINESS_PATH);
    revalidatePath(BUSINESS_REQUESTS_PATH);
    result = { type: 'success', message: 'Профиль компании сохранён.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveBusinessActionError('business:update-profile', error, {
        zod: 'Не удалось сохранить профиль. Проверьте обязательные поля и сайт.',
        city: 'Этот город сейчас недоступен для выбора.',
        fallback: 'Не удалось сохранить профиль. Попробуйте позже.'
      })
    };
  }

  redirectWithBusinessResult(BUSINESS_PATH, result);
}

export async function createBusinessApplication(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    const { user, businessAccount } = await requireBusinessAccountAccess();
    const parsed = parseBusinessApplicationInput(getBusinessApplicationFormData(formData));
    const city = await assertActiveCity(parsed.cityId);
    const status = getString(formData, 'intent') === 'draft' ? ApplicationStatus.DRAFT : ApplicationStatus.NEW;

    await prisma.application.create({
      data: {
        type: parsed.type,
        status,
        subject: getApplicationSubject({
          type: parsed.type,
          companyName: businessAccount.companyName,
          title: parsed.title
        }),
        message: parsed.details,
        name: businessAccount.contactPerson,
        email: user.email,
        phone: businessAccount.phone,
        telegram: businessAccount.telegram,
        cityId: city?.id ?? businessAccount.cityId,
        businessAccountId: businessAccount.id,
        payload: buildBusinessApplicationPayload({ ...parsed, companyName: businessAccount.companyName }),
        consentAcceptedAt: new Date(),
        consentText: PERSONAL_DATA_CONSENT_TEXT
      }
    });

    revalidatePath(BUSINESS_PATH);
    revalidatePath(BUSINESS_REQUESTS_PATH);
    revalidatePath('/admin/applications');
    result =
      status === ApplicationStatus.DRAFT
        ? { type: 'success', message: 'Черновик сохранён.' }
        : { type: 'success', message: 'Заявка отправлена.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveBusinessActionError('business:create-application', error, {
        zod: 'Не удалось сохранить заявку. Проверьте обязательные поля.',
        city: 'Этот город сейчас недоступен для выбора.',
        fallback: 'Не удалось сохранить заявку. Попробуйте позже.'
      })
    };
  }

  redirectWithBusinessResult(BUSINESS_REQUESTS_PATH, result);
}

export async function updateBusinessDraftApplication(formData: FormData) {
  const parsedId = applicationIdSchema.safeParse({ applicationId: getString(formData, 'applicationId') });
  const fallbackPath = parsedId.success ? `${BUSINESS_REQUESTS_PATH}/${parsedId.data.applicationId}` : BUSINESS_REQUESTS_PATH;
  let result: { type: 'success' | 'error'; message: string };

  try {
    const { user, businessAccount } = await requireBusinessAccountAccess();
    const parsed = parseBusinessApplicationInput(getBusinessApplicationFormData(formData));
    const city = await assertActiveCity(parsed.cityId);
    const existing = await prisma.application.findFirst({
      where: {
        id: parsed.applicationId,
        businessAccountId: businessAccount.id,
        status: ApplicationStatus.DRAFT
      },
      select: { id: true }
    });

    if (!existing) {
      throw new Error('draft is invalid');
    }

    await prisma.application.update({
      where: { id: existing.id },
      data: {
        type: parsed.type,
        subject: getApplicationSubject({
          type: parsed.type,
          companyName: businessAccount.companyName,
          title: parsed.title
        }),
        message: parsed.details,
        name: businessAccount.contactPerson,
        email: user.email,
        phone: businessAccount.phone,
        telegram: businessAccount.telegram,
        cityId: city?.id ?? businessAccount.cityId,
        payload: buildBusinessApplicationPayload({ ...parsed, companyName: businessAccount.companyName }),
        consentAcceptedAt: new Date(),
        consentText: PERSONAL_DATA_CONSENT_TEXT
      }
    });

    revalidatePath(BUSINESS_PATH);
    revalidatePath(BUSINESS_REQUESTS_PATH);
    revalidatePath(fallbackPath);
    result = { type: 'success', message: 'Черновик обновлён.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveBusinessActionError('business:update-draft', error, {
        zod: 'Не удалось обновить заявку. Проверьте обязательные поля.',
        city: 'Этот город сейчас недоступен для выбора.',
        draft: 'Черновик не найден или уже недоступен.',
        fallback: 'Не удалось обновить заявку. Попробуйте позже.'
      })
    };
  }

  redirectWithBusinessResult(fallbackPath, result);
}

export async function submitBusinessDraftApplication(formData: FormData) {
  const parsed = applicationIdSchema.safeParse({ applicationId: getString(formData, 'applicationId') });
  let result: { type: 'success' | 'error'; message: string };

  try {
    if (!parsed.success) {
      throw new Error('application is invalid');
    }

    const { businessAccount } = await requireBusinessAccountAccess();
    const update = await prisma.application.updateMany({
      where: {
        id: parsed.data.applicationId,
        businessAccountId: businessAccount.id,
        status: ApplicationStatus.DRAFT
      },
      data: { status: ApplicationStatus.NEW }
    });

    if (update.count !== 1) {
      throw new Error('draft is invalid');
    }

    revalidatePath(BUSINESS_PATH);
    revalidatePath(BUSINESS_REQUESTS_PATH);
    revalidatePath('/admin/applications');
    result = { type: 'success', message: 'Заявка отправлена.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveBusinessActionError('business:submit-draft', error, {
        application: 'Заявка не найдена или уже недоступна.',
        draft: 'Черновик не найден или уже недоступен.',
        zod: 'Не удалось отправить заявку.',
        fallback: 'Не удалось отправить заявку. Попробуйте позже.'
      })
    };
  }

  redirectWithBusinessResult(BUSINESS_REQUESTS_PATH, result);
}

export async function archiveBusinessDraftApplication(formData: FormData) {
  const parsed = applicationIdSchema.safeParse({ applicationId: getString(formData, 'applicationId') });
  let result: { type: 'success' | 'error'; message: string };

  try {
    if (!parsed.success) {
      throw new Error('application is invalid');
    }

    const { businessAccount } = await requireBusinessAccountAccess();
    const update = await prisma.application.updateMany({
      where: {
        id: parsed.data.applicationId,
        businessAccountId: businessAccount.id,
        status: ApplicationStatus.DRAFT
      },
      data: { status: ApplicationStatus.ARCHIVED }
    });

    if (update.count !== 1) {
      throw new Error('draft is invalid');
    }

    revalidatePath(BUSINESS_PATH);
    revalidatePath(BUSINESS_REQUESTS_PATH);
    result = { type: 'success', message: 'Заявка перенесена в архив.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveBusinessActionError('business:archive-draft', error, {
        application: 'Заявка не найдена или уже недоступна.',
        draft: 'Черновик не найден или уже недоступен.',
        zod: 'Не удалось перенести заявку в архив.',
        fallback: 'Не удалось перенести заявку в архив. Попробуйте позже.'
      })
    };
  }

  redirectWithBusinessResult(BUSINESS_REQUESTS_PATH, result);
}
