import { headers } from 'next/headers';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import {
  authAttemptLimits,
  getAuthThrottleKeyHash,
  type AuthAttemptAction
} from '@/lib/auth/auth-rate-limit-helpers';
import { getClientIpFromHeaders } from '@/lib/security/request-identity';

const AUTH_THROTTLE_WINDOW_MS = 15 * 60 * 1000;

export class AuthRateLimitError extends Error {
  constructor() {
    super('auth rate limit exceeded');
  }
}

async function consumeThrottleBucket(
  tx: Prisma.TransactionClient,
  input: { keyHash: string; maxAttempts: number; now: Date; windowBoundary: Date }
) {
  const existing = await tx.authAttemptThrottle.findUnique({
    where: { keyHash: input.keyHash },
    select: { count: true, windowStartedAt: true }
  });

  if (!existing || existing.windowStartedAt <= input.windowBoundary) {
    await tx.authAttemptThrottle.upsert({
      where: { keyHash: input.keyHash },
      create: { keyHash: input.keyHash, count: 1, windowStartedAt: input.now },
      update: { count: 1, windowStartedAt: input.now }
    });
    return;
  }

  if (existing.count >= input.maxAttempts) {
    throw new AuthRateLimitError();
  }

  await tx.authAttemptThrottle.update({
    where: { keyHash: input.keyHash },
    data: { count: { increment: 1 } }
  });
}

export async function assertAuthAttemptAllowed(input: { action: AuthAttemptAction; email: string }) {
  const headerList = await headers();
  const clientIp = getClientIpFromHeaders(headerList);
  const now = new Date();
  const windowBoundary = new Date(now.getTime() - AUTH_THROTTLE_WINDOW_MS);
  const scopes =
    input.action === 'login'
      ? [
          { scope: 'loginEmail' as const, identifier: input.email },
          { scope: 'loginIp' as const, identifier: clientIp }
        ]
      : [
          { scope: 'registerEmail' as const, identifier: input.email },
          { scope: 'registerIp' as const, identifier: clientIp }
        ];

  await prisma.$transaction(async (tx) => {
    for (const scope of scopes) {
      await consumeThrottleBucket(tx, {
        keyHash: getAuthThrottleKeyHash(scope),
        maxAttempts: authAttemptLimits[scope.scope],
        now,
        windowBoundary
      });
    }
  });
}
