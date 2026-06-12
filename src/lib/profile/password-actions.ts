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

export async function changePassword(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

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

    const newPasswordHash = await hashPassword(parsed.newPassword);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash }
      });
      await tx.session.deleteMany({ where: { userId: user.id } });
    });

    revalidatePath(SETTINGS_PATH);
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
          }
        ],
        fallbackMessage: 'Не удалось сменить пароль. Попробуйте позже.'
      })
    };
  }

  const url = new URL(SETTINGS_PATH, 'http://localhost');
  url.searchParams.delete('success');
  url.searchParams.delete('error');
  url.searchParams.set(result.type, result.message);
  redirect(`${url.pathname}${url.search}`);
}
