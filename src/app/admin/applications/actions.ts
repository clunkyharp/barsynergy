'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getApplicationStatusUpdate } from '@/lib/admin/application-transitions';
import {
  applicationStatusValues,
  formatApplicationActionError
} from '@/lib/admin/application-utils';
import {
  getString,
  optionalString,
  redirectWithAdminActionResult,
  safeAdminRedirectPath
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

function applicationDetailPath(applicationId: string) {
  return `${ADMIN_APPLICATIONS_PATH}/${applicationId}`;
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
