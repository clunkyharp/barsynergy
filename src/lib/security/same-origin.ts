type SameOriginInput = {
  requestUrl: string;
  origin?: string | null;
  referer?: string | null;
  appUrl?: string | null;
};

function normalizeOrigin(value: string) {
  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }

    const protocol = url.protocol.toLowerCase();
    const hostname = url.hostname.toLowerCase();
    const isDefaultPort =
      (protocol === 'http:' && url.port === '80') || (protocol === 'https:' && url.port === '443');
    const port = url.port && !isDefaultPort ? `:${url.port}` : '';

    return `${protocol}//${hostname}${port}`;
  } catch {
    return null;
  }
}

function getAllowedOrigins(requestUrl: string, appUrl?: string | null) {
  const origins = new Set<string>();
  const requestOrigin = normalizeOrigin(requestUrl);
  const appOrigin = appUrl ? normalizeOrigin(appUrl) : null;

  if (appOrigin) {
    origins.add(appOrigin);

    if (requestOrigin && isLocalDevelopmentOrigin(appOrigin) && isLocalDevelopmentOrigin(requestOrigin)) {
      origins.add(requestOrigin);
    }

    return origins;
  }

  if (requestOrigin) {
    origins.add(requestOrigin);
  }

  return origins;
}

function isLocalDevelopmentOrigin(origin: string) {
  try {
    const hostname = new URL(origin).hostname.toLowerCase();
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1';
  } catch {
    return false;
  }
}

export function isSameOriginRequest(input: SameOriginInput) {
  const allowedOrigins = getAllowedOrigins(input.requestUrl, input.appUrl);

  if (allowedOrigins.size === 0) {
    return false;
  }

  if (input.origin !== undefined && input.origin !== null) {
    const origin = normalizeOrigin(input.origin);
    return origin ? allowedOrigins.has(origin) : false;
  }

  if (input.referer !== undefined && input.referer !== null) {
    const refererOrigin = normalizeOrigin(input.referer);
    return refererOrigin ? allowedOrigins.has(refererOrigin) : false;
  }

  return false;
}

export function isSameOriginBrowserRequest(request: Request, appUrl?: string | null) {
  return isSameOriginRequest({
    requestUrl: request.url,
    origin: request.headers.get('origin'),
    referer: request.headers.get('referer'),
    appUrl
  });
}
