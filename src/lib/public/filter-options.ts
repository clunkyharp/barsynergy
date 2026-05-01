import { CategoryType, ContentStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

export type PublicTaxonomyOption = {
  id: string;
  name: string;
  slug: string;
};

export type PublicSelectOption = {
  value: string;
  label: string;
};

function uniqueTextOptions(values: Array<string | null | undefined>): PublicSelectOption[] {
  const uniqueValues = Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
    )
  );

  return uniqueValues
    .sort((left, right) => left.localeCompare(right, 'ru'))
    .map((value) => ({ value, label: value }));
}

export async function getPublicCategoryOptions(type: CategoryType): Promise<PublicTaxonomyOption[]> {
  return prisma.category.findMany({
    where: { type, isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, slug: true }
  });
}

export async function getPublicCityFilterOptions(): Promise<PublicTaxonomyOption[]> {
  return prisma.city.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, slug: true }
  });
}

export async function getCourseFilterOptions() {
  const [formats, levels] = await Promise.all([
    prisma.course.findMany({
      where: { status: ContentStatus.PUBLISHED, format: { not: null } },
      distinct: ['format'],
      select: { format: true }
    }),
    prisma.course.findMany({
      where: { status: ContentStatus.PUBLISHED, level: { not: null } },
      distinct: ['level'],
      select: { level: true }
    })
  ]);

  return {
    formats: uniqueTextOptions(formats.map((course) => course.format)),
    levels: uniqueTextOptions(levels.map((course) => course.level))
  };
}

export async function getEventFilterOptions() {
  const events = await prisma.event.findMany({
    where: { status: ContentStatus.PUBLISHED, format: { not: null } },
    distinct: ['format'],
    select: { format: true }
  });

  return {
    formats: uniqueTextOptions(events.map((event) => event.format))
  };
}

export async function getVacancyFilterOptions() {
  const vacancies = await prisma.vacancy.findMany({
    where: { status: ContentStatus.PUBLISHED, employmentType: { not: null } },
    distinct: ['employmentType'],
    select: { employmentType: true }
  });

  return {
    employmentTypes: uniqueTextOptions(vacancies.map((vacancy) => vacancy.employmentType))
  };
}

export async function getPartnerFilterOptions() {
  const partners = await prisma.partner.findMany({
    where: { status: ContentStatus.PUBLISHED, partnerType: { not: null } },
    distinct: ['partnerType'],
    select: { partnerType: true }
  });

  return {
    partnerTypes: uniqueTextOptions(partners.map((partner) => partner.partnerType))
  };
}
