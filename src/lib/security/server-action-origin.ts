import { headers } from 'next/headers';
import { getEnv } from '@/lib/validation/env';
import { isSameOriginRequest } from '@/lib/security/same-origin';

function parseAllowedOrigins(value?: string) {
  return value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getRequestUrlFromHeaders(headerStore: Headers, appUrl: string) {
  const fallback = new URL(appUrl);
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host') ?? fallback.host;
  const protocol = headerStore.get('x-forwarded-proto') ?? fallback.protocol.replace(':', '');

  return `${protocol}://${host}/`;
}

export async function assertSameOriginServerAction() {
  const headerStore = await headers();
  const env = getEnv();
  const appUrl = env.APP_URL;

  if (
    !isSameOriginRequest({
      requestUrl: getRequestUrlFromHeaders(headerStore, appUrl),
      origin: headerStore.get('origin'),
      referer: headerStore.get('referer'),
      appUrl,
      allowedOrigins: parseAllowedOrigins(env.SERVER_ACTION_ALLOWED_ORIGINS)
    })
  ) {
    throw new Error('same origin required');
  }
}
