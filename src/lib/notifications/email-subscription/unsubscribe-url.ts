import { createHmac, timingSafeEqual } from 'node:crypto';
import { getEnv } from '@/lib/validation/env';

function computeSig(subscriptionId: string, secret: string): string {
  return createHmac('sha256', secret).update(subscriptionId).digest('hex').slice(0, 40);
}

export function createEmailUnsubscribeUrl(subscriptionId: string): string {
  const env = getEnv();
  const secret = env.CRON_SECRET ?? env.SESSION_SECRET ?? '';
  const sig = computeSig(subscriptionId, secret);
  return `${env.APP_URL}/newsletter/unsubscribe-email/${subscriptionId}?sig=${sig}`;
}

export function verifyEmailUnsubscribeSig(subscriptionId: string, sig: string): boolean {
  const env = getEnv();
  const secret = env.CRON_SECRET ?? env.SESSION_SECRET ?? '';
  const expected = computeSig(subscriptionId, secret);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}
