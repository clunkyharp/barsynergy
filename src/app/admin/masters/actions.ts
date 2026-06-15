'use server';

import { revalidatePath } from 'next/cache';
import { CategoryType, ContentStatus, MasterEntityType } from '@prisma/client';
import { z } from 'zod';
import {
  assertActiveContentRelations,
  contentStatusValues,
  deleteUploadedFileIfUnused,
  getString,
  initialPublicationDates,
  nullableString,
  optionalString,
  persistWithUniqueSlugRetry,
  resolveCoverImageId,
  slugify,
  statusTransitionDates
} from '@/lib/admin/content-utils';
import { deleteContentDraft, updateContentStatus } from '@/lib/admin/content-lifecycle';
import { revalidateMasterPublicPaths } from '@/lib/admin/public-content-revalidation';
import { prisma } from '@/lib/db/prisma';
import { withAdminAction } from '@/lib/server-action-wrappers';
import { maybeNotifyFirstPublication } from '@/lib/notifications/web-push/publish-trigger';

const ADMIN_MASTERS_PATH = '/admin/masters';

const masterFormSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(180).optional(),
  summary: z.string().trim().min(10).max(500),
  description: z.string().trim().min(20).max(100_000),
  status: z.enum(contentStatusValues).default(ContentStatus.DRAFT),
  coverImageAlt: z.string().trim().max(180).optional(),
  categoryId: z.string().trim().optional(),
  cityId: z.string().trim().optional(),
  entityType: z.nativeEnum(MasterEntityType).default(MasterEntityType.INDIVIDUAL),
  fullName: z.string().trim().max(180).optional(),
  companyName: z.string().trim().max(180).optional(),
  contactLabel: z.string().trim().max(160).optional(),
  contactTelegram: z.string().trim().max(120).optional(),
  contactPhone: z.string().trim().max(60).optional(),
  contactEmail: z.string().trim().max(180).optional(),
  specializations: z.array(z.string().trim().min(1)).optional(),
  experienceYears: z.coerce.number().int().min(0).max(100).optional(),
  rateLabel: z.string().trim().max(120).optional(),
  isVerified: z.boolean().default(false),
  serviceArea: z.string().trim().max(180).optional(),
  businessAccountId: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().optional()
});

const statusFormSchema = z.object({
  masterId: z.string().trim().min(1),
  status: z.enum(contentStatusValues)
});

const deleteFormSchema = z.object({
  masterId: z.string().trim().min(1)
});

const entityTypeValues = [MasterEntityType.INDIVIDUAL, MasterEntityType.BUSINESS] as const;

