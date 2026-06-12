'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApplicationStatus, ApplicationType, BusinessAccountStatus, UserRole, UserStatus } from '@prisma/client';
import { z } from 'zod';
import { getString } from '@/lib/admin/content-utils';
import {
  BUSINESS_ACCESS_ACTIVATION_COOKIE_NAME,
  findActiveBusinessAccessInvite,
  getBusinessAccessActivationCookieOptions,
  isBusinessAccessInviteActivationEligible
} from '@/lib/auth/business-access';
import { hasErrorMessage, resolveServerActionError } from '@/lib/actions/server-action-errors';
import { hashPassword } from '@/lib/auth/password';
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  getSessionExpiresAt,
  hashSessionToken
} from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';

const businessAccessActivationSchema = z
  .object({
    token: z.string().trim().min(1),
    password: z.string().min(8).max(200),
    confirmPassword: z.string().min(8).max(200)
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'password confirmation does not match'
  });

function activationResultPath(result: { type: 'error'; code: string }) {
  const url = new URL('/auth/activate', 'http://localhost');
  url.searchParams.set('error', result.code);
  return `${url.pathname}${url.search}`;
}

function redirectWithActivationResult(result: { type: 'error'; code: string }): never {
  redirect(activationResultPath(result));
}

async function preserveBusinessAccessActivationCookie(token: string) {
  const normalizedToken = token.trim();

  if (!/^[A-Za-z0-9_-]{20,200}$/.test(normalizedToken)) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(BUSINESS_ACCESS_ACTIVATION_COOKIE_NAME, normalizedToken, getBusinessAccessActivationCookieOptions());
}

function clearBusinessAccessActivationCookie(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  cookieStore.set(BUSINESS_ACCESS_ACTIVATION_COOKIE_NAME, '', {
    ...getBusinessAccessActivationCookieOptions(),
    maxAge: 0
  });
}

function resolveBusinessAccessActivationErrorCode(error: unknown) {
  return resolveServerActionError({
    action: 'auth:activate-business-access',
    error,
    zodMessage: 'invalid',
    known: [
      {
        matches: (candidate) => hasErrorMessage(candidate, 'password confirmation does not match'),
        message: 'mismatch'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'business access invite is invalid'),
        message: 'invalid'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'business access invite is blocked'),
        message: 'blocked'
      }
    ],
    fallbackMessage: 'failed'
  });
}

export async function activateBusinessAccessAction(formData: FormData) {
  await assertSameOriginServerAction();

  const token = getString(formData, 'token');
  let parsed: z.infer<typeof businessAccessActivationSchema>;

  try {
    parsed = businessAccessActivationSchema.parse({
      token,
      password: getString(formData, 'password'),
      confirmPassword: getString(formData, 'confirmPassword')
    });
  } catch (error) {
    await preserveBusinessAccessActivationCookie(token);
    redirectWithActivationResult({
      type: 'error',
      code: resolveBusinessAccessActivationErrorCode(error)
    });
  }

  try {
    const invite = await findActiveBusinessAccessInvite(parsed.token);

    if (!invite || invite.application.type !== ApplicationType.BUSINESS_ACCOUNT_REQUEST || !invite.application.businessAccount) {
      throw new Error('business access invite is invalid');
    }

    if (
      invite.user.status === UserStatus.BLOCKED ||
      invite.application.businessAccount.status === BusinessAccountStatus.BLOCKED
    ) {
      throw new Error('business access invite is blocked');
    }

    if (
      !isBusinessAccessInviteActivationEligible({
        applicationStatus: invite.application.status,
        userStatus: invite.user.status,
        businessAccountStatus: invite.application.businessAccount.status
      })
    ) {
      throw new Error('business access invite is invalid');
    }

    const businessAccountId = invite.application.businessAccount.id;
    const now = new Date();
    const passwordHash = await hashPassword(parsed.password);
    const sessionToken = createSessionToken();
    const sessionExpiresAt = getSessionExpiresAt();

    await prisma.$transaction(async (tx) => {
      const userUpdate = await tx.user.updateMany({
        where: { id: invite.user.id, role: UserRole.BUSINESS, status: UserStatus.PENDING },
        data: {
          passwordHash,
          status: UserStatus.ACTIVE
        }
      });

      const accountUpdate = await tx.businessAccount.updateMany({
        where: { id: businessAccountId, status: BusinessAccountStatus.PENDING },
        data: {
          status: BusinessAccountStatus.ACTIVE
        }
      });

      const inviteUpdate = await tx.businessAccessInvite.updateMany({
        where: { id: invite.id, usedAt: null, expiresAt: { gt: now } },
        data: {
          usedAt: now
        }
      });

      const applicationUpdate = await tx.application.updateMany({
        where: {
          id: invite.application.id,
          type: ApplicationType.BUSINESS_ACCOUNT_REQUEST,
          status: ApplicationStatus.APPROVED,
          businessAccountId
        },
        data: {
          status: ApplicationStatus.COMPLETED
        }
      });

      if (
        userUpdate.count !== 1 ||
        accountUpdate.count !== 1 ||
        inviteUpdate.count !== 1 ||
        applicationUpdate.count !== 1
      ) {
        throw new Error('business access invite is invalid');
      }

      await tx.session.create({
        data: {
          userId: invite.user.id,
          tokenHash: hashSessionToken(sessionToken),
          expiresAt: sessionExpiresAt
        }
      });
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions());
    clearBusinessAccessActivationCookie(cookieStore);
  } catch (error) {
    await preserveBusinessAccessActivationCookie(parsed.token);
    redirectWithActivationResult({
      type: 'error',
      code: resolveBusinessAccessActivationErrorCode(error)
    });
  }

  redirect('/business/cabinet?welcome=1&success=Доступ%20подключен.%20Теперь%20можно%20работать%20в%20кабинете.');
}
