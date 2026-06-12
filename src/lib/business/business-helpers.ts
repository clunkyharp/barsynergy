import { prisma } from '@/lib/db/prisma';

export async function assertActiveCity(cityId?: string | null) {
  if (!cityId) {
    return null;
  }

  const city = await prisma.city.findFirst({
    where: { id: cityId, isActive: true },
    select: { id: true, name: true }
  });

  if (!city) {
    throw new Error('city is invalid');
  }

  return city;
}
