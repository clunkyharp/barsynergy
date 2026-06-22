import { ContentStatus, type Prisma } from '@prisma/client';
import { getActiveCities, getGeneralSponsorList } from '@/lib/admin/admin-queries';
import { ADMIN_CONTENT_PAGE_SIZE } from '@/lib/admin/content-search-params';

export type AdminGeneralSponsorFilters = {
  page: number;
  q?: string;
  status?: ContentStatus;
  cityId?: string;
  isFeatured?: boolean;
};

export async function listAdminGeneralSponsors(filters: AdminGeneralSponsorFilters) {
  const { page, q, status, cityId, isFeatured } = filters;

  const where: Prisma.GeneralSponsorWhereInput = {
    status,
    cityId,
    isFeatured,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { shortDescription: { contains: q, mode: 'insensitive' } },
            { fullDescription: { contains: q, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [[sponsors, total], cities] = await Promise.all([
    getGeneralSponsorList(where, (page - 1) * ADMIN_CONTENT_PAGE_SIZE, ADMIN_CONTENT_PAGE_SIZE),
    getActiveCities()
  ]);

  return { sponsors, total, cities };
}
