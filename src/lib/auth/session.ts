import { createHmac, randomBytes } from 'node:crypto';

export { SESSION_COOKIE_NAME } from '@/lib/auth/session-constants';
const DEVELOPMENT_SESSION_SECRET = 'barsynergy-development-session-secret';

export function createSessionToken() {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string) {
  const secret = process.env.SESSION_SECRET ?? (process.env.NODE_ENV === 'production' ? undefined : DEVELOPMENT_SESSION_SECRET);

  if (!secret) {
    throw new Error('SESSION_SECRET is required to hash session tokens');
  }

  return createHmac('sha256', secret).update(token).digest('hex');
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  };
}

export function getSessionExpiresAt() {
  return new Date(Date.now() + getSessionCookieOptions().maxAge * 1000);
}

export const SESSION_REFRESH_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;
