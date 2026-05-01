import { PrismaClient } from '@prisma/client';

const THROTTLE_RETENTION_HOURS = 48;

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

async function main() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - THROTTLE_RETENTION_HOURS * 60 * 60 * 1000);
  const result = await prisma.authAttemptThrottle.deleteMany({
    where: {
      updatedAt: {
        lt: cutoff
      }
    }
  });

  console.log(
    `[auth-throttle-cleanup] Deleted ${result.count} stale throttle record(s) older than ${cutoff.toISOString()}`
  );
}

main()
  .catch((error) => {
    console.error('[auth-throttle-cleanup] Failed to cleanup stale throttle records');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
