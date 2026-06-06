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
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { hasErrorMessage, resolveServerActionError } from '@/lib/actions/server-action-errors';

const ADMIN_USERS_PATH = '/admin/users';

const userStatusFormSchema = z.object({
  userId: z.string().trim().min(1),
  status: z.enum(['active', 'blocked'])
});

export async function updateBusinessUserAccess(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_USERS_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    await requireAdminSectionAccess('users');
    const parsed = userStatusFormSchema.parse({
      userId: getString(formData, 'userId'),
      status: getString(formData, 'status')
    });
    const currentUser = await prisma.user.findUnique({
      where: { id: parsed.userId },
      select: {
        status: true,
        businessAccount: {
          select: { status: true }
        }
      }
    });

    if (!currentUser?.businessAccount) {
      throw new Error('business account is missing');
    }

    if (
      parsed.status === 'active' &&
      (currentUser.status === UserStatus.PENDING || currentUser.businessAccount.status === BusinessAccountStatus.PENDING)
    ) {
      throw new Error('pending business activation is disabled');
    }

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
  } catch (error) {
    result = {
      type: 'error',
      message: resolveServerActionError({
        action: 'admin:users',
        error,
        zodMessage: 'Проверьте корректность переданных данных.',
        known: [
          {
            matches: (e) => hasErrorMessage(e, 'pending business activation is disabled'),
            message: 'Для новых заявок доступ больше не открывается напрямую. Сначала завершите отдельную подготовку доступа.'
          },
          {
            matches: (e) => hasErrorMessage(e, 'business account is missing'),
            message: 'Не удалось изменить доступ. Проверьте, что у пользователя есть бизнес-аккаунт.'
          }
        ],
        fallbackMessage: 'Не удалось изменить доступ.'
      })
    };
  }

  redirectWithAdminActionResult(redirectTo, result);
}
