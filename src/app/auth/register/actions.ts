'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApplicationStatus, ApplicationType, UserRole, UserStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { getString, nullableString, optionalString } from '@/lib/admin/content-utils';
import { hasErrorMessage, resolveServerActionError } from '@/lib/actions/server-action-errors';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { AuthRateLimitError, assertAuthAttemptAllowed } from '@/lib/auth/auth-rate-limit';
import { createHash, randomBytes } from 'node:crypto';
import { hashPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/db/prisma';
import { getEnv } from '@/lib/validation/env';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { assertTurnstilePassed } from '@/lib/security/turnstile';

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
  confirmPassword: z.string().min(8).max(200),
  consent: z.literal('on')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'passwords do not match',
  path: ['confirmPassword']
});

const REGISTER_USER_FLASH_COOKIE = 'barsynergy-register-user-flash';

type RegisterUserFlash = {
  email: string;
  fullName: string;
};

function authResultPath(path: string, result: { type: 'success' | 'error'; code: string }) {
  const url = new URL(path, 'http://localhost');
  url.searchParams.set(result.type, result.code);
  return `${url.pathname}${url.search}`;
}

async function setRegisterUserFlashCookie(value: RegisterUserFlash | null) {
  const cookieStore = await cookies();

  if (!value) {
    cookieStore.delete(REGISTER_USER_FLASH_COOKIE);
    return;
  }

  cookieStore.set(
    REGISTER_USER_FLASH_COOKIE,
    encodeURIComponent(JSON.stringify(value)),
    {
      httpOnly: true,
      maxAge: 60 * 10,
      path: '/auth/register/user',
      sameSite: 'lax'
    }
  );
}

async function redirectWithAuthResult(path: string, result: { type: 'success' | 'error'; code: string }): Promise<never> {
  redirect(authResultPath(path, result));
}

function getRegisterUserFlash(formData: FormData): RegisterUserFlash {
  return {
    fullName: getString(formData, 'fullName').trim(),
    email: getString(formData, 'email').trim()
  };
}

async function sendUserVerificationEmail(input: { email: string; userId: string }) {
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.userEmailVerificationToken.updateMany({
      where: {
        userId: input.userId,
        usedAt: null,
        expiresAt: { gt: new Date() }
      },
      data: { usedAt: new Date() }
    });

    await tx.userEmailVerificationToken.create({
      data: {
        userId: input.userId,
        tokenHash,
        expiresAt
      }
    });
  });

  const env = getEnv();
  const verificationUrl = `${env.APP_URL}/auth/verify-email?token=${rawToken}`;
  const { sendVerificationEmail } = await import('@/lib/notifications/auth-email');
  sendVerificationEmail({ to: input.email, verificationUrl }).catch(() => {});
}

