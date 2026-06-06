'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserRole, UserStatus } from '@prisma/client';
import { z } from 'zod';
import { getString, optionalString } from '@/lib/admin/content-utils';
import { resolveServerActionError } from '@/lib/actions/server-action-errors';
import { AuthRateLimitError, assertAuthAttemptAllowed } from '@/lib/auth/auth-rate-limit';
import { verifyPassword, verifyPasswordAgainstDummyHash } from '@/lib/auth/password';
import { isSafeReturnTo } from '@/lib/auth/safe-redirect';
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  getSessionExpiresAt,
  hashSessionToken
} from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(200),
  role: z.enum(['participant', 'business']).optional(),
  surface: z.enum(['public', 'admin']).optional(),
  returnTo: z.string().max(500).optional()
});

type LoginRoleIntent = z.infer<typeof loginSchema>['role'];
type LoginSurface = z.infer<typeof loginSchema>['surface'];

function authResultPath(path: string, result: { type: 'success' | 'error'; code: string }) {
  const url = new URL(path, 'http://localhost');
  url.searchParams.set(result.type, result.code);
  return `${url.pathname}${url.search}`;
}

function redirectWithAuthResult(path: string, result: { type: 'success' | 'error'; code: string }): never {
  redirect(authResultPath(path, result));
}

function getLoginPath(surface: LoginSurface, role: LoginRoleIntent) {
  if (surface === 'admin') {
    return '/admin/login';
  }

  if (!role) {
    return '/auth/login';
  }

  const url = new URL('/auth/login', 'http://localhost');
  url.searchParams.set('role', role);
  return `${url.pathname}${url.search}`;
}

function canUseSelectedLoginRole(selectedRole: LoginRoleIntent, userRole: UserRole) {
  if (!selectedRole) {
    return true;
  }

  if (selectedRole === 'participant') {
    return userRole === UserRole.USER;
  }

  if (selectedRole === 'business') {
    return userRole === UserRole.BUSINESS;
  }

  return false;
}

function resolveAuthLoginErrorCode(error: unknown) {
  return resolveServerActionError({
    action: 'auth:login',
    error,
    fallbackMessage: 'failed'
  });
}

function getPostLoginPath(role: UserRole) {
  if (role === UserRole.ADMIN || role === UserRole.MODERATOR) {
    return '/admin';
  }

  if (role === UserRole.BUSINESS) {
    return '/business/cabinet';
  }

  if (role === UserRole.USER) {
    return '/profile';
  }

  return '/';
}

export async function loginAction(formData: FormData) {
  const rawSurface: LoginSurface = getString(formData, 'surface') === 'admin' ? 'admin' : 'public';
  const parsed = loginSchema.safeParse({
    email: getString(formData, 'email').toLowerCase(),
    password: getString(formData, 'password'),
    role: optionalString(getString(formData, 'role')),
    surface: rawSurface
  });

  if (!parsed.success) {
    redirectWithAuthResult(getLoginPath(rawSurface, undefined), { type: 'error', code: 'invalid' });
  }

  const loginPath = getLoginPath(parsed.data.surface, parsed.data.role);

  await assertSameOriginServerAction();

  try {
    await assertAuthAttemptAllowed({ action: 'login', email: parsed.data.email });

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true, passwordHash: true, role: true, status: true }
    });

    if (!user) {
      await verifyPasswordAgainstDummyHash(parsed.data.password);
      redirectWithAuthResult(loginPath, { type: 'error', code: 'invalid' });
    }

    if (!(await verifyPassword(parsed.data.password, user.passwordHash))) {
      redirectWithAuthResult(loginPath, { type: 'error', code: 'invalid' });
    }

    if (user.status === UserStatus.PENDING) {
      redirectWithAuthResult(loginPath, { type: 'error', code: 'pending' });
    }

    if (user.status === UserStatus.BLOCKED) {
      redirectWithAuthResult(loginPath, { type: 'error', code: 'blocked' });
    }

    if (!canUseSelectedLoginRole(parsed.data.role, user.role)) {
      redirectWithAuthResult(loginPath, { type: 'error', code: 'role-mismatch' });
    }

    const token = createSessionToken();
    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: hashSessionToken(token),
        expiresAt: getSessionExpiresAt()
      }
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

    const returnTo = parsed.data.returnTo;
    if (returnTo && isSafeReturnTo(returnTo)) {
      redirect(returnTo);
    }

    redirect(getPostLoginPath(user.role));
  } catch (error) {
    if (error instanceof AuthRateLimitError) {
      redirectWithAuthResult(loginPath, { type: 'error', code: 'rate-limited' });
    }

    redirectWithAuthResult(loginPath, {
      type: 'error',
      code: resolveAuthLoginErrorCode(error)
    });
  }
}

export async function logoutAction() {
  await assertSameOriginServerAction();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
    redirectWithAuthResult('/auth/login', { type: 'success', code: 'logged-out' });
  } catch (error) {
    redirectWithAuthResult('/auth/login', {
      type: 'error',
      code: resolveServerActionError({
        action: 'auth:logout',
        error,
        fallbackMessage: 'failed'
      })
    });
  }
}
