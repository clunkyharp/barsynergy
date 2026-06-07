import { canUpdateApplicationBusinessNotes } from '@/lib/admin/application-transitions';
import { prisma } from '@/lib/db/prisma';

export async function updateApplicationInternalNotesById({
  applicationId,
  internalNotes
}: {
  applicationId: string;
  internalNotes?: string;
}) {
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      internalNotes: internalNotes ?? null
    }
  });
}

export async function updateApplicationBusinessNotesById({
  applicationId,
  businessNotes
}: {
  applicationId: string;
  businessNotes?: string;
}) {
  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    select: { businessAccountId: true, status: true }
  });

  if (!canUpdateApplicationBusinessNotes(application)) {
    throw new Error('business notes require linked business account and editable status');
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      businessNotes: businessNotes ?? null
    }
  });
}
