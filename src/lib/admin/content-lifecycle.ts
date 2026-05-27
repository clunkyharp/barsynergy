import { ContentStatus, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { statusTransitionDates } from './content-utils';

type TransactionClient = Prisma.TransactionClient;

type ContentStatusUpdateData = {
  archivedAt?: Date | null;
  publishedAt?: Date | null;
  status: ContentStatus;
  updatedById: string;
};

export async function updateContentStatus({
  findCurrent,
  status,
  update,
  userId
}: {
  findCurrent: (tx: TransactionClient) => Promise<{ publishedAt: Date | null }>;
  status: ContentStatus;
  update: (tx: TransactionClient, data: ContentStatusUpdateData) => Promise<unknown>;
  userId: string;
}) {
  await prisma.$transaction(async (tx) => {
    const current = await findCurrent(tx);

    await update(tx, {
      status,
      updatedById: userId,
      ...statusTransitionDates(status, current.publishedAt)
    });
  });
}

export async function deleteContentDraft<DeletedRecord>({
  deleteDraft,
  findRecord
}: {
  deleteDraft: (tx: TransactionClient) => Promise<{ count: number }>;
  findRecord: (tx: TransactionClient) => Promise<DeletedRecord | null>;
}) {
  return prisma.$transaction(async (tx) => {
    const record = await findRecord(tx);

    if (!record) {
      throw new Error('record is invalid');
    }

    const deletion = await deleteDraft(tx);

    if (deletion.count !== 1) {
      throw new Error('record is invalid');
    }

    return record;
  });
}
