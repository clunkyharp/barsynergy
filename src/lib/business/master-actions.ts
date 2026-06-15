'use server';

import { revalidatePath } from 'next/cache';
import { CategoryType, ContentStatus, MasterEntityType } from '@prisma/client';
import { z } from 'zod';
import { getString, nullableString, optionalString, persistWithUniqueSlugRetry, slugify } from '@/lib/admin/content-utils';
import { assertActiveCity } from '@/lib/business/business-helpers';
import { formatZodFieldErrors, redirectWithBusinessResult, resolveBusinessActionError } from '@/lib/business/business-action-utils';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { prisma } from '@/lib/db/prisma';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';

const BUSINESS_MASTERS_PATH = '/business/cabinet/masters';

const businessMasterSchema = z.object({
  title: z.string().trim().min(2).max(180),
  summary: z.string().trim().min(10).max(500),
  description: z.string().trim().min(20).max(4000),
  cityId: z.string().trim().optional(),
  serviceArea: z.string().trim().max(180).optional(),
  specializations: z.string().trim().min(2).max(500),
  experienceYears: z.coerce.number().int().min(0).max(80).optional(),
  rateLabel: z.string().trim().max(120).optional(),
  contactLabel: z.string().trim().max(180).optional()
});

const fieldLabels: Record<string, string> = {
  title: 'название',
  summary: 'краткое описание',
  description: 'описание',
  specializations: 'специализации',
  cityId: 'город',
  serviceArea: 'зона работы',
  experienceYears: 'опыт',
  rateLabel: 'ставка',
  contactLabel: 'контакт'
};

function splitSpecializations(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export async function createBusinessMaster(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const { user, businessAccount } = await requireBusinessAccountAccess();
    const parsed = businessMasterSchema.parse({
      title: getString(formData, 'title'),
      summary: getString(formData, 'summary'),
      description: getString(formData, 'description'),
      cityId: optionalString(getString(formData, 'cityId')),
      serviceArea: optionalString(getString(formData, 'serviceArea')),
      specializations: getString(formData, 'specializations'),
      experienceYears: optionalString(getString(formData, 'experienceYears')),
      rateLabel: optionalString(getString(formData, 'rateLabel')),
      contactLabel: optionalString(getString(formData, 'contactLabel'))
    });
    const city = await assertActiveCity(parsed.cityId);
    const defaultCategory = await prisma.category.findFirst({
      where: { type: CategoryType.MASTER, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true }
    });
    const baseSlug = slugify(`${businessAccount.companyName}-${parsed.title}`);

    if (!baseSlug) {
      throw new Error('master slug is required');
    }

    await persistWithUniqueSlugRetry({
      baseSlug,
      exists: async (candidate) => Boolean(await prisma.master.findFirst({ where: { slug: candidate }, select: { id: true } })),
      persist: (uniqueSlug) =>
        prisma.master.create({
          data: {
            title: parsed.title,
            slug: uniqueSlug,
            summary: parsed.summary,
            description: parsed.description,
            status: ContentStatus.DRAFT,
            categoryId: defaultCategory?.id ?? null,
            cityId: city?.id ?? businessAccount.cityId,
            businessAccountId: businessAccount.id,
            entityType: MasterEntityType.BUSINESS,
            companyName: businessAccount.companyName,
            contactLabel: nullableString(parsed.contactLabel),
            contactTelegram: nullableString(businessAccount.telegram ?? undefined),
            contactPhone: nullableString(businessAccount.phone ?? undefined),
            contactEmail: user.email,
            specializations: splitSpecializations(parsed.specializations),
            experienceYears: parsed.experienceYears ?? null,
            rateLabel: nullableString(parsed.rateLabel),
            serviceArea: nullableString(parsed.serviceArea),
            createdById: user.id,
            updatedById: user.id
          }
        })
    });

    revalidatePath('/business/cabinet');
    revalidatePath(BUSINESS_MASTERS_PATH);
    revalidatePath('/admin/masters');
    result = { type: 'success', message: 'Услуга мастера сохранена как черновик.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveBusinessActionError('business:create-master', error, {
        zod: formatZodFieldErrors(error, fieldLabels, 'Не удалось сохранить услугу. Проверьте обязательные поля.'),
        city: 'Этот город сейчас недоступен для выбора.',
        fallback: 'Не удалось сохранить услугу. Попробуйте позже.'
      })
    };
  }

  redirectWithBusinessResult(BUSINESS_MASTERS_PATH, result);
}
