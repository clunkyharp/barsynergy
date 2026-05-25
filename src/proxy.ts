import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';
import {
  buildContentSecurityPolicy,
  createCspNonce,
  isProtectedAppPath,
  shouldApplyCsp
} from '@/lib/security/csp';

export function proxy(request: NextRequest) {
  if (!shouldApplyCsp(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const nonce = createCspNonce();
  const contentSecurityPolicy = buildContentSecurityPolicy({
    nonce,
    isDevelopment: process.env.NODE_ENV !== 'production'
  });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy);

  const withSecurityHeaders = (response: NextResponse) => {
    response.headers.set('Content-Security-Policy', contentSecurityPolicy);
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

    const loginPath = request.nextUrl.pathname === '/admin' || request.nextUrl.pathname.startsWith('/admin/')
      ? '/admin/login'
      : '/auth/login';

    return withSecurityHeaders(NextResponse.redirect(new URL(loginPath, request.url)));
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
