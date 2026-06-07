import { prisma } from '@/lib/db/prisma';

export async function getActiveCities() {
  return prisma.city.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true }
  });
}
