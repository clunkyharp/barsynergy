import { ApplicationNotificationChannel, ApplicationNotificationStatus, type Prisma } from '@prisma/client';
import {
  hasAdminEmailNotificationConfig, hasSmtpNotificationConfig, hasTelegramAdminNotificationConfig
} from './application-notification-format.ts';
import type { ApplicationNotificationInput } from './application-notification-dispatch.ts';
import type { AppEnv } from '../validation/env.ts';
import { getErrorMessage, getNextAttemptAt, processNotificationQueue } from './process-queue.ts';

const MAX_NOTIFICATION_ATTEMPTS = 5;
const NOTIFICATION_RETRY_BASE_DELAY_MS = 60_000;
const NOTIFICATION_RETRY_MAX_DELAY_MS = 60 * 60 * 1000;

type ApplicationNotificationJob = {
  channel: ApplicationNotificationChannel;
  payload: ApplicationNotificationInput;
};

type ApplicationNotificationTx = Pick<Prisma.TransactionClient, 'applicationNotification'>;

export function buildApplicationNotificationJobs(
  input: ApplicationNotificationInput,
  env: Pick<AppEnv, 'SMTP_HOST' | 'SMTP_PORT' | 'SMTP_FROM' | 'ADMIN_NOTIFICATION_EMAIL' | 'TELEGRAM_BOT_TOKEN' | 'TELEGRAM_ADMIN_CHAT_ID'>
): ApplicationNotificationJob[] {
  const jobs: ApplicationNotificationJob[] = [];

  if (hasTelegramAdminNotificationConfig(env)) {
    jobs.push({ channel: ApplicationNotificationChannel.ADMIN_TELEGRAM, payload: input });
  }
  if (hasAdminEmailNotificationConfig(env)) {
    jobs.push({ channel: ApplicationNotificationChannel.ADMIN_EMAIL, payload: input });
  }
  if (input.userEmail && hasSmtpNotificationConfig(env)) {
    jobs.push({ channel: ApplicationNotificationChannel.USER_EMAIL, payload: input });
  }

  return jobs;
}

export async function queueApplicationNotifications(
  tx: ApplicationNotificationTx,
  applicationId: string,
  jobs: ApplicationNotificationJob[]
) {
  if (jobs.length === 0) return;
  await tx.applicationNotification.createMany({
    data: jobs.map((job) => ({
      applicationId,
      channel: job.channel,
      payload: job.payload as Prisma.InputJsonValue
    }))
  });
}

export async function processApplicationNotificationQueue(input: {
  applicationId?: string;
  limit?: number;
  now?: Date;
  logger?: Pick<Console, 'error'>;
} = {}) {
  return processNotificationQueue({
    maxAttempts: MAX_NOTIFICATION_ATTEMPTS,
    retryBaseDelayMs: NOTIFICATION_RETRY_BASE_DELAY_MS,
    retryMaxDelayMs: NOTIFICATION_RETRY_MAX_DELAY_MS,
    limit: input.limit,
    logger: input.logger,

    findPending: async (now, limit) => {
      const { prisma } = await import('../db/prisma.ts');
      return prisma.applicationNotification.findMany({
        where: {
          ...(input.applicationId ? { applicationId: input.applicationId } : {}),
          status: { in: [ApplicationNotificationStatus.PENDING, ApplicationNotificationStatus.FAILED] },
          attempts: { lt: MAX_NOTIFICATION_ATTEMPTS },
          nextAttemptAt: { lte: now }
        },
        orderBy: { createdAt: 'asc' },
        take: limit
      }) as unknown as Array<{ id: string; attempts: number; nextAttemptAt: Date }>;
    },

    send: async (record) => {
      const { sendApplicationNotification } = await import('./application-notifications.ts');
      const notification = record as unknown as {
        channel: ApplicationNotificationChannel;
        payload: ApplicationNotificationInput;
      };
      await sendApplicationNotification(notification.channel, notification.payload);
    },

    onSuccess: async (record, attempts) => {
      const { prisma } = await import('../db/prisma.ts');
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
      const { prisma } = await import('../db/prisma.ts');
      const finalFailure = attempts >= MAX_NOTIFICATION_ATTEMPTS;
      await prisma.applicationNotification.update({
        where: { id: record.id },
        data: {
          attempts,
          status: ApplicationNotificationStatus.FAILED,
          nextAttemptAt: finalFailure ? record.nextAttemptAt : getNextAttemptAt(attempts, now, NOTIFICATION_RETRY_BASE_DELAY_MS, NOTIFICATION_RETRY_MAX_DELAY_MS),
          lastError: getErrorMessage(error)
        }
      });
    }
  });
}

export function dispatchApplicationNotificationQueue(input: {
  applicationId: string;
  logger?: Pick<Console, 'error'>;
}) {
  if (process.env.NEXT_RUNTIME === 'edge') {
    const edgeLogger = input.logger ?? console;
    edgeLogger.error('Application notification queue dispatch is not supported in edge runtime.');
    return;
  }

  const logger = input.logger ?? console;
  void processApplicationNotificationQueue({
    applicationId: input.applicationId,
    logger
  }).catch((error: unknown) => {
    logger.error('Application notification queue dispatch failed.', error);
  });
}
