import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
import {
  getAdminOptionLabel,
  vacancyEmploymentTypeOptions,
  vacancyExperienceOptions
} from '@/lib/admin/content-labels';
import { prisma } from '@/lib/db/prisma';
import {
  formatUpdatedLabel,
  getPage,
  getPageSize,
  listResult,
  optionalParam,
  publicImageUrl,
  textSearch,
  type PublishedContentMetaGroup,
  type PublicContentSearchParams
} from './shared';

export type VacancyApplicationFormOptions = {
  cities: {
    id: string;
    name: string;
  }[];
  vacancies: {
    id: string;
    title: string;
    companyName: string;
    cityName?: string;
  }[];
};

export async function getPublishedVacancies(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const where: Prisma.VacancyWhereInput = {
    status: ContentStatus.PUBLISHED,
    ...textSearch(q),
    category: optionalParam(params, 'category') ? { slug: optionalParam(params, 'category'), type: CategoryType.VACANCY } : undefined,
    city: optionalParam(params, 'city') ? { slug: optionalParam(params, 'city') } : undefined,
    employmentType: optionalParam(params, 'employmentType')
      ? { equals: optionalParam(params, 'employmentType'), mode: 'insensitive' }
      : undefined
  };
  const [total, vacancies] = await Promise.all([
    prisma.vacancy.count({ where }),
    prisma.vacancy.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { name: true } },
        city: { select: { name: true } },
        coverImage: { select: { fileKey: true, bucket: true, visibility: true } }
      }
    })
  ]);

  return listResult({
    params,
    page,
    pageSize,
    total,
    searchQuery: q,
    items: vacancies.map((vacancy) => ({
      id: vacancy.id,
      title: vacancy.title,
      slug: vacancy.slug,
      summary: vacancy.summary,
      kind: 'vacancy',
      label: vacancy.category?.name,
      subtitle: vacancy.companyName,
      meta: [
        vacancy.city?.name,
        vacancy.companyName,
        getAdminOptionLabel(vacancyEmploymentTypeOptions, vacancy.employmentType, ''),
        vacancy.salaryLabel
      ].filter(Boolean) as string[],
      metaGroups: [
        vacancy.city?.name ? { label: 'Город', value: vacancy.city.name } : undefined,
        vacancy.companyName ? { label: 'Компания', value: vacancy.companyName } : undefined,
        vacancy.employmentType ? { label: 'График', value: getAdminOptionLabel(vacancyEmploymentTypeOptions, vacancy.employmentType) } : undefined,
        vacancy.category?.name ? { label: 'Формат', value: vacancy.category.name } : undefined,
        vacancy.experienceLabel ? { label: 'Опыт', value: getAdminOptionLabel(vacancyExperienceOptions, vacancy.experienceLabel) } : undefined,
        vacancy.salaryLabel ? { label: 'Оплата', value: vacancy.salaryLabel, tone: 'accent' } : undefined
      ].filter(Boolean) as PublishedContentMetaGroup[],
      statusLabel: 'Открыта',
      updatedLabel: formatUpdatedLabel(vacancy.publishedAt ?? vacancy.createdAt),
      imageUrl: publicImageUrl(vacancy.coverImage)
    }))
  });
}

export async function getVacancyApplicationFormOptions(): Promise<VacancyApplicationFormOptions> {
  const [cities, vacancies] = await Promise.all([
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    }),
    prisma.vacancy.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 100,
      select: {
        id: true,
        title: true,
        companyName: true,
        city: { select: { name: true } }
      }
    })
  ]);

  return {
    cities,
    vacancies: vacancies.map((vacancy) => ({
      id: vacancy.id,
      title: vacancy.title,
      companyName: vacancy.companyName,
      cityName: vacancy.city?.name
    }))
  };
}
