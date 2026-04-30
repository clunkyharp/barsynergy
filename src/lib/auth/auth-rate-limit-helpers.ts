import { createHmac } from 'node:crypto';

export const authAttemptLimits = {
  loginEmail: 5,
  loginIp: 30,
  registerEmail: 3,
  registerIp: 10
} as const;

export type AuthAttemptScope = keyof typeof authAttemptLimits;
export type AuthAttemptAction = 'login' | 'register';

const DEVELOPMENT_AUTH_THROTTLE_SECRET = 'barsynergy-development-auth-throttle';

export function getAuthThrottleKeyHash(input: { scope: AuthAttemptScope; identifier: string; secret?: string }) {
  const secret = input.secret ?? process.env.SESSION_SECRET ?? DEVELOPMENT_AUTH_THROTTLE_SECRET;
  return createHmac('sha256', secret)
    .update([input.scope, input.identifier.trim().toLowerCase()].join(':'))
    .digest('hex');
}
