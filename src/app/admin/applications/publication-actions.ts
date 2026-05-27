'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  getString
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import {
  createVacancyDraftFromApplicationId,
  publishContentFromApplicationId
} from '@/lib/admin/applications/publication';
import {
  ADMIN_APPLICATIONS_PATH,
  applicationDetailPath,
  getApplicationActionErrorResult,
  getApplicationActionRedirect,
  redirectWithApplicationActionResult,
  type AdminApplicationActionResult
} from './action-helpers';

const vacancyDraftFormSchema = z.object({
  applicationId: z.string().trim().min(1)
});

const publicationFormSchema = z.object({
  applicationId: z.string().trim().min(1),
  target: z.enum(['vacancy', 'supplier', 'partner'])
});

export async function createVacancyDraftFromApplication(formData: FormData) {
  const redirectTo = getApplicationActionRedirect(formData);
  let result: AdminApplicationActionResult;

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess('applications');
    const parsed = vacancyDraftFormSchema.parse({
      applicationId: getString(formData, 'applicationId')
    });

    await createVacancyDraftFromApplicationId({
      applicationId: parsed.applicationId,
      userId: user.id
    });

    revalidatePath(ADMIN_APPLICATIONS_PATH);
    revalidatePath(applicationDetailPath(parsed.applicationId));
    revalidatePath('/admin/vacancies');
    result = { type: 'success', message: 'Черновик вакансии создан и связан с заявкой.' };
  } catch (error) {
    result = getApplicationActionErrorResult(error);
  }

  redirectWithApplicationActionResult(redirectTo, result);
}

export async function publishContentFromApplication(formData: FormData) {
  const redirectTo = getApplicationActionRedirect(formData);
  let result: AdminApplicationActionResult;

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess('applications');
    const parsed = publicationFormSchema.parse({
      applicationId: getString(formData, 'applicationId'),
      target: getString(formData, 'target')
    });

    const publication = await publishContentFromApplicationId({
      applicationId: parsed.applicationId,
      target: parsed.target,
      userId: user.id
    });

    revalidatePath(ADMIN_APPLICATIONS_PATH);
    revalidatePath(applicationDetailPath(parsed.applicationId));
    revalidatePath(`/admin/${publication.target === 'vacancy' ? 'vacancies' : `${publication.target}s`}`);
    revalidatePath(publication.target === 'vacancy' ? '/vacancies' : `/${publication.target}s`);
    revalidatePath('/');

    const message =
      publication.target === 'vacancy'
        ? `Вакансия опубликована: ${publication.title}.`
        : publication.target === 'supplier'
          ? `Поставщик опубликован: ${publication.title}.`
          : `Партнёр опубликован: ${publication.title}.`;
    result = { type: 'success', message };
  } catch (error) {
    result = getApplicationActionErrorResult(error);
  }

  redirectWithApplicationActionResult(redirectTo, result);
}
