import { prisma } from '@/lib/db/prisma';

export type TopicPreference = {
  topic: string;
  enabled: boolean;
};

export async function getNotificationPreferences(userId: string): Promise<TopicPreference[]> {
  const prefs = await prisma.userNotificationPreference.findMany({
    where: { userId },
    select: { topic: true, enabled: true },
  });
  return prefs.map((p) => ({ topic: p.topic as string, enabled: p.enabled }));
}

export async function setNotificationPreferences(userId: string, topics: TopicPreference[]) {
  await prisma.$transaction(async (tx) => {
    for (const { topic, enabled } of topics) {
      await tx.userNotificationPreference.upsert({
        where: {
          userId_topic: { userId, topic: topic as never },
        },
        update: { enabled },
        create: { userId, topic: topic as never, enabled },
      });
    }
  });
}
