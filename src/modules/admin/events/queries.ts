import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
import { getActiveCategories, getActiveCities, getEventList } from '@/lib/admin/admin-queries';
import { ADMIN_CONTENT_PAGE_SIZE } from '@/lib/admin/content-search-params';

export type AdminEventFilters = {
  page: number;
  q?: string;
  status?: ContentStatus;
  categoryId?: string;
  cityId?: string;
  format?: string;
};

export async function listAdminEvents(filters: AdminEventFilters) {
  const { page, q, status, categoryId, cityId, format } = filters;

  const where: Prisma.EventWhereInput = {
    status,
    categoryId,
    cityId,
    format,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
            { locationName: { contains: q, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [[events, total], categories, cities] = await Promise.all([
    getEventList(where, (page - 1) * ADMIN_CONTENT_PAGE_SIZE, ADMIN_CONTENT_PAGE_SIZE),
    getActiveCategories(CategoryType.EVENT),
    getActiveCities()
  ]);

  return { events, total, categories, cities };
}
