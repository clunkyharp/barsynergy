import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session-constants';
import {
  buildContentSecurityPolicy,
  createCspNonce,
  isProtectedAppPath,
  shouldApplyCsp
} from '@/lib/security/csp';

function generateRequestId() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return 'req_' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function proxy(request: NextRequest) {
  const requestId = generateRequestId();

  if (!shouldApplyCsp(request.nextUrl.pathname)) {
    const response = NextResponse.next();
    response.headers.set('X-Request-Id', requestId);
    return response;
  }

  const nonce = createCspNonce();
  const contentSecurityPolicy = buildContentSecurityPolicy({
    nonce,
    isDevelopment: process.env.NODE_ENV !== 'production'
  });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('x-request-id', requestId);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy);

  const withSecurityHeaders = (response: NextResponse) => {
    response.headers.set('Content-Security-Policy', contentSecurityPolicy);
    response.headers.set('X-Request-Id', requestId);
    return response;
  };

  if (!isProtectedAppPath(request.nextUrl.pathname)) {
    return withSecurityHeaders(
      NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })
    );
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    if (request.nextUrl.pathname === '/admin/uploads/content-image') {
      return withSecurityHeaders(NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }));
    }

    if (request.nextUrl.pathname === '/admin' || request.nextUrl.pathname.startsWith('/admin/')) {
      return withSecurityHeaders(NextResponse.redirect(new URL('/admin/login', request.url)));
    }

    const loginUrl = new URL('/auth/login', request.url);

    if (request.nextUrl.pathname === '/profile' || request.nextUrl.pathname.startsWith('/profile/')) {
      loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
    } else if (
      request.nextUrl.pathname === '/business/cabinet' ||
      request.nextUrl.pathname.startsWith('/business/cabinet/')
    ) {
      loginUrl.searchParams.set('returnTo', '/business/cabinet');
    }

    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return withSecurityHeaders(
    NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  );
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)']
};
