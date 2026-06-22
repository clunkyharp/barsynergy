'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { BusinessAccountStatus, UserRole, UserStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { getString, nullableString, optionalString } from '@/lib/forms/form-data';
import { hasErrorMessage, resolveServerActionError } from '@/lib/actions/server-action-errors';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { AuthRateLimitError, assertAuthAttemptAllowed } from '@/lib/auth/auth-rate-limit';
import { createHash, randomBytes } from 'node:crypto';
import { hashPassword } from '@/lib/auth/password';
import { PASSWORD_MIN_LENGTH } from '@/lib/auth/password-policy';
import { prisma } from '@/lib/db/prisma';
import { getEnv } from '@/lib/validation/env';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { assertTurnstilePassed } from '@/lib/security/turnstile';
import { CompromisedPasswordError, assertPasswordNotCompromised } from '@/lib/security/hibp';
import { setRegisterUserFlashCookie } from '@/lib/auth/register-user-flash';
import { SESSION_COOKIE_NAME, createSessionToken, getSessionCookieOptions, getSessionExpiresAt, hashSessionToken } from '@/lib/auth/session';
import { slugify } from '@/lib/utils/slugify';

const businessRequestSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  contactPerson: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  cityId: z.string().trim().optional(),
  phone: z.string().trim().max(80).optional(),
  telegram: z.string().trim().max(80).optional(),
  websiteUrl: z.string().trim().url().max(240).optional().or(z.literal('')),
  description: z.string().trim().max(1000).optional(),
  consent: z.literal('accepted')
});

const registerUserSchema = z.object({
  fullName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(200),
  confirmPassword: z.string().min(PASSWORD_MIN_LENGTH).max(200),
  consent: z.literal('accepted')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'passwords do not match',
  path: ['confirmPassword']
});

export type RegisterUserActionResult = { type: 'error'; code: string } | null;

function authResultPath(path: string, result: { type: 'success' | 'error'; code: string }) {
  const url = new URL(path, 'http://localhost');
  url.searchParams.set(result.type, result.code);
  return `${url.pathname}${url.search}`;
}

function redirectWithAuthResult(path: string, result: { type: 'success' | 'error'; code: string }): never {
  redirect(authResultPath(path, result));
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

async function redirectForExistingUserRegistration(email: string, fullName?: string): Promise<RegisterUserActionResult> {
  setRegisterUserFlashCookie(await cookies(), { email, fullName });

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, status: true, emailVerifiedAt: true }
  });

  if (existingUser && existingUser.status === UserStatus.PENDING && !existingUser.emailVerifiedAt) {
    await sendUserVerificationEmail({ email, userId: existingUser.id });
  }

  return { type: 'error', code: 'account-check' };
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
    await redirectWithAuthResult('/auth/register/business', { type: 'error', code: 'disabled' });
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
    await redirectWithAuthResult('/auth/register/business', { type: 'error', code: 'invalid' });
  }

  const businessRequest = parsed.data!;

  // Compute bcrypt hash before transaction to avoid holding DB connection during slow hashing
  const placeholderPasswordHash = await hashPassword(randomBytes(32).toString('hex'));

  type RegistrationOutcome =
    | { status: 'created'; sessionRaw: string; setPasswordUrl: string }
    | { status: 'duplicate' }
    | { status: 'error'; code: string };

  let outcome: RegistrationOutcome;

  try {
    await assertAuthAttemptAllowed({ action: 'register', email: businessRequest.email });

    const result = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: businessRequest.email },
        select: { id: true }
      });

      if (existingUser) return null;

      if (businessRequest.cityId) {
        const city = await tx.city.findFirst({ where: { id: businessRequest.cityId, isActive: true }, select: { id: true } });
        if (!city) throw new Error('city is invalid');
      }

      const baseSlug = slugify(businessRequest.companyName);
      const existing = await tx.businessAccount.count({ where: { slug: { startsWith: baseSlug } } });
      const slug = existing === 0 ? baseSlug : `${baseSlug}-${randomBytes(3).toString('hex')}`;

      const user = await tx.user.create({
        data: {
          email: businessRequest.email,
          passwordHash: placeholderPasswordHash,
          role: UserRole.BUSINESS,
          status: UserStatus.ACTIVE,
          emailVerifiedAt: new Date(),
          profile: { create: { fullName: businessRequest.contactPerson } }
        }
      });

      await tx.businessAccount.create({
        data: {
          ownerId: user.id,
          companyName: businessRequest.companyName,
          slug,
          status: BusinessAccountStatus.ACTIVE,
          contactPerson: businessRequest.contactPerson,
          phone: nullableString(businessRequest.phone),
          telegram: nullableString(businessRequest.telegram),
          cityId: businessRequest.cityId || null,
          websiteUrl: businessRequest.websiteUrl || null,
          description: businessRequest.description || null,
        }
      });

      const rawResetToken = randomBytes(32).toString('hex');
      await tx.userPasswordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: createHash('sha256').update(rawResetToken).digest('hex'),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      const sessionRaw = createSessionToken();
      await tx.session.create({
        data: {
          userId: user.id,
          tokenHash: hashSessionToken(sessionRaw),
          expiresAt: getSessionExpiresAt()
        }
      });

      return {
        sessionRaw,
        setPasswordUrl: `${env.APP_URL}/auth/password-reset/confirm?token=${rawResetToken}`
      };
    });

    outcome = result
      ? { status: 'created', sessionRaw: result.sessionRaw, setPasswordUrl: result.setPasswordUrl }
      : { status: 'duplicate' };

  } catch (error) {
    const code = error instanceof AuthRateLimitError ? 'rate-limited' : resolveRegisterErrorCode(error);
    outcome = { status: 'error', code };
  }

  // All redirects outside try/catch
  if (outcome.status === 'error') {
    redirect(authResultPath('/auth/register/business', { type: 'error', code: outcome.code }));
  }

  if (outcome.status === 'duplicate') {
    redirect(authResultPath('/auth/register/business', { type: 'error', code: 'already-registered' }));
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, outcome.sessionRaw, getSessionCookieOptions());

  void (async () => {
    const { sendBusinessWelcomeEmail } = await import('@/lib/notifications/auth-email');
    await sendBusinessWelcomeEmail({
      to: businessRequest.email,
      companyName: businessRequest.companyName,
      setPasswordUrl: outcome.status === 'created' ? outcome.setPasswordUrl : ''
    });
  })().catch(() => {});

  redirect('/business/cabinet?welcome=1');
}

