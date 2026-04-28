'use server';

import { revalidatePath } from 'next/cache';
import { ApplicationStatus, type Prisma } from '@prisma/client';
import { z } from 'zod';
import { getApplicationStatusUpdate } from '@/lib/admin/application-transitions';
import {
  applicationStatusValues,
  formatApplicationActionError
} from '@/lib/admin/application-utils';
import {
  appendApplicationInternalNote,
  getVacancyDraftFieldsFromApplication
} from '@/lib/admin/vacancy-application-drafts';
import {
  getString,
  optionalString,
  redirectWithAdminActionResult,
  safeAdminRedirectPath,
  slugify
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

const ADMIN_APPLICATIONS_PATH = '/admin/applications';

const statusFormSchema = z.object({
  applicationId: z.string().trim().min(1),
  status: z.enum(applicationStatusValues)
});

const notesFormSchema = z.object({
  applicationId: z.string().trim().min(1),
  internalNotes: z.string().trim().max(4000).optional()
});

const vacancyDraftFormSchema = z.object({
  applicationId: z.string().trim().min(1)
});

function applicationDetailPath(applicationId: string) {
  return `${ADMIN_APPLICATIONS_PATH}/${applicationId}`;
}

async function getUniqueVacancySlug(tx: Prisma.TransactionClient, baseSlug: string) {
  let candidate = baseSlug;
  let suffix = 2;

  while (
    await tx.vacancy.findFirst({
      where: { slug: candidate },
      select: { id: true }
    })
  ) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function updateApplicationStatus(formData: FormData) {
  const fallbackPath = applicationDetailPath(getString(formData, 'applicationId'));
  const redirectTo = safeAdminRedirectPath(formData, fallbackPath);
  let result: { type: 'success' | 'error'; message: string };

  try {
    const user = await requireAdminSectionAccess('applications');
    const parsed = statusFormSchema.parse({
      applicationId: getString(formData, 'applicationId'),
      status: getString(formData, 'status')
    });
    const application = await prisma.application.findUniqueOrThrow({
      where: { id: parsed.applicationId },
      select: {
        type: true,
        status: true,
        vacancyId: true,
        consentAcceptedAt: true
      }
    });

    await prisma.application.update({
      where: { id: parsed.applicationId },
      data: getApplicationStatusUpdate({
        application,
        nextStatus: parsed.status,
        userId: user.id
      })
    });

    revalidatePath(ADMIN_APPLICATIONS_PATH);
    revalidatePath(applicationDetailPath(parsed.applicationId));
    result = { type: 'success', message: 'Статус заявки обновлен.' };
  } catch (error) {
    result = { type: 'error', message: formatApplicationActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updateApplicationInternalNotes(formData: FormData) {
  const fallbackPath = applicationDetailPath(getString(formData, 'applicationId'));
  const redirectTo = safeAdminRedirectPath(formData, fallbackPath);
  let result: { type: 'success' | 'error'; message: string };

  try {
    const parsed = notesFormSchema.parse({
      applicationId: getString(formData, 'applicationId'),
      internalNotes: optionalString(getString(formData, 'internalNotes'))
    });

    await requireAdminSectionAccess('applications');
    await prisma.application.update({
      where: { id: parsed.applicationId },
      data: {
        internalNotes: parsed.internalNotes ?? null
      }
    });

    revalidatePath(ADMIN_APPLICATIONS_PATH);
    revalidatePath(applicationDetailPath(parsed.applicationId));
    result = { type: 'success', message: 'Внутренняя заметка сохранена.' };
  } catch (error) {
    result = { type: 'error', message: formatApplicationActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function createVacancyDraftFromApplication(formData: FormData) {
  const fallbackPath = applicationDetailPath(getString(formData, 'applicationId'));
  const redirectTo = safeAdminRedirectPath(formData, fallbackPath);
  let result: { type: 'success' | 'error'; message: string };

  try {
    const user = await requireAdminSectionAccess('applications');
    const parsed = vacancyDraftFormSchema.parse({
      applicationId: getString(formData, 'applicationId')
    });
    await prisma.$transaction(async (tx) => {
      const application = await tx.application.findUniqueOrThrow({
        where: { id: parsed.applicationId },
        select: {
          type: true,
          vacancyId: true,
          cityId: true,
          message: true,
          name: true,
          email: true,
          phone: true,
          telegram: true,
          consentAcceptedAt: true,
          payload: true,
          internalNotes: true
        }
      });
      const draftFields = getVacancyDraftFieldsFromApplication(application);
      const slug = slugify(`${draftFields.position}-${draftFields.companyName}`);

      if (!slug) {
        throw new Error('vacancy draft requires slug');
      }

      const uniqueSlug = await getUniqueVacancySlug(tx, slug);
      const vacancy = await tx.vacancy.create({
        data: {
          ...draftFields,
          slug: uniqueSlug,
          createdById: user.id,
          updatedById: user.id
        },
        select: { id: true, title: true }
      });

      await tx.application.update({
        where: { id: parsed.applicationId },
        data: {
          vacancyId: vacancy.id,
          status: ApplicationStatus.APPROVED,
          internalNotes: appendApplicationInternalNote(
            application.internalNotes,
            `Создан черновик вакансии: ${vacancy.title} (${uniqueSlug}).`
          )
        }
      });
    });

    revalidatePath(ADMIN_APPLICATIONS_PATH);
    revalidatePath(applicationDetailPath(parsed.applicationId));
    revalidatePath('/admin/vacancies');
    result = { type: 'success', message: 'Черновик вакансии создан и связан с заявкой.' };
  } catch (error) {
    result = { type: 'error', message: formatApplicationActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}
