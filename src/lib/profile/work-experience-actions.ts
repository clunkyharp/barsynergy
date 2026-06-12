'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getString, optionalString } from '@/lib/admin/content-utils';
import { resolveServerActionError } from '@/lib/actions/server-action-errors';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import type { ProfileActionResult } from '@/lib/profile/profile-action-result';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';

const workExperienceSchema = z.object({
  id: z.string().optional(),
  companyName: z.string().trim().min(1).max(240),
  position: z.string().trim().min(1).max(240),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  sortOrder: z.coerce.number().int().default(0)
});

const SETTINGS_PATH = '/profile/settings';

export async function updateWorkExperiences(_prevState: ProfileActionResult, formData: FormData): Promise<ProfileActionResult> {
  let result: Exclude<ProfileActionResult, null>;

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

    const rawExperiences: unknown[] = [];
    const indexes = [...new Set(
      Array.from(formData.keys())
        .filter((k) => k.startsWith('experiences.'))
        .map((k) => k.split('.')[1])
    )];

    for (const idx of indexes) {
      rawExperiences.push({
        id: optionalString(getString(formData, `experiences.${idx}.id`)),
        companyName: getString(formData, `experiences.${idx}.companyName`),
        position: getString(formData, `experiences.${idx}.position`),
        startDate: getString(formData, `experiences.${idx}.startDate`),
        endDate: optionalString(getString(formData, `experiences.${idx}.endDate`)),
        description: optionalString(getString(formData, `experiences.${idx}.description`)),
        sortOrder: Number(idx)
      });
    }

    const filteredExperiences = rawExperiences.filter(
      (e) => (e as Record<string, unknown>).companyName || (e as Record<string, unknown>).position || (e as Record<string, unknown>).startDate
    );

    const parsed = z.array(workExperienceSchema).parse(filteredExperiences);

    const existingIds = new Set(
      (await prisma.workExperience.findMany({
        where: { profileId: profile.id },
        select: { id: true }
      })).map((e) => e.id)
    );

    const incomingIds = new Set(parsed.filter((e) => e.id).map((e) => e.id as string));
    const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

    await prisma.$transaction(async (tx) => {
      if (toDelete.length > 0) {
        await tx.workExperience.deleteMany({ where: { id: { in: toDelete }, profileId: profile.id } });
      }

      for (const exp of parsed) {
        if (exp.id) {
          const updated = await tx.workExperience.updateMany({
            where: { id: exp.id, profileId: profile.id },
            data: {
              companyName: exp.companyName,
              position: exp.position,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              description: exp.description ?? null,
              sortOrder: exp.sortOrder
            }
          });
          if (updated.count === 0) {
            throw new Error('work experience not found');
          }
        } else {
          await tx.workExperience.create({
            data: {
              profileId: profile.id,
              companyName: exp.companyName,
              position: exp.position,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              description: exp.description ?? null,
              sortOrder: exp.sortOrder
            }
          });
        }
      }
    });

    revalidatePath('/profile');
    revalidatePath(SETTINGS_PATH);
    result = { type: 'success', message: 'Опыт работы сохранён.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveServerActionError({
        action: 'profile:update-work-experiences',
        error,
        zodMessage: 'Не удалось сохранить опыт работы. Проверьте поля.',
        known: [],
        fallbackMessage: 'Не удалось сохранить опыт работы. Попробуйте позже.'
      })
    };
  }

  return result;
}
