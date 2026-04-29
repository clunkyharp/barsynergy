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
import { vacancyPositionValues } from '@/lib/vacancies/positions';

const ADMIN_VACANCIES_PATH = '/admin/vacancies';

const vacancyFormSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(180).optional(),
  summary: z.string().trim().min(10).max(500),
  description: z.string().trim().min(20),
  status: z.enum(contentStatusValues).default(ContentStatus.DRAFT),
  categoryId: z.string().trim().optional(),
  cityId: z.string().trim().optional(),
  companyName: z.string().trim().min(2).max(180),
  position: z.enum(vacancyPositionValues),
  employmentType: z.string().trim().max(100).optional(),
  salaryLabel: z.string().trim().max(120).optional(),
  experienceLabel: z.string().trim().max(120).optional(),
  contactMode: z.string().trim().max(120).optional()
});

const statusFormSchema = z.object({
  vacancyId: z.string().trim().min(1),
  status: z.enum(contentStatusValues)
});

const deleteFormSchema = z.object({
  vacancyId: z.string().trim().min(1)
});

async function getUniqueVacancySlug(baseSlug: string, excludeId?: string) {
  let candidate = baseSlug;
  let suffix = 2;

  while (
    await prisma.vacancy.findFirst({
      where: { slug: candidate, id: excludeId ? { not: excludeId } : undefined },
      select: { id: true }
    })
  ) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function assertVacancyRelations(input: { categoryId?: string; cityId?: string }) {
  const [category, city] = await Promise.all([
    input.categoryId
      ? prisma.category.findFirst({
          where: { id: input.categoryId, type: CategoryType.VACANCY, isActive: true },
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
    throw new Error('Vacancy category is invalid.');
  }

  if (input.cityId && !city) {
    throw new Error('Vacancy city is invalid.');
  }
}

export async function createVacancy(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_VACANCIES_PATH);
  let result: { type: 'success' | 'error'; message: string };
  let uploadedCoverImageId: string | null = null;

  try {
    const user = await requireAdminSectionAccess('vacancies');
    const parsed = vacancyFormSchema.parse({
      title: getString(formData, 'title'),
      slug: optionalString(getString(formData, 'slug')),
      summary: getString(formData, 'summary'),
      description: getString(formData, 'description'),
      status: getString(formData, 'status') || ContentStatus.DRAFT,
      categoryId: optionalString(getString(formData, 'categoryId')),
      cityId: optionalString(getString(formData, 'cityId')),
      companyName: getString(formData, 'companyName'),
      position: getString(formData, 'position'),
      employmentType: optionalString(getString(formData, 'employmentType')),
      salaryLabel: optionalString(getString(formData, 'salaryLabel')),
      experienceLabel: optionalString(getString(formData, 'experienceLabel')),
      contactMode: optionalString(getString(formData, 'contactMode'))
    });
    const slug = slugify(parsed.slug ?? parsed.title);

    if (!slug) {
      throw new Error('Vacancy slug is required.');
    }

    await assertVacancyRelations({
      categoryId: parsed.categoryId,
      cityId: parsed.cityId
    });

    const [uniqueSlug, coverImageId] = await Promise.all([
      getUniqueVacancySlug(slug),
      resolveCoverImageId({
        formData,
        userId: user.id,
        onUploadedImageId: (fileId) => {
          uploadedCoverImageId = fileId;
        }
      })
    ]);

    await prisma.vacancy.create({
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
        position: parsed.position,
        employmentType: nullableString(parsed.employmentType),
        salaryLabel: nullableString(parsed.salaryLabel),
        experienceLabel: nullableString(parsed.experienceLabel),
        contactMode: nullableString(parsed.contactMode),
        createdById: user.id,
        updatedById: user.id,
        ...initialPublicationDates(parsed.status)
      }
    });

    revalidatePath(ADMIN_VACANCIES_PATH);
    result = { type: 'success', message: 'Вакансия создана.' };
  } catch (error) {
    await deleteUploadedFileIfUnused(uploadedCoverImageId);
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updateVacancy(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_VACANCIES_PATH);
  let result: { type: 'success' | 'error'; message: string };
  let uploadedCoverImageId: string | null = null;
  let previousCoverImageId: string | null = null;

  try {
    const user = await requireAdminSectionAccess('vacancies');
    const parsed = vacancyFormSchema
      .extend({
        vacancyId: z.string().trim().min(1)
      })
      .parse({
        vacancyId: getString(formData, 'vacancyId'),
        title: getString(formData, 'title'),
        slug: optionalString(getString(formData, 'slug')),
        summary: getString(formData, 'summary'),
        description: getString(formData, 'description'),
        status: getString(formData, 'status') || ContentStatus.DRAFT,
        categoryId: optionalString(getString(formData, 'categoryId')),
        cityId: optionalString(getString(formData, 'cityId')),
        companyName: getString(formData, 'companyName'),
        position: getString(formData, 'position'),
        employmentType: optionalString(getString(formData, 'employmentType')),
        salaryLabel: optionalString(getString(formData, 'salaryLabel')),
        experienceLabel: optionalString(getString(formData, 'experienceLabel')),
        contactMode: optionalString(getString(formData, 'contactMode'))
      });
    const slug = slugify(parsed.slug ?? parsed.title);

    if (!slug) {
      throw new Error('Vacancy slug is required.');
    }

    const existingVacancy = await prisma.vacancy.findUniqueOrThrow({
      where: { id: parsed.vacancyId },
      select: { coverImageId: true, publishedAt: true }
    });
    previousCoverImageId = existingVacancy.coverImageId;

    await assertVacancyRelations({
      categoryId: parsed.categoryId,
      cityId: parsed.cityId
    });

    const [uniqueSlug, coverImageId] = await Promise.all([
      getUniqueVacancySlug(slug, parsed.vacancyId),
      resolveCoverImageId({
        formData,
        userId: user.id,
        currentCoverImageId: existingVacancy.coverImageId,
        onUploadedImageId: (fileId) => {
          uploadedCoverImageId = fileId;
        }
      })
    ]);

    await prisma.vacancy.update({
      where: { id: parsed.vacancyId },
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
        position: parsed.position,
        employmentType: nullableString(parsed.employmentType),
        salaryLabel: nullableString(parsed.salaryLabel),
        experienceLabel: nullableString(parsed.experienceLabel),
        contactMode: nullableString(parsed.contactMode),
        updatedById: user.id,
        ...statusTransitionDates(parsed.status, existingVacancy.publishedAt)
      }
    });

    if (previousCoverImageId !== coverImageId) {
      await deleteUploadedFileIfUnused(previousCoverImageId);
    }

    revalidatePath(ADMIN_VACANCIES_PATH);
    result = { type: 'success', message: 'Вакансия обновлена.' };
  } catch (error) {
    await deleteUploadedFileIfUnused(uploadedCoverImageId);
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updateVacancyStatus(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_VACANCIES_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    const user = await requireAdminSectionAccess('vacancies');
    const parsed = statusFormSchema.parse({
      vacancyId: getString(formData, 'vacancyId'),
      status: getString(formData, 'status')
    });

    await prisma.$transaction(async (tx) => {
      const vacancy = await tx.vacancy.findUniqueOrThrow({
        where: { id: parsed.vacancyId },
        select: { publishedAt: true }
      });

      await tx.vacancy.update({
        where: { id: parsed.vacancyId },
        data: {
          status: parsed.status,
          updatedById: user.id,
          ...statusTransitionDates(parsed.status, vacancy.publishedAt)
        }
      });
    });

    revalidatePath(ADMIN_VACANCIES_PATH);
    result = { type: 'success', message: 'Статус вакансии обновлен.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function deleteVacancyDraft(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_VACANCIES_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await requireAdminSectionAccess('vacancies');
    const parsed = deleteFormSchema.parse({
      vacancyId: getString(formData, 'vacancyId')
    });

    const deletedVacancy = await prisma.$transaction(async (tx) => {
      const vacancy = await tx.vacancy.findFirst({
        where: {
          id: parsed.vacancyId,
          status: { not: ContentStatus.PUBLISHED }
        },
        select: { coverImageId: true }
      });

      if (!vacancy) {
        throw new Error('draft is invalid');
      }

      const deletion = await tx.vacancy.deleteMany({
        where: {
          id: parsed.vacancyId,
          status: { not: ContentStatus.PUBLISHED }
        }
      });

      if (deletion.count !== 1) {
        throw new Error('draft is invalid');
      }

      return vacancy;
    });

    await deleteUploadedFileIfUnused(deletedVacancy.coverImageId);

    revalidatePath(ADMIN_VACANCIES_PATH);
    result = { type: 'success', message: 'Черновик вакансии удален.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}
