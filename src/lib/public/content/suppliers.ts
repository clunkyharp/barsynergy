import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
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

export async function getPublishedSupplierDetail(slug: string): Promise<PublicContentDetail | null> {
  const supplier = await prisma.supplier.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: {
      category: { select: { name: true } },
      city: { select: { name: true } },
      coverImage: { select: { fileKey: true, bucket: true, visibility: true } }
    }
  });

  if (!supplier) {
    return null;
  }

  const externalUrl = getRenderableExternalUrl(supplier.websiteUrl);

  return {
    id: supplier.id,
    title: supplier.title,
    slug: supplier.slug,
    summary: cleanPublicDetailText(supplier.summary),
    publishedAtIso: supplier.publishedAt?.toISOString(),
    updatedAtIso: supplier.updatedAt.toISOString(),
    body: cleanPublicDetailText(supplier.description),
    label: supplier.category?.name,
    meta: compact([supplier.city?.name, supplier.companyName, supplier.isVerified ? 'Проверенный поставщик' : undefined]),
    imageUrl: detailImage(supplier.coverImage, supplier.coverImageAlt, supplier.title),
    companyName: supplier.companyName,
    cityName: supplier.city?.name,
    facts: parseFacts(compact([
      `Компания: ${supplier.companyName}`,
      supplier.category?.name ? `Категория: ${supplier.category.name}` : undefined,
      supplier.city?.name ? `Город: ${supplier.city.name}` : undefined,
      supplier.serviceArea ? `География: ${supplier.serviceArea}` : undefined,
      supplier.contactLabel ? `Контакты: ${supplier.contactLabel}` : undefined,
      supplier.isVerified ? 'Статус: проверен BARSYNERGY' : 'Статус: контакт для уточнения',
      'Условия: уточняйте у компании'
    ])),
    isVerified: supplier.isVerified,
    externalUrl,
    externalUrlLabel: externalUrl ? 'Сайт компании' : undefined,
  };
}

const supplierSearchFields = (q: string): Prisma.SupplierWhereInput[] => [
  { title: { contains: q, mode: 'insensitive' as const } },
  { summary: { contains: q, mode: 'insensitive' as const } },
  { companyName: { contains: q, mode: 'insensitive' as const } },
  { serviceArea: { contains: q, mode: 'insensitive' as const } },
  { contactLabel: { contains: q, mode: 'insensitive' as const } },
  { city: { name: { contains: q, mode: 'insensitive' as const } } }
];

function getSupplierOrderBy(sort?: string): Prisma.SupplierOrderByWithRelationInput[] {
  if (sort === 'recent') {
    return [{ publishedAt: 'desc' }, { createdAt: 'desc' }, { sortOrder: 'asc' }];
  }

  if (sort === 'verified') {
    return [{ isVerified: 'desc' }, { sortOrder: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];
  }

  if (sort === 'name') {
    return [{ companyName: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];
  }

  return [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];
}

export async function getPublishedSuppliers(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const sort = optionalParam(params, 'sort');
  const verified = optionalParam(params, 'verified');
  const categoryValues = optionalParams(params, 'category');
  const cityValues = optionalParams(params, 'city');
  const andConditions: Prisma.SupplierWhereInput[] = [];
  if (categoryValues) {
    andConditions.push({ category: { slug: { in: categoryValues }, type: CategoryType.SUPPLIER } });
  }
  if (cityValues) {
    andConditions.push({ city: { slug: { in: cityValues } } });
  }
  const baseWhere: Prisma.SupplierWhereInput = {
    status: ContentStatus.PUBLISHED,
    ...(andConditions.length > 0 ? { AND: andConditions } : {}),
    isVerified: verified === 'true' ? true : verified === 'false' ? false : undefined
  };

  const { items, total } = await listResultWithRelevance(
    q,
    page,
    pageSize,
    ({ idsOnly }) => {
      const selectIdAndTitle = { id: true, title: true } as const;
      if (idsOnly) {
        const searchWhere: Prisma.SupplierWhereInput = {
          ...baseWhere,
          ...(q ? { OR: supplierSearchFields(q) } : {})
        };
        return prisma.supplier
          .findMany({
            where: searchWhere,
            select: selectIdAndTitle,
            orderBy: getSupplierOrderBy(sort)
          })
          .then(async (items) => {
            const total = await prisma.supplier.count({ where: searchWhere });
            return { ids: items, total };
          });
      }
      return prisma.supplier
        .findMany({
          where: baseWhere,
          select: selectIdAndTitle,
          orderBy: getSupplierOrderBy(sort)
        })
        .then(async (items) => {
          const total = await prisma.supplier.count({ where: baseWhere });
          return { ids: items, total };
        });
    },
    (ids) =>
      prisma.supplier.findMany({
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
    items: items.map((supplier) => {
      const externalUrl = getRenderableExternalUrl(supplier.websiteUrl);
      return {
        id: supplier.id,
        title: supplier.title,
        slug: supplier.slug,
        summary: supplier.summary,
        kind: 'supplier',
        label: supplier.category?.name,
        subtitle: supplier.companyName,
        meta: [supplier.city?.name, supplier.companyName, supplier.isVerified ? 'Проверен' : undefined, supplier.serviceArea].filter(Boolean) as string[],
        metaGroups: [
          supplier.category?.name ? { label: 'Категория', value: supplier.category.name } : undefined,
          supplier.city?.name ? { label: 'Город', value: supplier.city.name } : undefined,
          supplier.serviceArea ? { label: 'География', value: supplier.serviceArea } : undefined,
          { label: 'Условия', value: 'по запросу' },
          { label: 'Связь', value: supplier.contactLabel ?? 'через BARSYNERGY' },
          { label: 'Продукты / услуги', value: compactLabel(supplier.summary) },
          supplier.isVerified ? undefined : { value: 'Контакт для уточнения' }
        ].filter(Boolean) as PublishedContentMetaGroup[],
        statusLabel: supplier.isVerified ? 'Проверен' : 'Контакт для уточнения',
        updatedLabel: formatUpdatedLabel(supplier.publishedAt ?? supplier.createdAt),
        imageUrl: publicImageUrl(supplier.coverImage),
        websiteUrl: externalUrl
      };
    })
  });
}
