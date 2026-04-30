import { createHmac } from 'node:crypto';
import type { ApplicationType } from '@prisma/client';
import { getClientIpFromHeaders } from '../security/request-identity.ts';

const DEVELOPMENT_THROTTLE_SECRET = 'barsynergy-development-application-throttle';

export function hasHoneypotValue(value: string) {
  return value.trim().length > 0;
}

export { getClientIpFromHeaders };

export function getApplicationThrottleKeyHash(input: {
  applicationType: ApplicationType;
  ip: string;
  userAgent: string;
  secret?: string;
}) {
  const secret = input.secret ?? process.env.SESSION_SECRET ?? DEVELOPMENT_THROTTLE_SECRET;
  return createHmac('sha256', secret)
    .update([input.applicationType, input.ip, input.userAgent.slice(0, 240)].join(':'))
    .digest('hex');
}
