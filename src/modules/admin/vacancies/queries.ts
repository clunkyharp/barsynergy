import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
import {
  getActiveCategories,
  getActiveCities,
  getVacancyList,
  getVacancyStatusCounts
} from '@/lib/admin/admin-queries';
import { ADMIN_CONTENT_PAGE_SIZE } from '@/lib/admin/content-search-params';

/**
 * Route-level filter DTO for the admin vacancies list. Plain values only —
 * pages must not construct Prisma where clauses (A-01).
 */
export type AdminVacancyFilters = {
  page: number;
  q?: string;
  status?: ContentStatus;
  categoryId?: string;
  cityId?: string;
  employmentType?: string;
};

export async function listAdminVacancies(filters: AdminVacancyFilters) {
  const { page, q, status, categoryId, cityId, employmentType } = filters;

  const searchWhere: Prisma.VacancyWhereInput = q
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { summary: { contains: q, mode: 'insensitive' as const } },
          { slug: { contains: q, mode: 'insensitive' as const } },
          { companyName: { contains: q, mode: 'insensitive' as const } },
          { position: { contains: q, mode: 'insensitive' as const } }
        ]
      }
    : {};

  const where: Prisma.VacancyWhereInput = {
    status,
    categoryId,
    cityId,
    employmentType,
    ...searchWhere
  };

  const [[vacancies, total], statusCounts, categories, cities] = await Promise.all([
    getVacancyList(where, (page - 1) * ADMIN_CONTENT_PAGE_SIZE, ADMIN_CONTENT_PAGE_SIZE),
    getVacancyStatusCounts(searchWhere),
    getActiveCategories(CategoryType.VACANCY),
    getActiveCities()
  ]);

  return { vacancies, total, statusCounts, categories, cities };
}
