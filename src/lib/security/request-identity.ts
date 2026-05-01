function normalizeIpHeaderValue(value: string | null) {
  const normalized = value?.trim().replace(/^\[|\]$/g, '');
  return normalized && normalized.toLowerCase() !== 'unknown' ? normalized : null;
}

function getFirstForwardedIp(value: string | null) {
  if (!value) {
    return null;
  }

  for (const candidate of value.split(',')) {
    const normalized = normalizeIpHeaderValue(candidate);

    if (normalized) {
      return normalized;
    }
  }

  return null;
}

export function getClientIpFromHeaders(headerList: Headers) {
  return (
    getFirstForwardedIp(headerList.get('x-forwarded-for')) ||
    normalizeIpHeaderValue(headerList.get('cf-connecting-ip')) ||
    normalizeIpHeaderValue(headerList.get('x-real-ip')) ||
    'unknown'
  );
}
