import { BusinessAccountStatus, UserRole, UserStatus, type Prisma } from '@prisma/client';
import { getUserList } from '@/lib/admin/admin-queries';

export const accessFilterValues = ['all', 'pending', 'active', 'blocked'] as const;

export type AccessFilter = (typeof accessFilterValues)[number];

function getBusinessAccessWhere(accessFilter: AccessFilter): Prisma.UserWhereInput {
  const baseWhere: Prisma.UserWhereInput = { role: UserRole.BUSINESS };

  if (accessFilter === 'active') {
    return {
      ...baseWhere,
      status: UserStatus.ACTIVE,
      businessAccount: { is: { status: BusinessAccountStatus.ACTIVE } }
    };
  }

  if (accessFilter === 'pending') {
    return {
      ...baseWhere,
      OR: [
        { status: UserStatus.PENDING },
        { businessAccount: { is: { status: BusinessAccountStatus.PENDING } } }
      ]
    };
  }

  if (accessFilter === 'blocked') {
    return {
      ...baseWhere,
      OR: [
        { status: UserStatus.BLOCKED },
        { businessAccount: { is: { status: BusinessAccountStatus.BLOCKED } } }
      ]
    };
  }

  return baseWhere;
}

export async function listAdminBusinessUsers(filters: { accessFilter: AccessFilter; searchQuery: string }) {
  const { accessFilter, searchQuery } = filters;

  const searchWhere: Prisma.UserWhereInput = searchQuery
    ? {
        OR: [
          { email: { contains: searchQuery, mode: 'insensitive' } },
          { businessAccount: { companyName: { contains: searchQuery, mode: 'insensitive' } } }
        ]
      }
    : {};

  const where: Prisma.UserWhereInput = {
    ...getBusinessAccessWhere(accessFilter),
    ...searchWhere
  };

  const [users] = await getUserList(where, 0, 50);
  return { users };
}
