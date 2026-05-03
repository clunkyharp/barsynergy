'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApplicationStatus, ApplicationType, BusinessAccountStatus, UserRole, UserStatus } from '@prisma/client';
import { z } from 'zod';
import { getString, nullableString, optionalString } from '@/lib/admin/content-utils';
import { findActiveBusinessAccessInvite } from '@/lib/auth/business-access';
import { hasErrorMessage, resolveServerActionError } from '@/lib/actions/server-action-errors';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { AuthRateLimitError, assertAuthAttemptAllowed } from '@/lib/auth/auth-rate-limit';
import { hashPassword, verifyPassword, verifyPasswordAgainstDummyHash } from '@/lib/auth/password';
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  getSessionExpiresAt,
  hashSessionToken
} from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getEnv } from '@/lib/validation/env';

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(200)
});

const businessRequestSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  contactPerson: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  cityId: z.string().trim().optional(),
  phone: z.string().trim().max(80).optional(),
  telegram: z.string().trim().max(80).optional(),
  websiteUrl: z.string().trim().url().max(240).optional().or(z.literal('')),
  description: z.string().trim().max(1000).optional(),
  consent: z.literal('on')
});

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

function authResultPath(path: string, result: { type: 'success' | 'error'; code: string }) {
  const url = new URL(path, 'http://localhost');
  url.searchParams.set(result.type, result.code);
  return `${url.pathname}${url.search}`;
}

function redirectWithAuthResult(path: string, result: { type: 'success' | 'error'; code: string }): never {
  redirect(authResultPath(path, result));
}

function activationResultPath(token: string, result: { type: 'error'; code: string }) {
  const url = new URL('/auth/activate', 'http://localhost');
  url.searchParams.set('token', token);
  url.searchParams.set('error', result.code);
  return `${url.pathname}${url.search}`;
}

function redirectWithActivationResult(token: string, result: { type: 'error'; code: string }): never {
  redirect(activationResultPath(token, result));
}

function getPostLoginPath(role: UserRole) {
  if (role === UserRole.ADMIN || role === UserRole.MODERATOR) {
    return '/admin';
  }

  if (role === UserRole.BUSINESS) {
    return '/business';
  }

  if (role === UserRole.USER) {
    return '/profile';
  }

  return '/';
}

function resolveAuthLoginErrorCode(error: unknown) {
  return resolveServerActionError({
    action: 'auth:login',
    error,
    fallbackMessage: 'failed'
  });
}

function resolveAuthRegisterErrorCode(error: unknown) {
  return resolveServerActionError({
    action: 'auth:business-request',
    error,
    zodMessage: 'invalid',
    known: [
      {
        matches: (candidate) => hasErrorMessage(candidate, 'city is invalid'),
        message: 'invalid'
      }
    ],
    fallbackMessage: 'failed'
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

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: getString(formData, 'email').toLowerCase(),
    password: getString(formData, 'password')
  });

  if (!parsed.success) {
    redirectWithAuthResult('/auth/login', { type: 'error', code: 'invalid' });
  }

  try {
    await assertAuthAttemptAllowed({ action: 'login', email: parsed.data.email });

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true, passwordHash: true, role: true, status: true }
    });

    if (!user) {
      await verifyPasswordAgainstDummyHash(parsed.data.password);
      redirectWithAuthResult('/auth/login', { type: 'error', code: 'invalid' });
    }

    if (!(await verifyPassword(parsed.data.password, user.passwordHash))) {
      redirectWithAuthResult('/auth/login', { type: 'error', code: 'invalid' });
    }

    if (user.status === UserStatus.PENDING) {
      redirectWithAuthResult('/auth/login', { type: 'error', code: 'pending' });
    }

    if (user.status === UserStatus.BLOCKED) {
      redirectWithAuthResult('/auth/login', { type: 'error', code: 'blocked' });
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

    redirect(getPostLoginPath(user.role));
  } catch (error) {
    if (error instanceof AuthRateLimitError) {
      redirectWithAuthResult('/auth/login', { type: 'error', code: 'rate-limited' });
    }

    redirectWithAuthResult('/auth/login', {
      type: 'error',
      code: resolveAuthLoginErrorCode(error)
    });
  }
}

