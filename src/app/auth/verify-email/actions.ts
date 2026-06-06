'use server';

import { redirect } from 'next/navigation';
import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '@/lib/db/prisma';
import { getString } from '@/lib/admin/content-utils';
import { assertAuthAttemptAllowed } from '@/lib/auth/auth-rate-limit';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';

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

  if (!token) {
    redirectWithAuthResult('/auth/verify-email', { type: 'error', code: 'invalid' });
  }

  try {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const record = await prisma.$executeRaw`
      DELETE FROM "UserEmailVerificationToken"
      WHERE "tokenHash" = ${tokenHash}
        AND "expiresAt" > NOW()
        AND "usedAt" IS NULL
      RETURNING "userId"
    `;

    if (!record) {
      redirectWithAuthResult('/auth/verify-email', { type: 'error', code: 'invalid' });
    }

    redirectWithAuthResult('/auth/login', { type: 'success', code: 'verified' });
  } catch {
    redirectWithAuthResult('/auth/verify-email', { type: 'error', code: 'failed' });
  }
}

export async function resendUserVerificationAction(formData: FormData) {
  await assertSameOriginServerAction();

  const email = getString(formData, 'email').trim().toLowerCase();

  if (!email) {
    redirectWithAuthResult('/auth/verify-email', { type: 'error', code: 'invalid' });
  }

  try {
    await assertAuthAttemptAllowed({ action: 'verify-email', email });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, status: true }
    });

    if (!user || user.status !== 'PENDING') {
      redirectWithAuthResult('/auth/verify-email', { type: 'success', code: 'verification-resent' });
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    await prisma.$executeRaw`
      INSERT INTO "UserEmailVerificationToken" ("userId", "tokenHash", "expiresAt", "createdAt")
      VALUES (${user.id}, ${tokenHash}, NOW() + INTERVAL '24 hours', NOW())
    `;

    redirectWithAuthResult('/auth/verify-email', { type: 'success', code: 'verification-resent' });
  } catch {
    redirectWithAuthResult('/auth/verify-email', { type: 'error', code: 'rate-limited' });
  }
}
