'use server';

import { redirect } from 'next/navigation';
import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getString } from '@/lib/admin/content-utils';
import { AuthRateLimitError, assertAuthAttemptAllowed } from '@/lib/auth/auth-rate-limit';
import { hashPassword } from '@/lib/auth/password';
import { PASSWORD_MIN_LENGTH } from '@/lib/auth/password-policy';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { getEnv } from '@/lib/validation/env';
import { sendPasswordResetEmail } from '@/lib/notifications/auth-email';

const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1),
    password: z.string().min(PASSWORD_MIN_LENGTH).max(200),
    confirmPassword: z.string().min(1).max(200)
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

function redirectWithPasswordResetConfirmResult(token: string, result: { type: 'success' | 'error'; code: string }): never {
  const url = new URL('/auth/password-reset/confirm', 'http://localhost');

  if (token) {
    url.searchParams.set('token', token);
  }

  url.searchParams.set(result.type, result.code);
  redirect(`${url.pathname}${url.search}`);
}

export async function requestPasswordResetAction(formData: FormData) {
  await assertSameOriginServerAction();

  const email = getString(formData, 'email').trim().toLowerCase();

  if (!email) {
    redirectWithAuthResult('/auth/password-reset', { type: 'error', code: 'invalid' });
  }

  let requestAccepted = false;

  try {
    await assertAuthAttemptAllowed({ action: 'password-reset', email });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (user) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.userPasswordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt
        }
      });

      const env = getEnv();
      const resetUrl = `${env.APP_URL}/auth/password-reset/confirm?token=${rawToken}`;
      await sendPasswordResetEmail({ to: email, resetUrl }).catch(() => {
        // best-effort
      });
    }

    requestAccepted = true;
  } catch (error) {
    if (error instanceof AuthRateLimitError) {
      redirectWithAuthResult('/auth/password-reset', { type: 'error', code: 'rate-limited' });
    }

    redirectWithAuthResult('/auth/password-reset', { type: 'error', code: 'failed' });
  }

  if (requestAccepted) {
    redirectWithAuthResult('/auth/password-reset', { type: 'success', code: 'reset-sent' });
  }
}

export async function resetPasswordAction(formData: FormData) {
  await assertSameOriginServerAction();
  const token = getString(formData, 'token');

  const parsed = resetPasswordSchema.safeParse({
    token,
    password: getString(formData, 'password'),
    confirmPassword: getString(formData, 'confirmPassword')
  });

  if (!parsed.success) {
    redirectWithPasswordResetConfirmResult(token, { type: 'error', code: 'invalid' });
  }

  let resetSucceeded = false;

  try {
    const tokenHash = createHash('sha256').update(parsed.data.token).digest('hex');
    const passwordHash = await hashPassword(parsed.data.password);

    const result = await prisma.$queryRaw<{ userId: string }[]>`
      WITH consumed_token AS (
        UPDATE "UserPasswordResetToken"
        SET "usedAt" = NOW(), "updatedAt" = NOW()
        WHERE "tokenHash" = ${tokenHash}
          AND "expiresAt" > NOW()
          AND "usedAt" IS NULL
        RETURNING "userId"
      ),
      updated_password AS (
        UPDATE "User"
        SET "passwordHash" = ${passwordHash}, "updatedAt" = NOW()
        FROM consumed_token
        WHERE "User"."id" = consumed_token."userId"
        RETURNING "User"."id" AS "userId"
      ),
      deleted_sessions AS (
        DELETE FROM "Session"
        USING updated_password
        WHERE "Session"."userId" = updated_password."userId"
      )
      SELECT "userId" FROM updated_password
    `;

    resetSucceeded = Boolean(result && result.length > 0);
  } catch {
    redirectWithPasswordResetConfirmResult(parsed.data.token, { type: 'error', code: 'failed' });
  }

  if (!resetSucceeded) {
    redirectWithPasswordResetConfirmResult(parsed.data.token, { type: 'error', code: 'invalid' });
  }

  redirectWithAuthResult('/auth/login', { type: 'success', code: 'password-reset' });
}
