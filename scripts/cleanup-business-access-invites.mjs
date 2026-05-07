import { PrismaClient } from '@prisma/client';

const USED_INVITE_RETENTION_HOURS = 48;

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

async function main() {
  const now = new Date();
  const usedInviteCutoff = new Date(now.getTime() - USED_INVITE_RETENTION_HOURS * 60 * 60 * 1000);
  const result = await prisma.businessAccessInvite.deleteMany({
    where: {
      OR: [
        {
          expiresAt: {
            lt: now
          }
        },
        {
          usedAt: {
            not: null,
            lt: usedInviteCutoff
          }
        }
      ]
    }
  });

  console.log(
    `[business-access-invite-cleanup] Deleted ${result.count} stale invite(s); expired before ${now.toISOString()} or used before ${usedInviteCutoff.toISOString()}`
  );
}

main()
  .catch((error) => {
    console.error('[business-access-invite-cleanup] Failed to cleanup stale invites');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
