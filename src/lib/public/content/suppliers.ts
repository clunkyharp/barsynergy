import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import {
  compactLabel,
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

export async function getPublishedSuppliers(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const verified = optionalParam(params, 'verified');
  const where: Prisma.SupplierWhereInput = {
    status: ContentStatus.PUBLISHED,
    ...textSearch(q),
    category: optionalParam(params, 'category') ? { slug: optionalParam(params, 'category'), type: CategoryType.SUPPLIER } : undefined,
    city: optionalParam(params, 'city') ? { slug: optionalParam(params, 'city') } : undefined,
    isVerified: verified === 'true' ? true : verified === 'false' ? false : undefined
  };
  const [total, suppliers] = await Promise.all([
    prisma.supplier.count({ where }),
    prisma.supplier.findMany({
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
    items: suppliers.map((supplier) => ({
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
      imageUrl: publicImageUrl(supplier.coverImage)
    }))
  });
}
