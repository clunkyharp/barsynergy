'use server';

import { revalidatePath } from 'next/cache';
import { ContentStatus } from '@prisma/client';
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
import { revalidateGeneralSponsorPublicPaths } from '@/lib/admin/public-content-revalidation';
import { prisma } from '@/lib/db/prisma';
import { withAdminAction } from '@/lib/server-action-wrappers';
import { normalizeExternalUrlInput } from '@/lib/validation/external-url';

const ADMIN_GENERAL_SPONSORS_PATH = '/admin/general-sponsors';

const generalSponsorFormSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(180).optional(),
  status: z.enum(contentStatusValues).default(ContentStatus.DRAFT),
  logoImageAlt: z.string().trim().max(180).optional(),
  logoPath: z.string().trim().max(500).optional(),
  coverImageAlt: z.string().trim().max(180).optional(),
  coverImagePath: z.string().trim().max(500).optional(),
  shortDescription: z.string().trim().min(10).max(500),
  fullDescription: z.string().trim().min(20).max(4000),
  seasonLabel: z.string().trim().max(160).optional(),
  priority: z.coerce.number().int().min(0).max(100_000).default(0),
  isFeatured: z.boolean().default(false),
  websiteUrl: z.string().trim().max(500).optional(),
  instagramUrl: z.string().trim().max(500).optional(),
  whatsappUrl: z.string().trim().max(500).optional(),
  telegramUrl: z.string().trim().max(500).optional(),
  contactName: z.string().trim().max(240).optional(),
  contactPhone: z.string().trim().max(240).optional(),
  contactEmail: z.string().trim().email().max(240).optional(),
  representedBrands: z.string().trim().max(2000).optional(),
  benefitsForVenues: z.string().trim().max(2000).optional(),
  cityId: z.string().trim().optional()
});

const statusFormSchema = z.object({
  sponsorId: z.string().trim().min(1),
  status: z.enum(contentStatusValues)
});

const deleteFormSchema = z.object({
  sponsorId: z.string().trim().min(1)
});

function normalizePublicAssetPath(value?: string) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('..')) {
    throw new Error('public asset path is invalid');
  }

  return trimmed;
}

function readGeneralSponsorForm(formData: FormData) {
  const parsed = generalSponsorFormSchema.parse({
    name: getString(formData, 'name'),
    slug: optionalString(getString(formData, 'slug')),
    status: getString(formData, 'status') || ContentStatus.DRAFT,
    logoImageAlt: optionalString(getString(formData, 'logoImageAlt')),
    logoPath: optionalString(getString(formData, 'logoPath')),
    coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
    coverImagePath: optionalString(getString(formData, 'coverImagePath')),
    shortDescription: getString(formData, 'shortDescription'),
    fullDescription: getString(formData, 'fullDescription'),
    seasonLabel: optionalString(getString(formData, 'seasonLabel')),
    priority: getString(formData, 'priority') || '0',
    isFeatured: getString(formData, 'isFeatured') === 'true',
    websiteUrl: optionalString(getString(formData, 'websiteUrl')),
    instagramUrl: optionalString(getString(formData, 'instagramUrl')),
    whatsappUrl: optionalString(getString(formData, 'whatsappUrl')),
    telegramUrl: optionalString(getString(formData, 'telegramUrl')),
    contactName: optionalString(getString(formData, 'contactName')),
    contactPhone: optionalString(getString(formData, 'contactPhone')),
    contactEmail: optionalString(getString(formData, 'contactEmail')),
    representedBrands: optionalString(getString(formData, 'representedBrands')),
    benefitsForVenues: optionalString(getString(formData, 'benefitsForVenues')),
    cityId: optionalString(getString(formData, 'cityId'))
  });

  return {
    ...parsed,
    logoPath: normalizePublicAssetPath(parsed.logoPath),
    coverImagePath: normalizePublicAssetPath(parsed.coverImagePath),
    websiteUrl: normalizeExternalUrlInput(parsed.websiteUrl),
    instagramUrl: normalizeExternalUrlInput(parsed.instagramUrl),
    whatsappUrl: normalizeExternalUrlInput(parsed.whatsappUrl),
    telegramUrl: normalizeExternalUrlInput(parsed.telegramUrl)
  };
}

function revalidateGeneralSponsorPaths() {
  revalidatePath(ADMIN_GENERAL_SPONSORS_PATH);
  revalidateGeneralSponsorPublicPaths();
}

