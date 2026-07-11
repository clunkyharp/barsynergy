import { BusinessAccountStatus, ContentStatus, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getActiveCityOptions } from '@/lib/shared/city-options';
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
  optionalParams,
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

function getVacancyOrderBy(sort?: string): Prisma.VacancyOrderByWithRelationInput[] {
  if (sort === 'recent') {
    return [{ publishedAt: 'desc' }, { createdAt: 'desc' }, { sortOrder: 'asc' }];
  }

  if (sort === 'company') {
    return [{ companyName: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];
  }

  if (sort === 'verified') {
    return [{ businessAccountId: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }, { sortOrder: 'asc' }];
  }

  return [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];
}

export async function getPublishedVacancies(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const sort = optionalParam(params, 'sort');

  const categoryValues = optionalParams(params, 'category');
  const cityValues = optionalParams(params, 'city');
  const employmentTypeValues = optionalParams(params, 'employmentType');
  const verified = optionalParam(params, 'verified');

  const andConditions: Prisma.VacancyWhereInput[] = [];

  if (categoryValues) {
    andConditions.push({
      category: { slug: { in: categoryValues }, type: CategoryType.VACANCY }
    });
  }
  if (cityValues) {
    andConditions.push({
      city: { slug: { in: cityValues } }
    });
  }
  if (employmentTypeValues) {
    andConditions.push({
      OR: employmentTypeValues.map((v) => ({ employmentType: { equals: v, mode: 'insensitive' as const } }))
    });
  }
  if (verified === 'true') {
    andConditions.push({
      businessAccountId: { not: null },
      businessAccount: { status: BusinessAccountStatus.ACTIVE }
    });
  } else if (verified === 'false') {
    andConditions.push({
      OR: [
        { businessAccountId: null },
        { businessAccount: { status: { not: BusinessAccountStatus.ACTIVE } } }
      ]
    });
  }

  const baseWhere: Prisma.VacancyWhereInput = {
    status: ContentStatus.PUBLISHED,
    ...(andConditions.length > 0 ? { AND: andConditions } : {})
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
            orderBy: getVacancyOrderBy(sort)
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
          orderBy: getVacancyOrderBy(sort)
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
          coverImage: { select: { fileKey: true, bucket: true, visibility: true } },
          businessAccount: { select: { status: true } }
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
        isNew,
        isVerified: vacancy.businessAccount?.status === BusinessAccountStatus.ACTIVE
      };
    })
  });
}

function stripApplySection(md: string): string {
  return md.replace(/^##\s*Как откликнуться[\s\S]*?(?=^##|$)/m, '').trim();
}

export async function getPublishedVacancyDetail(slug: string) {
  const vacancy = await prisma.vacancy.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: {
      category: { select: { name: true } },
      city: { select: { name: true } },
      coverImage: { select: { fileKey: true, bucket: true, visibility: true } },
      businessAccount: { select: { status: true } }
    }
  });

  if (!vacancy) return null;

  const contactTelegram = vacancy.contactTelegram?.trim() || undefined;
  const contactPhone = vacancy.contactPhone?.trim() || undefined;
  const contactEmail = vacancy.contactEmail?.trim() || undefined;
  const hasDirectContact = Boolean(contactTelegram || contactPhone || contactEmail);

  return {
    id: vacancy.id,
    isVerified: vacancy.businessAccount?.status === BusinessAccountStatus.ACTIVE,
    title: vacancy.title,
    slug: vacancy.slug,
    summary: cleanPublicDetailText(vacancy.summary),
    publishedAtIso: vacancy.publishedAt?.toISOString() ?? vacancy.createdAt.toISOString(),
    updatedAtIso: vacancy.updatedAt.toISOString(),
    body: vacancy.description ? stripApplySection(cleanPublicDetailText(vacancy.description)) : vacancy.description,
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
    contactDirect: hasDirectContact
      ? { telegram: contactTelegram, phone: contactPhone, email: contactEmail }
      : undefined,
    facts: compact([
      `Компания: ${vacancy.companyName}`,
      `Позиция: ${vacancy.position}`,
      vacancy.city?.name ? `Город: ${vacancy.city.name}` : undefined,
      vacancy.salaryLabel ? `Зарплата: ${vacancy.salaryLabel}` : undefined,
      vacancy.employmentType ? `График: ${getAdminOptionLabel(vacancyEmploymentTypeOptions, vacancy.employmentType)}` : undefined,
      vacancy.experienceLabel ? `Опыт: ${getAdminOptionLabel(vacancyExperienceOptions, vacancy.experienceLabel)}` : undefined,
      formatDate(vacancy.publishedAt ?? vacancy.createdAt) ? `Обновлено: ${formatDate(vacancy.publishedAt ?? vacancy.createdAt)}` : undefined
    ]).map((entry) => {
      const [label, ...rest] = entry.split(': ');
      return { label, value: rest.join(': ') };
    })
  };
}

export async function getVacancyApplicationFormOptions(): Promise<VacancyApplicationFormOptions> {
  const [cities, vacancies] = await Promise.all([
    getActiveCityOptions(),
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
