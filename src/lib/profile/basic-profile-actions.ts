'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getString, nullableString, optionalString } from '@/lib/forms/form-data';
import { resolveServerActionError } from '@/lib/actions/server-action-errors';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import type { ProfileActionResult } from '@/lib/profile/profile-action-result';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';

const basicProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  cityId: z.string().trim().optional(),
  profession: z.string().trim().max(120).optional(),
  company: z.string().trim().max(160).optional(),
  bio: z.string().trim().max(1000).optional(),
  phone: z.string().trim().max(80).optional(),
  telegram: z.string().trim().max(80).optional()
});

const SETTINGS_PATH = '/profile/settings';

export async function updateBasicProfile(_prevState: ProfileActionResult, formData: FormData): Promise<ProfileActionResult> {
  let result: Exclude<ProfileActionResult, null>;

  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      redirect('/auth/login');
    }

    const parsed = basicProfileSchema.parse({
      fullName: getString(formData, 'fullName'),
      cityId: optionalString(getString(formData, 'cityId')),
      profession: optionalString(getString(formData, 'profession')),
      company: optionalString(getString(formData, 'company')),
      bio: optionalString(getString(formData, 'bio')),
      phone: optionalString(getString(formData, 'phone')),
      telegram: optionalString(getString(formData, 'telegram'))
    });

    if (parsed.cityId) {
      const city = await prisma.city.findFirst({
        where: { id: parsed.cityId, isActive: true },
        select: { id: true }
      });

      if (!city) {
        throw new Error('city is invalid');
      }
    }

    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: parsed.fullName,
        cityId: nullableString(parsed.cityId),
        profession: nullableString(parsed.profession),
        company: nullableString(parsed.company),
        bio: nullableString(parsed.bio),
        phone: nullableString(parsed.phone),
        telegram: nullableString(parsed.telegram)
      },
      update: {
        fullName: parsed.fullName,
        cityId: nullableString(parsed.cityId),
        profession: nullableString(parsed.profession),
        company: nullableString(parsed.company),
        bio: nullableString(parsed.bio),
        phone: nullableString(parsed.phone),
        telegram: nullableString(parsed.telegram)
      }
    });

    revalidatePath('/profile');
    revalidatePath(SETTINGS_PATH, 'layout');
    result = { type: 'success', message: 'Профиль сохранён.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveServerActionError({
        action: 'profile:update-basic',
        error,
        zodMessage: 'Не удалось сохранить профиль. Проверьте поля.',
        known: [
          {
            matches: (e: Error) => e.message === 'city is invalid',
            message: 'Этот город сейчас недоступен для выбора.'
          }
        ],
        fallbackMessage: 'Не удалось сохранить профиль. Попробуйте позже.'
      })
    };
  }

  return result;
}
