'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  getString
} from '@/lib/admin/content-utils';
import {
  BUSINESS_ACCESS_PREVIEW_COOKIE_NAME,
  getBusinessAccessPreviewCookieOptions
} from '@/lib/auth/business-access';
import { canPrepareBusinessAccess } from '@/lib/auth/permissions';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import {
  prepareBusinessAccessForApplication
} from '@/lib/admin/applications/business-access';
import {
  ADMIN_APPLICATIONS_PATH,
  applicationDetailPath,
  getApplicationActionErrorResult,
  getApplicationActionRedirect,
  redirectWithApplicationActionResult,
  type AdminApplicationActionResult
} from './action-helpers';

const BUSINESS_ACCESS_ADMIN_REQUIRED_ERROR = 'business access requires admin';

const prepareBusinessAccessFormSchema = z.object({
  applicationId: z.string().trim().min(1)
});

export async function prepareBusinessAccessAction(formData: FormData) {
  const redirectTo = getApplicationActionRedirect(formData);
  let result: AdminApplicationActionResult;

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess('applications');

    if (!canPrepareBusinessAccess(user.role)) {
      throw new Error(BUSINESS_ACCESS_ADMIN_REQUIRED_ERROR);
    }

    const parsed = prepareBusinessAccessFormSchema.parse({
      applicationId: getString(formData, 'applicationId')
    });

    const invite = await prepareBusinessAccessForApplication(parsed.applicationId);
    const cookieStore = await cookies();
    cookieStore.set(
      BUSINESS_ACCESS_PREVIEW_COOKIE_NAME,
      JSON.stringify(invite),
      getBusinessAccessPreviewCookieOptions()
    );

    revalidatePath(ADMIN_APPLICATIONS_PATH);
    revalidatePath(applicationDetailPath(parsed.applicationId));
    revalidatePath('/admin/users');
    result = {
      type: 'success',
      message: 'Ссылка активации подготовлена. Покажите её владельцу бизнеса безопасным каналом.'
    };
  } catch (error) {
    result =
      error instanceof Error && error.message === BUSINESS_ACCESS_ADMIN_REQUIRED_ERROR
        ? { type: 'error', message: 'Недостаточно прав для подготовки бизнес-доступа.' }
        : getApplicationActionErrorResult(error);
  }

  redirectWithApplicationActionResult(redirectTo, result);
}
