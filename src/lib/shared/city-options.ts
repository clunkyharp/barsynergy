import { prisma } from '@/lib/db/prisma';

export type CityOption = {
  id: string;
  name: string;
};

export async function getActiveCityOptions(): Promise<CityOption[]> {
  return prisma.city.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true }
  });
}
