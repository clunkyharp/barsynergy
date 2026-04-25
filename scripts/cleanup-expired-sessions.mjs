import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

async function main() {
  const now = new Date();
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: now
      }
    }
  });

  console.log(
    `[session-cleanup] Deleted ${result.count} expired session(s) at ${now.toISOString()}`
  );
}

main()
  .catch((error) => {
    console.error('[session-cleanup] Failed to cleanup expired sessions');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
