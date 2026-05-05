'use server';

import { revalidatePath } from 'next/cache';
import { CategoryType } from '@prisma/client';
import { z } from 'zod';
import {
  formatAdminActionError,
  getString,
  nullableString,
  optionalString,
  redirectWithAdminActionResult,
  safeAdminRedirectPath,
  slugify
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

const ADMIN_CATEGORIES_PATH = '/admin/categories';
const ADMIN_CITIES_PATH = '/admin/cities';

const categorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(160).optional(),
  type: z.enum(CategoryType),
  description: z.string().trim().max(500).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(100_000).default(0)
});

const citySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(160).optional(),
  region: z.string().trim().max(160).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(100_000).default(0)
});

function readSlug(value: string | undefined, fallback: string, label: string) {
  const slug = slugify(value ?? fallback);

  if (!slug) {
    throw new Error(`${label} slug is required.`);
  }

  return slug;
}

function revalidateTaxonomyPaths() {
  [
    ADMIN_CATEGORIES_PATH,
    ADMIN_CITIES_PATH,
    '/admin/articles/create',
    '/admin/events/create',
    '/admin/courses/create',
    '/admin/vacancies/create',
    '/admin/suppliers/create',
    '/admin/partners/create',
    '/articles',
    '/events',
    '/education',
    '/vacancies',
    '/suppliers',
    '/partners'
  ].forEach((path) => revalidatePath(path));
}

export async function createCategory(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_CATEGORIES_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await requireAdminSectionAccess('categories');
    const parsed = categorySchema.parse({
      name: getString(formData, 'name'),
      slug: optionalString(getString(formData, 'slug')),
      type: getString(formData, 'type'),
      description: optionalString(getString(formData, 'description')),
      isActive: getString(formData, 'isActive') === 'true',
      sortOrder: getString(formData, 'sortOrder') || '0'
    });
    const slug = readSlug(parsed.slug, parsed.name, 'Category');

    await prisma.category.create({
      data: {
        name: parsed.name,
        slug,
        type: parsed.type,
        description: nullableString(parsed.description),
        isActive: parsed.isActive,
        sortOrder: parsed.sortOrder
      }
    });

    revalidateTaxonomyPaths();
    result = { type: 'success', message: 'Категория создана.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updateCategory(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_CATEGORIES_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await requireAdminSectionAccess('categories');
    const categoryId = getString(formData, 'categoryId');
    const parsed = categorySchema.parse({
      name: getString(formData, 'name'),
      slug: optionalString(getString(formData, 'slug')),
      type: getString(formData, 'type'),
      description: optionalString(getString(formData, 'description')),
      isActive: getString(formData, 'isActive') === 'true',
      sortOrder: getString(formData, 'sortOrder') || '0'
    });
    const slug = readSlug(parsed.slug, parsed.name, 'Category');
    const conflict = await prisma.category.findUnique({
      where: { slug_type: { slug, type: parsed.type } },
      select: { id: true }
    });

    if (conflict && conflict.id !== categoryId) {
      throw new Error('Category slug is already used.');
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: parsed.name,
        slug,
        type: parsed.type,
        description: nullableString(parsed.description),
        isActive: parsed.isActive,
        sortOrder: parsed.sortOrder
      }
    });

    revalidateTaxonomyPaths();
    result = { type: 'success', message: 'Категория обновлена.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function createCity(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_CITIES_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await requireAdminSectionAccess('cities');
    const parsed = citySchema.parse({
      name: getString(formData, 'name'),
      slug: optionalString(getString(formData, 'slug')),
      region: optionalString(getString(formData, 'region')),
      isActive: getString(formData, 'isActive') === 'true',
      sortOrder: getString(formData, 'sortOrder') || '0'
    });
    const slug = readSlug(parsed.slug, parsed.name, 'City');

    await prisma.city.create({
      data: {
        name: parsed.name,
        slug,
        region: parsed.region,
        isActive: parsed.isActive,
        sortOrder: parsed.sortOrder
      }
    });

    revalidateTaxonomyPaths();
    result = { type: 'success', message: 'Город создан.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updateCity(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_CITIES_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await requireAdminSectionAccess('cities');
    const cityId = getString(formData, 'cityId');
    const parsed = citySchema.parse({
      name: getString(formData, 'name'),
      slug: optionalString(getString(formData, 'slug')),
      region: optionalString(getString(formData, 'region')),
      isActive: getString(formData, 'isActive') === 'true',
      sortOrder: getString(formData, 'sortOrder') || '0'
    });
    const slug = readSlug(parsed.slug, parsed.name, 'City');
    const conflict = await prisma.city.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (conflict && conflict.id !== cityId) {
      throw new Error('City slug is already used.');
    }

    await prisma.city.update({
      where: { id: cityId },
      data: {
        name: parsed.name,
        slug,
        region: parsed.region,
        isActive: parsed.isActive,
        sortOrder: parsed.sortOrder
      }
    });

    revalidateTaxonomyPaths();
    result = { type: 'success', message: 'Город обновлен.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}