export async function logoutAction() {
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

export async function createBusinessAccountRequestAction(formData: FormData) {
  const env = getEnv();

  if (!arePublicApplicationFormsEnabled(env)) {
    redirectWithAuthResult('/auth/register', { type: 'error', code: 'disabled' });
  }

  const parsed = businessRequestSchema.safeParse({
    companyName: getString(formData, 'companyName'),
    contactPerson: getString(formData, 'contactPerson'),
    email: getString(formData, 'email'),
    cityId: optionalString(getString(formData, 'cityId')),
    phone: optionalString(getString(formData, 'phone')),
    telegram: optionalString(getString(formData, 'telegram')),
    websiteUrl: getString(formData, 'websiteUrl'),
    description: optionalString(getString(formData, 'description')),
    consent: getString(formData, 'consent')
  });

  if (!parsed.success) {
    redirectWithAuthResult('/auth/register', { type: 'error', code: 'invalid' });
  }

  try {
    await assertAuthAttemptAllowed({ action: 'register', email: parsed.data.email });

    await prisma.$transaction(async (tx) => {
      const [existingUser, existingRequest] = await Promise.all([
        tx.user.findUnique({
          where: { email: parsed.data.email },
          select: { id: true }
        }),
        tx.application.findFirst({
          where: {
            type: ApplicationType.BUSINESS_ACCOUNT_REQUEST,
            email: parsed.data.email,
            status: {
              notIn: [ApplicationStatus.REJECTED, ApplicationStatus.ARCHIVED, ApplicationStatus.COMPLETED]
            }
          },
          select: { id: true }
        })
      ]);

      if (existingUser || existingRequest) {
        return;
      }

      if (parsed.data.cityId) {
        const city = await tx.city.findFirst({
          where: { id: parsed.data.cityId, isActive: true },
          select: { id: true }
        });

        if (!city) {
          throw new Error('city is invalid');
        }
      }

      await tx.application.create({
        data: {
          type: ApplicationType.BUSINESS_ACCOUNT_REQUEST,
          status: ApplicationStatus.NEW,
          subject: `Заявка на бизнес-доступ: ${parsed.data.companyName}`,
          name: parsed.data.contactPerson,
          email: parsed.data.email,
          phone: nullableString(parsed.data.phone),
          telegram: nullableString(parsed.data.telegram),
          cityId: nullableString(parsed.data.cityId),
          payload: {
            companyName: parsed.data.companyName,
            contactPerson: parsed.data.contactPerson,
            websiteUrl: parsed.data.websiteUrl || null,
            description: parsed.data.description || null
          },
          consentAcceptedAt: new Date(),
          consentText:
            'Пользователь согласился с политикой обработки персональных данных и дал согласие на обработку персональных данных для рассмотрения заявки на бизнес-доступ.'
        }
      });
    });
  } catch (error) {
    if (error instanceof AuthRateLimitError) {
      redirectWithAuthResult('/auth/register', { type: 'error', code: 'rate-limited' });
    }

    redirectWithAuthResult('/auth/register', {
      type: 'error',
      code: resolveAuthRegisterErrorCode(error)
    });
  }

  redirectWithAuthResult('/auth/login', { type: 'success', code: 'business-request-created' });
}

export async function activateBusinessAccessAction(formData: FormData) {
  const token = getString(formData, 'token');
  let parsed: z.infer<typeof businessAccessActivationSchema>;

  try {
    parsed = businessAccessActivationSchema.parse({
      token,
      password: getString(formData, 'password'),
      confirmPassword: getString(formData, 'confirmPassword')
    });
  } catch (error) {
    redirectWithActivationResult(token, {
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

    const businessAccountId = invite.application.businessAccount.id;
    const sessionToken = createSessionToken();
    const sessionExpiresAt = getSessionExpiresAt();

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: invite.user.id },
        data: {
          passwordHash: await hashPassword(parsed.password),
          role: UserRole.BUSINESS,
          status: UserStatus.ACTIVE
        }
      });

      await tx.businessAccount.update({
        where: { id: businessAccountId },
        data: {
          status: BusinessAccountStatus.ACTIVE
        }
      });

      await tx.businessAccessInvite.update({
        where: { id: invite.id },
        data: {
          usedAt: new Date()
        }
      });

      await tx.application.update({
        where: { id: invite.application.id },
        data: {
          status: ApplicationStatus.COMPLETED
        }
      });

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
    redirect('/business?success=Доступ%20подключен.%20Теперь%20можно%20работать%20в%20кабинете.');
  } catch (error) {
    redirectWithActivationResult(parsed.token, {
      type: 'error',
      code: resolveBusinessAccessActivationErrorCode(error)
    });
  }
}
