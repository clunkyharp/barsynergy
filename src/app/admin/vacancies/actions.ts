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
import { prisma } from '@/lib/db/prisma';
import { vacancyPositionValues } from '@/lib/vacancies/positions';
import { withAdminAction } from '@/lib/server-action-wrappers';

const ADMIN_VACANCIES_PATH = '/admin/vacancies';

const vacancyFormSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(180).optional(),
  summary: z.string().trim().min(10).max(500),
  description: z.string().trim().min(20),
  status: z.enum(contentStatusValues).default(ContentStatus.DRAFT),
  coverImageAlt: z.string().trim().max(180).optional(),
  categoryId: z.string().trim().optional(),
  cityId: z.string().trim().optional(),
  companyName: z.string().trim().min(2).max(180),
  position: z.enum(vacancyPositionValues),
  employmentType: z.string().trim().max(100).optional(),
  salaryLabel: z.string().trim().max(120).optional(),
  experienceLabel: z.string().trim().max(120).optional(),
  contactMode: z.string().trim().max(120).optional(),
  businessAccountId: z.string().trim().optional()
});

const statusFormSchema = z.object({
  vacancyId: z.string().trim().min(1),
  status: z.enum(contentStatusValues)
});

const deleteFormSchema = z.object({
  vacancyId: z.string().trim().min(1)
});

export async function createVacancy(formData: FormData) {
  let uploadedCoverImageId: string | null = null;

  await withAdminAction({
    formData,
    section: 'vacancies',
    defaultRedirectPath: ADMIN_VACANCIES_PATH,
    cleanup: () => deleteUploadedFileIfUnused(uploadedCoverImageId),
    handler: async ({ formData, user }) => {
      const parsed = vacancyFormSchema.parse({
        title: getString(formData, 'title'),
        slug: optionalString(getString(formData, 'slug')),
        summary: getString(formData, 'summary'),
        description: getString(formData, 'description'),
        status: getString(formData, 'status') || ContentStatus.DRAFT,
        coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
        categoryId: optionalString(getString(formData, 'categoryId')),
        cityId: optionalString(getString(formData, 'cityId')),
        companyName: getString(formData, 'companyName'),
        position: getString(formData, 'position'),
        employmentType: optionalString(getString(formData, 'employmentType')),
        salaryLabel: optionalString(getString(formData, 'salaryLabel')),
        experienceLabel: optionalString(getString(formData, 'experienceLabel')),
        contactMode: optionalString(getString(formData, 'contactMode')),
        businessAccountId: optionalString(getString(formData, 'businessAccountId'))
      });
      const slug = slugify(parsed.slug ?? parsed.title);

      if (!slug) {
        throw new Error('Vacancy slug is required.');
      }

      await assertActiveContentRelations({
        entityName: 'Vacancy',
        categoryId: parsed.categoryId,
        categoryType: CategoryType.VACANCY,
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
            await prisma.vacancy.findFirst({
              where: { slug: candidate },
              select: { id: true }
            })
          ),
        persist: (uniqueSlug) =>
          prisma.vacancy.create({
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
              position: parsed.position,
              employmentType: nullableString(parsed.employmentType),
              salaryLabel: nullableString(parsed.salaryLabel),
              experienceLabel: nullableString(parsed.experienceLabel),
              contactMode: nullableString(parsed.contactMode),
              businessAccountId: nullableString(parsed.businessAccountId),
              createdById: user.id,
              updatedById: user.id,
              ...initialPublicationDates(parsed.status)
            }
          })
      });

      revalidatePath(ADMIN_VACANCIES_PATH);
      return { type: 'success', message: 'Вакансия создана.' };
    }
  });
}

