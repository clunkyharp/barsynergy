import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
import {
  getActiveCategories,
  getActiveCities,
  getSupplierList,
  getSupplierStatusCounts
} from '@/lib/admin/admin-queries';
import { ADMIN_CONTENT_PAGE_SIZE } from '@/lib/admin/content-search-params';

export type AdminSupplierFilters = {
  page: number;
  q?: string;
  status?: ContentStatus;
  categoryId?: string;
  cityId?: string;
  isVerified?: boolean;
  isNoCityFilter?: boolean;
};

export async function listAdminSuppliers(filters: AdminSupplierFilters) {
  const { page, q, status, categoryId, cityId, isVerified, isNoCityFilter } = filters;

  const searchWhere: Prisma.SupplierWhereInput = q
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { summary: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
          { companyName: { contains: q, mode: 'insensitive' } },
          { serviceArea: { contains: q, mode: 'insensitive' } }
        ]
      }
    : {};

  const noCityWhere: Prisma.SupplierWhereInput = isNoCityFilter
    ? {
        OR: [{ cityId: null }, { cityId: '' }]
      }
    : {};

  const andWhere = [searchWhere, noCityWhere].filter((item) => Object.keys(item).length > 0);
  const where: Prisma.SupplierWhereInput = {
    status,
    categoryId,
    cityId: isNoCityFilter ? undefined : cityId,
    isVerified,
    ...(andWhere.length > 0 ? { AND: andWhere } : {})
  };

  const [[suppliers, total], statusCounts, categories, cities] = await Promise.all([
    getSupplierList(where, (page - 1) * ADMIN_CONTENT_PAGE_SIZE, ADMIN_CONTENT_PAGE_SIZE),
    getSupplierStatusCounts(searchWhere),
    getActiveCategories(CategoryType.SUPPLIER),
    getActiveCities()
  ]);

  return { suppliers, total, statusCounts, categories, cities };
}
