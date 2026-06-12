'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getString, nullableString, optionalString } from '@/lib/admin/content-utils';
import { resolveServerActionError } from '@/lib/actions/server-action-errors';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';

const basicProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  cityId: z.string().trim().optional(),
  profession: z.string().trim().max(120).optional(),
  company: z.string().trim().max(160).optional(),
  bio: z.string().trim().max(1000).optional(),
  phone: z.string().trim().max(80).optional(),
  telegram: z.string().trim().max(80).optional(),
  website: z.string().trim().url().max(240).optional().or(z.literal(''))
});

const SETTINGS_PATH = '/profile/settings';

export async function updateBasicProfile(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

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
      telegram: optionalString(getString(formData, 'telegram')),
      website: getString(formData, 'website')
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
        telegram: nullableString(parsed.telegram),
        website: nullableString(parsed.website)
      },
      update: {
        fullName: parsed.fullName,
        cityId: nullableString(parsed.cityId),
        profession: nullableString(parsed.profession),
        company: nullableString(parsed.company),
        bio: nullableString(parsed.bio),
        phone: nullableString(parsed.phone),
        telegram: nullableString(parsed.telegram),
        website: nullableString(parsed.website)
      }
    });

    revalidatePath('/profile');
    revalidatePath(SETTINGS_PATH);
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

  const url = new URL(SETTINGS_PATH, 'http://localhost');
  url.searchParams.delete('success');
  url.searchParams.delete('error');
  url.searchParams.set(result.type, result.message);
  redirect(`${url.pathname}${url.search}`);
}
