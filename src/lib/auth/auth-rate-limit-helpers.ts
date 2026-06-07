import { createHmac } from 'node:crypto';

export const authAttemptLimits = {
  loginEmail: 5,
  loginIp: 30,
  registerEmail: 3,
  registerIp: 10,
  passwordResetEmail: 3,
  passwordResetIp: 10,
  verifyEmailEmail: 3,
  verifyEmailIp: 10
} as const;

export type AuthAttemptScope = keyof typeof authAttemptLimits;
export type AuthAttemptAction = 'login' | 'register' | 'password-reset' | 'verify-email';

const DEVELOPMENT_AUTH_THROTTLE_SECRET = 'barsynergy-development-auth-throttle';

export function getAuthThrottleKeyHash(input: { scope: AuthAttemptScope; identifier: string; secret?: string }) {
  const secret = input.secret ?? process.env.THROTTLE_SECRET ?? (process.env.NODE_ENV === 'production' ? undefined : DEVELOPMENT_AUTH_THROTTLE_SECRET);

  if (!secret) {
    throw new Error('THROTTLE_SECRET is required for auth rate limiting');
  }

  return createHmac('sha256', secret)
    .update([input.scope, input.identifier.trim().toLowerCase()].join(':'))
    .digest('hex');
}
