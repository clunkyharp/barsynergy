'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getArray } from '@/lib/admin/content-utils';
import { resolveServerActionError } from '@/lib/actions/server-action-errors';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';

const SETTINGS_PATH = '/profile/settings';

export async function updateProfileSkills(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      redirect('/auth/login');
    }

    const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } });

    if (!profile) {
      throw new Error('profile not found');
    }

    const skillIds = getArray(formData, 'skillIds');

    await prisma.$transaction(async (tx) => {
      await tx.profileSkill.deleteMany({ where: { profileId: profile.id } });

      if (skillIds.length > 0) {
        const validSkills = await tx.skill.findMany({
          where: { id: { in: skillIds }, isActive: true },
          select: { id: true }
        });

        if (validSkills.length > 0) {
          await tx.profileSkill.createMany({
            data: validSkills.map((s) => ({ profileId: profile.id, skillId: s.id }))
          });
        }
      }
    });

    revalidatePath('/profile');
    revalidatePath(SETTINGS_PATH);
    result = { type: 'success', message: 'Навыки сохранены.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveServerActionError({
        action: 'profile:update-skills',
        error,
        zodMessage: 'Не удалось сохранить навыки.',
        known: [],
        fallbackMessage: 'Не удалось сохранить навыки. Попробуйте позже.'
      })
    };
  }

  const url = new URL(SETTINGS_PATH, 'http://localhost');
  url.searchParams.delete('success');
  url.searchParams.delete('error');
  url.searchParams.set(result.type, result.message);
  redirect(`${url.pathname}${url.search}`);
}
