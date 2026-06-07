import { processApplicationNotificationQueue } from '../src/lib/notifications/application-notification-outbox.ts';
import { prisma } from '../src/lib/db/prisma.ts';

try {
  const processed = await processApplicationNotificationQueue();
  console.log(`Processed application notifications: ${processed}`);
} finally {
  await prisma.$disconnect();
}
