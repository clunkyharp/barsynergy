'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserRole, UserStatus } from '@prisma/client';
import { z } from 'zod';
import { getString, optionalString } from '@/lib/forms/form-data';
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

export type LoginActionResult = { type: 'error'; code: string } | null;

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(200),
  role: z.enum(['participant', 'business']).optional(),
  surface: z.enum(['public', 'admin']).optional(),
  returnTo: z.string().max(500).optional()
});

type LoginRoleIntent = z.infer<typeof loginSchema>['role'];
type LoginSurface = z.infer<typeof loginSchema>['surface'];

function canUseSelectedLoginRole(selectedRole: LoginRoleIntent, userRole: UserRole) {
  if (!selectedRole) return true;
  if (selectedRole === 'participant') return userRole === UserRole.USER;
  if (selectedRole === 'business') return userRole === UserRole.BUSINESS;
  return false;
}

function resolveAuthLoginErrorCode(error: unknown) {
  return resolveServerActionError({ action: 'auth:login', error, fallbackMessage: 'failed' });
}

function getPostLoginPath(role: UserRole) {
  if (role === UserRole.ADMIN || role === UserRole.MODERATOR) return '/admin';
  if (role === UserRole.BUSINESS) return '/business/cabinet';
  if (role === UserRole.USER) return '/profile';
  return '/';
}

export async function loginAction(_prevState: LoginActionResult, formData: FormData): Promise<LoginActionResult> {
  const rawSurface: LoginSurface = getString(formData, 'surface') === 'admin' ? 'admin' : 'public';
  const parsed = loginSchema.safeParse({
    email: getString(formData, 'email').toLowerCase(),
    password: getString(formData, 'password'),
    role: optionalString(getString(formData, 'role')),
    surface: rawSurface,
    returnTo: optionalString(getString(formData, 'returnTo'))
  });

  if (!parsed.success) {
    return { type: 'error', code: 'invalid' };
  }

  let successRedirectTo: string | null = null;

  try {
    await assertSameOriginServerAction();
    await assertAuthAttemptAllowed({ action: 'login', email: parsed.data.email });

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true, passwordHash: true, role: true, status: true, createdAt: true }
    });

    if (!user) {
      await verifyPasswordAgainstDummyHash(parsed.data.password);
      return { type: 'error', code: 'invalid' };
    }

    if (!(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return { type: 'error', code: 'invalid' };
    }

    if (user.status === UserStatus.PENDING) return { type: 'error', code: 'pending' };
    if (user.status === UserStatus.BLOCKED) return { type: 'error', code: 'blocked' };
    if (!canUseSelectedLoginRole(parsed.data.role, user.role)) return { type: 'error', code: 'role-mismatch' };

    const token = createSessionToken();
    await prisma.session.create({
      data: { userId: user.id, tokenHash: hashSessionToken(token), expiresAt: getSessionExpiresAt() }
    });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

    const returnTo = parsed.data.returnTo;
    if (returnTo && isSafeReturnTo(returnTo)) {
      successRedirectTo = returnTo;
    } else {
      const isNewUser = user.role === UserRole.USER && Date.now() - user.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000;
      const postLoginPath = getPostLoginPath(user.role);
      successRedirectTo = isNewUser ? `${postLoginPath}?welcome=1` : postLoginPath;
    }
  } catch (error) {
    if (error instanceof AuthRateLimitError) return { type: 'error', code: 'rate-limited' };
    return { type: 'error', code: resolveAuthLoginErrorCode(error) };
  }

  // redirect() must be called outside try/catch
  if (successRedirectTo) redirect(successRedirectTo);
  return null;
}

export async function logoutAction() {
  await assertSameOriginServerAction();

  let redirectTo = '/auth/login?success=logged-out';

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
    }
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    redirectTo = '/auth/login?error=failed';
  }

  redirect(redirectTo);
}
