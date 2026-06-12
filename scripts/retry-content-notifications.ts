import { processContentNotificationQueue } from '../src/lib/notifications/web-push/outbox.ts';
import { prisma } from '../src/lib/db/prisma.ts';

try {
  const processed = await processContentNotificationQueue();
  console.log(`Processed content notifications: ${processed}`);
} finally {
  await prisma.$disconnect();
}
