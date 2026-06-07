'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  getString,
  optionalString
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import {
  updateApplicationBusinessNotesById,
  updateApplicationInternalNotesById
} from '@/lib/admin/applications/notes';
import {
  ADMIN_APPLICATIONS_PATH,
  applicationDetailPath,
  getApplicationActionErrorResult,
  getApplicationActionRedirect,
  redirectWithApplicationActionResult,
  type AdminApplicationActionResult
} from './action-helpers';

const notesFormSchema = z.object({
  applicationId: z.string().trim().min(1),
  internalNotes: z.string().trim().max(4000).optional()
});

const businessNotesFormSchema = z.object({
  applicationId: z.string().trim().min(1),
  businessNotes: z.string().trim().max(2000).optional()
});

export async function updateApplicationInternalNotes(formData: FormData) {
  const redirectTo = getApplicationActionRedirect(formData);
  let result: AdminApplicationActionResult;

  try {
    await assertSameOriginServerAction();
    const parsed = notesFormSchema.parse({
      applicationId: getString(formData, 'applicationId'),
      internalNotes: optionalString(getString(formData, 'internalNotes'))
    });

    await requireAdminSectionAccess('applications');
    await updateApplicationInternalNotesById({
      applicationId: parsed.applicationId,
      internalNotes: parsed.internalNotes
    });

    revalidatePath(ADMIN_APPLICATIONS_PATH);
    revalidatePath(applicationDetailPath(parsed.applicationId));
    result = { type: 'success', message: 'Внутренняя заметка сохранена.' };
  } catch (error) {
    result = getApplicationActionErrorResult(error);
  }

  redirectWithApplicationActionResult(redirectTo, result);
}

export async function updateApplicationBusinessNotes(formData: FormData) {
  const redirectTo = getApplicationActionRedirect(formData);
  let result: AdminApplicationActionResult;

  try {
    await assertSameOriginServerAction();
    const parsed = businessNotesFormSchema.parse({
      applicationId: getString(formData, 'applicationId'),
      businessNotes: optionalString(getString(formData, 'businessNotes'))
    });

    await requireAdminSectionAccess('applications');
    await updateApplicationBusinessNotesById({
      applicationId: parsed.applicationId,
      businessNotes: parsed.businessNotes
    });

    revalidatePath(ADMIN_APPLICATIONS_PATH);
    revalidatePath(applicationDetailPath(parsed.applicationId));
    revalidatePath('/business/cabinet');
    revalidatePath('/business/cabinet/requests');
    result = { type: 'success', message: 'Комментарий для бизнеса сохранён.' };
  } catch (error) {
    result = getApplicationActionErrorResult(error);
  }

  redirectWithApplicationActionResult(redirectTo, result);
}
