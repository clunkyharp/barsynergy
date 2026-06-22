'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { JobSearchStatus } from '@prisma/client';
import { z } from 'zod';
import { getString, getArray, optionalString } from '@/lib/forms/form-data';
import { resolveServerActionError } from '@/lib/actions/server-action-errors';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import type { ProfileActionResult } from '@/lib/profile/profile-action-result';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { slugify } from '@/lib/utils/slugify';

const jobSearchSchema = z.object({
  jobSearchStatus: z.enum(['ACTIVE', 'OPEN', 'NOT_LOOKING']).optional(),
  desiredSalary: z.coerce.number().int().min(0).optional().nullable(),
  desiredSalaryMax: z.coerce.number().int().min(0).optional().nullable(),
  employmentTypes: z.array(z.enum(['FULL_TIME', 'PART_TIME', 'FREELANCE', 'REMOTE']))
});

const SETTINGS_PATH = '/profile/settings';

export async function updateJobSearch(_prevState: ProfileActionResult, formData: FormData): Promise<ProfileActionResult> {
  let result: Exclude<ProfileActionResult, null>;

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
      employmentTypes: getArray(formData, 'employmentTypes')
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: '',
        jobSearchStatus: parsed.jobSearchStatus as never,
        desiredSalary: parsed.desiredSalary ?? null,
        desiredSalaryMax: parsed.desiredSalaryMax ?? null,
        employmentTypes: parsed.employmentTypes as never
      },
      update: {
        jobSearchStatus: parsed.jobSearchStatus as never,
        desiredSalary: parsed.desiredSalary ?? null,
        desiredSalaryMax: parsed.desiredSalaryMax ?? null,
        employmentTypes: parsed.employmentTypes as never
      }
    });

    revalidatePath('/profile');
    revalidatePath(SETTINGS_PATH, 'layout');
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

  return result;
}

export async function openProfileVisibilityAction(_prevState: ProfileActionResult): Promise<ProfileActionResult> {
  let result: Exclude<ProfileActionResult, null>;

  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      redirect('/auth/login');
    }

    const updated = await prisma.profile.updateMany({
      where: {
        userId: user.id,
        jobSearchStatus: { not: JobSearchStatus.NOT_LOOKING }
      },
      data: { isPublic: true }
    });

    if (updated.count === 0) {
      throw new Error('profile cannot be opened');
    }

    revalidatePath('/profile');
    revalidatePath(SETTINGS_PATH, 'layout');
    result = { type: 'success', message: 'Профиль открыт для работодателей.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveServerActionError({
        action: 'profile:open-visibility',
        error,
        zodMessage: 'Не удалось открыть профиль.',
        known: [
          {
            matches: (e: Error) => e.message === 'profile cannot be opened',
            message: 'Сначала укажите, что вы ищете работу или готовы к предложениям.'
          }
        ],
        fallbackMessage: 'Не удалось открыть профиль. Попробуйте позже.'
      })
    };
  }

  return result;
}

export async function checkPublicHandleAvailable(handle: string): Promise<boolean> {
  try {
    await assertSameOriginServerAction();
    const existing = await prisma.profile.findFirst({
      where: { publicHandle: handle },
      select: { id: true }
    });
    return !existing;
  } catch {
    return false;
  }
}

const publishSchema = z.object({
  publish: z.coerce.boolean(),
  handle: z.string().min(1).max(60).optional(),
});

export async function setProfilePublic(_prevState: ProfileActionResult, formData: FormData): Promise<ProfileActionResult> {
  let result: Exclude<ProfileActionResult, null>;

  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      redirect('/auth/login');
    }

    const parsed = publishSchema.parse({
      publish: formData.get('publish') === 'on',
      handle: optionalString(getString(formData, 'handle')),
    });

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    });

    if (!profile) {
      return { type: 'error', message: 'Сначала заполните основные данные профиля.' };
    }

    if (parsed.publish) {
      if (!profile.fullName || !profile.profession || !profile.cityId || profile.employmentTypes.length === 0) {
        return {
          type: 'error',
          message: 'Для публикации резюме заполните: ФИО, профессию, город и хотя бы один формат занятости.'
        };
      }

      if (!profile.jobSearchStatus || profile.jobSearchStatus === JobSearchStatus.NOT_LOOKING) {
        return {
          type: 'error',
          message: 'Для публикации резюме укажите статус «Активно ищу» или «Открыт к предложениям».'
        };
      }

      let publicHandle = parsed.handle?.trim();
      if (!publicHandle) {
        publicHandle = slugify(profile.fullName ?? '');
      }

      if (!publicHandle) {
        return { type: 'error', message: 'Не удалось сгенерировать публичный адрес. Укажите его вручную.' };
      }

      const existingHandle = await prisma.profile.findFirst({
        where: { publicHandle, id: { not: profile.id } },
        select: { id: true }
      });

      if (existingHandle) {
        return { type: 'error', message: 'Этот публичный адрес уже занят. Укажите другой.' };
      }

      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          isPublic: true,
          publicHandle,
          publishedAt: profile.publishedAt ?? new Date(),
        }
      });
    } else {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { isPublic: false }
      });
    }

    revalidatePath('/profile');
    revalidatePath(SETTINGS_PATH, 'layout');
    result = {
      type: 'success',
      message: parsed.publish ? 'Резюме опубликовано.' : 'Резюме скрыто.'
    };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveServerActionError({
        action: 'profile:set-public',
        error,
        zodMessage: 'Не удалось изменить статус публикации.',
        known: [],
        fallbackMessage: 'Не удалось изменить статус публикации. Попробуйте позже.'
      })
    };
  }

  return result;
}
