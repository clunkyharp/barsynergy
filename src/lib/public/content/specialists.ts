import { prisma } from '@/lib/db/prisma';
import { ContentStatus, MasterEntityType } from '@prisma/client';
import type { PublicContentSearchParams } from './shared';
import { getPage, getPageSize, publicImageUrl } from './shared';
import type { PublishedContentItem } from './shared';

export type SpecialistMode = 'seeking' | 'offering';

export type SpecialistCardItem = PublishedContentItem & {
  mode: SpecialistMode;
  detailUrl: string;
  publicHandle?: string;
  citySlug?: string;
};

type SpecialistListResult = {
  items: SpecialistCardItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  searchQuery?: string;
  params: PublicContentSearchParams;
};

function asArray(value: string | string[] | undefined): string[] | undefined {
  if (!value) return undefined;
  const items = (Array.isArray(value) ? value : [value])
    .flatMap((v) => v.split(',').map((s) => s.trim()).filter(Boolean));
  return items.length > 0 ? items : undefined;
}

function getSeekingWhere(params: PublicContentSearchParams) {
  const q = params.q as string | undefined;
  const cityValues = asArray(params.city);
  const employmentValues = asArray(params.employmentType);
  const categoryValues = asArray(params.category);
  const jobSearchValues = asArray(params.jobSearchStatus);

  const where: Record<string, unknown> = {
    isPublic: true,
    publicHandle: { not: null },
  };

  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' as const } },
      { profession: { contains: q, mode: 'insensitive' as const } },
      { headline: { contains: q, mode: 'insensitive' as const } },
      { bio: { contains: q, mode: 'insensitive' as const } },
    ];
  }

  if (cityValues) where.city = { slug: { in: cityValues } };
  if (employmentValues) where.employmentTypes = { hasSome: employmentValues };
  if (categoryValues) where.profession = { in: categoryValues };
  if (jobSearchValues) where.jobSearchStatus = { in: jobSearchValues };

  return where;
}

function getOfferingWhere(params: PublicContentSearchParams) {
  const q = params.q as string | undefined;
  const cityValues = asArray(params.city);
  const categoryValues = asArray(params.category);
  const verified = params.verified as string | undefined;
  const specializationValues = asArray(params.specialization);
  const entityType = params.entityType as string | undefined;

  const andConditions: Record<string, unknown>[] = [];

  if (cityValues) {
    andConditions.push({ city: { slug: { in: cityValues } } });
  }

  if (categoryValues) {
    andConditions.push({ category: { slug: { in: categoryValues } } });
  }

  if (specializationValues) {
    andConditions.push({ specializations: { hasSome: specializationValues } });
  }

  const baseWhere: Record<string, unknown> = {
    status: ContentStatus.PUBLISHED,
  };

  if (andConditions.length > 0) {
    baseWhere.AND = andConditions;
  }

  if (verified === 'true') baseWhere.isVerified = true;

  if (entityType === MasterEntityType.INDIVIDUAL || entityType === MasterEntityType.BUSINESS) {
    baseWhere.entityType = entityType;
  }

  if (q) {
    baseWhere.AND = [
      ...(baseWhere.AND ? (baseWhere.AND as Record<string, unknown>[]) : []),
      {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { summary: { contains: q, mode: 'insensitive' as const } },
          { fullName: { contains: q, mode: 'insensitive' as const } },
          { companyName: { contains: q, mode: 'insensitive' as const } },
        ],
      },
    ];
  }

  return baseWhere;
}

const SEEKING_INCLUDE = {
  city: { select: { name: true, slug: true } },
  avatarFile: { select: { fileKey: true, bucket: true, visibility: true } },
} as const;

const OFFERING_INCLUDE = {
  category: { select: { name: true } },
  city: { select: { name: true, slug: true } },
  coverImage: { select: { fileKey: true, bucket: true, visibility: true } },
} as const;

async function countSeeking(where: Record<string, unknown>) {
  return prisma.profile.count({ where: where as never });
}

async function fetchSeeking(where: Record<string, unknown>, skip: number, take: number) {
  return prisma.profile.findMany({
    where: where as never,
    orderBy: { publishedAt: 'desc' },
    skip,
    take,
    include: SEEKING_INCLUDE,
  });
}

async function countOffering(where: Record<string, unknown>) {
  return prisma.master.count({ where: where as never });
}

async function fetchOffering(where: Record<string, unknown>, skip: number, take: number) {
  return prisma.master.findMany({
    where: where as never,
    orderBy: { publishedAt: 'desc' },
    skip,
    take,
    include: OFFERING_INCLUDE,
  });
}

