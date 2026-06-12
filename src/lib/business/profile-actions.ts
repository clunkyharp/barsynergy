'use server';

import { revalidatePath } from 'next/cache';
import { getString, nullableString, optionalString } from '@/lib/admin/content-utils';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { prisma } from '@/lib/db/prisma';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { assertActiveCity } from '@/lib/business/business-helpers';
import { businessProfileSchema, resolveBusinessActionError, redirectWithBusinessResult } from '@/lib/business/business-action-utils';

const BUSINESS_PATH = '/business/cabinet';

export async function updateBusinessProfile(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const { businessAccount } = await requireBusinessAccountAccess();
    const parsed = businessProfileSchema.parse({
      companyName: getString(formData, 'companyName'),
      contactPerson: getString(formData, 'contactPerson'),
      cityId: optionalString(getString(formData, 'cityId')),
      phone: optionalString(getString(formData, 'phone')),
      telegram: optionalString(getString(formData, 'telegram')),
      websiteUrl: getString(formData, 'websiteUrl'),
      description: optionalString(getString(formData, 'description'))
    });
    const city = await assertActiveCity(parsed.cityId);

    await prisma.businessAccount.update({
      where: { id: businessAccount.id },
      data: {
        companyName: parsed.companyName,
        contactPerson: parsed.contactPerson,
        cityId: city?.id ?? null,
        phone: nullableString(parsed.phone),
        telegram: nullableString(parsed.telegram),
        websiteUrl: nullableString(parsed.websiteUrl),
        description: nullableString(parsed.description)
      }
    });

    revalidatePath(BUSINESS_PATH);
    revalidatePath('/business/cabinet/requests');
    result = { type: 'success', message: 'Профиль компании сохранён.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveBusinessActionError('business:update-profile', error, {
        zod: 'Не удалось сохранить профиль. Проверьте обязательные поля и сайт.',
        city: 'Этот город сейчас недоступен для выбора.',
        fallback: 'Не удалось сохранить профиль. Попробуйте позже.'
      })
    };
  }

  redirectWithBusinessResult(BUSINESS_PATH, result);
}
