'use server';

import { revalidatePath } from 'next/cache';
import { CategoryType, ContentStatus } from '@prisma/client';
import { z } from 'zod';
import {
  contentStatusValues,
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

const ADMIN_PARTNERS_PATH = '/admin/partners';

const partnerFormSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(180).optional(),
  summary: z.string().trim().min(10).max(500),
  description: z.string().trim().min(20),
  status: z.enum(contentStatusValues).default(ContentStatus.DRAFT),
  categoryId: z.string().trim().optional(),
  companyName: z.string().trim().min(2).max(180),
  websiteUrl: z.string().trim().url().max(240).optional(),
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

async function getUniquePartnerSlug(baseSlug: string, excludeId?: string) {
  let candidate = baseSlug;
  let suffix = 2;

  while (
    await prisma.partner.findFirst({
      where: { slug: candidate, id: excludeId ? { not: excludeId } : undefined },
      select: { id: true }
    })
  ) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function assertPartnerRelations(input: { categoryId?: string }) {
  const category = input.categoryId
    ? await prisma.category.findFirst({
        where: { id: input.categoryId, type: CategoryType.PARTNER, isActive: true },
        select: { id: true }
      })
    : null;

  if (input.categoryId && !category) {
    throw new Error('Partner category is invalid.');
  }
}

export async function createPartner(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_PARTNERS_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    const user = await requireAdminSectionAccess('partners');
    const parsed = partnerFormSchema.parse({
      title: getString(formData, 'title'),
      slug: optionalString(getString(formData, 'slug')),
      summary: getString(formData, 'summary'),
      description: getString(formData, 'description'),
      status: getString(formData, 'status') || ContentStatus.DRAFT,
      categoryId: optionalString(getString(formData, 'categoryId')),
      companyName: getString(formData, 'companyName'),
      websiteUrl: optionalString(getString(formData, 'websiteUrl')),
      partnerType: optionalString(getString(formData, 'partnerType')),
      isFeatured: getString(formData, 'isFeatured') === 'true'
    });
    const slug = slugify(parsed.slug ?? parsed.title);

    if (!slug) {
      throw new Error('Partner slug is required.');
    }

    await assertPartnerRelations({
      categoryId: parsed.categoryId
    });

    const [uniqueSlug, coverImageId] = await Promise.all([
      getUniquePartnerSlug(slug),
      resolveCoverImageId({ formData, userId: user.id })
    ]);

    await prisma.partner.create({
      data: {
        title: parsed.title,
        slug: uniqueSlug,
        summary: parsed.summary,
        description: parsed.description,
        status: parsed.status,
        coverImageId,
        categoryId: nullableString(parsed.categoryId),
        companyName: parsed.companyName,
        websiteUrl: nullableString(parsed.websiteUrl),
        partnerType: nullableString(parsed.partnerType),
        isFeatured: parsed.isFeatured,
        createdById: user.id,
        updatedById: user.id,
        ...initialPublicationDates(parsed.status)
      }
    });

    revalidatePath(ADMIN_PARTNERS_PATH);
    result = { type: 'success', message: 'Партнер создан.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updatePartner(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_PARTNERS_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
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
        categoryId: optionalString(getString(formData, 'categoryId')),
        companyName: getString(formData, 'companyName'),
        websiteUrl: optionalString(getString(formData, 'websiteUrl')),
        partnerType: optionalString(getString(formData, 'partnerType')),
        isFeatured: getString(formData, 'isFeatured') === 'true'
      });
    const slug = slugify(parsed.slug ?? parsed.title);

    if (!slug) {
      throw new Error('Partner slug is required.');
    }

    const existingPartner = await prisma.partner.findUniqueOrThrow({
      where: { id: parsed.partnerId },
      select: { coverImageId: true, publishedAt: true }
    });

    await assertPartnerRelations({
      categoryId: parsed.categoryId
    });

    const [uniqueSlug, coverImageId] = await Promise.all([
      getUniquePartnerSlug(slug, parsed.partnerId),
      resolveCoverImageId({
        formData,
        userId: user.id,
        currentCoverImageId: existingPartner.coverImageId
      })
    ]);

    await prisma.partner.update({
      where: { id: parsed.partnerId },
      data: {
        title: parsed.title,
        slug: uniqueSlug,
        summary: parsed.summary,
        description: parsed.description,
        status: parsed.status,
        coverImageId,
        categoryId: nullableString(parsed.categoryId),
        companyName: parsed.companyName,
        websiteUrl: nullableString(parsed.websiteUrl),
        partnerType: nullableString(parsed.partnerType),
        isFeatured: parsed.isFeatured,
        updatedById: user.id,
        ...statusTransitionDates(parsed.status, existingPartner.publishedAt)
      }
    });

    revalidatePath(ADMIN_PARTNERS_PATH);
    result = { type: 'success', message: 'Партнер обновлен.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updatePartnerStatus(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_PARTNERS_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
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
    result = { type: 'success', message: 'Статус партнера обновлен.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function deletePartnerDraft(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_PARTNERS_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await requireAdminSectionAccess('partners');
    const parsed = deleteFormSchema.parse({
      partnerId: getString(formData, 'partnerId')
    });

    await prisma.partner.deleteMany({
      where: {
        id: parsed.partnerId,
        status: { not: ContentStatus.PUBLISHED }
      }
    });

    revalidatePath(ADMIN_PARTNERS_PATH);
    result = { type: 'success', message: 'Черновик партнера удален.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}
