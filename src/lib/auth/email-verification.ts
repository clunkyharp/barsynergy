import 'server-only';

import { createHash } from 'node:crypto';
import { prisma } from '@/lib/db/prisma';

export type VerifyEmailResult = 'verified' | 'invalid' | 'failed';

export async function verifyUserEmailToken(token: string): Promise<VerifyEmailResult> {
  if (!token) return 'invalid';

  try {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const result = await prisma.$queryRaw<{ id: string }[]>`
      WITH deleted AS (
        DELETE FROM "UserEmailVerificationToken"
        WHERE "tokenHash" = ${tokenHash}
          AND "expiresAt" > NOW()
          AND "usedAt" IS NULL
        RETURNING "userId"
      ),
      activated AS (
        UPDATE "User"
        SET "emailVerifiedAt" = NOW(), "status" = ${'active'}::"UserStatus", "updatedAt" = NOW()
        FROM deleted
        WHERE "User"."id" = deleted."userId"
          AND "User"."status" = ${'pending'}::"UserStatus"
        RETURNING "User"."id"
      ),
      cleaned AS (
        DELETE FROM "UserEmailVerificationToken"
        WHERE "userId" IN (SELECT "id" FROM activated)
          AND "usedAt" IS NULL
      )
      SELECT "id" FROM activated
    `;

    return result && result.length > 0 ? 'verified' : 'invalid';
  } catch {
    return 'failed';
  }
}
