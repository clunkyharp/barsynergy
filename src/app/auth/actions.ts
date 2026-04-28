'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApplicationStatus, ApplicationType, BusinessAccountStatus, UserRole, UserStatus, type Prisma } from '@prisma/client';
import { z } from 'zod';
import { getString, nullableString, optionalString, slugify } from '@/lib/admin/content-utils';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
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
  password: z.string().min(8).max(200),
  cityId: z.string().trim().optional(),
  phone: z.string().trim().max(80).optional(),
  telegram: z.string().trim().max(80).optional(),
  websiteUrl: z.string().trim().url().max(240).optional().or(z.literal('')),
  description: z.string().trim().max(1000).optional(),
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

function getPostLoginPath(role: UserRole) {
  if (role === UserRole.ADMIN || role === UserRole.MODERATOR) {
    return '/admin';
  }

  if (role === UserRole.BUSINESS) {
    return '/business';
  }

  return '/';
}

async function getUniqueBusinessSlug(tx: Prisma.TransactionClient, companyName: string) {
  const baseSlug = slugify(companyName) || 'business';
  let candidate = baseSlug;
  let suffix = 2;

  while (await tx.businessAccount.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: getString(formData, 'email').toLowerCase(),
    password: getString(formData, 'password')
  });

  if (!parsed.success) {
    redirectWithAuthResult('/auth/login', { type: 'error', code: 'invalid' });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, passwordHash: true, role: true, status: true }
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
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
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  redirectWithAuthResult('/auth/login', { type: 'success', code: 'logged-out' });
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
    password: getString(formData, 'password'),
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

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true }
  });

  if (existingUser) {
    redirectWithAuthResult('/auth/register', { type: 'error', code: 'exists' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (parsed.data.cityId) {
        const city = await tx.city.findFirst({
          where: { id: parsed.data.cityId, isActive: true },
          select: { id: true }
        });

        if (!city) {
          throw new Error('city is invalid');
        }
      }

      const user = await tx.user.create({
        data: {
          email: parsed.data.email,
          passwordHash: await hashPassword(parsed.data.password),
          role: UserRole.BUSINESS,
          status: UserStatus.PENDING
        },
        select: { id: true }
      });
      const businessAccount = await tx.businessAccount.create({
        data: {
          ownerId: user.id,
          companyName: parsed.data.companyName,
          slug: await getUniqueBusinessSlug(tx, parsed.data.companyName),
          status: BusinessAccountStatus.PENDING,
          cityId: nullableString(parsed.data.cityId),
          contactPerson: parsed.data.contactPerson,
          phone: nullableString(parsed.data.phone),
          telegram: nullableString(parsed.data.telegram),
          websiteUrl: nullableString(parsed.data.websiteUrl),
          description: nullableString(parsed.data.description)
        },
        select: { id: true }
      });

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
          businessAccountId: businessAccount.id,
          payload: {
            companyName: parsed.data.companyName,
            websiteUrl: parsed.data.websiteUrl || null,
            description: parsed.data.description || null
          },
          consentAcceptedAt: new Date(),
          consentText: 'Согласие на обработку персональных данных для рассмотрения заявки на бизнес-доступ.'
        }
      });
    });
  } catch {
    redirectWithAuthResult('/auth/register', { type: 'error', code: 'invalid' });
  }

  redirectWithAuthResult('/auth/login', { type: 'success', code: 'business-request-created' });
}
