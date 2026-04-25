import { cookies } from 'next/headers';
import { UserStatus } from '@prisma/client';
import { SESSION_COOKIE_NAME, hashSessionToken } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!session || session.expiresAt <= new Date() || session.user.status !== UserStatus.ACTIVE) {
    return null;
  }

  return session.user;
}
