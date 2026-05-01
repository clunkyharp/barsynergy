const allowedExternalProtocols = new Set(['https:', 'http:']);

function parseExternalUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isAllowedExternalUrl(url: URL) {
  return allowedExternalProtocols.has(url.protocol) && !url.username && !url.password && url.hostname.length > 0;
}

export function normalizeExternalUrlInput(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = parseExternalUrl(trimmed);

  if (!parsed || !isAllowedExternalUrl(parsed)) {
    throw new Error('External URL must use http or https.');
  }

  return parsed.toString();
}

export function getRenderableExternalUrl(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = parseExternalUrl(trimmed);
  return parsed && isAllowedExternalUrl(parsed) ? parsed.toString() : undefined;
}
