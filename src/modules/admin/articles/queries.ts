import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
import { getActiveCategories, getActiveCities, getArticleList } from '@/lib/admin/admin-queries';
import { ADMIN_CONTENT_PAGE_SIZE } from '@/lib/admin/content-search-params';

export type AdminArticleFilters = {
  page: number;
  q?: string;
  status?: ContentStatus;
  categoryId?: string;
  cityId?: string;
};

export async function listAdminArticles(filters: AdminArticleFilters) {
  const { page, q, status, categoryId, cityId } = filters;

  const where: Prisma.ArticleWhereInput = {
    status,
    categoryId,
    cityId,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [[articles, total], categories, cities] = await Promise.all([
    getArticleList(where, (page - 1) * ADMIN_CONTENT_PAGE_SIZE, ADMIN_CONTENT_PAGE_SIZE),
    getActiveCategories(CategoryType.ARTICLE),
    getActiveCities()
  ]);

  return { articles, total, categories, cities };
}