export async function createMasterAction(formData: FormData) {
  let uploadedCoverImageId: string | null = null;

  await withAdminAction({
    formData,
    section: 'masters',
    defaultRedirectPath: ADMIN_MASTERS_PATH,
    cleanup: () => deleteUploadedFileIfUnused(uploadedCoverImageId),
    handler: async ({ formData, user }) => {
      const entityType = formData.get('entityType') as MasterEntityType;
      const isBusiness = entityType === MasterEntityType.BUSINESS;
      const nameFieldValue = getString(formData, isBusiness ? 'companyName' : 'fullName');

      const parsed = masterFormSchema.parse({
        title: nameFieldValue,
        slug: optionalString(getString(formData, 'slug')),
        summary: getString(formData, 'summary'),
        description: getString(formData, 'description'),
        status: getString(formData, 'status') || ContentStatus.DRAFT,
        coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
        categoryId: optionalString(getString(formData, 'categoryId')),
        cityId: optionalString(getString(formData, 'cityId')),
        entityType: entityTypeValues.includes(entityType) ? entityType : MasterEntityType.INDIVIDUAL,
        fullName: isBusiness ? undefined : optionalString(nameFieldValue),
        companyName: isBusiness ? optionalString(nameFieldValue) : undefined,
        contactLabel: optionalString(getString(formData, 'contactLabel')),
        contactTelegram: optionalString(getString(formData, 'contactTelegram')),
        contactPhone: optionalString(getString(formData, 'contactPhone')),
        contactEmail: optionalString(getString(formData, 'contactEmail')),
        specializations: parseLines(getString(formData, 'specializations')),
        experienceYears: optionalString(getString(formData, 'experienceYears')),
        rateLabel: optionalString(getString(formData, 'rateLabel')),
        isVerified: getString(formData, 'isVerified') === 'true',
        serviceArea: optionalString(getString(formData, 'serviceArea')),
        businessAccountId: optionalString(getString(formData, 'businessAccountId')),
        sortOrder: optionalString(getString(formData, 'sortOrder'))
      });

      const slug = slugify(parsed.slug ?? parsed.title);
      if (!slug) throw new Error('Master slug is required.');

      await assertActiveContentRelations({ entityName: 'Master', categoryId: parsed.categoryId, categoryType: CategoryType.MASTER, cityId: parsed.cityId });

      const coverImageId = await resolveCoverImageId({ formData, userId: user.id, onUploadedImageId: (fileId) => { uploadedCoverImageId = fileId; } });

      const createdMaster = await persistWithUniqueSlugRetry({
        baseSlug: slug,
        exists: async (candidate) => Boolean(await prisma.master.findFirst({ where: { slug: candidate }, select: { id: true } })),
        persist: (uniqueSlug) => prisma.master.create({
          data: {
            title: parsed.title,
            slug: uniqueSlug,
            summary: parsed.summary,
            description: parsed.description,
            status: parsed.status,
            coverImageId,
            coverImageAlt: nullableString(parsed.coverImageAlt),
            categoryId: nullableString(parsed.categoryId),
            cityId: nullableString(parsed.cityId),
            entityType: parsed.entityType,
            fullName: nullableString(parsed.fullName),
            companyName: nullableString(parsed.companyName),
            contactLabel: nullableString(parsed.contactLabel),
            contactTelegram: nullableString(parsed.contactTelegram),
            contactPhone: nullableString(parsed.contactPhone),
            contactEmail: nullableString(parsed.contactEmail),
            specializations: parsed.specializations ?? [],
            experienceYears: parsed.experienceYears ?? null,
            rateLabel: nullableString(parsed.rateLabel),
            isVerified: parsed.isVerified,
            serviceArea: nullableString(parsed.serviceArea),
            businessAccountId: nullableString(parsed.businessAccountId),
            sortOrder: parsed.sortOrder ?? 0,
            createdById: user.id,
            updatedById: user.id,
            ...initialPublicationDates(parsed.status)
          },
          select: { slug: true, id: true, title: true }
        })
      });

      await maybeNotifyFirstPublication(
        'master',
        ContentStatus.DRAFT,
        parsed.status,
        { id: createdMaster.id, title: createdMaster.title, slug: createdMaster.slug, publishedAt: null }
      );

      revalidatePath(ADMIN_MASTERS_PATH);
      revalidateMasterPublicPaths(createdMaster.slug);
      return { type: 'success', message: 'Мастер создан.' };
    }
  });
}

