const STATIC_ASSET_PATH_PATTERN = /\.[^/]+$/;

function base64EncodeBytes(bytes: Uint8Array) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    const triplet = (first << 16) | ((second ?? 0) << 8) | (third ?? 0);

    output += alphabet[(triplet >> 18) & 63];
    output += alphabet[(triplet >> 12) & 63];
    output += index + 1 < bytes.length ? alphabet[(triplet >> 6) & 63] : '=';
    output += index + 2 < bytes.length ? alphabet[triplet & 63] : '=';
  }

  return output;
}

export function createCspNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return base64EncodeBytes(bytes);
}

export function buildContentSecurityPolicy({
  nonce,
  isDevelopment
}: {
  nonce: string;
  isDevelopment: boolean;
}) {
  const scriptSources = [`'self'`, `'nonce-${nonce}'`, `'strict-dynamic'`];
  const connectSources = [`'self'`];

  if (isDevelopment) {
    scriptSources.push(`'unsafe-eval'`);
    connectSources.push('ws:', 'http://localhost:*', 'http://127.0.0.1:*');
  }

  const directives = [
    [`default-src`, `'self'`],
    [`base-uri`, `'self'`],
    [`form-action`, `'self'`],
    [`frame-ancestors`, `'self'`],
    [`object-src`, `'none'`],
    [`script-src`, ...scriptSources],
    [`style-src`, `'self'`, `'unsafe-inline'`],
    [`img-src`, `'self'`, 'data:', 'blob:', 'https://s3.twcstorage.ru', 'https://images.unsplash.com', 'https://picsum.photos'],
    [`font-src`, `'self'`, 'data:'],
    [`connect-src`, ...connectSources]
  ];

  if (!isDevelopment) {
    directives.push([`upgrade-insecure-requests`]);
  }

  return directives.map((directive) => directive.join(' ')).join('; ');
}

export function isProtectedAppPath(pathname: string) {
  return (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/business/cabinet' ||
    pathname.startsWith('/business/cabinet/')
  );
}

export function shouldApplyCsp(pathname: string) {
  return (
    !pathname.startsWith('/_next/static') &&
    !pathname.startsWith('/_next/image') &&
    pathname !== '/favicon.ico' &&
    pathname !== '/robots.txt' &&
    pathname !== '/sitemap.xml' &&
    !STATIC_ASSET_PATH_PATTERN.test(pathname)
  );
}
