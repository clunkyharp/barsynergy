import { createHmac } from 'node:crypto';
import { Prisma } from '@prisma/client';

type QueryClient = Pick<Prisma.TransactionClient, '$queryRaw'>;
const DEVELOPMENT_PERSISTENT_THROTTLE_SECRET = 'barsynergy-development-persistent-throttle';

const throttleTableNames = {
  authAttempt: Prisma.raw('"AuthAttemptThrottle"'),
  applicationSubmission: Prisma.raw('"ApplicationSubmissionThrottle"')
} as const;

export type ThrottleTableKind = keyof typeof throttleTableNames;

type ConsumeThrottleWindowInput = {
  table: ThrottleTableKind;
  keyHash: string;
  now: Date;
  windowBoundary: Date;
  maxAttempts: number;
};

export function getPersistentThrottleKeyHash(input: { scope: string; identifier: string; secret?: string }) {
  const secret = input.secret ?? process.env.SESSION_SECRET ?? DEVELOPMENT_PERSISTENT_THROTTLE_SECRET;
  return createHmac('sha256', secret)
    .update([input.scope.trim().toLowerCase(), input.identifier.trim().toLowerCase()].join(':'))
    .digest('hex');
}

export async function consumeThrottleWindowAtomically(client: QueryClient, input: ConsumeThrottleWindowInput) {
  const tableName = throttleTableNames[input.table];

  const rows = await client.$queryRaw<Array<{ count: number; windowStartedAt: Date }>>(Prisma.sql`
    INSERT INTO ${tableName} ("keyHash", "windowStartedAt", "count", "createdAt", "updatedAt")
    VALUES (${input.keyHash}, ${input.now}, 1, ${input.now}, ${input.now})
    ON CONFLICT ("keyHash") DO UPDATE
    SET
      "count" = CASE
        WHEN ${tableName}."windowStartedAt" <= ${input.windowBoundary} THEN 1
        ELSE ${tableName}."count" + 1
      END,
      "windowStartedAt" = CASE
        WHEN ${tableName}."windowStartedAt" <= ${input.windowBoundary} THEN ${input.now}
        ELSE ${tableName}."windowStartedAt"
      END,
      "updatedAt" = ${input.now}
    WHERE ${tableName}."windowStartedAt" <= ${input.windowBoundary}
      OR ${tableName}."count" < ${input.maxAttempts}
    RETURNING "count", "windowStartedAt"
  `);

  return rows[0] ?? null;
}