export async function updateMasterAction(formData: FormData) {
  let uploadedCoverImageId: string | null = null;

  await withAdminAction({
    formData,
    section: 'masters',
    defaultRedirectPath: ADMIN_MASTERS_PATH,
    cleanup: () => deleteUploadedFileIfUnused(uploadedCoverImageId),
    handler: async ({ formData, user }) => {
      const entityType = formData.get('entityType') as MasterEntityType;
      const isBusiness = entityType === MasterEntityType.BUSINESS;
      const nameFieldValue = getString(formData, isBusiness ? 'companyName' : 'fullName');

      const parsed = masterFormSchema.extend({ masterId: z.string().trim().min(1) }).parse({
        masterId: getString(formData, 'masterId'),
        title: nameFieldValue,
        slug: optionalString(getString(formData, 'slug')),
        summary: getString(formData, 'summary'),
        description: getString(formData, 'description'),
        status: getString(formData, 'status') || ContentStatus.DRAFT,
        coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
        categoryId: optionalString(getString(formData, 'categoryId')),
        cityId: optionalString(getString(formData, 'cityId')),
        entityType: entityTypeValues.includes(entityType) ? entityType : MasterEntityType.INDIVIDUAL,
        fullName: isBusiness ? undefined : optionalString(nameFieldValue),
        companyName: isBusiness ? optionalString(nameFieldValue) : undefined,
        contactLabel: optionalString(getString(formData, 'contactLabel')),
        contactTelegram: optionalString(getString(formData, 'contactTelegram')),
        contactPhone: optionalString(getString(formData, 'contactPhone')),
        contactEmail: optionalString(getString(formData, 'contactEmail')),
        specializations: parseLines(getString(formData, 'specializations')),
        experienceYears: optionalString(getString(formData, 'experienceYears')),
        rateLabel: optionalString(getString(formData, 'rateLabel')),
        isVerified: getString(formData, 'isVerified') === 'true',
        serviceArea: optionalString(getString(formData, 'serviceArea')),
        businessAccountId: optionalString(getString(formData, 'businessAccountId')),
        sortOrder: optionalString(getString(formData, 'sortOrder'))
      });

      const slug = slugify(parsed.slug ?? parsed.title);
      if (!slug) throw new Error('Master slug is required.');

      const existingMaster = await prisma.master.findUniqueOrThrow({
        where: { id: parsed.masterId },
        select: { id: true, coverImageId: true, publishedAt: true, slug: true, title: true, status: true }
      });
      const previousCoverImageId = existingMaster.coverImageId;

      await assertActiveContentRelations({ entityName: 'Master', categoryId: parsed.categoryId, categoryType: CategoryType.MASTER, cityId: parsed.cityId });

      const coverImageId = await resolveCoverImageId({
        formData,
        userId: user.id,
        currentCoverImageId: existingMaster.coverImageId,
        onUploadedImageId: (fileId) => { uploadedCoverImageId = fileId; }
      });

      const experienceYears = parsed.experienceYears != null ? parsed.experienceYears : null;
      const sortOrder = parsed.sortOrder != null ? parsed.sortOrder : 0;

      const updatedMaster = await persistWithUniqueSlugRetry({
        baseSlug: slug,
        exists: async (candidate) => Boolean(await prisma.master.findFirst({ where: { slug: candidate, id: { not: parsed.masterId } }, select: { id: true } })),
        persist: (uniqueSlug) => prisma.master.update({
          where: { id: parsed.masterId },
          data: {
            title: parsed.title,
            slug: uniqueSlug,
            summary: parsed.summary,
            description: parsed.description,
            status: parsed.status,
            coverImageId,
            coverImageAlt: nullableString(parsed.coverImageAlt),
            categoryId: nullableString(parsed.categoryId),
            cityId: nullableString(parsed.cityId),
            entityType: parsed.entityType,
            fullName: nullableString(parsed.fullName),
            companyName: nullableString(parsed.companyName),
            contactLabel: nullableString(parsed.contactLabel),
            contactTelegram: nullableString(parsed.contactTelegram),
            contactPhone: nullableString(parsed.contactPhone),
            contactEmail: nullableString(parsed.contactEmail),
            specializations: parsed.specializations ?? [],
            experienceYears,
            rateLabel: nullableString(parsed.rateLabel),
            isVerified: parsed.isVerified,
            serviceArea: nullableString(parsed.serviceArea),
            businessAccountId: nullableString(parsed.businessAccountId),
            sortOrder,
            updatedById: user.id,
            ...statusTransitionDates(parsed.status, existingMaster.publishedAt)
          },
          select: { slug: true }
        })
      });

      if (previousCoverImageId !== coverImageId) await deleteUploadedFileIfUnused(previousCoverImageId);

      await maybeNotifyFirstPublication('master', existingMaster.status, parsed.status, existingMaster);

      revalidatePath(ADMIN_MASTERS_PATH);
      revalidateMasterPublicPaths(updatedMaster.slug, existingMaster.slug);
      return { type: 'success', message: 'Мастер обновлён.' };
    }
  });
}

export async function updateMasterStatus(formData: FormData) {
  await withAdminAction({
    formData,
    section: 'masters',
    defaultRedirectPath: ADMIN_MASTERS_PATH,
    handler: async ({ user }) => {
      const parsed = statusFormSchema.parse({ masterId: getString(formData, 'masterId'), status: getString(formData, 'status') });

      const existing = await prisma.master.findUniqueOrThrow({
        where: { id: parsed.masterId },
        select: { id: true, slug: true, title: true, publishedAt: true, status: true }
      });

      await updateContentStatus({
        status: parsed.status,
        userId: user.id,
        findCurrent: (tx) => tx.master.findUniqueOrThrow({ where: { id: parsed.masterId }, select: { publishedAt: true } }),
        update: (tx, data) => tx.master.update({ where: { id: parsed.masterId }, data })
      });

      await maybeNotifyFirstPublication('master', existing.status, parsed.status, existing);

      revalidatePath(ADMIN_MASTERS_PATH);
      revalidateMasterPublicPaths(existing.slug);
      return { type: 'success', message: 'Статус мастера обновлён.' };
    }
  });
}

export async function deleteMasterDraft(formData: FormData) {
  await withAdminAction({
    formData,
    section: 'masters',
    defaultRedirectPath: ADMIN_MASTERS_PATH,
    handler: async () => {
      const parsed = deleteFormSchema.parse({ masterId: getString(formData, 'masterId') });

      const deletedMaster = await deleteContentDraft({
        findRecord: (tx) => tx.master.findUnique({ where: { id: parsed.masterId }, select: { coverImageId: true } }),
        deleteDraft: (tx) => tx.master.deleteMany({ where: { id: parsed.masterId, status: ContentStatus.DRAFT } })
      });

      await deleteUploadedFileIfUnused(deletedMaster.coverImageId);

      revalidatePath(ADMIN_MASTERS_PATH);
      return { type: 'success', message: 'Мастер удалён.' };
    }
  });
}

function parseLines(value: string): string[] {
  return value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}
