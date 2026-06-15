import { CategoryType, ContentStatus, MasterEntityType, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import {
  cleanPublicDetailText,
  compact,
  detailImage,
  parseFacts,
  type PublicContentDetail
} from '@/modules/content/shared/detail-helpers';
import {
  compactLabel,
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
} from './shared';

export type PublicMasterDetail = PublicContentDetail & {
  entityType: MasterEntityType;
  specializations: string[];
  experienceYears?: number;
  rateLabel?: string;
  serviceArea?: string;
  contactLabel?: string;
  contactTelegram?: string;
  contactPhone?: string;
  contactEmail?: string;
};

const masterSearchFields = (q: string): Prisma.MasterWhereInput[] => [
  { title: { contains: q, mode: 'insensitive' as const } },
  { summary: { contains: q, mode: 'insensitive' as const } },
  { fullName: { contains: q, mode: 'insensitive' as const } },
  { companyName: { contains: q, mode: 'insensitive' as const } },
  { serviceArea: { contains: q, mode: 'insensitive' as const } },
  { contactLabel: { contains: q, mode: 'insensitive' as const } },
  { city: { name: { contains: q, mode: 'insensitive' as const } } }
];

function getMasterDisplayName(master: { entityType: MasterEntityType; fullName: string | null; companyName: string | null; title: string }) {
  if (master.entityType === MasterEntityType.BUSINESS) {
    return master.companyName ?? master.title;
  }

  return master.fullName ?? master.title;
}

function getMasterEntityLabel(entityType: MasterEntityType) {
  return entityType === MasterEntityType.BUSINESS ? 'Компания' : 'Частный мастер';
}

function getExperienceWhere(value: string | undefined): Prisma.MasterWhereInput | undefined {
  if (value === '0-2') return { experienceYears: { gte: 0, lte: 2 } };
  if (value === '3-5') return { experienceYears: { gte: 3, lte: 5 } };
  if (value === '6-plus') return { experienceYears: { gte: 6 } };
  return undefined;
}

function getMasterOrderBy(sort?: string): Prisma.MasterOrderByWithRelationInput[] {
  if (sort === 'recent') {
    return [{ publishedAt: 'desc' }, { createdAt: 'desc' }, { sortOrder: 'asc' }];
  }

  if (sort === 'verified') {
    return [{ isVerified: 'desc' }, { sortOrder: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];
  }

  if (sort === 'experience') {
    return [{ experienceYears: 'desc' }, { isVerified: 'desc' }, { sortOrder: 'asc' }];
  }

  if (sort === 'name') {
    return [{ title: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];
  }

  return [{ sortOrder: 'asc' }, { isVerified: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];
}

export async function getPublishedMasterDetail(slug: string): Promise<PublicMasterDetail | null> {
  const master = await prisma.master.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: {
      category: { select: { name: true } },
      city: { select: { name: true } },
      coverImage: { select: { fileKey: true, bucket: true, visibility: true } }
    }
  });

  if (!master) return null;

  const displayName = getMasterDisplayName(master);

  return {
    id: master.id,
    title: master.title,
    slug: master.slug,
    summary: cleanPublicDetailText(master.summary),
    publishedAtIso: master.publishedAt?.toISOString(),
    updatedAtIso: master.updatedAt.toISOString(),
    body: cleanPublicDetailText(master.description),
    label: master.category?.name,
    meta: compact([master.city?.name, displayName, master.serviceArea]),
    imageUrl: detailImage(master.coverImage, master.coverImageAlt, master.title),
    companyName: master.companyName ?? undefined,
    cityName: master.city?.name,
    facts: parseFacts(compact([
      `Тип: ${getMasterEntityLabel(master.entityType)}`,
      `Профиль: ${displayName}`,
      master.category?.name ? `Категория: ${master.category.name}` : undefined,
      master.city?.name ? `Город: ${master.city.name}` : undefined,
      master.serviceArea ? `География: ${master.serviceArea}` : undefined,
      master.experienceYears !== null ? `Опыт: ${master.experienceYears} лет` : undefined,
      master.rateLabel ? `Стоимость: ${master.rateLabel}` : undefined,
      master.contactLabel ? `Контакты: ${master.contactLabel}` : undefined,
      master.isVerified ? 'Статус: проверен BARSYNERGY' : undefined
    ])),
    isVerified: master.isVerified,
    entityType: master.entityType,
    specializations: master.specializations,
    experienceYears: master.experienceYears ?? undefined,
    rateLabel: master.rateLabel ?? undefined,
    serviceArea: master.serviceArea ?? undefined,
    contactLabel: master.contactLabel ?? undefined,
    contactTelegram: master.contactTelegram ?? undefined,
    contactPhone: master.contactPhone ?? undefined,
    contactEmail: master.contactEmail ?? undefined
  };
}

export async function getPublishedMasterInquiryTarget(id: string) {
  return prisma.master.findFirst({
    where: { id, status: ContentStatus.PUBLISHED },
    select: { id: true, title: true }
  });
}

export async function getPublishedMasters(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const sort = optionalParam(params, 'sort');
  const verified = optionalParam(params, 'verified');
  const entityType = optionalParam(params, 'entityType');
  const experience = optionalParam(params, 'experience');
  const categoryValues = optionalParams(params, 'category');
  const cityValues = optionalParams(params, 'city');
  const specializationValues = optionalParams(params, 'specialization');
  const andConditions: Prisma.MasterWhereInput[] = [];

  if (categoryValues) {
    andConditions.push({ category: { slug: { in: categoryValues }, type: CategoryType.MASTER } });
  }

  if (cityValues) {
    andConditions.push({ city: { slug: { in: cityValues } } });
  }

  if (specializationValues) {
    andConditions.push({ specializations: { hasSome: specializationValues } });
  }

  const experienceWhere = getExperienceWhere(experience);
  if (experienceWhere) {
    andConditions.push(experienceWhere);
  }

  const baseWhere: Prisma.MasterWhereInput = {
    status: ContentStatus.PUBLISHED,
    ...(andConditions.length > 0 ? { AND: andConditions } : {}),
    isVerified: verified === 'true' ? true : verified === 'false' ? false : undefined,
    entityType: entityType === MasterEntityType.INDIVIDUAL || entityType === MasterEntityType.BUSINESS
      ? entityType
      : undefined
  };

  const { items, total } = await listResultWithRelevance(
    q,
    page,
    pageSize,
    ({ idsOnly }) => {
      const selectIdAndTitle = { id: true, title: true } as const;
      if (idsOnly) {
        const searchWhere: Prisma.MasterWhereInput = {
          ...baseWhere,
          ...(q ? { OR: masterSearchFields(q) } : {})
        };
        return prisma.master
          .findMany({
            where: searchWhere,
            select: selectIdAndTitle,
            orderBy: getMasterOrderBy(sort)
          })
          .then(async (items) => {
            const total = await prisma.master.count({ where: searchWhere });
            return { ids: items, total };
          });
      }
      return prisma.master
        .findMany({
          where: baseWhere,
          select: selectIdAndTitle,
          orderBy: getMasterOrderBy(sort)
        })
        .then(async (items) => {
          const total = await prisma.master.count({ where: baseWhere });
          return { ids: items, total };
        });
    },
    (ids) =>
      prisma.master.findMany({
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
    items: items.map((master) => {
      const displayName = getMasterDisplayName(master);
      return {
        id: master.id,
        title: master.title,
        slug: master.slug,
        summary: master.summary,
        kind: 'master',
        label: master.category?.name,
        subtitle: displayName,
        meta: compact([master.city?.name, getMasterEntityLabel(master.entityType), master.serviceArea]),
        metaGroups: [
          { label: 'Тип', value: getMasterEntityLabel(master.entityType) },
          master.category?.name ? { label: 'Категория', value: master.category.name } : undefined,
          master.city?.name ? { label: 'Город', value: master.city.name } : undefined,
          master.serviceArea ? { label: 'География', value: master.serviceArea } : undefined,
          master.experienceYears !== null ? { label: 'Опыт', value: `${master.experienceYears} лет` } : undefined,
          master.rateLabel ? { label: 'Стоимость', value: master.rateLabel } : undefined,
          master.specializations.length > 0 ? { label: 'Специализация', value: compactLabel(master.specializations.join(', ')) } : undefined,
        ].filter(Boolean) as PublishedContentMetaGroup[],
        updatedLabel: formatUpdatedLabel(master.publishedAt ?? master.createdAt),
        imageUrl: publicImageUrl(master.coverImage),
        isVerified: master.isVerified
      };
    })
  });
}
