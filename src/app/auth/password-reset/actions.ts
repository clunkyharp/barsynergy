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

export type PasswordResetRequestResult = { type: 'success' | 'error'; code: string } | null;
export type PasswordResetConfirmResult = { type: 'error'; code: string } | null;

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

export async function requestPasswordResetAction(
  _prevState: PasswordResetRequestResult,
  formData: FormData
): Promise<PasswordResetRequestResult> {
  await assertSameOriginServerAction();

  const email = getString(formData, 'email').trim().toLowerCase();

  if (!email) {
    return { type: 'error', code: 'invalid' };
  }

  try {
    await assertAuthAttemptAllowed({ action: 'password-reset', email });

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

    if (user) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.userPasswordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

      const env = getEnv();
      const resetUrl = `${env.APP_URL}/auth/password-reset/confirm?token=${rawToken}`;
      await sendPasswordResetEmail({ to: email, resetUrl }).catch(() => {});
    }

    return { type: 'success', code: 'reset-sent' };
  } catch (error) {
    if (error instanceof AuthRateLimitError) return { type: 'error', code: 'rate-limited' };
    return { type: 'error', code: 'failed' };
  }
}

export async function resetPasswordAction(
  _prevState: PasswordResetConfirmResult,
  formData: FormData
): Promise<PasswordResetConfirmResult> {
  await assertSameOriginServerAction();

  const token = getString(formData, 'token');

  const parsed = resetPasswordSchema.safeParse({
    token,
    password: getString(formData, 'password'),
    confirmPassword: getString(formData, 'confirmPassword')
  });

  if (!parsed.success) {
    return { type: 'error', code: 'invalid' };
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
    return { type: 'error', code: 'failed' };
  }

  if (!resetSucceeded) {
    return { type: 'error', code: 'invalid' };
  }

  // Navigate to login with success message (intentional navigation)
  redirect('/auth/login?success=password-reset');
}
