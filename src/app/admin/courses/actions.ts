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
import { withAdminAction } from '@/lib/server-action-wrappers';

const ADMIN_COURSES_PATH = '/admin/courses';

const courseFormSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(180).optional(),
  summary: z.string().trim().min(10).max(500),
  program: z.string().trim().min(20),
  status: z.enum(contentStatusValues).default(ContentStatus.DRAFT),
  coverImageAlt: z.string().trim().max(180).optional(),
  categoryId: z.string().trim().optional(),
  cityId: z.string().trim().optional(),
  format: z.string().trim().max(80).optional(),
  durationLabel: z.string().trim().max(120).optional(),
  level: z.string().trim().max(80).optional(),
  priceLabel: z.string().trim().max(120).optional(),
  instructorName: z.string().trim().max(160).optional()
});

const statusFormSchema = z.object({
  courseId: z.string().trim().min(1),
  status: z.enum(contentStatusValues)
});

const deleteFormSchema = z.object({
  courseId: z.string().trim().min(1)
});

export async function createCourse(formData: FormData) {
  let uploadedCoverImageId: string | null = null;

  await withAdminAction({
    formData,
    section: 'courses',
    defaultRedirectPath: ADMIN_COURSES_PATH,
    cleanup: () => deleteUploadedFileIfUnused(uploadedCoverImageId),
    handler: async ({ formData, user }) => {
      const parsed = courseFormSchema.parse({
        title: getString(formData, 'title'), slug: optionalString(getString(formData, 'slug')),
        summary: getString(formData, 'summary'), program: getString(formData, 'program'),
        status: getString(formData, 'status') || ContentStatus.DRAFT,
        coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
        categoryId: optionalString(getString(formData, 'categoryId')), cityId: optionalString(getString(formData, 'cityId')),
        format: optionalString(getString(formData, 'format')), durationLabel: optionalString(getString(formData, 'durationLabel')),
        level: optionalString(getString(formData, 'level')), priceLabel: optionalString(getString(formData, 'priceLabel')),
        instructorName: optionalString(getString(formData, 'instructorName'))
      });
      const slug = slugify(parsed.slug ?? parsed.title);
      if (!slug) throw new Error('Course slug is required.');

      await assertActiveContentRelations({ entityName: 'Course', categoryId: parsed.categoryId, categoryType: CategoryType.COURSE, cityId: parsed.cityId });

      const coverImageId = await resolveCoverImageId({ formData, userId: user.id, onUploadedImageId: (fileId) => { uploadedCoverImageId = fileId; } });

      await persistWithUniqueSlugRetry({
        baseSlug: slug, exists: async (candidate) => Boolean(await prisma.course.findFirst({ where: { slug: candidate }, select: { id: true } })),
        persist: (uniqueSlug) => prisma.course.create({
          data: { title: parsed.title, slug: uniqueSlug, summary: parsed.summary, program: parsed.program, status: parsed.status, coverImageId, coverImageAlt: nullableString(parsed.coverImageAlt), categoryId: nullableString(parsed.categoryId), cityId: nullableString(parsed.cityId), format: nullableString(parsed.format), durationLabel: nullableString(parsed.durationLabel), level: nullableString(parsed.level), priceLabel: nullableString(parsed.priceLabel), instructorName: nullableString(parsed.instructorName), createdById: user.id, updatedById: user.id, ...initialPublicationDates(parsed.status) }
        })
      });

      revalidatePath(ADMIN_COURSES_PATH);
      return { type: 'success', message: 'Курс создан.' };
    }
  });
}

