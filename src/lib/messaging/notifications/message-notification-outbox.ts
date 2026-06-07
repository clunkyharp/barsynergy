import { ApplicationNotificationChannel, ApplicationNotificationStatus, ConversationSender, type Prisma } from '@prisma/client';
import { getErrorMessage, getNextAttemptAt, processNotificationQueue } from '@/lib/notifications/process-queue';

const MAX_MESSAGE_NOTIFICATION_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 60_000;
const RETRY_MAX_DELAY_MS = 30 * 60 * 1000;

type MessageNotificationJob = {
  channel: ApplicationNotificationChannel;
  payload: {
    applicationId: string;
    senderRole: ConversationSender;
    recipientEmail: string;
    recipientName: string | null;
    senderName: string;
    contextLabel: string;
    threadUrl: string;
  };
};

type MessageNotificationTx = Pick<Prisma.TransactionClient, 'applicationNotification'>;

export async function queueMessageNotifications(
  tx: MessageNotificationTx,
  jobs: MessageNotificationJob[]
) {
  if (jobs.length === 0) return;
  await tx.applicationNotification.createMany({
    data: jobs.map((job) => ({
      applicationId: job.payload.applicationId,
      channel: job.channel,
      payload: job.payload as Prisma.InputJsonValue
    }))
  });
}

export async function processMessageNotificationQueue(input: {
  applicationId?: string;
  limit?: number;
  now?: Date;
  logger?: Pick<Console, 'error'>;
} = {}) {
  return processNotificationQueue({
    maxAttempts: MAX_MESSAGE_NOTIFICATION_ATTEMPTS,
    retryBaseDelayMs: RETRY_BASE_DELAY_MS,
    retryMaxDelayMs: RETRY_MAX_DELAY_MS,
    limit: input.limit,
    logger: input.logger,

    findPending: async (now, limit) => {
      const { prisma } = await import('@/lib/db/prisma');
      return prisma.applicationNotification.findMany({
        where: {
          ...(input.applicationId ? { applicationId: input.applicationId } : {}),
          channel: {
            in: [
              ApplicationNotificationChannel.USER_MESSAGE_EMAIL,
              ApplicationNotificationChannel.BUSINESS_MESSAGE_EMAIL
            ]
          },
          status: { in: [ApplicationNotificationStatus.PENDING, ApplicationNotificationStatus.FAILED] },
          attempts: { lt: MAX_MESSAGE_NOTIFICATION_ATTEMPTS },
          nextAttemptAt: { lte: now }
        },
        orderBy: { createdAt: 'asc' },
        take: limit
      }) as unknown as Array<{ id: string; attempts: number; nextAttemptAt: Date }>;
    },

    send: async (record) => {
      const { sendMessageEmailNotification } = await import('./message-email.ts');
      const notification = record as unknown as {
        channel: ApplicationNotificationChannel;
        payload: MessageNotificationJob['payload'];
      };
      await sendMessageEmailNotification(notification.channel, notification.payload);
    },

    onSuccess: async (record, attempts) => {
      const { prisma } = await import('@/lib/db/prisma');
      await prisma.applicationNotification.update({
        where: { id: record.id },
        data: {
          attempts,
          status: ApplicationNotificationStatus.SENT,
          sentAt: new Date(),
          lastError: null
        }
      });
    },

    onFailure: async (record, attempts, error, now) => {
      const { prisma } = await import('@/lib/db/prisma');
      const finalFailure = attempts >= MAX_MESSAGE_NOTIFICATION_ATTEMPTS;
      await prisma.applicationNotification.update({
        where: { id: record.id },
        data: {
          attempts,
          status: ApplicationNotificationStatus.FAILED,
          nextAttemptAt: finalFailure
            ? record.nextAttemptAt
            : getNextAttemptAt(attempts, now, RETRY_BASE_DELAY_MS, RETRY_MAX_DELAY_MS),
          lastError: getErrorMessage(error)
        }
      });
    }
  });
}

export function dispatchMessageNotificationQueue(input: {
  applicationId: string;
  logger?: Pick<Console, 'error'>;
}) {
  if (process.env.NEXT_RUNTIME === 'edge') return;

  const logger = input.logger ?? console;
  void processMessageNotificationQueue({
    applicationId: input.applicationId,
    logger
  }).catch((error: unknown) => {
    logger.error('Message notification queue dispatch failed.', error);
  });
}
