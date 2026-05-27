import {
  ApplicationNotificationChannel,
  ApplicationNotificationStatus,
  type Prisma
} from '@prisma/client';
import {
  hasAdminEmailNotificationConfig,
  hasSmtpNotificationConfig,
  hasTelegramAdminNotificationConfig
} from './application-notification-format.ts';
import type { ApplicationNotificationInput } from './application-notification-dispatch.ts';
import type { AppEnv } from '../validation/env.ts';

const MAX_NOTIFICATION_ATTEMPTS = 5;
const NOTIFICATION_RETRY_BASE_DELAY_MS = 60_000;
const NOTIFICATION_RETRY_MAX_DELAY_MS = 60 * 60 * 1000;

type ApplicationNotificationJob = {
  channel: ApplicationNotificationChannel;
  payload: ApplicationNotificationInput;
};

type ApplicationNotificationTx = Pick<Prisma.TransactionClient, 'applicationNotification'>;

function getNextAttemptAt(attempts: number, now: Date) {
  const delay = Math.min(
    NOTIFICATION_RETRY_BASE_DELAY_MS * 2 ** Math.max(0, attempts - 1),
    NOTIFICATION_RETRY_MAX_DELAY_MS
  );

  return new Date(now.getTime() + delay);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.slice(0, 1000);
  }

  return String(error).slice(0, 1000);
}

export function buildApplicationNotificationJobs(
  input: ApplicationNotificationInput,
  env: Pick<
    AppEnv,
    | 'SMTP_HOST'
    | 'SMTP_PORT'
    | 'SMTP_FROM'
    | 'ADMIN_NOTIFICATION_EMAIL'
    | 'TELEGRAM_BOT_TOKEN'
    | 'TELEGRAM_ADMIN_CHAT_ID'
  >
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
  if (jobs.length === 0) {
    return;
  }

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
  const { prisma } = await import('../db/prisma.ts');
  const now = input.now ?? new Date();
  const logger = input.logger ?? console;
  const notifications = await prisma.applicationNotification.findMany({
    where: {
      ...(input.applicationId ? { applicationId: input.applicationId } : {}),
      status: { in: [ApplicationNotificationStatus.PENDING, ApplicationNotificationStatus.FAILED] },
      attempts: { lt: MAX_NOTIFICATION_ATTEMPTS },
      nextAttemptAt: { lte: now }
    },
    orderBy: { createdAt: 'asc' },
    take: input.limit ?? 20
  });

  for (const notification of notifications) {
    const attempts = notification.attempts + 1;

    try {
      const { sendApplicationNotification } = await import('./application-notifications.ts');

      await sendApplicationNotification(notification.channel, notification.payload as ApplicationNotificationInput);
      await prisma.applicationNotification.update({
        where: { id: notification.id },
        data: {
          attempts,
          status: ApplicationNotificationStatus.SENT,
          sentAt: new Date(),
          lastError: null
        }
      });
    } catch (error) {
      const finalFailure = attempts >= MAX_NOTIFICATION_ATTEMPTS;

      logger.error('Application notification attempt failed.', error);
      await prisma.applicationNotification.update({
        where: { id: notification.id },
        data: {
          attempts,
          status: ApplicationNotificationStatus.FAILED,
          nextAttemptAt: finalFailure ? notification.nextAttemptAt : getNextAttemptAt(attempts, now),
          lastError: getErrorMessage(error)
        }
      });
    }
  }

  return notifications.length;
}

export function dispatchApplicationNotificationQueue(input: {
  applicationId: string;
  logger?: Pick<Console, 'error'>;
}) {
  const logger = input.logger ?? console;

  void processApplicationNotificationQueue({
    applicationId: input.applicationId,
    logger
  }).catch((error: unknown) => {
    logger.error('Application notification queue dispatch failed.', error);
  });
}
