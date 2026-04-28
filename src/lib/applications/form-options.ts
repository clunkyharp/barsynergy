import { prisma } from '@/lib/db/prisma';

export type ApplicationCityOption = {
  id: string;
  name: string;
};

export async function getApplicationCityOptions(): Promise<ApplicationCityOption[]> {
  return prisma.city.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true }
  });
}
