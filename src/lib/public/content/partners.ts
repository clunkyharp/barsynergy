import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
import { getAdminOptionLabel, partnerTypeOptions } from '@/lib/admin/content-labels';
import { prisma } from '@/lib/db/prisma';
import { getRenderableExternalUrl } from '@/lib/validation/external-url';
import {
  cleanPublicDetailText,
  compact,
  detailImage,
  parseFacts,
  type PublicContentDetail
} from '@/modules/content/shared/detail-helpers';
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
} from './shared';

export async function getPublishedPartnerDetail(slug: string): Promise<PublicContentDetail | null> {
  const partner = await prisma.partner.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: {
      category: { select: { name: true } },
      coverImage: { select: { fileKey: true, bucket: true, visibility: true } }
    }
  });

  if (!partner) {
    return null;
  }

  const externalUrl = getRenderableExternalUrl(partner.websiteUrl);

  return {
    id: partner.id,
    title: partner.title,
    slug: partner.slug,
    summary: cleanPublicDetailText(partner.summary),
    publishedAtIso: partner.publishedAt?.toISOString(),
    updatedAtIso: partner.updatedAt.toISOString(),
    body: partner.description ? cleanPublicDetailText(partner.description) : partner.description,
    label: partner.category?.name,
    meta: compact([
      partner.companyName,
      getAdminOptionLabel(partnerTypeOptions, partner.partnerType, ''),
      partner.isFeatured ? 'В подборке' : undefined
    ]),
    imageUrl: detailImage(partner.coverImage, partner.coverImageAlt, partner.title),
    companyName: partner.companyName,
    facts: parseFacts(compact([
      `Компания: ${partner.companyName}`,
      partner.partnerType ? `Тип партнёрства: ${getAdminOptionLabel(partnerTypeOptions, partner.partnerType)}` : undefined,
      partner.isFeatured ? 'Статус: В подборке' : undefined
    ])),
    externalUrl,
    externalUrlLabel: externalUrl ? 'Сайт партнёра' : undefined,
    sections: [
      {
        title: 'Формат партнёрства',
        items: compact([
          partner.partnerType ? `Тип: ${getAdminOptionLabel(partnerTypeOptions, partner.partnerType)}.` : undefined,
          partner.category?.name ? `Направление: ${partner.category.name}.` : undefined,
          partner.isFeatured ? 'Партнёр отмечен в подборке BARSYNERGY.' : undefined
        ])
      },
      {
        title: 'Следующий шаг',
        items: compact([
          'Используйте кнопку связи, чтобы обсудить формат сотрудничества.',
          externalUrl ? 'Сайт партнёра доступен отдельной ссылкой.' : undefined,
          'В обращении сохранится выбранная компания и направление.'
        ])
      }
    ].filter((section) => section.items.length > 0)
  };
}

const partnerSearchFields = (q: string): Prisma.PartnerWhereInput[] => [
  { title: { contains: q, mode: 'insensitive' as const } },
  { summary: { contains: q, mode: 'insensitive' as const } },
  { companyName: { contains: q, mode: 'insensitive' as const } }
];

export async function getPublishedPartners(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const featured = optionalParam(params, 'featured');
  const baseWhere: Prisma.PartnerWhereInput = {
    status: ContentStatus.PUBLISHED,
    category: optionalParam(params, 'category') ? { slug: optionalParam(params, 'category'), type: CategoryType.PARTNER } : undefined,
    partnerType: optionalParam(params, 'partnerType') ? { equals: optionalParam(params, 'partnerType'), mode: 'insensitive' } : undefined,
    isFeatured: featured === 'true' ? true : featured === 'false' ? false : undefined
  };

  const { items, total } = await listResultWithRelevance(
    q,
    page,
    pageSize,
    ({ idsOnly }) => {
      const selectIdAndTitle = { id: true, title: true } as const;
      const orderBy = [{ isFeatured: 'desc' as const }, { sortOrder: 'asc' as const }, { publishedAt: 'desc' as const }, { createdAt: 'desc' as const }];
      if (idsOnly) {
        const searchWhere: Prisma.PartnerWhereInput = {
          ...baseWhere,
          ...(q ? { OR: partnerSearchFields(q) } : {})
        };
        return prisma.partner
          .findMany({ where: searchWhere, select: selectIdAndTitle, orderBy })
          .then(async (items) => {
            const total = await prisma.partner.count({ where: searchWhere });
            return { ids: items, total };
          });
      }
      return prisma.partner
        .findMany({ where: baseWhere, select: selectIdAndTitle, orderBy })
        .then(async (items) => {
          const total = await prisma.partner.count({ where: baseWhere });
          return { ids: items, total };
        });
    },
    (ids) =>
      prisma.partner.findMany({
        where: { id: { in: ids }, status: ContentStatus.PUBLISHED },
        include: {
          category: { select: { name: true } },
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
    items: items.map((partner) => ({
      id: partner.id,
      title: partner.title,
      slug: partner.slug,
      summary: partner.summary,
      kind: 'partner',
      label: partner.category?.name,
      subtitle: partner.companyName,
      meta: [
        partner.companyName,
        getAdminOptionLabel(partnerTypeOptions, partner.partnerType, ''),
        partner.isFeatured ? 'В подборке' : undefined
      ].filter(Boolean) as string[],
      metaGroups: [
        partner.companyName ? { label: 'Компания', value: partner.companyName } : undefined,
        partner.partnerType ? { label: 'Формат', value: getAdminOptionLabel(partnerTypeOptions, partner.partnerType) } : undefined,
        partner.isFeatured ? { value: 'В подборке', tone: 'accent' } : undefined
      ].filter(Boolean) as PublishedContentMetaGroup[],
      statusLabel: partner.isFeatured ? 'В подборке' : 'Партнёр',
      updatedLabel: formatUpdatedLabel(partner.publishedAt ?? partner.createdAt),
      imageUrl: publicImageUrl(partner.coverImage)
    }))
  });
}
