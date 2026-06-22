import { ApplicationStatus, ApplicationType, type Prisma } from '@prisma/client';
import { getApplicationList } from '@/lib/admin/admin-queries';
import { ADMIN_CONTENT_PAGE_SIZE } from '@/lib/admin/content-search-params';

export type AdminApplicationFilters = {
  page: number;
  search?: string;
  type?: ApplicationType | null;
  status?: ApplicationStatus | null;
};

export async function listAdminApplications(filters: AdminApplicationFilters) {
  const { page, search, type, status } = filters;

  const searchWhere: Prisma.ApplicationWhereInput = search
    ? {
        OR: [
          { subject: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { telegram: { contains: search, mode: 'insensitive' } },
          { businessAccount: { companyName: { contains: search, mode: 'insensitive' } } },
          { payload: { path: ['companyName'], string_contains: search } },
          { payload: { path: ['projectName'], string_contains: search } },
          { payload: { path: ['employerCompanyName'], string_contains: search } }
        ]
      }
    : {};

  const where: Prisma.ApplicationWhereInput = {
    ...searchWhere,
    ...(type ? { type } : {}),
    ...(status ? { status } : {})
  };

  const [applications, total] = await getApplicationList(
    where,
    { createdAt: 'desc' },
    (page - 1) * ADMIN_CONTENT_PAGE_SIZE,
    ADMIN_CONTENT_PAGE_SIZE
  );

  return { applications, total };
}
