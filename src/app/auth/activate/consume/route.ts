import { NextRequest, NextResponse } from 'next/server';
import {
  BUSINESS_ACCESS_ACTIVATION_COOKIE_NAME,
  findActiveBusinessAccessInvite,
  getBusinessAccessActivationCookieOptions
} from '@/lib/auth/business-access';

export async function GET(request: NextRequest) {
  const redirectUrl = new URL('/auth/activate', request.url);
  const response = NextResponse.redirect(redirectUrl);
  const token = request.nextUrl.searchParams.get('token')?.trim() ?? '';

  if (!/^[A-Za-z0-9_-]{20,200}$/.test(token) || !(await findActiveBusinessAccessInvite(token))) {
    redirectUrl.searchParams.set('error', 'invalid');
    const invalidResponse = NextResponse.redirect(redirectUrl);
    invalidResponse.cookies.set(BUSINESS_ACCESS_ACTIVATION_COOKIE_NAME, '', {
      ...getBusinessAccessActivationCookieOptions(),
      maxAge: 0
    });
    return invalidResponse;
  }

  response.cookies.set(BUSINESS_ACCESS_ACTIVATION_COOKIE_NAME, token, getBusinessAccessActivationCookieOptions());
  return response;
}
