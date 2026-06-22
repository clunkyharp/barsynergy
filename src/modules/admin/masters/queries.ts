import { CategoryType, ContentStatus, MasterEntityType, type Prisma } from '@prisma/client';
import {
  getActiveCategories,
  getActiveCities,
  getMasterList,
  getMasterStatusCounts
} from '@/lib/admin/admin-queries';
import { ADMIN_CONTENT_PAGE_SIZE } from '@/lib/admin/content-search-params';

export type AdminMasterFilters = {
  page: number;
  q?: string;
  status?: ContentStatus;
  categoryId?: string;
  cityId?: string;
  entityType?: string;
  isVerified?: boolean;
  isNoCityFilter?: boolean;
};

export async function listAdminMasters(filters: AdminMasterFilters) {
  const { page, q, status, categoryId, cityId, entityType, isVerified, isNoCityFilter } = filters;

  const searchWhere: Prisma.MasterWhereInput = q
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { summary: { contains: q, mode: 'insensitive' } },
          { fullName: { contains: q, mode: 'insensitive' } },
          { companyName: { contains: q, mode: 'insensitive' } },
          { serviceArea: { contains: q, mode: 'insensitive' } }
        ]
      }
    : {};

  const noCityWhere: Prisma.MasterWhereInput = isNoCityFilter
    ? {
        OR: [{ cityId: null }, { cityId: '' }]
      }
    : {};

  const andWhere = [searchWhere, noCityWhere].filter((item) => Object.keys(item).length > 0);
  const where: Prisma.MasterWhereInput = {
    status,
    categoryId,
    cityId: isNoCityFilter ? undefined : cityId,
    entityType: entityType as MasterEntityType | undefined,
    isVerified,
    ...(andWhere.length > 0 ? { AND: andWhere } : {})
  };

  const [[masters, total], statusCounts, categories, cities] = await Promise.all([
    getMasterList(where, (page - 1) * ADMIN_CONTENT_PAGE_SIZE, ADMIN_CONTENT_PAGE_SIZE),
    getMasterStatusCounts(searchWhere),
    getActiveCategories(CategoryType.MASTER),
    getActiveCities()
  ]);

  return { masters, total, statusCounts, categories, cities };
}
