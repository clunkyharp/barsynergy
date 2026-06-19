'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getString } from '@/lib/admin/content-utils';
import { resolveServerActionError } from '@/lib/actions/server-action-errors';
import { getCurrentUser } from '@/lib/auth/current-user';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { PASSWORD_MIN_LENGTH } from '@/lib/auth/password-policy';
import { prisma } from '@/lib/db/prisma';
import type { ProfileActionResult } from '@/lib/profile/profile-action-result';
import { CompromisedPasswordError, assertPasswordNotCompromised } from '@/lib/security/hibp';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(PASSWORD_MIN_LENGTH).max(200),
  confirmPassword: z.string().min(1).max(200)
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword']
});

const SETTINGS_PATH = '/profile/settings';

export async function changePassword(_prevState: ProfileActionResult, formData: FormData): Promise<ProfileActionResult> {
  let result: Exclude<ProfileActionResult, null>;

  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      redirect('/auth/login');
    }

    const parsed = changePasswordSchema.parse({
      currentPassword: getString(formData, 'currentPassword'),
      newPassword: getString(formData, 'newPassword'),
      confirmPassword: getString(formData, 'confirmPassword')
    });

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true }
    });

    if (!fullUser) {
      throw new Error('user not found');
    }

    const isValid = await verifyPassword(parsed.currentPassword, fullUser.passwordHash);

    if (!isValid) {
      throw new Error('current password is invalid');
    }

    await assertPasswordNotCompromised(parsed.newPassword);
    const newPasswordHash = await hashPassword(parsed.newPassword);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash }
      });
      await tx.session.deleteMany({ where: { userId: user.id } });
    });

    revalidatePath(SETTINGS_PATH, 'layout');
    result = { type: 'success', message: 'Пароль изменён. Перезайдите с новым паролем.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveServerActionError({
        action: 'profile:change-password',
        error,
        zodMessage: 'Не удалось сменить пароль. Проверьте правильность текущего пароля.',
        known: [
          {
            matches: (e: Error) => e.message === 'current password is invalid',
            message: 'Текущий пароль указан неверно.'
          },
          {
            matches: (e: Error) => e instanceof CompromisedPasswordError,
            message: 'Этот пароль уже встречался в утечках. Выберите другую фразу или пароль.'
          }
        ],
        fallbackMessage: 'Не удалось сменить пароль. Попробуйте позже.'
      })
    };
  }

  return result;
}
