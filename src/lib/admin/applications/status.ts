import { ApplicationStatus } from '@prisma/client';
import {
  canUpdateApplicationBusinessNotes,
  getApplicationStatusUpdate
} from '@/lib/admin/application-transitions';
import { prisma } from '@/lib/db/prisma';
import {
  shouldInvalidateBusinessAccessInvitesOnStatusChange
} from '@/lib/auth/business-access';

export async function updateApplicationStatusById({
  applicationId,
  status,
  userId
}: {
  applicationId: string;
  status: ApplicationStatus;
  userId: string;
}) {
  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    select: {
      type: true,
      status: true,
      vacancyId: true,
      consentAcceptedAt: true
    }
  });

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: applicationId },
      data: getApplicationStatusUpdate({
        application,
        nextStatus: status,
        userId
      })
    });

    if (
      shouldInvalidateBusinessAccessInvitesOnStatusChange({
        applicationType: application.type,
        previousStatus: application.status,
        nextStatus: status
      })
    ) {
      await tx.businessAccessInvite.deleteMany({
        where: {
          applicationId,
          usedAt: null
        }
      });
    }
  });
}

export async function updateApplicationProcessingById({
  applicationId,
  status,
  businessNotes,
  internalNotes,
  userId
}: {
  applicationId: string;
  status: ApplicationStatus;
  businessNotes?: string;
  internalNotes?: string;
  userId: string;
}) {
  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    select: {
      type: true,
      status: true,
      vacancyId: true,
      consentAcceptedAt: true,
      businessAccountId: true
    }
  });
  const businessNotesUpdate = canUpdateApplicationBusinessNotes(application)
    ? { businessNotes: businessNotes ?? null }
    : {};

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: applicationId },
      data: {
        ...getApplicationStatusUpdate({
          application,
          nextStatus: status,
          userId
        }),
        ...businessNotesUpdate,
        internalNotes: internalNotes ?? null
      }
    });

    if (
      shouldInvalidateBusinessAccessInvitesOnStatusChange({
        applicationType: application.type,
        previousStatus: application.status,
        nextStatus: status
      })
    ) {
      await tx.businessAccessInvite.deleteMany({
        where: {
          applicationId,
          usedAt: null
        }
      });
    }
  });
}
