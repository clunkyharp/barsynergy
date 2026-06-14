import { createHash, randomBytes } from 'node:crypto';

export function createEmailSubscriptionToken() {
  const rawToken = randomBytes(32).toString('hex');
  return {
    rawToken,
    tokenHash: hashEmailSubscriptionToken(rawToken)
  };
}

export function hashEmailSubscriptionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
