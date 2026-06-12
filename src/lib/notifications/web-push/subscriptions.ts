import { prisma } from '@/lib/db/prisma';

type PushSubscriptionData = {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
};

export async function saveSubscription(userId: string, data: PushSubscriptionData) {
  await prisma.webPushSubscription.upsert({
    where: {
      userId_endpoint: { userId, endpoint: data.endpoint },
    },
    update: {
      p256dh: data.p256dh,
      auth: data.auth,
      userAgent: data.userAgent,
      lastSeenAt: new Date(),
      disabledAt: null,
    },
    create: {
      userId,
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      userAgent: data.userAgent,
    },
  });
}

export async function getActiveSubscriptions(userId: string) {
  return prisma.webPushSubscription.findMany({
    where: { userId, disabledAt: null },
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
      lastSeenAt: true,
    },
  });
}

export async function disableSubscription(id: string, userId: string) {
  await prisma.webPushSubscription.updateMany({
    where: { id, userId },
    data: { disabledAt: new Date() },
  });
}

// Server-side cleanup: called by outbox worker when push service returns 410 Gone.
// No userId filter — endpoint uniqueness is guaranteed by the push service.
export async function disableSubscriptionsByEndpoints(endpoints: string[]) {
  await prisma.webPushSubscription.updateMany({
    where: { endpoint: { in: endpoints } },
    data: { disabledAt: new Date() },
  });
}

// User-initiated unsubscribe: scoped to the authenticated user's own subscriptions.
export async function disableUserSubscriptionByEndpoint(userId: string, endpoint: string) {
  await prisma.webPushSubscription.updateMany({
    where: { userId, endpoint },
    data: { disabledAt: new Date() },
  });
}

export async function getUserIdsWithEnabledTopic(topic: string) {
  const subs = await prisma.webPushSubscription.findMany({
    where: { disabledAt: null },
    select: { userId: true },
    distinct: ['userId'],
  });

  if (subs.length === 0) return [];

  const userIds = subs.map((s) => s.userId);

  const disabledPrefs = await prisma.userNotificationPreference.findMany({
    where: {
      userId: { in: userIds },
      topic: topic as never,
      enabled: false,
    },
    select: { userId: true },
  });

  const disabledUserIds = new Set(disabledPrefs.map((p) => p.userId));
  return userIds.filter((id) => !disabledUserIds.has(id));
}
