'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getString, getArray, optionalString } from '@/lib/admin/content-utils';
import { resolveServerActionError } from '@/lib/actions/server-action-errors';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';

const jobSearchSchema = z.object({
  jobSearchStatus: z.enum(['ACTIVE', 'OPEN', 'NOT_LOOKING']).optional(),
  desiredSalary: z.coerce.number().int().min(0).optional().nullable(),
  desiredSalaryMax: z.coerce.number().int().min(0).optional().nullable(),
  employmentTypes: z.array(z.enum(['FULL_TIME', 'PART_TIME', 'FREELANCE', 'REMOTE'])),
  isPublic: z.coerce.boolean()
});

const SETTINGS_PATH = '/profile/settings';

export async function updateJobSearch(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      redirect('/auth/login');
    }

    const parsed = jobSearchSchema.parse({
      jobSearchStatus: optionalString(getString(formData, 'jobSearchStatus')),
      desiredSalary: optionalString(getString(formData, 'desiredSalary').replace(/\D/g, '')),
      desiredSalaryMax: optionalString(getString(formData, 'desiredSalaryMax').replace(/\D/g, '')),
      employmentTypes: getArray(formData, 'employmentTypes'),
      isPublic: formData.get('isPublic') === 'on'
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: '',
        jobSearchStatus: parsed.jobSearchStatus as never,
        desiredSalary: parsed.desiredSalary ?? null,
        desiredSalaryMax: parsed.desiredSalaryMax ?? null,
        employmentTypes: parsed.employmentTypes as never,
        isPublic: parsed.isPublic
      },
      update: {
        jobSearchStatus: parsed.jobSearchStatus as never,
        desiredSalary: parsed.desiredSalary ?? null,
        desiredSalaryMax: parsed.desiredSalaryMax ?? null,
        employmentTypes: parsed.employmentTypes as never,
        isPublic: parsed.isPublic
      }
    });

    revalidatePath('/profile');
    revalidatePath(SETTINGS_PATH);
    result = { type: 'success', message: 'Статус поиска сохранён.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveServerActionError({
        action: 'profile:update-job-search',
        error,
        zodMessage: 'Не удалось сохранить статус поиска.',
        known: [],
        fallbackMessage: 'Не удалось сохранить статус поиска. Попробуйте позже.'
      })
    };
  }

  const url = new URL(SETTINGS_PATH, 'http://localhost');
  url.searchParams.delete('success');
  url.searchParams.delete('error');
  url.searchParams.set(result.type, result.message);
  redirect(`${url.pathname}${url.search}`);
}
