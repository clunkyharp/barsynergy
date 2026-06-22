import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
import { getActiveCategories, getPartnerList } from '@/lib/admin/admin-queries';
import { ADMIN_CONTENT_PAGE_SIZE } from '@/lib/admin/content-search-params';

export type AdminPartnerFilters = {
  page: number;
  q?: string;
  status?: ContentStatus;
  categoryId?: string;
  partnerType?: string;
  isFeatured?: boolean;
};

export async function listAdminPartners(filters: AdminPartnerFilters) {
  const { page, q, status, categoryId, partnerType, isFeatured } = filters;

  const where: Prisma.PartnerWhereInput = {
    status,
    categoryId,
    partnerType,
    isFeatured,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
            { companyName: { contains: q, mode: 'insensitive' } },
            { partnerType: { contains: q, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [[partners, total], categories] = await Promise.all([
    getPartnerList(where, (page - 1) * ADMIN_CONTENT_PAGE_SIZE, ADMIN_CONTENT_PAGE_SIZE),
    getActiveCategories(CategoryType.PARTNER)
  ]);

  return { partners, total, categories };
}
