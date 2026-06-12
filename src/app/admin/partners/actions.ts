'use server';

import { revalidatePath } from 'next/cache';
import { CategoryType, ContentStatus } from '@prisma/client';
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
import { revalidatePartnerPublicPaths } from '@/lib/admin/public-content-revalidation';
import { prisma } from '@/lib/db/prisma';
import { withAdminAction } from '@/lib/server-action-wrappers';
import { normalizeExternalUrlInput } from '@/lib/validation/external-url';

const ADMIN_PARTNERS_PATH = '/admin/partners';

const partnerFormSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(180).optional(),
  summary: z.string().trim().min(10).max(500),
  description: z.string().trim().min(20).max(100_000),
  status: z.enum(contentStatusValues).default(ContentStatus.DRAFT),
  coverImageAlt: z.string().trim().max(180).optional(),
  categoryId: z.string().trim().optional(),
  companyName: z.string().trim().min(2).max(180),
  websiteUrl: z.string().trim().max(240).optional(),
  partnerType: z.string().trim().max(120).optional(),
  isFeatured: z.boolean().default(false)
});

const statusFormSchema = z.object({
  partnerId: z.string().trim().min(1),
  status: z.enum(contentStatusValues)
});

const deleteFormSchema = z.object({
  partnerId: z.string().trim().min(1)
});

export async function createPartner(formData: FormData) {
  let uploadedCoverImageId: string | null = null;

  await withAdminAction({
    formData,
    section: 'partners',
    defaultRedirectPath: ADMIN_PARTNERS_PATH,
    cleanup: () => deleteUploadedFileIfUnused(uploadedCoverImageId),
    handler: async ({ formData, user }) => {
      const parsed = partnerFormSchema.parse({
        title: getString(formData, 'companyName'), slug: optionalString(getString(formData, 'slug')),
        summary: getString(formData, 'summary'), description: getString(formData, 'description'),
        status: getString(formData, 'status') || ContentStatus.DRAFT,
        coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
        categoryId: optionalString(getString(formData, 'categoryId')), companyName: getString(formData, 'companyName'),
        websiteUrl: optionalString(getString(formData, 'websiteUrl')), partnerType: optionalString(getString(formData, 'partnerType')),
        isFeatured: getString(formData, 'isFeatured') === 'true'
      });
      const websiteUrl = normalizeExternalUrlInput(parsed.websiteUrl);
      const slug = slugify(parsed.slug ?? parsed.title);
      if (!slug) throw new Error('Partner slug is required.');

      await assertActiveContentRelations({ entityName: 'Partner', categoryId: parsed.categoryId, categoryType: CategoryType.PARTNER });

      const coverImageId = await resolveCoverImageId({ formData, userId: user.id, onUploadedImageId: (fileId) => { uploadedCoverImageId = fileId; } });

      const createdPartner = await persistWithUniqueSlugRetry({
        baseSlug: slug, exists: async (candidate) => Boolean(await prisma.partner.findFirst({ where: { slug: candidate }, select: { id: true } })),
        persist: (uniqueSlug) => prisma.partner.create({
          data: { title: parsed.companyName, slug: uniqueSlug, summary: parsed.summary, description: parsed.description, status: parsed.status, coverImageId, coverImageAlt: nullableString(parsed.coverImageAlt), categoryId: nullableString(parsed.categoryId), companyName: parsed.companyName, websiteUrl: nullableString(websiteUrl), partnerType: nullableString(parsed.partnerType), isFeatured: parsed.isFeatured, createdById: user.id, updatedById: user.id, ...initialPublicationDates(parsed.status) },
          select: { slug: true }
        })
      });

      revalidatePath(ADMIN_PARTNERS_PATH);
      revalidatePartnerPublicPaths(createdPartner.slug);
      return { type: 'success', message: 'Партнёр создан.' };
    }
  });
}

