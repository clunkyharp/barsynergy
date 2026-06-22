import type { NotificationTopic } from '@prisma/client';
import { getEnv } from '@/lib/validation/env';
import { sendContentNotificationEmail } from './emails';
import { createEmailUnsubscribeUrl } from './unsubscribe-url';

type PendingOutboxRecord = {
  id: string;
  topic: NotificationTopic;
  contentType: string;
  contentSlug: string;
  title: string;
};

const CONTENT_ROUTES: Record<string, string> = {
  article: '/articles',
  event: '/events',
  vacancy: '/vacancies',
  course: '/education',
  supplier: '/suppliers',
  master: '/masters',
};

const SUBSCRIBER_BATCH_SIZE = 500;

const TOPIC_LABELS: Record<string, string> = {
  EVENTS: 'Новое событие',
  ARTICLES: 'Новый материал',
  VACANCIES: 'Новая вакансия',
  COURSES: 'Новый курс',
  SUPPLIERS: 'Новый поставщик',
  MASTERS: 'Новый мастер',
};

export async function processEmailNotificationQueue(input: {
  limit?: number;
  logger?: Pick<Console, 'error'>;
} = {}): Promise<number> {
  const logger = input.logger ?? console;
  const env = getEnv();

  if (!env.SMTP_HOST) {
    logger.error('SMTP not configured. Skipping email notification queue.');
    return 0;
  }

  const { prisma } = await import('@/lib/db/prisma');
  const limit = input.limit ?? 20;

  const records = await prisma.contentNotificationOutbox.findMany({
    where: { emailSentAt: null },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: { id: true, topic: true, contentType: true, contentSlug: true, title: true },
  }) as unknown as PendingOutboxRecord[];

  if (records.length === 0) return 0;

  for (const record of records) {
    const basePath = CONTENT_ROUTES[record.contentType] ?? '/';
    const contentUrl = `${env.APP_URL}${basePath}/${record.contentSlug}`;
    const topicLabel = TOPIC_LABELS[record.topic] ?? 'Новая публикация';

    // Cursor through subscribers in bounded batches so a large list never
    // loads as one array (memory) and the cron run can't spike per content row.
    let cursor: string | undefined;
    for (;;) {
      const subscribers = await prisma.emailSubscription.findMany({
        where: {
          topics: { has: record.topic },
          confirmedAt: { not: null },
          unsubscribedAt: null,
        },
        select: { id: true, email: true },
        orderBy: { id: 'asc' },
        take: SUBSCRIBER_BATCH_SIZE,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

      if (subscribers.length === 0) break;

      for (const subscriber of subscribers) {
        const unsubscribeUrl = createEmailUnsubscribeUrl(subscriber.id);
        await sendContentNotificationEmail({
          to: subscriber.email,
          title: record.title,
          topicLabel,
          contentUrl,
          unsubscribeUrl,
        }).catch((err: unknown) => {
          logger.error(`Email send failed for ${subscriber.email}: ${err instanceof Error ? err.message : String(err)}`);
        });
      }

      if (subscribers.length < SUBSCRIBER_BATCH_SIZE) break;
      cursor = subscribers[subscribers.length - 1].id;
    }

    await prisma.contentNotificationOutbox.update({
      where: { id: record.id },
      data: { emailSentAt: new Date() },
    });
  }

  return records.length;
}
