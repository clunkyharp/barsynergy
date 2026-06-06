'use server';

import { revalidatePath } from 'next/cache';
import { CategoryType } from '@prisma/client';
import { z } from 'zod';
import {
  getString,
  nullableString,
  optionalString,
  persistWithUniqueSlugRetry,
  slugify
} from '@/lib/admin/content-utils';
import { prisma } from '@/lib/db/prisma';
import { withAdminAction } from '@/lib/server-action-wrappers';

const ADMIN_TAGS_PATH = '/admin/tags';

const tagFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(160).optional(),
  type: z.enum(CategoryType).default(CategoryType.ARTICLE),
  description: z.string().trim().max(500).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(100_000).default(0)
});

const tagUpdateSchema = tagFormSchema.extend({
  tagId: z.string().trim().min(1)
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

function readTagForm(formData: FormData, defaultIsActive = true) {
  const parsed = tagFormSchema.parse({
    name: getString(formData, 'name'),
    slug: optionalString(getString(formData, 'slug')),
    type: getString(formData, 'type') || CategoryType.ARTICLE,
    description: optionalString(getString(formData, 'description')),
    isActive: readBooleanFormValue(formData, 'isActive', defaultIsActive),
    sortOrder: getString(formData, 'sortOrder') || '0'
  });
  const slug = slugify(parsed.slug ?? parsed.name);

  if (!slug) {
    throw new Error('Tag slug is required.');
  }

  return { ...parsed, slug };
}

function revalidateTagPaths() {
  revalidatePath(ADMIN_TAGS_PATH);
  revalidatePath('/admin/articles/create');
  revalidatePath('/admin/articles');
  revalidatePath('/articles');
}

export async function createTag(formData: FormData) {
  await withAdminAction({
    formData,
    section: 'tags',
    defaultRedirectPath: ADMIN_TAGS_PATH,
    handler: async () => {
      const parsed = readTagForm(formData);

      await persistWithUniqueSlugRetry({
        baseSlug: parsed.slug,
        exists: async (candidate) =>
          Boolean(
            await prisma.tag.findUnique({
              where: { slug_type: { slug: candidate, type: parsed.type } },
              select: { id: true }
            })
          ),
        persist: (uniqueSlug) =>
          prisma.tag.create({
            data: {
              name: parsed.name,
              slug: uniqueSlug,
              type: parsed.type,
              description: nullableString(parsed.description),
              isActive: parsed.isActive,
              sortOrder: parsed.sortOrder
            }
          })
      });

      revalidateTagPaths();
      return { type: 'success', message: 'Тег создан.' };
    }
  });
}

export async function updateTag(formData: FormData) {
  await withAdminAction({
    formData,
    section: 'tags',
    defaultRedirectPath: ADMIN_TAGS_PATH,
    handler: async () => {
      const base = readTagForm(formData);
      const parsed = tagUpdateSchema.parse({
        ...base,
        tagId: getString(formData, 'tagId')
      });
      const slug = parsed.slug ?? base.slug;
      const conflict = await prisma.tag.findUnique({
        where: { slug_type: { slug, type: parsed.type } },
        select: { id: true }
      });

      if (conflict && conflict.id !== parsed.tagId) {
        throw new Error('Tag slug is already used.');
      }

      await prisma.tag.update({
        where: { id: parsed.tagId },
        data: {
          name: parsed.name,
          slug,
          type: parsed.type,
          description: nullableString(parsed.description),
          isActive: parsed.isActive,
          sortOrder: parsed.sortOrder
        }
      });

      revalidateTagPaths();
      return { type: 'success', message: 'Тег обновлен.' };
    }
  });
}