export async function createGeneralSponsor(formData: FormData) {
  let uploadedLogoImageId: string | null = null;
  let uploadedCoverImageId: string | null = null;

  await withAdminAction({
    formData,
    section: 'generalSponsors',
    defaultRedirectPath: ADMIN_GENERAL_SPONSORS_PATH,
    cleanup: () => Promise.all([deleteUploadedFileIfUnused(uploadedLogoImageId), deleteUploadedFileIfUnused(uploadedCoverImageId)]),
    handler: async ({ formData, user }) => {
      const parsed = readGeneralSponsorForm(formData);
      const slug = slugify(parsed.slug ?? parsed.name);
      if (!slug) throw new Error('GeneralSponsor slug is required.');

      await assertActiveContentRelations({ entityName: 'GeneralSponsor', cityId: parsed.cityId });

      const [logoImageId, coverImageId] = await Promise.all([
        resolveCoverImageId({ formData, userId: user.id, formDataKey: 'logoImage', removeFormDataKey: 'removeLogoImage', onUploadedImageId: (fileId) => { uploadedLogoImageId = fileId; } }),
        resolveCoverImageId({ formData, userId: user.id, formDataKey: 'coverImage', onUploadedImageId: (fileId) => { uploadedCoverImageId = fileId; } })
      ]);

      await persistWithUniqueSlugRetry({
        baseSlug: slug, exists: async (candidate) => Boolean(await prisma.generalSponsor.findFirst({ where: { slug: candidate }, select: { id: true } })),
        persist: (uniqueSlug) => prisma.generalSponsor.create({
          data: { name: parsed.name, slug: uniqueSlug, status: parsed.status, logoImageId, logoImageAlt: nullableString(parsed.logoImageAlt), logoPath: nullableString(parsed.logoPath), coverImageId, coverImageAlt: nullableString(parsed.coverImageAlt), coverImagePath: nullableString(parsed.coverImagePath), shortDescription: parsed.shortDescription, fullDescription: parsed.fullDescription, seasonLabel: nullableString(parsed.seasonLabel), priority: parsed.priority, isFeatured: parsed.isFeatured, websiteUrl: nullableString(parsed.websiteUrl), instagramUrl: nullableString(parsed.instagramUrl), whatsappUrl: nullableString(parsed.whatsappUrl), telegramUrl: nullableString(parsed.telegramUrl), contactName: nullableString(parsed.contactName), contactPhone: nullableString(parsed.contactPhone), contactEmail: nullableString(parsed.contactEmail), representedBrands: nullableString(parsed.representedBrands), benefitsForVenues: nullableString(parsed.benefitsForVenues), cityId: nullableString(parsed.cityId), createdById: user.id, updatedById: user.id, ...initialPublicationDates(parsed.status) }
        })
      });

      revalidateGeneralSponsorPaths();
      return { type: 'success', message: 'Генеральный спонсор создан.' };
    }
  });
}

