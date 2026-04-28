import { redirect } from 'next/navigation';
import { BusinessAccountStatus, UserRole } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';

export async function requireBusinessAccountAccess() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  if (user.role !== UserRole.BUSINESS) {
    redirect('/');
  }

  const businessAccount = await prisma.businessAccount.findFirst({
    where: {
      ownerId: user.id,
      status: BusinessAccountStatus.ACTIVE
    },
    include: {
      city: { select: { name: true } }
    }
  });

  if (!businessAccount) {
    redirect('/auth/login?error=pending');
  }

  return { user, businessAccount };
}
