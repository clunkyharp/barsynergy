import { ContentNotificationOutboxStatus, type Prisma } from '@prisma/client';
import { getErrorMessage, getNextAttemptAt, processNotificationQueue } from '@/lib/notifications/process-queue';
import { hasWebPushConfig } from './vapid-keys';
import { getUserIdsWithEnabledTopic, getActiveSubscriptions, disableSubscriptionsByEndpoints } from './subscriptions';
import { sendPushNotification } from './send';

const MAX_ATTEMPTS = 5;
const RETRY_BASE_DELAY_MS = 60_000;
const RETRY_MAX_DELAY_MS = 60 * 60 * 1000;

type OutboxRecord = {
  id: string;
  topic: string;
  contentType: string;
  contentId: string;
  title: string;
  contentSlug: string;
  attempts: number;
  nextAttemptAt: Date;
};

export async function queueContentNotification(
  tx: Prisma.TransactionClient,
  input: {
    topic: string;
    contentType: string;
    contentId: string;
    title: string;
    contentSlug: string;
  }
) {
  await tx.contentNotificationOutbox.upsert({
    where: {
      contentType_contentId_topic: {
        contentType: input.contentType,
        contentId: input.contentId,
        topic: input.topic as never,
      },
    },
    update: {
      title: input.title,
      contentSlug: input.contentSlug,
      status: ContentNotificationOutboxStatus.PENDING,
      attempts: 0,
      nextAttemptAt: new Date(),
      lastError: null,
      sentAt: null,
    },
    create: {
      topic: input.topic as never,
      contentType: input.contentType,
      contentId: input.contentId,
      title: input.title,
      contentSlug: input.contentSlug,
      payload: {},
    },
  });
}

export async function processContentNotificationQueue(
  input: {
    topic?: string;
    limit?: number;
    now?: Date;
    logger?: Pick<Console, 'error'>;
  } = {}
) {
  if (!hasWebPushConfig()) {
    const logger = input.logger ?? console;
    logger.error('Web Push is not configured. Skipping content notification queue.');
    return 0;
  }

  return processNotificationQueue({
    maxAttempts: MAX_ATTEMPTS,
    retryBaseDelayMs: RETRY_BASE_DELAY_MS,
    retryMaxDelayMs: RETRY_MAX_DELAY_MS,
    limit: input.limit,
    logger: input.logger,

    findPending: async (now, limit) => {
      const { prisma } = await import('@/lib/db/prisma');
      return prisma.contentNotificationOutbox.findMany({
        where: {
          ...(input.topic ? { topic: input.topic as never } : {}),
          status: { in: [ContentNotificationOutboxStatus.PENDING, ContentNotificationOutboxStatus.FAILED] },
          attempts: { lt: MAX_ATTEMPTS },
          nextAttemptAt: { lte: now },
        },
        orderBy: { createdAt: 'asc' },
        take: limit,
      }) as unknown as OutboxRecord[];
    },

    send: async (record) => {
      const outbox = record as unknown as OutboxRecord;
      const userIds = await getUserIdsWithEnabledTopic(outbox.topic);

      if (userIds.length === 0) return;

      let totalAttempts = 0;
      let totalFailures = 0;
      const goneEndpoints: string[] = [];

      for (const userId of userIds) {
        const subscriptions = await getActiveSubscriptions(userId);

        for (const sub of subscriptions) {
          totalAttempts++;
          try {
            const url = getContentUrl(outbox.contentType, outbox.contentSlug);
            await sendPushNotification({
              subscription: { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              title: outbox.title,
              body: getTopicLabel(outbox.topic),
              url,
            });
          } catch (error: unknown) {
            totalFailures++;
            if (isSubscriptionGone(error)) {
              goneEndpoints.push(sub.endpoint);
            }
          }
        }
      }

      if (goneEndpoints.length > 0) {
        await disableSubscriptionsByEndpoints(goneEndpoints);
      }

      if (totalAttempts > 0 && totalFailures === totalAttempts) {
        throw new Error(`All push attempts failed (${totalFailures}/${totalAttempts})`);
      }
    },

    onSuccess: async (record, attempts) => {
      const { prisma } = await import('@/lib/db/prisma');
      await prisma.contentNotificationOutbox.update({
        where: { id: record.id },
        data: {
          attempts,
          status: ContentNotificationOutboxStatus.SENT,
          sentAt: new Date(),
          lastError: null,
        },
      });
    },

    onFailure: async (record, attempts, error, now) => {
      const { prisma } = await import('@/lib/db/prisma');
      const finalFailure = attempts >= MAX_ATTEMPTS;

      await prisma.contentNotificationOutbox.update({
        where: { id: record.id },
        data: {
          attempts,
          status: ContentNotificationOutboxStatus.FAILED,
          nextAttemptAt: finalFailure ? record.nextAttemptAt : getNextAttemptAt(attempts, now, RETRY_BASE_DELAY_MS, RETRY_MAX_DELAY_MS),
          lastError: getErrorMessage(error),
        },
      });
    },
  });
}

export function dispatchContentNotificationQueue(input: {
  logger?: Pick<Console, 'error'>;
}) {
  if (process.env.NEXT_RUNTIME === 'edge') {
    const logger = input.logger ?? console;
    logger.error('Content notification queue dispatch is not supported in edge runtime.');
    return;
  }

  void processContentNotificationQueue({ logger: input.logger }).catch((error: unknown) => {
    const logger = input.logger ?? console;
    logger.error('Content notification queue dispatch failed.', error);
  });
}

function getContentUrl(contentType: string, slug: string): string {
  const routes: Record<string, string> = {
    article: '/articles',
    event: '/events',
    vacancy: '/vacancies',
    course: '/education',
    supplier: '/suppliers',
  };
  const base = routes[contentType] || '/';
  return `${base}/${slug}`;
}

function getTopicLabel(topic: string): string {
  const labels: Record<string, string> = {
    EVENTS: 'Новое событие',
    ARTICLES: 'Новый материал',
    VACANCIES: 'Новая вакансия',
    COURSES: 'Новый курс',
    SUPPLIERS: 'Новый поставщик',
  };
  return labels[topic] || 'Новая публикация';
}

function isSubscriptionGone(error: unknown): boolean {
  const msg = getErrorMessage(error).toLowerCase();
  return msg.includes('410') || msg.includes('gone') || msg.includes('404') || msg.includes('not found');
}
