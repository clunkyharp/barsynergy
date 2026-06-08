import { ApplicationStatus } from '@prisma/client';
import {
  getPartnerPublicationFieldsFromApplication,
  getSupplierPublicationFieldsFromApplication,
  getVacancyPublicationFieldsFromApplication
} from '@/lib/admin/application-publication';
import {
  appendApplicationInternalNote,
  getVacancyDraftFieldsFromApplication
} from '@/lib/admin/vacancy-application-drafts';
import { persistWithUniqueSlugRetry, slugify } from '@/lib/admin/content-utils';
import { prisma } from '@/lib/db/prisma';

export type ApplicationPublicationTarget = 'vacancy' | 'supplier' | 'partner';

export async function createVacancyDraftFromApplicationId({
  applicationId,
  userId
}: {
  applicationId: string;
  userId: string;
}) {
  await prisma.$transaction(async (tx) => {
    const application = await tx.application.findUniqueOrThrow({
      where: { id: applicationId },
      select: {
        type: true,
        vacancyId: true,
        cityId: true,
        message: true,
        name: true,
        email: true,
        phone: true,
        telegram: true,
        consentAcceptedAt: true,
        payload: true,
        internalNotes: true,
        businessAccountId: true
      }
    });
    const draftFields = getVacancyDraftFieldsFromApplication(application);
    const slug = slugify(`${draftFields.position}-${draftFields.companyName}`);

    if (!slug) {
      throw new Error('vacancy draft requires slug');
    }

    const vacancy = await persistWithUniqueSlugRetry({
      baseSlug: slug,
      exists: async (candidate) =>
        Boolean(
          await tx.vacancy.findFirst({
            where: { slug: candidate },
            select: { id: true }
          })
        ),
      persist: (uniqueSlug) =>
        tx.vacancy.create({
          data: {
            ...draftFields,
            slug: uniqueSlug,
            createdById: userId,
            updatedById: userId,
            businessAccountId: application.businessAccountId
          },
          select: { id: true, title: true, slug: true }
        })
    });

    await tx.application.update({
      where: { id: applicationId },
      data: {
        vacancyId: vacancy.id,
        status: ApplicationStatus.APPROVED,
        internalNotes: appendApplicationInternalNote(
          application.internalNotes,
          `Создан черновик вакансии: ${vacancy.title} (${vacancy.slug}).`
        )
      }
    });
  });
}

export async function publishContentFromApplicationId({
  applicationId,
  target,
  userId
}: {
  applicationId: string;
  target: ApplicationPublicationTarget;
  userId: string;
}) {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const application = await tx.application.findUniqueOrThrow({
      where: { id: applicationId },
      select: {
        type: true,
        status: true,
        vacancyId: true,
        supplierId: true,
        partnerId: true,
        cityId: true,
        message: true,
        name: true,
        email: true,
        phone: true,
        telegram: true,
        consentAcceptedAt: true,
        payload: true,
        internalNotes: true,
        businessAccountId: true
      }
    });

    if (target === 'vacancy') {
      const fields = getVacancyPublicationFieldsFromApplication(application);
      const slug = slugify(`${fields.position}-${fields.companyName}`);

      if (!slug) {
        throw new Error('vacancy publication requires slug');
      }

      const vacancy = await persistWithUniqueSlugRetry({
        baseSlug: slug,
        exists: async (candidate) =>
          Boolean(
            await tx.vacancy.findFirst({
              where: { slug: candidate },
              select: { id: true }
            })
          ),
        persist: (uniqueSlug) =>
          tx.vacancy.create({
            data: {
              ...fields,
              slug: uniqueSlug,
              publishedAt: now,
              archivedAt: null,
              createdById: userId,
              updatedById: userId,
              businessAccountId: application.businessAccountId
            },
            select: { id: true, title: true, slug: true }
          })
      });

      await tx.application.update({
        where: { id: applicationId },
        data: {
          vacancyId: vacancy.id,
          status: ApplicationStatus.APPROVED,
          internalNotes: appendApplicationInternalNote(
            application.internalNotes,
            `Опубликована вакансия: ${vacancy.title} (${vacancy.slug}).`
          )
        }
      });

      return { target, title: vacancy.title };
    }

    if (target === 'supplier') {
      const fields = getSupplierPublicationFieldsFromApplication(application);
      const slug = slugify(fields.title);

      if (!slug) {
        throw new Error('supplier publication requires slug');
      }

      const supplier = await persistWithUniqueSlugRetry({
        baseSlug: slug,
        exists: async (candidate) =>
          Boolean(
            await tx.supplier.findFirst({
              where: { slug: candidate },
              select: { id: true }
            })
          ),
        persist: (uniqueSlug) =>
          tx.supplier.create({
            data: {
              ...fields,
              slug: uniqueSlug,
              publishedAt: now,
              archivedAt: null,
              createdById: userId,
              updatedById: userId
            },
            select: { id: true, title: true, slug: true }
          })
      });

      await tx.application.update({
        where: { id: applicationId },
        data: {
          supplierId: supplier.id,
          status: ApplicationStatus.APPROVED,
          internalNotes: appendApplicationInternalNote(
            application.internalNotes,
            `Опубликован поставщик: ${supplier.title} (${supplier.slug}).`
          )
        }
      });

      return { target, title: supplier.title };
    }

    const fields = getPartnerPublicationFieldsFromApplication(application);
    const slug = slugify(fields.title);

    if (!slug) {
      throw new Error('partner publication requires slug');
    }

    const partner = await persistWithUniqueSlugRetry({
      baseSlug: slug,
      exists: async (candidate) =>
        Boolean(
          await tx.partner.findFirst({
            where: { slug: candidate },
            select: { id: true }
          })
        ),
      persist: (uniqueSlug) =>
        tx.partner.create({
          data: {
            ...fields,
            slug: uniqueSlug,
            publishedAt: now,
            archivedAt: null,
            createdById: userId,
            updatedById: userId
          },
          select: { id: true, title: true, slug: true }
        })
    });

    await tx.application.update({
      where: { id: applicationId },
      data: {
        partnerId: partner.id,
        status: ApplicationStatus.APPROVED,
        internalNotes: appendApplicationInternalNote(
          application.internalNotes,
          `Опубликован партнёр: ${partner.title} (${partner.slug}).`
        )
      }
    });

    return { target, title: partner.title };
  });
}
