import { createHmac } from 'node:crypto';
import type { ApplicationType } from '@prisma/client';

const DEVELOPMENT_THROTTLE_SECRET = 'barsynergy-development-application-throttle';

export function hasHoneypotValue(value: string) {
  return value.trim().length > 0;
}

export function getClientIpFromHeaders(headerList: Headers) {
  const forwardedFor = headerList.get('x-forwarded-for')?.split(',')[0]?.trim();
  return (
    forwardedFor ||
    headerList.get('x-real-ip')?.trim() ||
    headerList.get('cf-connecting-ip')?.trim() ||
    'unknown'
  );
}

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
