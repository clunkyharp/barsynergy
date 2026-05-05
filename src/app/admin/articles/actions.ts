'use server';

import { revalidatePath } from 'next/cache';
import { CategoryType, ContentStatus } from '@prisma/client';
import { z } from 'zod';
import {
  assertActiveContentRelations,
  contentStatusValues,
  deleteUploadedFileIfUnused,
  formatAdminActionError,
  getString,
  initialPublicationDates,
  nullableString,
  optionalString,
  persistWithUniqueSlugRetry,
  redirectWithAdminActionResult,
  resolveCoverImageId,
  safeAdminRedirectPath,
  slugify,
  statusTransitionDates
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

const ADMIN_ARTICLES_PATH = '/admin/articles';
const ARTICLE_BODY_MAX_LENGTH = 20_000;

const articleFormSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(180).optional(),
  summary: z.string().trim().min(10).max(500),
  body: z.string().trim().min(20).max(ARTICLE_BODY_MAX_LENGTH),
  status: z.enum(contentStatusValues).default(ContentStatus.DRAFT),
  coverImageAlt: z.string().trim().max(180).optional(),
  categoryId: z.string().trim().optional(),
  cityId: z.string().trim().optional(),
  authorName: z.string().trim().max(120).optional(),
  sourceLabel: z.string().trim().max(160).optional(),
  readingTimeMinutes: z.coerce.number().int().positive().max(240).optional()
});

const statusFormSchema = z.object({
  articleId: z.string().trim().min(1),
  status: z.enum(contentStatusValues)
});

const deleteFormSchema = z.object({
  articleId: z.string().trim().min(1)
});

