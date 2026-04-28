'use server';

import { revalidatePath } from 'next/cache';
import { BusinessAccountStatus, UserStatus } from '@prisma/client';
import { z } from 'zod';
import {
  getString,
  redirectWithAdminActionResult,
  safeAdminRedirectPath
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

const ADMIN_USERS_PATH = '/admin/users';

const userStatusFormSchema = z.object({
  userId: z.string().trim().min(1),
  status: z.enum(['active', 'blocked'])
});

export async function updateBusinessUserAccess(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_USERS_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await requireAdminSectionAccess('users');
    const parsed = userStatusFormSchema.parse({
      userId: getString(formData, 'userId'),
      status: getString(formData, 'status')
    });
    const userStatus = parsed.status === 'active' ? UserStatus.ACTIVE : UserStatus.BLOCKED;
    const businessStatus = parsed.status === 'active' ? BusinessAccountStatus.ACTIVE : BusinessAccountStatus.BLOCKED;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: parsed.userId },
        data: { status: userStatus }
      }),
      prisma.businessAccount.update({
        where: { ownerId: parsed.userId },
        data: { status: businessStatus }
      })
    ]);

    revalidatePath(ADMIN_USERS_PATH);
    result = {
      type: 'success',
      message: parsed.status === 'active' ? 'Бизнес-доступ открыт.' : 'Бизнес-доступ заблокирован.'
    };
  } catch {
    result = {
      type: 'error',
      message: 'Не удалось изменить доступ. Проверьте, что у пользователя есть бизнес-аккаунт.'
    };
  }

  redirectWithAdminActionResult(redirectTo, result);
}
