'use server';

import { revalidatePath } from 'next/cache';
import { CategoryType, ContentStatus } from '@prisma/client';
import { z } from 'zod';
import {
  contentStatusValues,
  deleteUploadedFileIfUnused,
  formatAdminActionError,
  getString,
  initialPublicationDates,
  nullableString,
  optionalString,
  redirectWithAdminActionResult,
  resolveCoverImageId,
  safeAdminRedirectPath,
  slugify,
  statusTransitionDates
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

const ADMIN_SUPPLIERS_PATH = '/admin/suppliers';

const supplierFormSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(180).optional(),
  summary: z.string().trim().min(10).max(500),
  description: z.string().trim().min(20),
  status: z.enum(contentStatusValues).default(ContentStatus.DRAFT),
  categoryId: z.string().trim().optional(),
  cityId: z.string().trim().optional(),
  companyName: z.string().trim().min(2).max(180),
  websiteUrl: z.string().trim().url().max(240).optional(),
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

async function getUniqueSupplierSlug(baseSlug: string, excludeId?: string) {
  let candidate = baseSlug;
  let suffix = 2;

  while (
    await prisma.supplier.findFirst({
      where: { slug: candidate, id: excludeId ? { not: excludeId } : undefined },
      select: { id: true }
    })
  ) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function assertSupplierRelations(input: { categoryId?: string; cityId?: string }) {
  const [category, city] = await Promise.all([
    input.categoryId
      ? prisma.category.findFirst({
          where: { id: input.categoryId, type: CategoryType.SUPPLIER, isActive: true },
          select: { id: true }
        })
      : null,
    input.cityId
      ? prisma.city.findFirst({
          where: { id: input.cityId, isActive: true },
          select: { id: true }
        })
      : null
  ]);

  if (input.categoryId && !category) {
    throw new Error('Supplier category is invalid.');
  }

  if (input.cityId && !city) {
    throw new Error('Supplier city is invalid.');
  }
}

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
      categoryId: optionalString(getString(formData, 'categoryId')),
      cityId: optionalString(getString(formData, 'cityId')),
      companyName: getString(formData, 'companyName'),
      websiteUrl: optionalString(getString(formData, 'websiteUrl')),
      contactLabel: optionalString(getString(formData, 'contactLabel')),
      isVerified: getString(formData, 'isVerified') === 'true',
      serviceArea: optionalString(getString(formData, 'serviceArea'))
    });
    const slug = slugify(parsed.slug ?? parsed.title);

    if (!slug) {
      throw new Error('Supplier slug is required.');
    }

    await assertSupplierRelations({
      categoryId: parsed.categoryId,
      cityId: parsed.cityId
    });

    const [uniqueSlug, coverImageId] = await Promise.all([
      getUniqueSupplierSlug(slug),
      resolveCoverImageId({
        formData,
        userId: user.id,
        onUploadedImageId: (fileId) => {
          uploadedCoverImageId = fileId;
        }
      })
    ]);

    await prisma.supplier.create({
      data: {
        title: parsed.title,
        slug: uniqueSlug,
        summary: parsed.summary,
        description: parsed.description,
        status: parsed.status,
        coverImageId,
        categoryId: nullableString(parsed.categoryId),
        cityId: nullableString(parsed.cityId),
        companyName: parsed.companyName,
        websiteUrl: nullableString(parsed.websiteUrl),
        contactLabel: nullableString(parsed.contactLabel),
        isVerified: parsed.isVerified,
        serviceArea: nullableString(parsed.serviceArea),
        createdById: user.id,
        updatedById: user.id,
        ...initialPublicationDates(parsed.status)
      }
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
        categoryId: optionalString(getString(formData, 'categoryId')),
        cityId: optionalString(getString(formData, 'cityId')),
        companyName: getString(formData, 'companyName'),
        websiteUrl: optionalString(getString(formData, 'websiteUrl')),
        contactLabel: optionalString(getString(formData, 'contactLabel')),
        isVerified: getString(formData, 'isVerified') === 'true',
        serviceArea: optionalString(getString(formData, 'serviceArea'))
      });
    const slug = slugify(parsed.slug ?? parsed.title);

    if (!slug) {
      throw new Error('Supplier slug is required.');
    }

    const existingSupplier = await prisma.supplier.findUniqueOrThrow({
      where: { id: parsed.supplierId },
      select: { coverImageId: true, publishedAt: true }
    });
    previousCoverImageId = existingSupplier.coverImageId;

    await assertSupplierRelations({
      categoryId: parsed.categoryId,
      cityId: parsed.cityId
    });

    const [uniqueSlug, coverImageId] = await Promise.all([
      getUniqueSupplierSlug(slug, parsed.supplierId),
      resolveCoverImageId({
        formData,
        userId: user.id,
        currentCoverImageId: existingSupplier.coverImageId,
        onUploadedImageId: (fileId) => {
          uploadedCoverImageId = fileId;
        }
      })
    ]);

    await prisma.supplier.update({
      where: { id: parsed.supplierId },
      data: {
        title: parsed.title,
        slug: uniqueSlug,
        summary: parsed.summary,
        description: parsed.description,
        status: parsed.status,
        coverImageId,
        categoryId: nullableString(parsed.categoryId),
        cityId: nullableString(parsed.cityId),
        companyName: parsed.companyName,
        websiteUrl: nullableString(parsed.websiteUrl),
        contactLabel: nullableString(parsed.contactLabel),
        isVerified: parsed.isVerified,
        serviceArea: nullableString(parsed.serviceArea),
        updatedById: user.id,
        ...statusTransitionDates(parsed.status, existingSupplier.publishedAt)
      }
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

    const deletedSuppliers = await prisma.supplier.findMany({
      where: {
        id: parsed.supplierId,
        status: { not: ContentStatus.PUBLISHED }
      },
      select: { coverImageId: true }
    });

    await prisma.supplier.deleteMany({
      where: {
        id: parsed.supplierId,
        status: { not: ContentStatus.PUBLISHED }
      }
    });
    await Promise.all(deletedSuppliers.map((supplier) => deleteUploadedFileIfUnused(supplier.coverImageId)));

    revalidatePath(ADMIN_SUPPLIERS_PATH);
    result = { type: 'success', message: 'Черновик поставщика удален.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}
