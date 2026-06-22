'use server';

import { revalidatePath } from 'next/cache';
import { ApplicationStatus, ApplicationType } from '@prisma/client';
import { z } from 'zod';
import { getString, optionalString } from '@/lib/admin/content-utils';
import {
  buildBusinessApplicationPayload,
  parseBusinessApplicationInput
} from '@/lib/applications/business-request';
import { PERSONAL_DATA_CONSENT_TEXT } from '@/lib/applications/public-form-helpers';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { prisma } from '@/lib/db/prisma';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { assertActiveCity } from '@/lib/business/business-helpers';
import { resolveBusinessActionError, redirectWithBusinessResult, formatZodFieldErrors } from '@/lib/business/business-action-utils';

const BUSINESS_PATH = '/business/cabinet';
const BUSINESS_REQUESTS_PATH = '/business/cabinet/requests';

const BUSINESS_APPLICATION_FIELD_LABELS: Record<string, string> = {
  title: 'короткое название',
  details: 'подробности',
  cityId: 'город',
  position: 'должность',
  shortDescription: 'краткое описание',
  serviceArea: 'зона поставки',
  partnerType: 'тип партнёрства',
  teamSize: 'размер команды',
  recipientName: 'получатель',
  amountLabel: 'сумма',
  consent: 'согласие на обработку данных'
};

const applicationIdSchema = z.object({
  applicationId: z.string().trim().min(1)
});

function getApplicationSubject(input: { type: ApplicationType; companyName: string; title: string }) {
  switch (input.type) {
    case ApplicationType.VACANCY_SUBMISSION:
      return `${input.companyName}: ${input.title}`;
    case ApplicationType.SUPPLIER_SUBMISSION:
      return `Поставщик: ${input.companyName}`;
    case ApplicationType.PARTNER_APPLICATION:
      return `Партнёрство: ${input.companyName}`;
    case ApplicationType.CORPORATE_TRAINING_APPLICATION:
      return `Корпоративное обучение: ${input.companyName}`;
    default:
      return `Заказ сертификата: ${input.companyName}`;
  }
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

export async function createBusinessApplication(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
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
        userId: user.id,
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
        zod: formatZodFieldErrors(error, BUSINESS_APPLICATION_FIELD_LABELS, 'Не удалось сохранить заявку. Проверьте обязательные поля.'),
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
    await assertSameOriginServerAction();
    const { user, businessAccount } = await requireBusinessAccountAccess();
    const parsed = parseBusinessApplicationInput(getBusinessApplicationFormData(formData));
    const city = await assertActiveCity(parsed.cityId);

    const existing = await prisma.application.findFirst({
      where: {
        id: parsed.applicationId,
        businessAccountId: businessAccount.id,
        status: ApplicationStatus.DRAFT
      },
      select: { id: true, type: true }
    });

    if (!existing) {
      throw new Error('draft is invalid');
    }

    if (existing.type !== parsed.type) {
      throw new Error('draft type cannot be changed');
    }

    const update = await prisma.application.updateMany({
      where: {
        id: parsed.applicationId,
        businessAccountId: businessAccount.id,
        status: ApplicationStatus.DRAFT
      },
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
        userId: user.id,
        phone: businessAccount.phone,
        telegram: businessAccount.telegram,
        cityId: city?.id ?? businessAccount.cityId,
        payload: buildBusinessApplicationPayload({ ...parsed, companyName: businessAccount.companyName }),
        consentAcceptedAt: new Date(),
        consentText: PERSONAL_DATA_CONSENT_TEXT
      }
    });

    if (update.count !== 1) {
      throw new Error('draft is invalid');
    }

    revalidatePath(BUSINESS_PATH);
    revalidatePath(BUSINESS_REQUESTS_PATH);
    revalidatePath(fallbackPath);
    result = { type: 'success', message: 'Черновик обновлён.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveBusinessActionError('business:update-draft', error, {
        zod: formatZodFieldErrors(error, BUSINESS_APPLICATION_FIELD_LABELS, 'Не удалось обновить заявку. Проверьте обязательные поля.'),
        city: 'Этот город сейчас недоступен для выбора.',
        draft: 'Черновик не найден или уже недоступен.',
        application: 'Тип черновика нельзя изменить. Создайте новую заявку другого типа.',
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
    await assertSameOriginServerAction();
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
    await assertSameOriginServerAction();
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
