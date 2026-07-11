import { ContentStatus, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { dispatchContentNotificationQueue, queueContentNotification } from './outbox';

type ContentInfo = {
  id: string;
  title: string;
  slug: string;
  publishedAt: Date | null;
};

const CONTENT_TYPE_TOPIC: Record<string, string> = {
  article: 'ARTICLES',
  event: 'EVENTS',
  vacancy: 'VACANCIES',
  course: 'COURSES',
  supplier: 'SUPPLIERS',
  master: 'MASTERS',
};

/**
 * Queue a push notification if a content item was published for the first time.
 * Idempotent — uses upsert on (contentType, contentId, topic).
 */
export async function maybeNotifyFirstPublication(
  contentType: string,
  oldStatus: string,
  newStatus: string,
  content: ContentInfo
) {
  const topic = CONTENT_TYPE_TOPIC[contentType];
  if (!topic) return;

  const wasNotPublished = oldStatus !== ContentStatus.PUBLISHED;
  const isNowPublished = newStatus === ContentStatus.PUBLISHED;
  const isFirstPublication = wasNotPublished && isNowPublished && !content.publishedAt;

  if (!isFirstPublication) return;

  await prisma.$transaction((tx) =>
    queueContentNotification(tx as Prisma.TransactionClient, {
      topic,
      contentType,
      contentId: content.id,
      title: content.title,
      contentSlug: content.slug
    })
  );

  dispatchContentNotificationQueue();
}