export async function registerUserAction(
  _prevState: RegisterUserActionResult,
  formData: FormData
): Promise<RegisterUserActionResult> {
  await assertSameOriginServerAction();

  await assertTurnstilePassed(getString(formData, 'turnstileToken'));
  const flash = {
    fullName: getString(formData, 'fullName'),
    email: getString(formData, 'email')
  };

  const parsed = registerUserSchema.safeParse({
    fullName: flash.fullName, email: flash.email,
    password: getString(formData, 'password'), confirmPassword: getString(formData, 'confirmPassword'),
    consent: getString(formData, 'consent')
  });

  if (!parsed.success) {
    setRegisterUserFlashCookie(await cookies(), flash);
    return { type: 'error', code: 'invalid' };
  }

  const registerRequest = parsed.data;

  try {
    await assertAuthAttemptAllowed({ action: 'register', email: registerRequest.email });
    await assertPasswordNotCompromised(registerRequest.password);
    const existingUser = await prisma.user.findUnique({
      where: { email: registerRequest.email },
      select: { id: true, status: true, emailVerifiedAt: true }
    });

    if (existingUser) {
      return redirectForExistingUserRegistration(registerRequest.email, registerRequest.fullName);
    }

    const passwordHash = await hashPassword(registerRequest.password);
    const user = await prisma.user.create({
      data: {
        email: registerRequest.email, passwordHash, role: UserRole.USER, status: UserStatus.PENDING,
        profile: { create: { fullName: registerRequest.fullName } }
      }
    });
    await sendUserVerificationEmail({ email: registerRequest.email, userId: user.id });
  } catch (error) {
    if (error instanceof AuthRateLimitError) return { type: 'error', code: 'rate-limited' };
    if (error instanceof CompromisedPasswordError) return { type: 'error', code: 'compromised-password' };
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return redirectForExistingUserRegistration(registerRequest.email, registerRequest.fullName);
    }
    return { type: 'error', code: resolveRegisterErrorCode(error) };
  }

  // Success: navigate to success screen (intentional navigation)
  redirect(authResultPath('/auth/register/user', { type: 'success', code: 'registered' }));
}