function seekingToCard(profile: Awaited<ReturnType<typeof fetchSeeking>>[number]): SpecialistCardItem {
  return {
    id: profile.id,
    title: profile.fullName ?? 'Специалист',
    slug: profile.publicHandle!,
    summary: profile.headline ?? profile.bio ?? profile.profession ?? '',
    kind: 'master' as const,
    label: profile.profession ?? undefined,
    subtitle: profile.headline ?? undefined,
    meta: [
      profile.city?.name,
      profile.profession,
      profile.desiredSalary ? `от ${profile.desiredSalary} ₽` : undefined,
    ].filter(Boolean) as string[],
    metaGroups: [
      profile.city?.name ? { label: 'Город', value: profile.city.name } : undefined,
      profile.profession ? { label: 'Профессия', value: profile.profession } : undefined,
      profile.desiredSalary ? {
        label: 'Зарплата',
        value: `от ${profile.desiredSalary} ₽${profile.desiredSalaryMax ? ` до ${profile.desiredSalaryMax} ₽` : ''}`,
      } : undefined,
      profile.employmentTypes.length > 0 ? { label: 'Занятость', value: profile.employmentTypes.join(', ') } : undefined,
    ].filter(Boolean) as never[],
    updatedLabel: profile.publishedAt
      ? profile.publishedAt.toLocaleDateString('ru-RU')
      : undefined,
    imageUrl: publicImageUrl(profile.avatarFile),
    dateIso: profile.publishedAt?.toISOString(),
    isVerified: false,
    isNew: profile.publishedAt
      ? Date.now() - profile.publishedAt.getTime() < 7 * 24 * 60 * 60 * 1000
      : false,
    mode: 'seeking' as const,
    detailUrl: `/specialists/cv/${profile.publicHandle!}`,
    publicHandle: profile.publicHandle ?? undefined,
    citySlug: profile.city?.slug,
  };
}

function offeringToCard(master: Awaited<ReturnType<typeof fetchOffering>>[number]): SpecialistCardItem {
  return {
    id: master.id,
    title: master.title,
    slug: master.slug,
    summary: master.summary,
    kind: 'master' as const,
    label: master.category?.name,
    subtitle: master.fullName ?? master.companyName ?? undefined,
    meta: [
      master.city?.name,
      master.category?.name,
      master.rateLabel,
    ].filter(Boolean) as string[],
    metaGroups: [
      { label: 'Тип', value: master.entityType === MasterEntityType.BUSINESS ? 'Компания' : 'Частный мастер' },
      master.category?.name ? { label: 'Категория', value: master.category.name } : undefined,
      master.city?.name ? { label: 'Город', value: master.city.name } : undefined,
      master.rateLabel ? { label: 'Стоимость', value: master.rateLabel } : undefined,
    ].filter(Boolean) as never[],
    updatedLabel: master.publishedAt
      ? master.publishedAt.toLocaleDateString('ru-RU')
      : undefined,
    imageUrl: publicImageUrl(master.coverImage),
    dateIso: master.publishedAt?.toISOString(),
    isVerified: master.isVerified,
    isNew: master.publishedAt
      ? Date.now() - master.publishedAt.getTime() < 7 * 24 * 60 * 60 * 1000
      : false,
    mode: 'offering' as const,
    detailUrl: `/specialists/svc/${master.slug}`,
    citySlug: master.city?.slug,
  };
}

export async function getPublishedSpecialists(
  params: PublicContentSearchParams = {}
): Promise<SpecialistListResult> {
  const mode = params.mode as string | undefined;

  const page = getPage(params);
  const pageSize = getPageSize(params);

  if (mode === 'seeking') {
    const where = getSeekingWhere(params);
    const [total, profiles] = await Promise.all([
      countSeeking(where),
      fetchSeeking(where, (page - 1) * pageSize, pageSize),
    ]);
    const items = profiles.map(seekingToCard);
    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      params,
    };
  }

  if (mode === 'offering') {
    const where = getOfferingWhere(params);
    const [total, masters] = await Promise.all([
      countOffering(where),
      fetchOffering(where, (page - 1) * pageSize, pageSize),
    ]);
    const items = masters.map(offeringToCard);
    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      params,
    };
  }

  const [seekingCount, seekingProfiles, offeringCount, offeringProfiles] = await Promise.all([
    countSeeking(getSeekingWhere(params)),
    fetchSeeking(getSeekingWhere(params), 0, 1000),
    countOffering(getOfferingWhere(params)),
    fetchOffering(getOfferingWhere(params), 0, 1000),
  ]);

  const merged = [
    ...seekingProfiles.map(seekingToCard),
    ...offeringProfiles.map(offeringToCard),
  ];

  merged.sort((a, b) => {
    const dateA = a.dateIso ? new Date(a.dateIso).getTime() : 0;
    const dateB = b.dateIso ? new Date(b.dateIso).getTime() : 0;
    return dateB - dateA;
  });

  const total = seekingCount + offeringCount;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: merged.slice(start, start + pageSize),
    page,
    pageSize,
    total,
    totalPages,
    params,
  };
}

export type { SpecialistListResult };
