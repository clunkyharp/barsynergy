'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/current-user';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { resolveServerActionError } from '@/lib/actions/server-action-errors';

export async function removeSavedVacancyAction(formData: FormData) {
  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      redirect('/auth/login');
    }

    const savedVacancyId = formData.get('savedVacancyId') as string;

    if (!savedVacancyId) {
      throw new Error('savedVacancyId is required');
    }

    await prisma.savedVacancy.delete({
      where: { id: savedVacancyId, userId: user.id }
    });

    revalidatePath('/profile/saved-vacancies');
  } catch (error) {
    console.error('Failed to remove saved vacancy:', error);
  }
}

export async function toggleSavedVacancy(vacancyId: string) {
  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      redirect('/auth/login');
    }

    const existing = await prisma.savedVacancy.findUnique({
      where: { userId_vacancyId: { userId: user.id, vacancyId } }
    });

    if (existing) {
      await prisma.savedVacancy.delete({ where: { id: existing.id } });
    } else {
      await prisma.savedVacancy.create({
        data: { userId: user.id, vacancyId }
      });
    }

    revalidatePath(`/vacancies/${vacancyId}`);
    revalidatePath('/profile/saved-vacancies');
    return { saved: !existing };
  } catch (error) {
    return {
      saved: false,
      error: resolveServerActionError({
        action: 'saved-vacancy:toggle',
        error,
        zodMessage: 'Не удалось изменить статус избранного.',
        known: [],
        fallbackMessage: 'Не удалось изменить статус избранного. Попробуйте позже.'
      })
    };
  }
}

export async function getSavedVacancies() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  return prisma.savedVacancy.findMany({
    where: { userId: user.id },
    include: {
      vacancy: {
        select: {
          id: true,
          title: true,
          slug: true,
          companyName: true,
          city: { select: { name: true } },
          salaryLabel: true,
          employmentType: true,
          publishedAt: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}
