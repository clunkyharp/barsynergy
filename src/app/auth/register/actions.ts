'use server';

import { redirect } from 'next/navigation';
import { ApplicationStatus, ApplicationType, UserRole, UserStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { getString, nullableString, optionalString } from '@/lib/admin/content-utils';
import { hasErrorMessage, resolveServerActionError } from '@/lib/actions/server-action-errors';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { AuthRateLimitError, assertAuthAttemptAllowed } from '@/lib/auth/auth-rate-limit';
import { hashPassword } from '@/lib/auth/password';
import { SESSION_COOKIE_NAME, createSessionToken, getSessionCookieOptions, getSessionExpiresAt, hashSessionToken } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getEnv } from '@/lib/validation/env';
import { cookies } from 'next/headers';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';

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

const registerUserSchema = z.object({
  fullName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(200),
  consent: z.literal('on')
});

function authResultPath(path: string, result: { type: 'success' | 'error'; code: string }) {
  const url = new URL(path, 'http://localhost');
  url.searchParams.set(result.type, result.code);
  return `${url.pathname}${url.search}`;
}

function redirectWithAuthResult(path: string, result: { type: 'success' | 'error'; code: string }): never {
  redirect(authResultPath(path, result));
}

function resolveRegisterErrorCode(error: unknown) {
  return resolveServerActionError({
    action: 'auth:register', error, zodMessage: 'invalid',
    known: [{ matches: (candidate: Error) => hasErrorMessage(candidate, 'city is invalid'), message: 'invalid' }],
    fallbackMessage: 'failed'
  });
}

export async function createBusinessAccountRequestAction(formData: FormData) {
  await assertSameOriginServerAction();

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

  let created = false;

  try {
    await assertAuthAttemptAllowed({ action: 'register', email: parsed.data.email });

    await prisma.$transaction(async (tx) => {
      const [existingUser, existingRequest] = await Promise.all([
        tx.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } }),
        tx.application.findFirst({
          where: {
            type: ApplicationType.BUSINESS_ACCOUNT_REQUEST, email: parsed.data.email,
            status: { notIn: [ApplicationStatus.REJECTED, ApplicationStatus.ARCHIVED, ApplicationStatus.COMPLETED] }
          },
          select: { id: true }
        })
      ]);

      if (existingUser || existingRequest) return;

      if (parsed.data.cityId) {
        const city = await tx.city.findFirst({ where: { id: parsed.data.cityId, isActive: true }, select: { id: true } });
        if (!city) throw new Error('city is invalid');
      }

      await tx.application.create({
        data: {
          type: ApplicationType.BUSINESS_ACCOUNT_REQUEST, status: ApplicationStatus.NEW,
          subject: `Заявка на бизнес-доступ: ${parsed.data.companyName}`,
          name: parsed.data.contactPerson, email: parsed.data.email,
          phone: nullableString(parsed.data.phone), telegram: nullableString(parsed.data.telegram),
          cityId: nullableString(parsed.data.cityId),
          payload: { companyName: parsed.data.companyName, contactPerson: parsed.data.contactPerson, websiteUrl: parsed.data.websiteUrl || null, description: parsed.data.description || null },
          consentAcceptedAt: new Date(),
          consentText: 'Пользователь согласился с политикой обработки персональных данных и дал согласие на обработку персональных данных для рассмотрения заявки на бизнес-доступ.'
        }
      });

      created = true;
    });
  } catch (error) {
    if (error instanceof AuthRateLimitError) {
      redirectWithAuthResult('/auth/register', { type: 'error', code: 'rate-limited' });
    }
    redirectWithAuthResult('/auth/register', { type: 'error', code: resolveRegisterErrorCode(error) });
  }

  if (created) {
    redirectWithAuthResult('/auth/login', { type: 'success', code: 'business-request-created' });
  } else {
    redirectWithAuthResult('/auth/login', { type: 'success', code: 'business-request-duplicate' });
  }
}

export async function registerUserAction(formData: FormData) {
  await assertSameOriginServerAction();

  const parsed = registerUserSchema.safeParse({
    fullName: getString(formData, 'fullName'), email: getString(formData, 'email'),
    password: getString(formData, 'password'), consent: getString(formData, 'consent')
  });

  if (!parsed.success) {
    redirectWithAuthResult('/auth/register/user', { type: 'error', code: 'invalid' });
  }

  try {
    await assertAuthAttemptAllowed({ action: 'register', email: parsed.data.email });
    const passwordHash = await hashPassword(parsed.data.password);

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email, passwordHash, role: UserRole.USER, status: UserStatus.ACTIVE,
        profile: { create: { fullName: parsed.data.fullName } }
      }
    });

    const token = createSessionToken();
    await prisma.session.create({
      data: { userId: user.id, tokenHash: hashSessionToken(token), expiresAt: getSessionExpiresAt() }
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
    redirect('/profile');
  } catch (error) {
    if (error instanceof AuthRateLimitError) {
      redirectWithAuthResult('/auth/register/user', { type: 'error', code: 'rate-limited' });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      redirectWithAuthResult('/auth/register/user', { type: 'error', code: 'email-used' });
    }
    redirectWithAuthResult('/auth/register/user', { type: 'error', code: resolveRegisterErrorCode(error) });
  }
}
