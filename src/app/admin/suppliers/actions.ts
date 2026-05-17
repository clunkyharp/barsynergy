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
import { normalizeExternalUrlInput } from '@/lib/validation/external-url';

const ADMIN_SUPPLIERS_PATH = '/admin/suppliers';

const supplierFormSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(180).optional(),
  summary: z.string().trim().min(10).max(500),
  description: z.string().trim().min(20),
  status: z.enum(contentStatusValues).default(ContentStatus.DRAFT),
  coverImageAlt: z.string().trim().max(180).optional(),
  categoryId: z.string().trim().optional(),
  cityId: z.string().trim().optional(),
  companyName: z.string().trim().min(2).max(180),
  websiteUrl: z.string().trim().max(240).optional(),
  contactLabel: z.string().trim().max(160).optional(),
  isVerified: z.boolean().default(false),
  serviceArea: z.string().trim().max(180).optional()
});

const statusFormSchema = z.object({
  supplierId: z.string().trim().min(1),
  status: z.enum(contentStatusValues)
});

const deleteFormSchema = z.object({
  supplierId: z.string().trim().min(1)
});

export async function createSupplier(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_SUPPLIERS_PATH);
  let result: { type: 'success' | 'error'; message: string };
  let uploadedCoverImageId: string | null = null;

  try {
    const user = await requireAdminSectionAccess('suppliers');
    const parsed = supplierFormSchema.parse({
      title: getString(formData, 'title'),
      slug: optionalString(getString(formData, 'slug')),
      summary: getString(formData, 'summary'),
      description: getString(formData, 'description'),
      status: getString(formData, 'status') || ContentStatus.DRAFT,
      coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
      categoryId: optionalString(getString(formData, 'categoryId')),
      cityId: optionalString(getString(formData, 'cityId')),
      companyName: getString(formData, 'companyName'),
      websiteUrl: optionalString(getString(formData, 'websiteUrl')),
      contactLabel: optionalString(getString(formData, 'contactLabel')),
      isVerified: getString(formData, 'isVerified') === 'true',
      serviceArea: optionalString(getString(formData, 'serviceArea'))
    });
    const websiteUrl = normalizeExternalUrlInput(parsed.websiteUrl);
    const slug = slugify(parsed.slug ?? parsed.title);

    if (!slug) {
      throw new Error('Supplier slug is required.');
    }

    await assertActiveContentRelations({
      entityName: 'Supplier',
      categoryId: parsed.categoryId,
      categoryType: CategoryType.SUPPLIER,
      cityId: parsed.cityId
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
          await prisma.supplier.findFirst({
            where: { slug: candidate },
            select: { id: true }
          })
        ),
      persist: (uniqueSlug) =>
        prisma.supplier.create({
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
            companyName: parsed.companyName,
            websiteUrl: nullableString(websiteUrl),
            contactLabel: nullableString(parsed.contactLabel),
            isVerified: parsed.isVerified,
            serviceArea: nullableString(parsed.serviceArea),
            createdById: user.id,
            updatedById: user.id,
            ...initialPublicationDates(parsed.status)
          }
        })
    });

    revalidatePath(ADMIN_SUPPLIERS_PATH);
    result = { type: 'success', message: 'Поставщик создан.' };
  } catch (error) {
    await deleteUploadedFileIfUnused(uploadedCoverImageId);
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updateSupplier(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_SUPPLIERS_PATH);
  let result: { type: 'success' | 'error'; message: string };
  let uploadedCoverImageId: string | null = null;
  let previousCoverImageId: string | null = null;

  try {
    const user = await requireAdminSectionAccess('suppliers');
    const parsed = supplierFormSchema
      .extend({
        supplierId: z.string().trim().min(1)
      })
      .parse({
        supplierId: getString(formData, 'supplierId'),
        title: getString(formData, 'title'),
        slug: optionalString(getString(formData, 'slug')),
        summary: getString(formData, 'summary'),
        description: getString(formData, 'description'),
        status: getString(formData, 'status') || ContentStatus.DRAFT,
        coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
        categoryId: optionalString(getString(formData, 'categoryId')),
        cityId: optionalString(getString(formData, 'cityId')),
        companyName: getString(formData, 'companyName'),
        websiteUrl: optionalString(getString(formData, 'websiteUrl')),
        contactLabel: optionalString(getString(formData, 'contactLabel')),
        isVerified: getString(formData, 'isVerified') === 'true',
        serviceArea: optionalString(getString(formData, 'serviceArea'))
      });
    const websiteUrl = normalizeExternalUrlInput(parsed.websiteUrl);
    const slug = slugify(parsed.slug ?? parsed.title);

    if (!slug) {
      throw new Error('Supplier slug is required.');
    }

    const existingSupplier = await prisma.supplier.findUniqueOrThrow({
      where: { id: parsed.supplierId },
      select: { coverImageId: true, publishedAt: true }
    });
    previousCoverImageId = existingSupplier.coverImageId;

    await assertActiveContentRelations({
      entityName: 'Supplier',
      categoryId: parsed.categoryId,
      categoryType: CategoryType.SUPPLIER,
      cityId: parsed.cityId
    });

    const coverImageId = await resolveCoverImageId({
      formData,
      userId: user.id,
      currentCoverImageId: existingSupplier.coverImageId,
      onUploadedImageId: (fileId) => {
        uploadedCoverImageId = fileId;
      }
    });

    await persistWithUniqueSlugRetry({
      baseSlug: slug,
      exists: async (candidate) =>
        Boolean(
          await prisma.supplier.findFirst({
            where: { slug: candidate, id: { not: parsed.supplierId } },
            select: { id: true }
          })
        ),
      persist: (uniqueSlug) =>
        prisma.supplier.update({
          where: { id: parsed.supplierId },
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
            companyName: parsed.companyName,
            websiteUrl: nullableString(websiteUrl),
            contactLabel: nullableString(parsed.contactLabel),
            isVerified: parsed.isVerified,
            serviceArea: nullableString(parsed.serviceArea),
            updatedById: user.id,
            ...statusTransitionDates(parsed.status, existingSupplier.publishedAt)
          }
        })
    });

    if (previousCoverImageId !== coverImageId) {
      await deleteUploadedFileIfUnused(previousCoverImageId);
    }

    revalidatePath(ADMIN_SUPPLIERS_PATH);
    result = { type: 'success', message: 'Поставщик обновлен.' };
  } catch (error) {
    await deleteUploadedFileIfUnused(uploadedCoverImageId);
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updateSupplierStatus(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_SUPPLIERS_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    const user = await requireAdminSectionAccess('suppliers');
    const parsed = statusFormSchema.parse({
      supplierId: getString(formData, 'supplierId'),
      status: getString(formData, 'status')
    });

    await prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.findUniqueOrThrow({
        where: { id: parsed.supplierId },
        select: { publishedAt: true }
      });

      await tx.supplier.update({
        where: { id: parsed.supplierId },
        data: {
          status: parsed.status,
          updatedById: user.id,
          ...statusTransitionDates(parsed.status, supplier.publishedAt)
        }
      });
    });

    revalidatePath(ADMIN_SUPPLIERS_PATH);
    result = { type: 'success', message: 'Статус поставщика обновлен.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function deleteSupplierDraft(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_SUPPLIERS_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await requireAdminSectionAccess('suppliers');
    const parsed = deleteFormSchema.parse({
      supplierId: getString(formData, 'supplierId')
    });

    const deletedSupplier = await prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.findUnique({
        where: {
          id: parsed.supplierId
        },
        select: { coverImageId: true }
      });

      if (!supplier) {
        throw new Error('record is invalid');
      }

      const deletion = await tx.supplier.deleteMany({
        where: {
          id: parsed.supplierId,
          status: ContentStatus.DRAFT
        }
      });

      if (deletion.count !== 1) {
        throw new Error('record is invalid');
      }

      return supplier;
    });

    await deleteUploadedFileIfUnused(deletedSupplier.coverImageId);

    revalidatePath(ADMIN_SUPPLIERS_PATH);
    result = { type: 'success', message: 'Поставщик удален.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}