export async function updateCourse(formData: FormData) {
  let uploadedCoverImageId: string | null = null;

  await withAdminAction({
    formData,
    section: 'courses',
    defaultRedirectPath: ADMIN_COURSES_PATH,
    cleanup: () => deleteUploadedFileIfUnused(uploadedCoverImageId),
    handler: async ({ formData, user }) => {
      const parsed = courseFormSchema.extend({ courseId: z.string().trim().min(1) }).parse({
        courseId: getString(formData, 'courseId'), title: getString(formData, 'title'),
        slug: optionalString(getString(formData, 'slug')), summary: getString(formData, 'summary'),
        program: getString(formData, 'program'), status: getString(formData, 'status') || ContentStatus.DRAFT,
        coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
        categoryId: optionalString(getString(formData, 'categoryId')), cityId: optionalString(getString(formData, 'cityId')),
        format: optionalString(getString(formData, 'format')), durationLabel: optionalString(getString(formData, 'durationLabel')),
        level: optionalString(getString(formData, 'level')), priceLabel: optionalString(getString(formData, 'priceLabel')),
        instructorName: optionalString(getString(formData, 'instructorName'))
      });
      const slug = slugify(parsed.slug ?? parsed.title);
      if (!slug) throw new Error('Course slug is required.');

      const existingCourse = await prisma.course.findUniqueOrThrow({ where: { id: parsed.courseId }, select: { coverImageId: true, publishedAt: true } });
      const previousCoverImageId = existingCourse.coverImageId;

      await assertActiveContentRelations({ entityName: 'Course', categoryId: parsed.categoryId, categoryType: CategoryType.COURSE, cityId: parsed.cityId });

      const coverImageId = await resolveCoverImageId({ formData, userId: user.id, currentCoverImageId: existingCourse.coverImageId, onUploadedImageId: (fileId) => { uploadedCoverImageId = fileId; } });

      await persistWithUniqueSlugRetry({
        baseSlug: slug, exists: async (candidate) => Boolean(await prisma.course.findFirst({ where: { slug: candidate, id: { not: parsed.courseId } }, select: { id: true } })),
        persist: (uniqueSlug) => prisma.course.update({
          where: { id: parsed.courseId }, data: { title: parsed.title, slug: uniqueSlug, summary: parsed.summary, program: parsed.program, status: parsed.status, coverImageId, coverImageAlt: nullableString(parsed.coverImageAlt), categoryId: nullableString(parsed.categoryId), cityId: nullableString(parsed.cityId), format: nullableString(parsed.format), durationLabel: nullableString(parsed.durationLabel), level: nullableString(parsed.level), priceLabel: nullableString(parsed.priceLabel), instructorName: nullableString(parsed.instructorName), updatedById: user.id, ...statusTransitionDates(parsed.status, existingCourse.publishedAt) }
        })
      });

      if (previousCoverImageId !== coverImageId) await deleteUploadedFileIfUnused(previousCoverImageId);

      revalidatePath(ADMIN_COURSES_PATH);
      return { type: 'success', message: 'Курс обновлён.' };
    }
  });
}

export async function updateCourseStatus(formData: FormData) {
  await withAdminAction({
    formData,
    section: 'courses',
    defaultRedirectPath: ADMIN_COURSES_PATH,
    handler: async ({ user }) => {
      const parsed = statusFormSchema.parse({ courseId: getString(formData, 'courseId'), status: getString(formData, 'status') });

      await updateContentStatus({ status: parsed.status, userId: user.id, findCurrent: (tx) => tx.course.findUniqueOrThrow({ where: { id: parsed.courseId }, select: { publishedAt: true } }), update: (tx, data) => tx.course.update({ where: { id: parsed.courseId }, data }) });

      revalidatePath(ADMIN_COURSES_PATH);
      return { type: 'success', message: 'Статус курса обновлён.' };
    }
  });
}

export async function deleteCourseDraft(formData: FormData) {
  await withAdminAction({
    formData,
    section: 'courses',
    defaultRedirectPath: ADMIN_COURSES_PATH,
    handler: async () => {
      const parsed = deleteFormSchema.parse({ courseId: getString(formData, 'courseId') });

      const deletedCourse = await deleteContentDraft({ findRecord: (tx) => tx.course.findUnique({ where: { id: parsed.courseId }, select: { coverImageId: true } }), deleteDraft: (tx) => tx.course.deleteMany({ where: { id: parsed.courseId, status: ContentStatus.DRAFT } }) });

      await deleteUploadedFileIfUnused(deletedCourse.coverImageId);

      revalidatePath(ADMIN_COURSES_PATH);
      return { type: 'success', message: 'Курс удалён.' };
    }
  });
}
