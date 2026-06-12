import { getEnv } from '@/lib/validation/env';

export function getWebPushVapidKeys() {
  const env = getEnv();
  return {
    publicKey: env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
    privateKey: env.WEB_PUSH_PRIVATE_KEY,
    subject: env.WEB_PUSH_SUBJECT,
  };
}

export function hasWebPushConfig() {
  const keys = getWebPushVapidKeys();
  return Boolean(keys.publicKey && keys.privateKey && keys.subject);
}
