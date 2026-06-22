'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { SkillSource } from '@prisma/client';
import { getArray } from '@/lib/forms/form-data';
import { resolveServerActionError } from '@/lib/actions/server-action-errors';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import type { ProfileActionResult } from '@/lib/profile/profile-action-result';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { slugify } from '@/lib/utils/slugify';

const SETTINGS_PATH = '/profile/settings';
const MAX_SKILLS = 20;
const MAX_SKILL_LENGTH = 40;
const USER_GENERATED_SORT_BUCKET = 100_000;

function normalizeSkillName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function readSkillNames(formData: FormData) {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const value of getArray(formData, 'skillNames')) {
    const name = normalizeSkillName(value);
    const key = name.toLocaleLowerCase('ru-RU');

    if (!name || name.length > MAX_SKILL_LENGTH || seen.has(key)) {
      continue;
    }

    seen.add(key);
    names.push(name);

    if (names.length >= MAX_SKILLS) {
      break;
    }
  }

  return names;
}

export async function updateProfileSkills(_prevState: ProfileActionResult, formData: FormData): Promise<ProfileActionResult> {
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

    const skillNames = readSkillNames(formData);

    await prisma.$transaction(async (tx) => {
      await tx.profileSkill.deleteMany({ where: { profileId: profile.id } });

      if (skillNames.length > 0) {
        const slugs = skillNames.map((name) => slugify(name)).filter(Boolean);
        const existingBySlug = new Map(
          (await tx.skill.findMany({
            where: { slug: { in: slugs } },
            select: { id: true, slug: true, isActive: true, source: true }
          })).map((s) => [s.slug, s])
        );
        const skillIds: string[] = [];

        for (const name of skillNames) {
          const slug = slugify(name);

          if (!slug) {
            continue;
          }

          const existing = existingBySlug.get(slug);

          if (existing) {
            // Reactivate only user-generated inactive skills; admin-deactivated stay as-is
            if (!existing.isActive && existing.source === SkillSource.USER_GENERATED) {
              await tx.skill.update({ where: { id: existing.id }, data: { isActive: true } });
            }

            skillIds.push(existing.id);
          } else {
            // Upsert handles concurrent requests creating the same slug (P2002-safe)
            const upserted = await tx.skill.upsert({
              where: { slug },
              create: {
                name,
                slug,
                source: SkillSource.USER_GENERATED,
                isActive: true,
                sortOrder: USER_GENERATED_SORT_BUCKET
              },
              update: {},
              select: { id: true }
            });
            skillIds.push(upserted.id);
          }
        }

        if (skillIds.length > 0) {
          await tx.profileSkill.createMany({
            data: skillIds.map((skillId) => ({ profileId: profile.id, skillId }))
          });
        }
      }
    });

    revalidatePath('/profile');
    revalidatePath(SETTINGS_PATH, 'layout');
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

  return result;
}