export async function updateVacancy(formData: FormData) {
  let uploadedCoverImageId: string | null = null;

  await withAdminAction({
    formData,
    section: 'vacancies',
    defaultRedirectPath: ADMIN_VACANCIES_PATH,
    cleanup: () => deleteUploadedFileIfUnused(uploadedCoverImageId),
    handler: async ({ formData, user }) => {
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
          coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
          categoryId: optionalString(getString(formData, 'categoryId')),
          cityId: optionalString(getString(formData, 'cityId')),
          companyName: getString(formData, 'companyName'),
          position: getString(formData, 'position'),
          employmentType: optionalString(getString(formData, 'employmentType')),
          salaryLabel: optionalString(getString(formData, 'salaryLabel')),
          experienceLabel: optionalString(getString(formData, 'experienceLabel')),
          contactMode: optionalString(getString(formData, 'contactMode')),
          businessAccountId: optionalString(getString(formData, 'businessAccountId'))
        });
      const slug = slugify(parsed.slug ?? parsed.title);

      if (!slug) {
        throw new Error('Vacancy slug is required.');
      }

      const existingVacancy = await prisma.vacancy.findUniqueOrThrow({
        where: { id: parsed.vacancyId },
        select: { coverImageId: true, publishedAt: true }
      });
      const previousCoverImageId = existingVacancy.coverImageId;

      await assertActiveContentRelations({
        entityName: 'Vacancy',
        categoryId: parsed.categoryId,
        categoryType: CategoryType.VACANCY,
        cityId: parsed.cityId
      });

      const coverImageId = await resolveCoverImageId({
        formData,
        userId: user.id,
        currentCoverImageId: existingVacancy.coverImageId,
        onUploadedImageId: (fileId) => {
          uploadedCoverImageId = fileId;
        }
      });

      await persistWithUniqueSlugRetry({
        baseSlug: slug,
        exists: async (candidate) =>
          Boolean(
            await prisma.vacancy.findFirst({
              where: { slug: candidate, id: { not: parsed.vacancyId } },
              select: { id: true }
            })
          ),
        persist: (uniqueSlug) =>
          prisma.vacancy.update({
            where: { id: parsed.vacancyId },
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
              position: parsed.position,
              employmentType: nullableString(parsed.employmentType),
              salaryLabel: nullableString(parsed.salaryLabel),
              experienceLabel: nullableString(parsed.experienceLabel),
              contactMode: nullableString(parsed.contactMode),
              businessAccountId: nullableString(parsed.businessAccountId),
              updatedById: user.id,
              ...statusTransitionDates(parsed.status, existingVacancy.publishedAt)
            }
          })
      });

      if (previousCoverImageId !== coverImageId) {
        await deleteUploadedFileIfUnused(previousCoverImageId);
      }

      revalidatePath(ADMIN_VACANCIES_PATH);
      return { type: 'success', message: 'Вакансия обновлена.' };
    }
  });
}

export async function updateVacancyStatus(formData: FormData) {
  await withAdminAction({
    formData,
    section: 'vacancies',
    defaultRedirectPath: ADMIN_VACANCIES_PATH,
    handler: async ({ formData, user }) => {
      const parsed = statusFormSchema.parse({
        vacancyId: getString(formData, 'vacancyId'),
        status: getString(formData, 'status')
      });

      await updateContentStatus({
        status: parsed.status,
        userId: user.id,
        findCurrent: (tx) =>
          tx.vacancy.findUniqueOrThrow({
            where: { id: parsed.vacancyId },
            select: { publishedAt: true }
          }),
        update: (tx, data) =>
          tx.vacancy.update({
            where: { id: parsed.vacancyId },
            data
          })
      });

      revalidatePath(ADMIN_VACANCIES_PATH);
      return { type: 'success', message: 'Статус вакансии обновлён.' };
    }
  });
}

export async function deleteVacancyDraft(formData: FormData) {
  await withAdminAction({
    formData,
    section: 'vacancies',
    defaultRedirectPath: ADMIN_VACANCIES_PATH,
    handler: async ({ formData }) => {
      const parsed = deleteFormSchema.parse({
        vacancyId: getString(formData, 'vacancyId')
      });

      const deletedVacancy = await deleteContentDraft({
        findRecord: (tx) =>
          tx.vacancy.findUnique({
            where: { id: parsed.vacancyId },
            select: { coverImageId: true }
          }),
        deleteDraft: (tx) =>
          tx.vacancy.deleteMany({
            where: { id: parsed.vacancyId, status: ContentStatus.DRAFT }
          })
      });

      await deleteUploadedFileIfUnused(deletedVacancy.coverImageId);

      revalidatePath(ADMIN_VACANCIES_PATH);
      return { type: 'success', message: 'Вакансия удалена.' };
    }
  });
}
