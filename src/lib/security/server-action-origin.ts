import { headers } from 'next/headers';
import { getEnv } from '@/lib/validation/env';
import { isSameOriginRequest } from '@/lib/security/same-origin';

function getRequestUrlFromHeaders(headerStore: Headers, appUrl: string) {
  const fallback = new URL(appUrl);
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host') ?? fallback.host;
  const protocol = headerStore.get('x-forwarded-proto') ?? fallback.protocol.replace(':', '');

  return `${protocol}://${host}/`;
}

export async function assertSameOriginServerAction() {
  const headerStore = await headers();
  const appUrl = getEnv().APP_URL;

  if (
    !isSameOriginRequest({
      requestUrl: getRequestUrlFromHeaders(headerStore, appUrl),
      origin: headerStore.get('origin'),
      referer: headerStore.get('referer'),
      appUrl
    })
  ) {
    throw new Error('same origin required');
  }
}
