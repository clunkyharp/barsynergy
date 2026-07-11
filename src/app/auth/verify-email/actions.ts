'use server';

import { redirect } from 'next/navigation';
import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '@/lib/db/prisma';
import { getString } from '@/lib/forms/form-data';
import { AuthRateLimitError, assertAuthAttemptAllowed } from '@/lib/auth/auth-rate-limit';
import { verifyUserEmailToken } from '@/lib/auth/email-verification';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { getEnv } from '@/lib/validation/env';

type ResendVerificationResult = 'verification-resent' | 'invalid' | 'rate-limited' | 'failed';

function authResultPath(path: string, result: { type: 'success' | 'error'; code: string }) {
  const url = new URL(path, 'http://localhost');
  url.searchParams.set(result.type, result.code);
  return `${url.pathname}${url.search}`;
}

function redirectWithAuthResult(path: string, result: { type: 'success' | 'error'; code: string }): never {
  redirect(authResultPath(path, result));
}

export async function verifyUserEmailAction(formData: FormData) {
  await assertSameOriginServerAction();

  const token = getString(formData, 'token');
  const result = await verifyUserEmailToken(token);

  if (result === 'verified') {
    redirectWithAuthResult('/auth/login', { type: 'success', code: 'verified' });
  }

  if (result === 'invalid') {
    redirectWithAuthResult('/auth/verify-email', { type: 'error', code: 'invalid' });
  }

  redirectWithAuthResult('/auth/verify-email', { type: 'error', code: 'failed' });
}

async function resendUserVerificationEmail(email: string): Promise<ResendVerificationResult> {
  if (!email) return 'invalid';

  try {
    await assertAuthAttemptAllowed({ action: 'verify-email', email });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, status: true }
    });

    if (!user || user.status !== 'PENDING') {
      return 'verification-resent';
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      await tx.userEmailVerificationToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
          expiresAt: { gt: new Date() }
        },
        data: { usedAt: new Date() }
      });

      await tx.userEmailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt
        }
      });
    });

    const env = getEnv();
    const verificationUrl = `${env.APP_URL}/auth/verify-email?token=${rawToken}`;
    const { sendVerificationEmail } = await import('@/lib/notifications/auth-email');
    sendVerificationEmail({ to: email, verificationUrl }).catch((error: unknown) => {
      console.error('Failed to send verification email:', error instanceof Error ? error.message : error);
    });

    return 'verification-resent';
  } catch (error) {
    if (error instanceof AuthRateLimitError) {
      return 'rate-limited';
    }
    return 'failed';
  }
}

export async function resendUserVerificationAction(formData: FormData) {
  await assertSameOriginServerAction();

  const email = getString(formData, 'email').trim().toLowerCase();
  const result = await resendUserVerificationEmail(email);

  if (result === 'verification-resent') {
    redirectWithAuthResult('/auth/verify-email', { type: 'success', code: 'verification-resent' });
  }

  redirectWithAuthResult('/auth/verify-email', { type: 'error', code: result });
}