export async function updateGeneralSponsor(formData: FormData) {
  let uploadedLogoImageId: string | null = null;
  let uploadedCoverImageId: string | null = null;

  await withAdminAction({
    formData,
    section: 'generalSponsors',
    defaultRedirectPath: ADMIN_GENERAL_SPONSORS_PATH,
    cleanup: () => Promise.all([deleteUploadedFileIfUnused(uploadedLogoImageId), deleteUploadedFileIfUnused(uploadedCoverImageId)]),
    handler: async ({ formData, user }) => {
      const sponsorId = getString(formData, 'sponsorId');
      const parsed = generalSponsorFormSchema.extend({ sponsorId: z.string().trim().min(1) }).parse({
        ...readGeneralSponsorForm(formData), sponsorId
      });
      const slug = slugify(parsed.slug ?? parsed.name);
      if (!slug) throw new Error('GeneralSponsor slug is required.');

      const existingSponsor = await prisma.generalSponsor.findUniqueOrThrow({ where: { id: parsed.sponsorId }, select: { logoImageId: true, coverImageId: true, publishedAt: true } });
      const previousLogoImageId = existingSponsor.logoImageId;
      const previousCoverImageId = existingSponsor.coverImageId;

      await assertActiveContentRelations({ entityName: 'GeneralSponsor', cityId: parsed.cityId });

      const [logoImageId, coverImageId] = await Promise.all([
        resolveCoverImageId({ formData, userId: user.id, currentCoverImageId: existingSponsor.logoImageId, formDataKey: 'logoImage', removeFormDataKey: 'removeLogoImage', onUploadedImageId: (fileId) => { uploadedLogoImageId = fileId; } }),
        resolveCoverImageId({ formData, userId: user.id, currentCoverImageId: existingSponsor.coverImageId, formDataKey: 'coverImage', onUploadedImageId: (fileId) => { uploadedCoverImageId = fileId; } })
      ]);

      await persistWithUniqueSlugRetry({
        baseSlug: slug, exists: async (candidate) => Boolean(await prisma.generalSponsor.findFirst({ where: { slug: candidate, id: { not: parsed.sponsorId } }, select: { id: true } })),
        persist: (uniqueSlug) => prisma.generalSponsor.update({
          where: { id: parsed.sponsorId }, data: { name: parsed.name, slug: uniqueSlug, status: parsed.status, logoImageId, logoImageAlt: nullableString(parsed.logoImageAlt), logoPath: nullableString(normalizePublicAssetPath(parsed.logoPath)), coverImageId, coverImageAlt: nullableString(parsed.coverImageAlt), coverImagePath: nullableString(normalizePublicAssetPath(parsed.coverImagePath)), shortDescription: parsed.shortDescription, fullDescription: parsed.fullDescription, seasonLabel: nullableString(parsed.seasonLabel), priority: parsed.priority, isFeatured: parsed.isFeatured, websiteUrl: nullableString(normalizeExternalUrlInput(parsed.websiteUrl)), instagramUrl: nullableString(normalizeExternalUrlInput(parsed.instagramUrl)), whatsappUrl: nullableString(normalizeExternalUrlInput(parsed.whatsappUrl)), telegramUrl: nullableString(normalizeExternalUrlInput(parsed.telegramUrl)), contactName: nullableString(parsed.contactName), contactPhone: nullableString(parsed.contactPhone), contactEmail: nullableString(parsed.contactEmail), representedBrands: nullableString(parsed.representedBrands), benefitsForVenues: nullableString(parsed.benefitsForVenues), cityId: nullableString(parsed.cityId), updatedById: user.id, ...statusTransitionDates(parsed.status, existingSponsor.publishedAt) }
        })
      });

      await Promise.all([previousLogoImageId !== logoImageId ? deleteUploadedFileIfUnused(previousLogoImageId) : Promise.resolve(), previousCoverImageId !== coverImageId ? deleteUploadedFileIfUnused(previousCoverImageId) : Promise.resolve()]);

      revalidateGeneralSponsorPaths();
      revalidatePath(`${ADMIN_GENERAL_SPONSORS_PATH}/${parsed.sponsorId}/edit`);
      return { type: 'success', message: 'Генеральный спонсор обновлён.' };
    }
  });
}

export async function updateGeneralSponsorStatus(formData: FormData) {
  await withAdminAction({
    formData,
    section: 'generalSponsors',
    defaultRedirectPath: ADMIN_GENERAL_SPONSORS_PATH,
    handler: async ({ user }) => {
      const parsed = statusFormSchema.parse({ sponsorId: getString(formData, 'sponsorId'), status: getString(formData, 'status') });

      await updateContentStatus({ status: parsed.status, userId: user.id, findCurrent: (tx) => tx.generalSponsor.findUniqueOrThrow({ where: { id: parsed.sponsorId }, select: { publishedAt: true } }), update: (tx, data) => tx.generalSponsor.update({ where: { id: parsed.sponsorId }, data }) });

      revalidateGeneralSponsorPaths();
      return { type: 'success', message: 'Статус генерального спонсора обновлён.' };
    }
  });
}

export async function deleteGeneralSponsorDraft(formData: FormData) {
  await withAdminAction({
    formData,
    section: 'generalSponsors',
    defaultRedirectPath: ADMIN_GENERAL_SPONSORS_PATH,
    handler: async () => {
      const parsed = deleteFormSchema.parse({ sponsorId: getString(formData, 'sponsorId') });

      const deletedSponsor = await deleteContentDraft({ findRecord: (tx) => tx.generalSponsor.findUnique({ where: { id: parsed.sponsorId }, select: { logoImageId: true, coverImageId: true } }), deleteDraft: (tx) => tx.generalSponsor.deleteMany({ where: { id: parsed.sponsorId, status: ContentStatus.DRAFT } }) });

      await Promise.all([deleteUploadedFileIfUnused(deletedSponsor.logoImageId), deleteUploadedFileIfUnused(deletedSponsor.coverImageId)]);

      revalidateGeneralSponsorPaths();
      return { type: 'success', message: 'Генеральный спонсор удалён.' };
    }
  });
}