export async function updatePartner(formData: FormData) {
  let uploadedCoverImageId: string | null = null;

  await withAdminAction({
    formData,
    section: 'partners',
    defaultRedirectPath: ADMIN_PARTNERS_PATH,
    cleanup: () => deleteUploadedFileIfUnused(uploadedCoverImageId),
    handler: async ({ formData, user }) => {
      const companyName = getString(formData, 'companyName');
      const parsed = partnerFormSchema.extend({ partnerId: z.string().trim().min(1) }).parse({
        partnerId: getString(formData, 'partnerId'), title: companyName,
        slug: optionalString(getString(formData, 'slug')), summary: getString(formData, 'summary'),
        description: getString(formData, 'description'), status: getString(formData, 'status') || ContentStatus.DRAFT,
        coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
        categoryId: optionalString(getString(formData, 'categoryId')), companyName,
        websiteUrl: optionalString(getString(formData, 'websiteUrl')), partnerType: optionalString(getString(formData, 'partnerType')),
        isFeatured: getString(formData, 'isFeatured') === 'true'
      });
      const websiteUrl = normalizeExternalUrlInput(parsed.websiteUrl);
      const slug = slugify(parsed.slug ?? parsed.title);
      if (!slug) throw new Error('Partner slug is required.');

      const existingPartner = await prisma.partner.findUniqueOrThrow({ where: { id: parsed.partnerId }, select: { coverImageId: true, publishedAt: true, slug: true } });
      const previousCoverImageId = existingPartner.coverImageId;

      await assertActiveContentRelations({ entityName: 'Partner', categoryId: parsed.categoryId, categoryType: CategoryType.PARTNER });

      const coverImageId = await resolveCoverImageId({ formData, userId: user.id, currentCoverImageId: existingPartner.coverImageId, onUploadedImageId: (fileId) => { uploadedCoverImageId = fileId; } });

      const updatedPartner = await persistWithUniqueSlugRetry({
        baseSlug: slug, exists: async (candidate) => Boolean(await prisma.partner.findFirst({ where: { slug: candidate, id: { not: parsed.partnerId } }, select: { id: true } })),
        persist: (uniqueSlug) => prisma.partner.update({
          where: { id: parsed.partnerId }, data: { title: parsed.companyName, slug: uniqueSlug, summary: parsed.summary, description: parsed.description, status: parsed.status, coverImageId, coverImageAlt: nullableString(parsed.coverImageAlt), categoryId: nullableString(parsed.categoryId), companyName: parsed.companyName, websiteUrl: nullableString(websiteUrl), partnerType: nullableString(parsed.partnerType), isFeatured: parsed.isFeatured, updatedById: user.id, ...statusTransitionDates(parsed.status, existingPartner.publishedAt) },
          select: { slug: true }
        })
      });

      if (previousCoverImageId !== coverImageId) await deleteUploadedFileIfUnused(previousCoverImageId);

      revalidatePath(ADMIN_PARTNERS_PATH);
      revalidatePartnerPublicPaths(updatedPartner.slug, existingPartner.slug);
      return { type: 'success', message: 'Партнёр обновлён.' };
    }
  });
}

export async function updatePartnerStatus(formData: FormData) {
  await withAdminAction({
    formData,
    section: 'partners',
    defaultRedirectPath: ADMIN_PARTNERS_PATH,
    handler: async ({ user }) => {
      const parsed = statusFormSchema.parse({ partnerId: getString(formData, 'partnerId'), status: getString(formData, 'status') });

      const partner = await prisma.partner.findUniqueOrThrow({ where: { id: parsed.partnerId }, select: { slug: true } });

      await updateContentStatus({ status: parsed.status, userId: user.id, findCurrent: (tx) => tx.partner.findUniqueOrThrow({ where: { id: parsed.partnerId }, select: { publishedAt: true } }), update: (tx, data) => tx.partner.update({ where: { id: parsed.partnerId }, data }) });

      revalidatePath(ADMIN_PARTNERS_PATH);
      revalidatePartnerPublicPaths(partner.slug);
      return { type: 'success', message: 'Статус партнёра обновлён.' };
    }
  });
}

export async function deletePartnerDraft(formData: FormData) {
  await withAdminAction({
    formData,
    section: 'partners',
    defaultRedirectPath: ADMIN_PARTNERS_PATH,
    handler: async () => {
      const parsed = deleteFormSchema.parse({ partnerId: getString(formData, 'partnerId') });

      const deletedPartner = await deleteContentDraft({ findRecord: (tx) => tx.partner.findUnique({ where: { id: parsed.partnerId }, select: { coverImageId: true } }), deleteDraft: (tx) => tx.partner.deleteMany({ where: { id: parsed.partnerId, status: ContentStatus.DRAFT } }) });

      await deleteUploadedFileIfUnused(deletedPartner.coverImageId);

      revalidatePath(ADMIN_PARTNERS_PATH);
      return { type: 'success', message: 'Партнёр удалён.' };
    }
  });
}
