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

const entityTypeValues = [MasterEntityType.INDIVIDUAL, MasterEntityType.BUSINESS] as const;

const businessMasterSchema = z.object({
  entityType: z.enum(entityTypeValues).default(MasterEntityType.INDIVIDUAL),
  fullName: z.string().trim().min(2).max(180).optional(),
  companyName: z.string().trim().min(2).max(180).optional(),
  summary: z.string().trim().min(10).max(500),
  description: z.string().trim().min(20).max(4000),
  cityId: z.string().trim().optional(),
  specializations: z.string().trim().min(2).max(500),
  experienceYears: z.coerce.number().int().min(0).max(80).optional(),
  rateLabel: z.string().trim().max(120).optional(),
  contactLabel: z.string().trim().max(180).optional(),
  contactTelegram: z.string().trim().max(120).optional(),
  contactPhone: z.string().trim().max(60).optional(),
  contactEmail: z.string().trim().max(180).optional(),
  serviceArea: z.string().trim().max(180).optional()
});

const fieldLabels: Record<string, string> = {
  fullName: 'ФИО',
  companyName: 'компания',
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

export async function createBusinessMasterAction(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const { user, businessAccount } = await requireBusinessAccountAccess();

    const entityType = formData.get('entityType') as MasterEntityType;
    const isBusiness = entityType === MasterEntityType.BUSINESS;
    const nameFieldValue = getString(formData, isBusiness ? 'companyName' : 'fullName');

    const parsed = businessMasterSchema.parse({
      entityType: entityTypeValues.includes(entityType) ? entityType : MasterEntityType.INDIVIDUAL,
      fullName: isBusiness ? undefined : optionalString(nameFieldValue),
      companyName: isBusiness ? optionalString(nameFieldValue) : undefined,
      summary: getString(formData, 'summary'),
      description: getString(formData, 'description'),
      cityId: optionalString(getString(formData, 'cityId')),
      specializations: getString(formData, 'specializations'),
      experienceYears: optionalString(getString(formData, 'experienceYears')),
      rateLabel: optionalString(getString(formData, 'rateLabel')),
      contactLabel: optionalString(getString(formData, 'contactLabel')),
      contactTelegram: optionalString(getString(formData, 'contactTelegram')),
      contactPhone: optionalString(getString(formData, 'contactPhone')),
      contactEmail: optionalString(getString(formData, 'contactEmail')),
      serviceArea: optionalString(getString(formData, 'serviceArea'))
    });

    const title = nameFieldValue;
    const city = await assertActiveCity(parsed.cityId);
    const defaultCategory = await prisma.category.findFirst({
      where: { type: CategoryType.MASTER, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true }
    });
    const baseSlug = slugify(title);

    if (!baseSlug) {
      throw new Error('master slug is required');
    }

    await persistWithUniqueSlugRetry({
      baseSlug,
      exists: async (candidate) => Boolean(await prisma.master.findFirst({ where: { slug: candidate }, select: { id: true } })),
      persist: (uniqueSlug) =>
        prisma.master.create({
          data: {
            title,
            slug: uniqueSlug,
            summary: parsed.summary,
            description: parsed.description,
            status: ContentStatus.DRAFT,
            categoryId: defaultCategory?.id ?? null,
            cityId: city?.id ?? businessAccount.cityId,
            businessAccountId: businessAccount.id,
            entityType: parsed.entityType,
            fullName: parsed.entityType === MasterEntityType.INDIVIDUAL ? nullableString(parsed.fullName) : null,
            companyName: parsed.entityType === MasterEntityType.BUSINESS ? nullableString(parsed.companyName) : null,
            contactLabel: nullableString(parsed.contactLabel),
            contactTelegram: nullableString(parsed.contactTelegram),
            contactPhone: nullableString(parsed.contactPhone),
            contactEmail: nullableString(parsed.contactEmail),
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
    result = { type: 'success', message: 'Карточка мастера сохранена как черновик.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveBusinessActionError('business:create-master', error, {
        zod: formatZodFieldErrors(error, fieldLabels, 'Не удалось сохранить карточку. Проверьте обязательные поля.'),
        city: 'Этот город сейчас недоступен для выбора.',
        fallback: 'Не удалось сохранить карточку. Попробуйте позже.'
      })
    };
  }

  redirectWithBusinessResult(BUSINESS_MASTERS_PATH, result);
}

export async function updateBusinessMasterAction(masterId: string, formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const { user, businessAccount } = await requireBusinessAccountAccess();

    const existing = await prisma.master.findFirst({
      where: { id: masterId, businessAccountId: businessAccount.id },
      select: { id: true, slug: true, title: true, status: true, publishedAt: true, entityType: true, categoryId: true }
    });

    if (!existing) {
      throw new Error('master not found');
    }

    const entityType = formData.get('entityType') as MasterEntityType;
    const isBusiness = entityType === MasterEntityType.BUSINESS;
    const nameFieldValue = getString(formData, isBusiness ? 'companyName' : 'fullName');

    const parsed = businessMasterSchema.parse({
      entityType: entityTypeValues.includes(entityType) ? entityType : MasterEntityType.INDIVIDUAL,
      fullName: isBusiness ? undefined : optionalString(nameFieldValue),
      companyName: isBusiness ? optionalString(nameFieldValue) : undefined,
      summary: getString(formData, 'summary'),
      description: getString(formData, 'description'),
      cityId: optionalString(getString(formData, 'cityId')),
      specializations: getString(formData, 'specializations'),
      experienceYears: optionalString(getString(formData, 'experienceYears')),
      rateLabel: optionalString(getString(formData, 'rateLabel')),
      contactLabel: optionalString(getString(formData, 'contactLabel')),
      contactTelegram: optionalString(getString(formData, 'contactTelegram')),
      contactPhone: optionalString(getString(formData, 'contactPhone')),
      contactEmail: optionalString(getString(formData, 'contactEmail')),
      serviceArea: optionalString(getString(formData, 'serviceArea'))
    });

    const title = nameFieldValue;
    const city = await assertActiveCity(parsed.cityId);

    await prisma.master.update({
      where: { id: existing.id },
      data: {
        title,
        summary: parsed.summary,
        description: parsed.description,
        cityId: city?.id ?? businessAccount.cityId,
        entityType: parsed.entityType,
        fullName: parsed.entityType === MasterEntityType.INDIVIDUAL ? nullableString(parsed.fullName) : null,
        companyName: parsed.entityType === MasterEntityType.BUSINESS ? nullableString(parsed.companyName) : null,
        contactLabel: nullableString(parsed.contactLabel),
        contactTelegram: nullableString(parsed.contactTelegram),
        contactPhone: nullableString(parsed.contactPhone),
        contactEmail: nullableString(parsed.contactEmail),
        specializations: splitSpecializations(parsed.specializations),
        experienceYears: parsed.experienceYears ?? null,
        rateLabel: nullableString(parsed.rateLabel),
        serviceArea: nullableString(parsed.serviceArea),
        updatedById: user.id
      }
    });

    revalidatePath('/business/cabinet');
    revalidatePath(BUSINESS_MASTERS_PATH);
    revalidatePath(`${BUSINESS_MASTERS_PATH}/${masterId}`);
    result = { type: 'success', message: 'Карточка мастера обновлена.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveBusinessActionError('business:update-master', error, {
        zod: formatZodFieldErrors(error, fieldLabels, 'Не удалось обновить карточку. Проверьте обязательные поля.'),
        city: 'Этот город сейчас недоступен для выбора.',
        fallback: 'Не удалось обновить карточку. Попробуйте позже.'
      })
    };
  }

  redirectWithBusinessResult(BUSINESS_MASTERS_PATH, result);
}
