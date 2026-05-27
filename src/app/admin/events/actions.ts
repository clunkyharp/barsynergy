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
import { deleteContentDraft, updateContentStatus } from '@/lib/admin/content-lifecycle';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';

const ADMIN_EVENTS_PATH = '/admin/events';

const eventFormSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(180).optional(),
  summary: z.string().trim().min(10).max(500),
  status: z.enum(contentStatusValues).default(ContentStatus.DRAFT),
  coverImageAlt: z.string().trim().max(180).optional(),
  categoryId: z.string().trim().optional(),
  cityId: z.string().trim().optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  locationName: z.string().trim().max(180).optional(),
  address: z.string().trim().max(240).optional(),
  format: z.string().trim().max(80).optional(),
  capacity: z.coerce.number().int().positive().max(100000).optional(),
  registrationMode: z.string().trim().max(120).optional()
});

const statusFormSchema = z.object({
  eventId: z.string().trim().min(1),
  status: z.enum(contentStatusValues)
});

const deleteFormSchema = z.object({
  eventId: z.string().trim().min(1)
});

export async function createEvent(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_EVENTS_PATH);
  let result: { type: 'success' | 'error'; message: string };
  let uploadedCoverImageId: string | null = null;

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess('events');
    const parsed = eventFormSchema.parse({
      title: getString(formData, 'title'),
      slug: optionalString(getString(formData, 'slug')),
      summary: getString(formData, 'summary'),
      status: getString(formData, 'status') || ContentStatus.DRAFT,
      coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
      categoryId: optionalString(getString(formData, 'categoryId')),
      cityId: optionalString(getString(formData, 'cityId')),
      startsAt: getString(formData, 'startsAt'),
      endsAt: optionalString(getString(formData, 'endsAt')),
      locationName: optionalString(getString(formData, 'locationName')),
      address: optionalString(getString(formData, 'address')),
      format: optionalString(getString(formData, 'format')),
      capacity: optionalString(getString(formData, 'capacity')),
      registrationMode: optionalString(getString(formData, 'registrationMode'))
    });
    const slug = slugify(parsed.slug ?? parsed.title);

    if (!slug) {
      throw new Error('Event slug is required.');
    }

    if (parsed.endsAt && parsed.endsAt < parsed.startsAt) {
      throw new Error('Event end date cannot be before start date.');
    }

    await assertActiveContentRelations({
      entityName: 'Event',
      categoryId: parsed.categoryId,
      categoryType: CategoryType.EVENT,
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
          await prisma.event.findFirst({
            where: { slug: candidate },
            select: { id: true }
          })
        ),
      persist: (uniqueSlug) =>
        prisma.event.create({
          data: {
            title: parsed.title,
            slug: uniqueSlug,
            summary: parsed.summary,
            status: parsed.status,
            coverImageId,
            coverImageAlt: nullableString(parsed.coverImageAlt),
            categoryId: nullableString(parsed.categoryId),
            cityId: nullableString(parsed.cityId),
            startsAt: parsed.startsAt,
            endsAt: parsed.endsAt ?? null,
            locationName: nullableString(parsed.locationName),
            address: nullableString(parsed.address),
            format: nullableString(parsed.format),
            capacity: parsed.capacity,
            registrationMode: nullableString(parsed.registrationMode),
            createdById: user.id,
            updatedById: user.id,
            ...initialPublicationDates(parsed.status)
          }
        })
    });

    revalidatePath(ADMIN_EVENTS_PATH);
    result = { type: 'success', message: 'Событие создано.' };
  } catch (error) {
    await deleteUploadedFileIfUnused(uploadedCoverImageId);
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updateEvent(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_EVENTS_PATH);
  let result: { type: 'success' | 'error'; message: string };
  let uploadedCoverImageId: string | null = null;
  let previousCoverImageId: string | null = null;

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess('events');
    const parsed = eventFormSchema
      .extend({
        eventId: z.string().trim().min(1)
      })
      .parse({
        eventId: getString(formData, 'eventId'),
        title: getString(formData, 'title'),
        slug: optionalString(getString(formData, 'slug')),
        summary: getString(formData, 'summary'),
        status: getString(formData, 'status') || ContentStatus.DRAFT,
        coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
        categoryId: optionalString(getString(formData, 'categoryId')),
        cityId: optionalString(getString(formData, 'cityId')),
        startsAt: getString(formData, 'startsAt'),
        endsAt: optionalString(getString(formData, 'endsAt')),
        locationName: optionalString(getString(formData, 'locationName')),
        address: optionalString(getString(formData, 'address')),
        format: optionalString(getString(formData, 'format')),
        capacity: optionalString(getString(formData, 'capacity')),
        registrationMode: optionalString(getString(formData, 'registrationMode'))
      });
    const slug = slugify(parsed.slug ?? parsed.title);

    if (!slug) {
      throw new Error('Event slug is required.');
    }

    if (parsed.endsAt && parsed.endsAt < parsed.startsAt) {
      throw new Error('Event end date cannot be before start date.');
    }

    const existingEvent = await prisma.event.findUniqueOrThrow({
      where: { id: parsed.eventId },
      select: { coverImageId: true, publishedAt: true }
    });
    previousCoverImageId = existingEvent.coverImageId;

    await assertActiveContentRelations({
      entityName: 'Event',
      categoryId: parsed.categoryId,
      categoryType: CategoryType.EVENT,
      cityId: parsed.cityId
    });

    const coverImageId = await resolveCoverImageId({
      formData,
      userId: user.id,
      currentCoverImageId: existingEvent.coverImageId,
      onUploadedImageId: (fileId) => {
        uploadedCoverImageId = fileId;
      }
    });

    await persistWithUniqueSlugRetry({
      baseSlug: slug,
      exists: async (candidate) =>
        Boolean(
          await prisma.event.findFirst({
            where: { slug: candidate, id: { not: parsed.eventId } },
            select: { id: true }
          })
        ),
      persist: (uniqueSlug) =>
        prisma.event.update({
          where: { id: parsed.eventId },
          data: {
            title: parsed.title,
            slug: uniqueSlug,
            summary: parsed.summary,
            status: parsed.status,
            coverImageId,
            coverImageAlt: nullableString(parsed.coverImageAlt),
            categoryId: nullableString(parsed.categoryId),
            cityId: nullableString(parsed.cityId),
            startsAt: parsed.startsAt,
            endsAt: parsed.endsAt ?? null,
            locationName: nullableString(parsed.locationName),
            address: nullableString(parsed.address),
            format: nullableString(parsed.format),
            capacity: parsed.capacity,
            registrationMode: nullableString(parsed.registrationMode),
            updatedById: user.id,
            ...statusTransitionDates(parsed.status, existingEvent.publishedAt)
          }
        })
    });

    if (previousCoverImageId !== coverImageId) {
      await deleteUploadedFileIfUnused(previousCoverImageId);
    }

    revalidatePath(ADMIN_EVENTS_PATH);
    result = { type: 'success', message: 'Событие обновлено.' };
  } catch (error) {
    await deleteUploadedFileIfUnused(uploadedCoverImageId);
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updateEventStatus(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_EVENTS_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess('events');
    const parsed = statusFormSchema.parse({
      eventId: getString(formData, 'eventId'),
      status: getString(formData, 'status')
    });

    await updateContentStatus({
      status: parsed.status,
      userId: user.id,
      findCurrent: (tx) =>
        tx.event.findUniqueOrThrow({
          where: { id: parsed.eventId },
          select: { publishedAt: true }
        }),
      update: (tx, data) =>
        tx.event.update({
          where: { id: parsed.eventId },
          data
        })
    });

    revalidatePath(ADMIN_EVENTS_PATH);
    result = { type: 'success', message: 'Статус события обновлен.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function deleteEventDraft(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_EVENTS_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    await requireAdminSectionAccess('events');
    const parsed = deleteFormSchema.parse({
      eventId: getString(formData, 'eventId')
    });

    const deletedEvent = await deleteContentDraft({
      findRecord: (tx) =>
        tx.event.findUnique({
          where: {
            id: parsed.eventId
          },
          select: { coverImageId: true }
        }),
      deleteDraft: (tx) =>
        tx.event.deleteMany({
          where: {
            id: parsed.eventId,
            status: ContentStatus.DRAFT
          }
        })
    });

    await deleteUploadedFileIfUnused(deletedEvent.coverImageId);

    revalidatePath(ADMIN_EVENTS_PATH);
    result = { type: 'success', message: 'Событие удалено.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}
