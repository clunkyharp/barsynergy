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
import { revalidateEventPublicPaths } from '@/lib/admin/public-content-revalidation';
import { prisma } from '@/lib/db/prisma';
import { withAdminAction } from '@/lib/server-action-wrappers';
import { maybeNotifyFirstPublication } from '@/lib/notifications/web-push/publish-trigger';

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
  registrationMode: z.string().trim().max(120).optional(),
  registrationUrl: z.string().trim().url().max(500).optional()
});

const statusFormSchema = z.object({
  eventId: z.string().trim().min(1),
  status: z.enum(contentStatusValues)
});

const deleteFormSchema = z.object({
  eventId: z.string().trim().min(1)
});

export async function createEvent(formData: FormData) {
  let uploadedCoverImageId: string | null = null;

  await withAdminAction({
    formData,
    section: 'events',
    defaultRedirectPath: ADMIN_EVENTS_PATH,
    cleanup: () => deleteUploadedFileIfUnused(uploadedCoverImageId),
    handler: async ({ formData, user }) => {
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
        registrationMode: optionalString(getString(formData, 'registrationMode')),
        registrationUrl: optionalString(getString(formData, 'registrationUrl'))
      });
      const slug = slugify(parsed.slug ?? parsed.title);

      if (!slug) throw new Error('Event slug is required.');
      if (parsed.endsAt && parsed.endsAt < parsed.startsAt) throw new Error('Event end date cannot be before start date.');

      await assertActiveContentRelations({ entityName: 'Event', categoryId: parsed.categoryId, categoryType: CategoryType.EVENT, cityId: parsed.cityId });

      const coverImageId = await resolveCoverImageId({ formData, userId: user.id, onUploadedImageId: (fileId) => { uploadedCoverImageId = fileId; } });

      const createdEvent = await persistWithUniqueSlugRetry({
        baseSlug: slug, exists: async (candidate) => Boolean(await prisma.event.findFirst({ where: { slug: candidate }, select: { id: true } })),
        persist: (uniqueSlug) => prisma.event.create({
          data: { title: parsed.title, slug: uniqueSlug, summary: parsed.summary, status: parsed.status, coverImageId, coverImageAlt: nullableString(parsed.coverImageAlt), categoryId: nullableString(parsed.categoryId), cityId: nullableString(parsed.cityId), startsAt: parsed.startsAt, endsAt: parsed.endsAt ?? null, locationName: nullableString(parsed.locationName), address: nullableString(parsed.address), format: nullableString(parsed.format), capacity: parsed.capacity, registrationMode: nullableString(parsed.registrationMode), registrationUrl: nullableString(parsed.registrationUrl), createdById: user.id, updatedById: user.id, ...initialPublicationDates(parsed.status) },
          select: { slug: true, id: true, title: true }
        })
      });

      await maybeNotifyFirstPublication(
        'event',
        ContentStatus.DRAFT,
        parsed.status,
        { id: createdEvent.id, title: createdEvent.title, slug: createdEvent.slug, publishedAt: null }
      );

      revalidatePath(ADMIN_EVENTS_PATH);
      revalidateEventPublicPaths(createdEvent.slug);
      return { type: 'success', message: 'Событие создано.' };
    }
  });
}

