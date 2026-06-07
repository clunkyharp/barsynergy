'use server';

import { redirect } from 'next/navigation';
import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getString } from '@/lib/admin/content-utils';
import { assertAuthAttemptAllowed } from '@/lib/auth/auth-rate-limit';
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

export async function requestPasswordResetAction(formData: FormData) {
  await assertSameOriginServerAction();

  const email = getString(formData, 'email').trim().toLowerCase();

  if (!email) {
    redirectWithAuthResult('/auth/password-reset', { type: 'error', code: 'invalid' });
  }

  try {
    await assertAuthAttemptAllowed({ action: 'password-reset', email });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (user) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');

      await prisma.$executeRaw`
        INSERT INTO "PasswordResetToken" ("userId", "tokenHash", "expiresAt", "createdAt")
        VALUES (${user.id}, ${tokenHash}, NOW() + INTERVAL '1 hour', NOW())
      `;

      const env = getEnv();
      const resetUrl = `${env.APP_URL}/auth/password-reset/confirm?token=${rawToken}`;
      await sendPasswordResetEmail({ to: email, resetUrl }).catch(() => {
        // best-effort
      });
    }

    redirectWithAuthResult('/auth/password-reset', { type: 'success', code: 'reset-sent' });
  } catch {
    redirectWithAuthResult('/auth/password-reset', { type: 'error', code: 'failed' });
  }
}

export async function resetPasswordAction(formData: FormData) {
  await assertSameOriginServerAction();

  const parsed = resetPasswordSchema.safeParse({
    token: getString(formData, 'token'),
    password: getString(formData, 'password'),
    confirmPassword: getString(formData, 'confirmPassword')
  });

  if (!parsed.success) {
    redirectWithAuthResult('/auth/password-reset/confirm', { type: 'error', code: 'invalid' });
  }

  try {
    const tokenHash = createHash('sha256').update(parsed.data.token).digest('hex');
    const passwordHash = await hashPassword(parsed.data.password);

    const result = await prisma.$queryRaw<{ userId: string }[]>`
      WITH consumed_token AS (
        UPDATE "PasswordResetToken"
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
      )
      DELETE FROM "Session"
      USING updated_password
      WHERE "Session"."userId" = updated_password."userId"
      RETURNING updated_password."userId" AS "userId"
    `;

    if (!result || result.length === 0) {
      redirectWithAuthResult('/auth/password-reset/confirm', { type: 'error', code: 'invalid' });
    }

    redirectWithAuthResult('/auth/login', { type: 'success', code: 'password-reset' });
  } catch {
    redirectWithAuthResult('/auth/password-reset/confirm', { type: 'error', code: 'failed' });
  }
}