async function redirectForExistingUserRegistration(email: string, flash: RegisterUserFlash): Promise<never> {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, status: true, emailVerifiedAt: true }
  });

  if (existingUser && existingUser.status === UserStatus.PENDING && !existingUser.emailVerifiedAt) {
    await sendUserVerificationEmail({ email, userId: existingUser.id });
  }

  await setRegisterUserFlashCookie(flash);
  return redirectWithAuthResult('/auth/register/user', { type: 'error', code: 'account-check' });
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

  await assertTurnstilePassed(getString(formData, 'turnstileToken'));

  const env = getEnv();
  if (!arePublicApplicationFormsEnabled(env)) {
    await redirectWithAuthResult('/auth/register', { type: 'error', code: 'disabled' });
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
    await redirectWithAuthResult('/auth/register', { type: 'error', code: 'invalid' });
  }

  const businessRequest = parsed.data!;

  try {
    await assertAuthAttemptAllowed({ action: 'register', email: businessRequest.email });

    await prisma.$transaction(async (tx) => {
      const [existingUser, existingRequest] = await Promise.all([
        tx.user.findUnique({ where: { email: businessRequest.email }, select: { id: true } }),
        tx.application.findFirst({
          where: {
            type: ApplicationType.BUSINESS_ACCOUNT_REQUEST, email: businessRequest.email,
            status: { notIn: [ApplicationStatus.REJECTED, ApplicationStatus.ARCHIVED, ApplicationStatus.COMPLETED] }
          },
          select: { id: true }
        })
      ]);

      if (existingUser || existingRequest) return;

      if (businessRequest.cityId) {
        const city = await tx.city.findFirst({ where: { id: businessRequest.cityId, isActive: true }, select: { id: true } });
        if (!city) throw new Error('city is invalid');
      }

      await tx.application.create({
        data: {
          type: ApplicationType.BUSINESS_ACCOUNT_REQUEST, status: ApplicationStatus.NEW,
          subject: `Заявка на бизнес-доступ: ${businessRequest.companyName}`,
          name: businessRequest.contactPerson, email: businessRequest.email,
          phone: nullableString(businessRequest.phone), telegram: nullableString(businessRequest.telegram),
          cityId: nullableString(businessRequest.cityId),
          payload: { companyName: businessRequest.companyName, contactPerson: businessRequest.contactPerson, websiteUrl: businessRequest.websiteUrl || null, description: businessRequest.description || null },
          consentAcceptedAt: new Date(),
          consentText: 'Пользователь согласился с политикой обработки персональных данных и дал согласие на обработку персональных данных для рассмотрения заявки на бизнес-доступ.'
        }
      });
    });
  } catch (error) {
    if (error instanceof AuthRateLimitError) {
      await redirectWithAuthResult('/auth/register', { type: 'error', code: 'rate-limited' });
    }
    await redirectWithAuthResult('/auth/register', { type: 'error', code: resolveRegisterErrorCode(error) });
  }

  await redirectWithAuthResult('/auth/login', { type: 'success', code: 'business-request-created' });
}

export async function registerUserAction(formData: FormData) {
  await assertSameOriginServerAction();

  await assertTurnstilePassed(getString(formData, 'turnstileToken'));
  const flash = getRegisterUserFlash(formData);

  const parsed = registerUserSchema.safeParse({
    fullName: getString(formData, 'fullName'), email: getString(formData, 'email'),
    password: getString(formData, 'password'), confirmPassword: getString(formData, 'confirmPassword'),
    consent: getString(formData, 'consent')
  });

  if (!parsed.success) {
    await setRegisterUserFlashCookie(flash);
    await redirectWithAuthResult('/auth/register/user', { type: 'error', code: 'invalid' });
  }

  const registerRequest = parsed.data!;

  try {
    await assertAuthAttemptAllowed({ action: 'register', email: registerRequest.email });
    const existingUser = await prisma.user.findUnique({
      where: { email: registerRequest.email },
      select: { id: true, status: true, emailVerifiedAt: true }
    });

    if (existingUser) {
      return redirectForExistingUserRegistration(registerRequest.email, flash);
    }

    const passwordHash = await hashPassword(registerRequest.password);

    const user = await prisma.user.create({
      data: {
        email: registerRequest.email, passwordHash, role: UserRole.USER, status: UserStatus.PENDING,
        profile: { create: { fullName: registerRequest.fullName } }
      }
    });
    await sendUserVerificationEmail({ email: registerRequest.email, userId: user.id });
    await setRegisterUserFlashCookie(null);
    await redirectWithAuthResult('/auth/register/user', { type: 'success', code: 'registered' });
  } catch (error) {
    if (error instanceof AuthRateLimitError) {
      await setRegisterUserFlashCookie(flash);
      await redirectWithAuthResult('/auth/register/user', { type: 'error', code: 'rate-limited' });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return redirectForExistingUserRegistration(registerRequest.email, flash);
    }
    await setRegisterUserFlashCookie(flash);
    await redirectWithAuthResult('/auth/register/user', { type: 'error', code: resolveRegisterErrorCode(error) });
  }
}