export async function updateEvent(formData: FormData) {
  let uploadedCoverImageId: string | null = null;

  await withAdminAction({
    formData,
    section: 'events',
    defaultRedirectPath: ADMIN_EVENTS_PATH,
    cleanup: () => deleteUploadedFileIfUnused(uploadedCoverImageId),
    handler: async ({ formData, user }) => {
      const parsed = eventFormSchema.extend({ eventId: z.string().trim().min(1) }).parse({
        eventId: getString(formData, 'eventId'), title: getString(formData, 'title'),
        slug: optionalString(getString(formData, 'slug')), summary: getString(formData, 'summary'),
        status: getString(formData, 'status') || ContentStatus.DRAFT, coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
        categoryId: optionalString(getString(formData, 'categoryId')), cityId: optionalString(getString(formData, 'cityId')),
        startsAt: getString(formData, 'startsAt'), endsAt: optionalString(getString(formData, 'endsAt')),
        locationName: optionalString(getString(formData, 'locationName')), address: optionalString(getString(formData, 'address')),
        format: optionalString(getString(formData, 'format')), capacity: optionalString(getString(formData, 'capacity')),
        registrationMode: optionalString(getString(formData, 'registrationMode')), registrationUrl: optionalString(getString(formData, 'registrationUrl'))
      });
      const slug = slugify(parsed.slug ?? parsed.title);

      if (!slug) throw new Error('Event slug is required.');
      if (parsed.endsAt && parsed.endsAt < parsed.startsAt) throw new Error('Event end date cannot be before start date.');

      const existingEvent = await prisma.event.findUniqueOrThrow({ where: { id: parsed.eventId }, select: { id: true, coverImageId: true, publishedAt: true, slug: true, title: true, status: true } });
      const previousCoverImageId = existingEvent.coverImageId;

      await assertActiveContentRelations({ entityName: 'Event', categoryId: parsed.categoryId, categoryType: CategoryType.EVENT, cityId: parsed.cityId });

      const coverImageId = await resolveCoverImageId({ formData, userId: user.id, currentCoverImageId: existingEvent.coverImageId, onUploadedImageId: (fileId) => { uploadedCoverImageId = fileId; } });

      const updatedEvent = await persistWithUniqueSlugRetry({
        baseSlug: slug, exists: async (candidate) => Boolean(await prisma.event.findFirst({ where: { slug: candidate, id: { not: parsed.eventId } }, select: { id: true } })),
        persist: (uniqueSlug) => prisma.event.update({
          where: { id: parsed.eventId }, data: { title: parsed.title, slug: uniqueSlug, summary: parsed.summary, status: parsed.status, coverImageId, coverImageAlt: nullableString(parsed.coverImageAlt), categoryId: nullableString(parsed.categoryId), cityId: nullableString(parsed.cityId), startsAt: parsed.startsAt, endsAt: parsed.endsAt ?? null, locationName: nullableString(parsed.locationName), address: nullableString(parsed.address), format: nullableString(parsed.format), capacity: parsed.capacity, registrationMode: nullableString(parsed.registrationMode), registrationUrl: nullableString(parsed.registrationUrl), updatedById: user.id, ...statusTransitionDates(parsed.status, existingEvent.publishedAt) },
          select: { slug: true }
        })
      });

      if (previousCoverImageId !== coverImageId) await deleteUploadedFileIfUnused(previousCoverImageId);

      await maybeNotifyFirstPublication('event', existingEvent.status, parsed.status, existingEvent);

      revalidatePath(ADMIN_EVENTS_PATH);
      revalidateEventPublicPaths(updatedEvent.slug, existingEvent.slug);
      return { type: 'success', message: 'Событие обновлено.' };
    }
  });
}

export async function updateEventStatus(formData: FormData) {
  await withAdminAction({
    formData,
    section: 'events',
    defaultRedirectPath: ADMIN_EVENTS_PATH,
    handler: async ({ user }) => {
      const parsed = statusFormSchema.parse({ eventId: getString(formData, 'eventId'), status: getString(formData, 'status') });

      const existing = await prisma.event.findUniqueOrThrow({ where: { id: parsed.eventId }, select: { id: true, slug: true, title: true, publishedAt: true, status: true } });

      await updateContentStatus({ status: parsed.status, userId: user.id, findCurrent: (tx) => tx.event.findUniqueOrThrow({ where: { id: parsed.eventId }, select: { publishedAt: true } }), update: (tx, data) => tx.event.update({ where: { id: parsed.eventId }, data }) });

      await maybeNotifyFirstPublication('event', existing.status, parsed.status, existing);

      revalidatePath(ADMIN_EVENTS_PATH);
      revalidateEventPublicPaths(existing.slug);
      return { type: 'success', message: 'Статус события обновлён.' };
    }
  });
}

export async function deleteEventDraft(formData: FormData) {
  await withAdminAction({
    formData,
    section: 'events',
    defaultRedirectPath: ADMIN_EVENTS_PATH,
    handler: async () => {
      const parsed = deleteFormSchema.parse({ eventId: getString(formData, 'eventId') });

      const deletedEvent = await deleteContentDraft({ findRecord: (tx) => tx.event.findUnique({ where: { id: parsed.eventId }, select: { coverImageId: true } }), deleteDraft: (tx) => tx.event.deleteMany({ where: { id: parsed.eventId, status: ContentStatus.DRAFT } }) });

      await deleteUploadedFileIfUnused(deletedEvent.coverImageId);

      revalidatePath(ADMIN_EVENTS_PATH);
      return { type: 'success', message: 'Событие удалено.' };
    }
  });
}
