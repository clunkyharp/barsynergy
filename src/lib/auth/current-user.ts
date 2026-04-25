import { cookies } from 'next/headers';
import type { Prisma } from '@prisma/client';
import { UserStatus } from '@prisma/client';
import { SESSION_COOKIE_NAME, hashSessionToken } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

const currentUserSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.UserSelect;

export type CurrentUser = Prisma.UserGetPayload<{ select: typeof currentUserSelect }>;

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: { select: currentUserSelect } }
  });

  if (!session || session.expiresAt <= new Date() || session.user.status !== UserStatus.ACTIVE) {
    return null;
  }

  return session.user;
}
