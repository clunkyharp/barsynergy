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

function getAuthScopes(action: AuthAttemptAction, email: string, clientIp: string) {
  switch (action) {
    case 'login':
      return [
        { scope: 'loginEmail' as const, identifier: email },
        { scope: 'loginIp' as const, identifier: clientIp }
      ];
    case 'register':
      return [
        { scope: 'registerEmail' as const, identifier: email },
        { scope: 'registerIp' as const, identifier: clientIp }
      ];
    case 'password-reset':
      return [
        { scope: 'passwordResetEmail' as const, identifier: email },
        { scope: 'passwordResetIp' as const, identifier: clientIp }
      ];
    case 'verify-email':
      return [
        { scope: 'verifyEmailEmail' as const, identifier: email },
        { scope: 'verifyEmailIp' as const, identifier: clientIp }
      ];
  }
}

export async function assertAuthAttemptAllowed(input: { action: AuthAttemptAction; email: string }) {
  const headerList = await headers();
  const clientIp = getClientIpFromHeaders(headerList);
  const now = new Date();
  const windowBoundary = new Date(now.getTime() - AUTH_THROTTLE_WINDOW_MS);
  const scopes = getAuthScopes(input.action, input.email, clientIp);

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
