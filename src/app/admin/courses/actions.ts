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

const ADMIN_COURSES_PATH = '/admin/courses';

const courseFormSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(180).optional(),
  summary: z.string().trim().min(10).max(500),
  program: z.string().trim().min(20),
  status: z.enum(contentStatusValues).default(ContentStatus.DRAFT),
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

async function getUniqueCourseSlug(baseSlug: string, excludeId?: string) {
  let candidate = baseSlug;
  let suffix = 2;

  while (
    await prisma.course.findFirst({
      where: { slug: candidate, id: excludeId ? { not: excludeId } : undefined },
      select: { id: true }
    })
  ) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function assertCourseRelations(input: { categoryId?: string; cityId?: string }) {
  const [category, city] = await Promise.all([
    input.categoryId
      ? prisma.category.findFirst({
          where: { id: input.categoryId, type: CategoryType.COURSE, isActive: true },
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
    throw new Error('Course category is invalid.');
  }

  if (input.cityId && !city) {
    throw new Error('Course city is invalid.');
  }
}

export async function createCourse(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_COURSES_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    const user = await requireAdminSectionAccess('courses');
    const parsed = courseFormSchema.parse({
      title: getString(formData, 'title'),
      slug: optionalString(getString(formData, 'slug')),
      summary: getString(formData, 'summary'),
      program: getString(formData, 'program'),
      status: getString(formData, 'status') || ContentStatus.DRAFT,
      categoryId: optionalString(getString(formData, 'categoryId')),
      cityId: optionalString(getString(formData, 'cityId')),
      format: optionalString(getString(formData, 'format')),
      durationLabel: optionalString(getString(formData, 'durationLabel')),
      level: optionalString(getString(formData, 'level')),
      priceLabel: optionalString(getString(formData, 'priceLabel')),
      instructorName: optionalString(getString(formData, 'instructorName'))
    });
    const slug = slugify(parsed.slug ?? parsed.title);

    if (!slug) {
      throw new Error('Course slug is required.');
    }

    await assertCourseRelations({
      categoryId: parsed.categoryId,
      cityId: parsed.cityId
    });

    const [uniqueSlug, coverImageId] = await Promise.all([
      getUniqueCourseSlug(slug),
      resolveCoverImageId({ formData, userId: user.id })
    ]);

    await prisma.course.create({
      data: {
        title: parsed.title,
        slug: uniqueSlug,
        summary: parsed.summary,
        program: parsed.program,
        status: parsed.status,
        coverImageId,
        categoryId: nullableString(parsed.categoryId),
        cityId: nullableString(parsed.cityId),
        format: nullableString(parsed.format),
        durationLabel: nullableString(parsed.durationLabel),
        level: nullableString(parsed.level),
        priceLabel: nullableString(parsed.priceLabel),
        instructorName: nullableString(parsed.instructorName),
        createdById: user.id,
        updatedById: user.id,
        ...initialPublicationDates(parsed.status)
      }
    });

    revalidatePath(ADMIN_COURSES_PATH);
    result = { type: 'success', message: 'Курс создан.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updateCourse(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_COURSES_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    const user = await requireAdminSectionAccess('courses');
    const parsed = courseFormSchema
      .extend({
        courseId: z.string().trim().min(1)
      })
      .parse({
        courseId: getString(formData, 'courseId'),
        title: getString(formData, 'title'),
        slug: optionalString(getString(formData, 'slug')),
        summary: getString(formData, 'summary'),
        program: getString(formData, 'program'),
        status: getString(formData, 'status') || ContentStatus.DRAFT,
        categoryId: optionalString(getString(formData, 'categoryId')),
        cityId: optionalString(getString(formData, 'cityId')),
        format: optionalString(getString(formData, 'format')),
        durationLabel: optionalString(getString(formData, 'durationLabel')),
        level: optionalString(getString(formData, 'level')),
        priceLabel: optionalString(getString(formData, 'priceLabel')),
        instructorName: optionalString(getString(formData, 'instructorName'))
      });
    const slug = slugify(parsed.slug ?? parsed.title);

    if (!slug) {
      throw new Error('Course slug is required.');
    }

    const existingCourse = await prisma.course.findUniqueOrThrow({
      where: { id: parsed.courseId },
      select: { coverImageId: true, publishedAt: true }
    });

    await assertCourseRelations({
      categoryId: parsed.categoryId,
      cityId: parsed.cityId
    });

    const [uniqueSlug, coverImageId] = await Promise.all([
      getUniqueCourseSlug(slug, parsed.courseId),
      resolveCoverImageId({
        formData,
        userId: user.id,
        currentCoverImageId: existingCourse.coverImageId
      })
    ]);

    await prisma.course.update({
      where: { id: parsed.courseId },
      data: {
        title: parsed.title,
        slug: uniqueSlug,
        summary: parsed.summary,
        program: parsed.program,
        status: parsed.status,
        coverImageId,
        categoryId: nullableString(parsed.categoryId),
        cityId: nullableString(parsed.cityId),
        format: nullableString(parsed.format),
        durationLabel: nullableString(parsed.durationLabel),
        level: nullableString(parsed.level),
        priceLabel: nullableString(parsed.priceLabel),
        instructorName: nullableString(parsed.instructorName),
        updatedById: user.id,
        ...statusTransitionDates(parsed.status, existingCourse.publishedAt)
      }
    });

    revalidatePath(ADMIN_COURSES_PATH);
    result = { type: 'success', message: 'Курс обновлен.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updateCourseStatus(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_COURSES_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    const user = await requireAdminSectionAccess('courses');
    const parsed = statusFormSchema.parse({
      courseId: getString(formData, 'courseId'),
      status: getString(formData, 'status')
    });

    await prisma.$transaction(async (tx) => {
      const course = await tx.course.findUniqueOrThrow({
        where: { id: parsed.courseId },
        select: { publishedAt: true }
      });

      await tx.course.update({
        where: { id: parsed.courseId },
        data: {
          status: parsed.status,
          updatedById: user.id,
          ...statusTransitionDates(parsed.status, course.publishedAt)
        }
      });
    });

    revalidatePath(ADMIN_COURSES_PATH);
    result = { type: 'success', message: 'Статус курса обновлен.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function deleteCourseDraft(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_COURSES_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await requireAdminSectionAccess('courses');
    const parsed = deleteFormSchema.parse({
      courseId: getString(formData, 'courseId')
    });

    await prisma.course.deleteMany({
      where: {
        id: parsed.courseId,
        status: { not: ContentStatus.PUBLISHED }
      }
    });

    revalidatePath(ADMIN_COURSES_PATH);
    result = { type: 'success', message: 'Черновик курса удален.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}
