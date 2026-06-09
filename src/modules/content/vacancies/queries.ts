import { ContentStatus, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import {
  vacancyEmploymentTypeOptions,
  vacancyExperienceOptions,
  getOptionLabel as getAdminOptionLabel
} from '@/modules/content/shared/labels';
import {
  formatUpdatedLabel,
  getPage,
  getPageSize,
  listResult,
  listResultWithRelevance,
  optionalParam,
  publicImageUrl,
  type PublishedContentMetaGroup,
  type PublicContentSearchParams
} from '@/lib/public/content/shared';
import {
  compact,
  cleanPublicDetailText,
  detailImage,
  formatDate
} from '@/modules/content/shared/detail-helpers';
import { CategoryType } from '../shared/types';

/* --- types --- */

export type VacancyApplicationFormOptions = {
  cities: { id: string; name: string }[];
  vacancies: { id: string; title: string; companyName: string; cityName?: string }[];
};

/* --- queries --- */

const vacancySearchFields = (q: string): Prisma.VacancyWhereInput[] => [
  { title: { contains: q, mode: 'insensitive' as const } },
  { summary: { contains: q, mode: 'insensitive' as const } },
  { companyName: { contains: q, mode: 'insensitive' as const } },
  { position: { contains: q, mode: 'insensitive' as const } },
  { city: { name: { contains: q, mode: 'insensitive' as const } } }
];

export async function getPublishedVacancies(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const baseWhere: Prisma.VacancyWhereInput = {
    status: ContentStatus.PUBLISHED,
    category: optionalParam(params, 'category') ? { slug: optionalParam(params, 'category'), type: CategoryType.VACANCY } : undefined,
    city: optionalParam(params, 'city') ? { slug: optionalParam(params, 'city') } : undefined,
    employmentType: optionalParam(params, 'employmentType')
      ? { equals: optionalParam(params, 'employmentType'), mode: 'insensitive' }
      : undefined
  };

  const { items, total } = await listResultWithRelevance(
    q,
    page,
    pageSize,
    ({ idsOnly }) => {
      const selectIdAndTitle = { id: true, title: true } as const;
      if (idsOnly) {
        const searchWhere: Prisma.VacancyWhereInput = {
          ...baseWhere,
          ...(q ? { OR: vacancySearchFields(q) } : {})
        };
        return prisma.vacancy
          .findMany({
            where: searchWhere,
            select: selectIdAndTitle,
            orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }]
          })
          .then(async (items) => {
            const total = await prisma.vacancy.count({ where: searchWhere });
            return { ids: items, total };
          });
      }
      return prisma.vacancy
        .findMany({
          where: baseWhere,
          select: selectIdAndTitle,
          orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }]
        })
        .then(async (items) => {
          const total = await prisma.vacancy.count({ where: baseWhere });
          return { ids: items, total };
        });
    },
    (ids) =>
      prisma.vacancy.findMany({
        where: { id: { in: ids }, status: ContentStatus.PUBLISHED },
        include: {
          category: { select: { name: true } },
          city: { select: { name: true } },
          coverImage: { select: { fileKey: true, bucket: true, visibility: true } }
        }
      })
  );

  return listResult({
    params,
    page,
    pageSize,
    total,
    searchQuery: q,
    items: items.map((vacancy) => {
      const createdOrPublished = vacancy.publishedAt ?? vacancy.createdAt;
      const isNew = createdOrPublished.getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000;
      return {
        id: vacancy.id,
        title: vacancy.title,
        slug: vacancy.slug,
        summary: vacancy.summary,
        kind: 'vacancy' as const,
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
          vacancy.salaryLabel ? { label: 'Оплата', value: vacancy.salaryLabel, tone: 'accent' as const } : undefined
        ].filter(Boolean) as PublishedContentMetaGroup[],
        statusLabel: 'Открыта',
        updatedLabel: formatUpdatedLabel(createdOrPublished),
        imageUrl: publicImageUrl(vacancy.coverImage),
        isNew
      };
    })
  });
}

