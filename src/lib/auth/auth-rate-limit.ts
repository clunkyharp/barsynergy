import { headers } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import {
  authAttemptLimits,
  getAuthThrottleKeyHash,
  type AuthAttemptAction
} from '@/lib/auth/auth-rate-limit-helpers';
import { getClientIpFromHeaders } from '@/lib/security/request-identity';
import { consumeThrottleWindowAtomically } from '@/lib/security/throttle-window';

const AUTH_THROTTLE_WINDOW_MS = 15 * 60 * 1000;

export class AuthRateLimitError extends Error {
  constructor() {
    super('auth rate limit exceeded');
  }
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
      const slot = await consumeThrottleWindowAtomically(tx, {
        table: 'authAttempt',
        keyHash: getAuthThrottleKeyHash(scope),
        maxAttempts: authAttemptLimits[scope.scope],
        now,
        windowBoundary
      });

      if (!slot) {
        throw new AuthRateLimitError();
      }
    }
  });
}
