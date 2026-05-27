import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
import { getAdminOptionLabel, partnerTypeOptions } from '@/lib/admin/content-labels';
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

export async function getPublishedPartners(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const featured = optionalParam(params, 'featured');
  const where: Prisma.PartnerWhereInput = {
    status: ContentStatus.PUBLISHED,
    ...textSearch(q),
    category: optionalParam(params, 'category') ? { slug: optionalParam(params, 'category'), type: CategoryType.PARTNER } : undefined,
    partnerType: optionalParam(params, 'partnerType') ? { equals: optionalParam(params, 'partnerType'), mode: 'insensitive' } : undefined,
    isFeatured: featured === 'true' ? true : featured === 'false' ? false : undefined
  };
  const [total, partners] = await Promise.all([
    prisma.partner.count({ where }),
    prisma.partner.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { name: true } },
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
    items: partners.map((partner) => ({
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
