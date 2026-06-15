import { ContentStatus, type Prisma } from '@prisma/client';
import { queueContentNotification } from './outbox';

type PublishableContent = {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: Date | null;
};

type ContentTopicMap = {
  [contentType: string]: string;
};

const CONTENT_TOPIC_MAP: ContentTopicMap = {
  article: 'ARTICLES',
  event: 'EVENTS',
  vacancy: 'VACANCIES',
  course: 'COURSES',
  supplier: 'SUPPLIERS',
  master: 'MASTERS',
};

function getTopic(contentType: string): string | null {
  return CONTENT_TOPIC_MAP[contentType] ?? null;
}

/**
 * Queue a push notification for a content item only when it transitions
 * to PUBLISHED for the first time (i.e., old status was not PUBLISHED
 * and new status is PUBLISHED and publishedAt was previously null).
 */
export async function queueContentPublishedNotification(
  tx: Prisma.TransactionClient,
  contentType: string,
  oldStatus: string,
  record: PublishableContent
) {
  const topic = getTopic(contentType);

  if (!topic) return;

  const wasNotPublished = oldStatus !== ContentStatus.PUBLISHED;
  const isNowPublished = record.status === ContentStatus.PUBLISHED;
  const isFirstPublication = wasNotPublished && isNowPublished && !record.publishedAt;

  if (!isFirstPublication) return;

  await queueContentNotification(tx, {
    topic,
    contentType,
    contentId: record.id,
    title: record.title,
    contentSlug: record.slug,
  });
}
