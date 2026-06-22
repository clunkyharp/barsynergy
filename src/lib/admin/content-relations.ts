import { CategoryType } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

export async function assertActiveContentRelations(input: {
  entityName: string;
  categoryId?: string;
  categoryType?: CategoryType;
  cityId?: string;
}) {
  const [category, city] = await Promise.all([
    input.categoryId && input.categoryType
      ? prisma.category.findFirst({
          where: { id: input.categoryId, type: input.categoryType, isActive: true },
          select: { id: true }
        })
      : null,
    input.cityId
      ? prisma.city.findFirst({
          where: { id: input.cityId, isActive: true },
          select: { id: true }
        })
      : null
  ]);

  if (input.categoryId && !category) {
    throw new Error(`${input.entityName} category is invalid.`);
  }

  if (input.cityId && !city) {
    throw new Error(`${input.entityName} city is invalid.`);
  }
}
