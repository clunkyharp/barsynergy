'use server';

import { revalidatePath } from 'next/cache';
import { SkillSource } from '@prisma/client';
import { z } from 'zod';
import {
  getString,
  optionalString,
  persistWithUniqueSlugRetry,
  slugify
} from '@/lib/admin/content-utils';
import { prisma } from '@/lib/db/prisma';
import { withAdminAction } from '@/lib/server-action-wrappers';

const ADMIN_SKILLS_PATH = '/admin/skills';

const skillFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().max(160).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(100_000).default(0)
});

const skillUpdateSchema = skillFormSchema.extend({
  skillId: z.string().trim().min(1)
});

function readBooleanFormValue(formData: FormData, key: string, fallback: boolean) {
  const value = getString(formData, key);

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return fallback;
}

function readSkillForm(formData: FormData, defaultIsActive = true) {
  const parsed = skillFormSchema.parse({
    name: getString(formData, 'name'),
    slug: optionalString(getString(formData, 'slug')),
    isActive: readBooleanFormValue(formData, 'isActive', defaultIsActive),
    sortOrder: getString(formData, 'sortOrder') || '0'
  });
  const slug = slugify(parsed.slug ?? parsed.name);

  if (!slug) {
    throw new Error('Slug is required.');
  }

  return { ...parsed, slug };
}

export async function createSkill(formData: FormData) {
  await withAdminAction({
    formData,
    section: 'skills',
    defaultRedirectPath: ADMIN_SKILLS_PATH,
    handler: async () => {
      const parsed = readSkillForm(formData);

      await persistWithUniqueSlugRetry({
        baseSlug: parsed.slug,
        exists: async (candidate) =>
          Boolean(
            await prisma.skill.findUnique({
              where: { slug: candidate },
              select: { id: true }
            })
          ),
        persist: (uniqueSlug) =>
          prisma.skill.create({
            data: {
              name: parsed.name,
              slug: uniqueSlug,
              source: SkillSource.ADMIN,
              isActive: parsed.isActive,
              sortOrder: parsed.sortOrder
            }
          })
      });

      revalidatePath(ADMIN_SKILLS_PATH);
      return { type: 'success', message: 'Навык создан.' };
    }
  });
}

export async function updateSkill(formData: FormData) {
  await withAdminAction({
    formData,
    section: 'skills',
    defaultRedirectPath: ADMIN_SKILLS_PATH,
    handler: async () => {
      const base = readSkillForm(formData);
      const parsed = skillUpdateSchema.parse({
        ...base,
        skillId: getString(formData, 'skillId')
      });
      const slug = parsed.slug ?? base.slug;
      const conflict = await prisma.skill.findUnique({
        where: { slug },
        select: { id: true }
      });

      if (conflict && conflict.id !== parsed.skillId) {
        throw new Error('Slug уже используется.');
      }

      await prisma.skill.update({
        where: { id: parsed.skillId },
        data: {
          name: parsed.name,
          slug,
          isActive: parsed.isActive,
          sortOrder: parsed.sortOrder
        }
      });

      revalidatePath(ADMIN_SKILLS_PATH);
      return { type: 'success', message: 'Навык обновлён.' };
    }
  });
}