function getArticleTagIds(formData: FormData) {
  return Array.from(
    new Set(
      formData
        .getAll('tagIds')
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

async function assertActiveArticleTags(tagIds: string[]) {
  if (tagIds.length === 0) {
    return;
  }

  const activeTags = await prisma.tag.findMany({
    where: {
      id: { in: tagIds },
      type: CategoryType.ARTICLE,
      isActive: true
    },
    select: { id: true }
  });

  if (activeTags.length !== tagIds.length) {
    throw new Error('tag is invalid');
  }
}

export async function createArticle(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_ARTICLES_PATH);
  let result: { type: 'success' | 'error'; message: string };
  let uploadedCoverImageId: string | null = null;

  try {
    const user = await requireAdminSectionAccess('articles');
    const parsed = articleFormSchema.parse({
      title: getString(formData, 'title'),
      slug: optionalString(getString(formData, 'slug')),
      summary: getString(formData, 'summary'),
      body: getString(formData, 'body'),
      status: getString(formData, 'status') || ContentStatus.DRAFT,
      coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
      categoryId: optionalString(getString(formData, 'categoryId')),
      cityId: optionalString(getString(formData, 'cityId')),
      authorName: optionalString(getString(formData, 'authorName')),
      sourceLabel: optionalString(getString(formData, 'sourceLabel')),
      readingTimeMinutes: optionalString(getString(formData, 'readingTimeMinutes'))
    });
    const slug = slugify(parsed.slug ?? parsed.title);
    const tagIds = getArticleTagIds(formData);

    if (!slug) {
      throw new Error('Article slug is required.');
    }

    await Promise.all([
      assertActiveContentRelations({
        entityName: 'Article',
        categoryId: parsed.categoryId,
        categoryType: CategoryType.ARTICLE,
        cityId: parsed.cityId
      }),
      assertActiveArticleTags(tagIds)
    ]);

    const coverImageId = await resolveCoverImageId({
      formData,
      userId: user.id,
      onUploadedImageId: (fileId) => {
        uploadedCoverImageId = fileId;
      }
    });

    await persistWithUniqueSlugRetry({
      baseSlug: slug,
      exists: async (candidate) =>
        Boolean(
          await prisma.article.findFirst({
            where: { slug: candidate },
            select: { id: true }
          })
        ),
      persist: (uniqueSlug) =>
        prisma.$transaction(async (tx) => {
          const article = await tx.article.create({
            data: {
              title: parsed.title,
              slug: uniqueSlug,
              summary: parsed.summary,
              body: parsed.body,
              status: parsed.status,
              coverImageId,
              coverImageAlt: nullableString(parsed.coverImageAlt),
              categoryId: nullableString(parsed.categoryId),
              cityId: nullableString(parsed.cityId),
              authorName: nullableString(parsed.authorName),
              sourceLabel: nullableString(parsed.sourceLabel),
              readingTimeMinutes: parsed.readingTimeMinutes,
              createdById: user.id,
              updatedById: user.id,
              ...initialPublicationDates(parsed.status)
            },
            select: { id: true }
          });

          if (tagIds.length > 0) {
            await tx.articleTag.createMany({
              data: tagIds.map((tagId) => ({ articleId: article.id, tagId })),
              skipDuplicates: true
            });
          }

          return article;
        })
    });

    revalidatePath(ADMIN_ARTICLES_PATH);
    result = { type: 'success', message: 'Статья создана.' };
  } catch (error) {
    await deleteUploadedFileIfUnused(uploadedCoverImageId);
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updateArticle(formData: FormData) {
  const articleId = getString(formData, 'articleId');
  const fallbackPath = articleId ? `${ADMIN_ARTICLES_PATH}/${articleId}` : ADMIN_ARTICLES_PATH;
  const redirectTo = safeAdminRedirectPath(formData, fallbackPath, [ADMIN_ARTICLES_PATH, fallbackPath]);
  let result: { type: 'success' | 'error'; message: string };
  let uploadedCoverImageId: string | null = null;
  let previousCoverImageId: string | null = null;

  try {
    const user = await requireAdminSectionAccess('articles');
    const parsed = articleFormSchema
      .extend({
        articleId: z.string().trim().min(1)
      })
      .parse({
        articleId: getString(formData, 'articleId'),
        title: getString(formData, 'title'),
        slug: optionalString(getString(formData, 'slug')),
        summary: getString(formData, 'summary'),
        body: getString(formData, 'body'),
       status: getString(formData, 'status') || ContentStatus.DRAFT,
        coverImageAlt: optionalString(getString(formData, 'coverImageAlt')),
        categoryId: optionalString(getString(formData, 'categoryId')),
        cityId: optionalString(getString(formData, 'cityId')),
        authorName: optionalString(getString(formData, 'authorName')),
        sourceLabel: optionalString(getString(formData, 'sourceLabel')),
        readingTimeMinutes: optionalString(getString(formData, 'readingTimeMinutes'))
    });
    const slug = slugify(parsed.slug ?? parsed.title);
    const tagIds = getArticleTagIds(formData);

    if (!slug) {
      throw new Error('Article slug is required.');
    }

    const existingArticle = await prisma.article.findUniqueOrThrow({
      where: { id: parsed.articleId },
      select: { coverImageId: true, publishedAt: true }
    });
    previousCoverImageId = existingArticle.coverImageId;

    await Promise.all([
      assertActiveContentRelations({
        entityName: 'Article',
        categoryId: parsed.categoryId,
        categoryType: CategoryType.ARTICLE,
        cityId: parsed.cityId
      }),
      assertActiveArticleTags(tagIds)
    ]);

    const coverImageId = await resolveCoverImageId({
      formData,
      userId: user.id,
      currentCoverImageId: existingArticle.coverImageId,
      onUploadedImageId: (fileId) => {
        uploadedCoverImageId = fileId;
      }
    });

    await persistWithUniqueSlugRetry({
      baseSlug: slug,
      exists: async (candidate) =>
        Boolean(
          await prisma.article.findFirst({
            where: { slug: candidate, id: { not: parsed.articleId } },
            select: { id: true }
          })
        ),
      persist: (uniqueSlug) =>
        prisma.$transaction(async (tx) => {
          const article = await tx.article.update({
            where: { id: parsed.articleId },
            data: {
              title: parsed.title,
              slug: uniqueSlug,
              summary: parsed.summary,
              body: parsed.body,
              status: parsed.status,
              coverImageId,
              coverImageAlt: nullableString(parsed.coverImageAlt),
              categoryId: nullableString(parsed.categoryId),
              cityId: nullableString(parsed.cityId),
              authorName: nullableString(parsed.authorName),
              sourceLabel: nullableString(parsed.sourceLabel),
              readingTimeMinutes: parsed.readingTimeMinutes,
              updatedById: user.id,
              ...statusTransitionDates(parsed.status, existingArticle.publishedAt)
            },
            select: { id: true }
          });

          await tx.articleTag.deleteMany({ where: { articleId: article.id } });

          if (tagIds.length > 0) {
            await tx.articleTag.createMany({
              data: tagIds.map((tagId) => ({ articleId: article.id, tagId })),
              skipDuplicates: true
            });
          }

          return article;
        })
    });

    if (previousCoverImageId !== coverImageId) {
      await deleteUploadedFileIfUnused(previousCoverImageId);
    }

    revalidatePath(ADMIN_ARTICLES_PATH);
    revalidatePath(`${ADMIN_ARTICLES_PATH}/${parsed.articleId}`);
    result = { type: 'success', message: 'Статья обновлена.' };
  } catch (error) {
    await deleteUploadedFileIfUnused(uploadedCoverImageId);
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updateArticleStatus(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_ARTICLES_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    const user = await requireAdminSectionAccess('articles');
    const parsed = statusFormSchema.parse({
      articleId: getString(formData, 'articleId'),
      status: getString(formData, 'status')
    });

    await prisma.$transaction(async (tx) => {
      const article = await tx.article.findUniqueOrThrow({
        where: { id: parsed.articleId },
        select: { publishedAt: true }
      });

      await tx.article.update({
        where: { id: parsed.articleId },
        data: {
          status: parsed.status,
          updatedById: user.id,
          ...statusTransitionDates(parsed.status, article.publishedAt)
        }
      });
    });

    revalidatePath(ADMIN_ARTICLES_PATH);
    result = { type: 'success', message: 'Статус статьи обновлен.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function deleteArticleDraft(formData: FormData) {
  const redirectTo = safeAdminRedirectPath(formData, ADMIN_ARTICLES_PATH);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await requireAdminSectionAccess('articles');
    const parsed = deleteFormSchema.parse({
      articleId: getString(formData, 'articleId')
    });

    const deletedArticle = await prisma.$transaction(async (tx) => {
      const article = await tx.article.findFirst({
        where: {
          id: parsed.articleId,
          status: { not: ContentStatus.PUBLISHED }
        },
        select: { coverImageId: true }
      });

      if (!article) {
        throw new Error('draft is invalid');
      }

      const deletion = await tx.article.deleteMany({
        where: {
          id: parsed.articleId,
          status: { not: ContentStatus.PUBLISHED }
        }
      });

      if (deletion.count !== 1) {
        throw new Error('draft is invalid');
      }

      return article;
    });

    await deleteUploadedFileIfUnused(deletedArticle.coverImageId);

    revalidatePath(ADMIN_ARTICLES_PATH);
    result = { type: 'success', message: 'Черновик статьи удален.' };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}
