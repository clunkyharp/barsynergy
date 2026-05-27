'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  applicationStatusValues
} from '@/lib/admin/application-utils';
import {
  getString,
  optionalString
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import {
  updateApplicationProcessingById,
  updateApplicationStatusById
} from '@/lib/admin/applications/status';
import {
  ADMIN_APPLICATIONS_PATH,
  applicationDetailPath,
  getApplicationActionErrorResult,
  getApplicationActionRedirect,
  redirectWithApplicationActionResult,
  type AdminApplicationActionResult
} from './action-helpers';

const statusFormSchema = z.object({
  applicationId: z.string().trim().min(1),
  status: z.enum(applicationStatusValues)
});

const processingFormSchema = z.object({
  applicationId: z.string().trim().min(1),
  status: z.enum(applicationStatusValues),
  businessNotes: z.string().trim().max(2000).optional(),
  internalNotes: z.string().trim().max(4000).optional()
});

export async function updateApplicationStatus(formData: FormData) {
  const redirectTo = getApplicationActionRedirect(formData);
  let result: AdminApplicationActionResult;

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess('applications');
    const parsed = statusFormSchema.parse({
      applicationId: getString(formData, 'applicationId'),
      status: getString(formData, 'status')
    });

    await updateApplicationStatusById({
      applicationId: parsed.applicationId,
      status: parsed.status,
      userId: user.id
    });

    revalidatePath(ADMIN_APPLICATIONS_PATH);
    revalidatePath(applicationDetailPath(parsed.applicationId));
    result = { type: 'success', message: 'Статус заявки обновлен.' };
  } catch (error) {
    result = getApplicationActionErrorResult(error);
  }

  redirectWithApplicationActionResult(redirectTo, result);
}

export async function updateApplicationProcessing(formData: FormData) {
  const redirectTo = getApplicationActionRedirect(formData);
  let result: AdminApplicationActionResult;

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess('applications');
    const parsed = processingFormSchema.parse({
      applicationId: getString(formData, 'applicationId'),
      status: getString(formData, 'status'),
      businessNotes: optionalString(getString(formData, 'businessNotes')),
      internalNotes: optionalString(getString(formData, 'internalNotes'))
    });

    await updateApplicationProcessingById({
      applicationId: parsed.applicationId,
      status: parsed.status,
      businessNotes: parsed.businessNotes,
      internalNotes: parsed.internalNotes,
      userId: user.id
    });

    revalidatePath(ADMIN_APPLICATIONS_PATH);
    revalidatePath(applicationDetailPath(parsed.applicationId));
    revalidatePath('/business/cabinet');
    revalidatePath('/business/cabinet/requests');
    result = { type: 'success', message: 'Обработка заявки сохранена.' };
  } catch (error) {
    result = getApplicationActionErrorResult(error);
  }

  redirectWithApplicationActionResult(redirectTo, result);
}
