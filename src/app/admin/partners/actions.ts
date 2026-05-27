'use server';

import { revalidatePath } from 'next/cache';
import { CategoryType, ContentStatus } from '@prisma/client';
import { z } from 'zod';
import {
  assertActiveContentRelations,
  contentStatusValues,
  deleteUploadedFileIfUnused,
  formatAdminActionError,
  getString,
  initialPublicationDates,
  nullableString,
  optionalString,
  persistWithUniqueSlugRetry,
  redirectWithAdminActionResult,
  resolveCoverImageId,
  safeAdminRedirectPath,
  slugify,
  statusTransitionDates
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { normalizeExternalUrlInput } from '@/lib/validation/external-url';

const ADMIN_PARTNERS_PATH = '/admin/partners';

const partnerFormSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(180).optional(),
  summary: z.string().trim().min(10).max(500),
  description: z.string().trim().min(20),
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
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_PARTNERS_PATH);
  let result: { type: 'success' | 'error'; message: string };
  let uploadedCoverImageId: string | null = null;

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess('partners');
    const parsed = partnerFormSchema.parse({
      title: getString(formData, 'title'),
      slug: optionalString(getString(formData, 'slug')),
      summary: getString(formData, 'summary'),
      description: getString(formData, 'description'),
      status: getString(formData, 'status') || ContentStatus.DRAFT,
      coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
      categoryId: optionalString(getString(formData, 'categoryId')),
      companyName: getString(formData, 'companyName'),
      websiteUrl: optionalString(getString(formData, 'websiteUrl')),
      partnerType: optionalString(getString(formData, 'partnerType')),
      isFeatured: getString(formData, 'isFeatured') === 'true'
    });
    const websiteUrl = normalizeExternalUrlInput(parsed.websiteUrl);
    const slug = slugify(parsed.slug ?? parsed.title);

    if (!slug) {
      throw new Error('Partner slug is required.');
    }

    await assertActiveContentRelations({
      entityName: 'Partner',
      categoryId: parsed.categoryId,
      categoryType: CategoryType.PARTNER
    });

    const coverImageId = await resolveCoverImageId({
      formData,
      userId: user.id,
      onUploadedImageId: (fileId) => {
        uploadedCoverImageId = fileId;
      }
    });

    await persistWithUniqueSlugRetry({
      baseSlug: slug,
      exists: async (candidate) =>
        Boolean(
          await prisma.partner.findFirst({
            where: { slug: candidate },
            select: { id: true }
          })
        ),
      persist: (uniqueSlug) =>
        prisma.partner.create({
          data: {
            title: parsed.title,
            slug: uniqueSlug,
            summary: parsed.summary,
            description: parsed.description,
            status: parsed.status,
            coverImageId,
            coverImageAlt: nullableString(parsed.coverImageAlt),
            categoryId: nullableString(parsed.categoryId),
            companyName: parsed.companyName,
            websiteUrl: nullableString(websiteUrl),
            partnerType: nullableString(parsed.partnerType),
            isFeatured: parsed.isFeatured,
            createdById: user.id,
            updatedById: user.id,
            ...initialPublicationDates(parsed.status)
          }
        })
    });

    revalidatePath(ADMIN_PARTNERS_PATH);
    result = { type: 'success', message: 'Партнёр создан.' };
  } catch (error) {
    await deleteUploadedFileIfUnused(uploadedCoverImageId);
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updatePartner(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_PARTNERS_PATH);
  let result: { type: 'success' | 'error'; message: string };
  let uploadedCoverImageId: string | null = null;
  let previousCoverImageId: string | null = null;

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess('partners');
    const parsed = partnerFormSchema
      .extend({
        partnerId: z.string().trim().min(1)
      })
      .parse({
        partnerId: getString(formData, 'partnerId'),
        title: getString(formData, 'title'),
        slug: optionalString(getString(formData, 'slug')),
        summary: getString(formData, 'summary'),
        description: getString(formData, 'description'),
        status: getString(formData, 'status') || ContentStatus.DRAFT,
        coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
        categoryId: optionalString(getString(formData, 'categoryId')),
        companyName: getString(formData, 'companyName'),
        websiteUrl: optionalString(getString(formData, 'websiteUrl')),
        partnerType: optionalString(getString(formData, 'partnerType')),
        isFeatured: getString(formData, 'isFeatured') === 'true'
      });
    const websiteUrl = normalizeExternalUrlInput(parsed.websiteUrl);
    const slug = slugify(parsed.slug ?? parsed.title);

    if (!slug) {
      throw new Error('Partner slug is required.');
    }

    const existingPartner = await prisma.partner.findUniqueOrThrow({
      where: { id: parsed.partnerId },
      select: { coverImageId: true, publishedAt: true }
    });
    previousCoverImageId = existingPartner.coverImageId;

    await assertActiveContentRelations({
      entityName: 'Partner',
      categoryId: parsed.categoryId,
      categoryType: CategoryType.PARTNER
    });

    const coverImageId = await resolveCoverImageId({
      formData,
      userId: user.id,
      currentCoverImageId: existingPartner.coverImageId,
      onUploadedImageId: (fileId) => {
        uploadedCoverImageId = fileId;
      }
    });

    await persistWithUniqueSlugRetry({
      baseSlug: slug,
      exists: async (candidate) =>
        Boolean(
          await prisma.partner.findFirst({
            where: { slug: candidate, id: { not: parsed.partnerId } },
            select: { id: true }
          })
        ),
      persist: (uniqueSlug) =>
        prisma.partner.update({
          where: { id: parsed.partnerId },
          data: {
            title: parsed.title,
            slug: uniqueSlug,
            summary: parsed.summary,
            description: parsed.description,
            status: parsed.status,
            coverImageId,
            coverImageAlt: nullableString(parsed.coverImageAlt),
            categoryId: nullableString(parsed.categoryId),
            companyName: parsed.companyName,
            websiteUrl: nullableString(websiteUrl),
            partnerType: nullableString(parsed.partnerType),
            isFeatured: parsed.isFeatured,
            updatedById: user.id,
            ...statusTransitionDates(parsed.status, existingPartner.publishedAt)
          }
        })
    });

    if (previousCoverImageId !== coverImageId) {
      await deleteUploadedFileIfUnused(previousCoverImageId);
    }

    revalidatePath(ADMIN_PARTNERS_PATH);
    result = { type: 'success', message: 'Партнёр обновлён.' };
  } catch (error) {
    await deleteUploadedFileIfUnused(uploadedCoverImageId);
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updatePartnerStatus(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_PARTNERS_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess('partners');
    const parsed = statusFormSchema.parse({
      partnerId: getString(formData, 'partnerId'),
      status: getString(formData, 'status')
    });

    await prisma.$transaction(async (tx) => {
      const partner = await tx.partner.findUniqueOrThrow({
        where: { id: parsed.partnerId },
        select: { publishedAt: true }
      });

      await tx.partner.update({
        where: { id: parsed.partnerId },
        data: {
          status: parsed.status,
          updatedById: user.id,
          ...statusTransitionDates(parsed.status, partner.publishedAt)
        }
      });
    });

    revalidatePath(ADMIN_PARTNERS_PATH);
    result = { type: 'success', message: 'Статус партнёра обновлён.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function deletePartnerDraft(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_PARTNERS_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    await requireAdminSectionAccess('partners');
    const parsed = deleteFormSchema.parse({
      partnerId: getString(formData, 'partnerId')
    });

    const deletedPartner = await prisma.$transaction(async (tx) => {
      const partner = await tx.partner.findUnique({
        where: {
          id: parsed.partnerId
        },
        select: { coverImageId: true }
      });

      if (!partner) {
        throw new Error('record is invalid');
      }

      const deletion = await tx.partner.deleteMany({
        where: {
          id: parsed.partnerId,
          status: ContentStatus.DRAFT
        }
      });

      if (deletion.count !== 1) {
        throw new Error('record is invalid');
      }

      return partner;
    });

    await deleteUploadedFileIfUnused(deletedPartner.coverImageId);

    revalidatePath(ADMIN_PARTNERS_PATH);
    result = { type: 'success', message: 'Партнёр удалён.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}
