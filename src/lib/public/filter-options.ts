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

const dagestanCityOptions: PublicTaxonomyOption[] = [
  { id: 'dagestan-makhachkala', name: 'Махачкала', slug: 'makhachkala' },
  { id: 'dagestan-derbent', name: 'Дербент', slug: 'derbent' },
  { id: 'dagestan-kaspiysk', name: 'Каспийск', slug: 'kaspiysk' },
  { id: 'dagestan-khasavyurt', name: 'Хасавюрт', slug: 'khasavyurt' },
  { id: 'dagestan-buynaksk', name: 'Буйнакск', slug: 'buynaksk' }
];

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
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, slug: true }
  });

  const existing = new Set(cities.flatMap((city) => [city.slug.toLowerCase(), city.name.toLowerCase()]));
  const missingDagestanCities = dagestanCityOptions.filter(
    (city) => !existing.has(city.slug.toLowerCase()) && !existing.has(city.name.toLowerCase())
  );

  return [...cities, ...missingDagestanCities];
}

export async function getCourseFilterOptions() {
  const courses = await prisma.course.findMany({
    where: { status: ContentStatus.PUBLISHED },
    select: { format: true, level: true }
  });

  return {
    formats: uniqueTextOptions(courses.map((course) => course.format)),
    levels: uniqueTextOptions(courses.map((course) => course.level))
  };
}

export async function getEventFilterOptions() {
  const events = await prisma.event.findMany({
    where: { status: ContentStatus.PUBLISHED },
    select: { format: true }
  });

  return {
    formats: uniqueTextOptions(events.map((event) => event.format))
  };
}

export async function getVacancyFilterOptions() {
  const vacancies = await prisma.vacancy.findMany({
    where: { status: ContentStatus.PUBLISHED },
    select: { employmentType: true }
  });

  return {
    employmentTypes: uniqueTextOptions(vacancies.map((vacancy) => vacancy.employmentType))
  };
}

export async function getPartnerFilterOptions() {
  const partners = await prisma.partner.findMany({
    where: { status: ContentStatus.PUBLISHED },
    select: { partnerType: true }
  });

  return {
    partnerTypes: uniqueTextOptions(partners.map((partner) => partner.partnerType))
  };
}