export async function getPublishedVacancyDetail(slug: string) {
  const vacancy = await prisma.vacancy.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: {
      category: { select: { name: true } },
      city: { select: { name: true } },
      coverImage: { select: { fileKey: true, bucket: true, visibility: true } }
    }
  });

  if (!vacancy) return null;

  return {
    id: vacancy.id,
    title: vacancy.title,
    slug: vacancy.slug,
    summary: cleanPublicDetailText(vacancy.summary),
    publishedAtIso: vacancy.publishedAt?.toISOString() ?? vacancy.createdAt.toISOString(),
    updatedAtIso: vacancy.updatedAt.toISOString(),
    body: vacancy.description ? cleanPublicDetailText(vacancy.description) : vacancy.description,
    label: vacancy.category?.name,
    meta: compact([
      vacancy.city?.name,
      vacancy.companyName,
      getAdminOptionLabel(vacancyEmploymentTypeOptions, vacancy.employmentType, ''),
      vacancy.salaryLabel
    ]),
    imageUrl: detailImage(vacancy.coverImage, vacancy.coverImageAlt, vacancy.title),
    companyName: vacancy.companyName,
    cityName: vacancy.city?.name,
    facts: compact([
      `Компания: ${vacancy.companyName}`,
      `Позиция: ${vacancy.position}`,
      vacancy.salaryLabel ? `Зарплата: ${vacancy.salaryLabel}` : undefined,
      vacancy.employmentType ? `График: ${getAdminOptionLabel(vacancyEmploymentTypeOptions, vacancy.employmentType)}` : undefined,
      vacancy.experienceLabel ? `Опыт: ${getAdminOptionLabel(vacancyExperienceOptions, vacancy.experienceLabel)}` : undefined,
      vacancy.contactMode ? `Контакт: ${vacancy.contactMode}` : undefined,
      formatDate(vacancy.publishedAt ?? vacancy.createdAt) ? `Обновлено: ${formatDate(vacancy.publishedAt ?? vacancy.createdAt)}` : undefined
    ]).map((entry) => {
      const [label, ...rest] = entry.split(': ');
      return { label, value: rest.join(': ') };
    }),
    sections: [
      {
        title: 'Условия',
        items: compact([
          `Компания: ${vacancy.companyName}.`,
          vacancy.city?.name ? `Город: ${vacancy.city.name}.` : undefined,
          vacancy.salaryLabel ? `Зарплата: ${vacancy.salaryLabel}.` : undefined,
          vacancy.employmentType ? `График: ${getAdminOptionLabel(vacancyEmploymentTypeOptions, vacancy.employmentType)}.` : undefined,
          vacancy.experienceLabel ? `Опыт: ${getAdminOptionLabel(vacancyExperienceOptions, vacancy.experienceLabel)}.` : undefined
        ])
      },
      {
        title: 'Контакт для отклика',
        items: compact([
          vacancy.contactMode ? `Контакт для отклика: ${vacancy.contactMode}.` : undefined
        ])
      }
    ].filter((section) => section.items.length > 0)
  };
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

export async function getVacancyUserPrefill(userId: string, vacancyId: string) {
  const [userWithProfile, savedVacancy] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        profile: { select: { fullName: true, cityId: true, phone: true, telegram: true } }
      }
    }),
    prisma.savedVacancy.findUnique({
      where: { userId_vacancyId: { userId, vacancyId } },
      select: { id: true }
    })
  ]);

  return {
    profilePrefill: userWithProfile
      ? {
          fullName: userWithProfile.profile?.fullName ?? undefined,
          cityId: userWithProfile.profile?.cityId ?? undefined,
          email: userWithProfile.email,
          phone: userWithProfile.profile?.phone ?? undefined,
          telegram: userWithProfile.profile?.telegram ?? undefined
        }
      : undefined,
    isSaved: Boolean(savedVacancy)
  };
}
