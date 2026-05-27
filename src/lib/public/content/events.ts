import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
import { eventFormatOptions, getAdminOptionLabel } from '@/lib/admin/content-labels';
import { prisma } from '@/lib/db/prisma';
import {
  eventPlaceLabel,
  formatDateTimeLabel,
  getPage,
  getPageSize,
  listResult,
  optionalParam,
  publicImageUrl,
  textSearch,
  type PublishedContentMetaGroup,
  type PublicContentSearchParams
} from './shared';

export async function getPublishedEvents(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const periodParam = optionalParam(params, 'period');
  const period = periodParam === 'all' ? undefined : periodParam;
  const where: Prisma.EventWhereInput = {
    status: ContentStatus.PUBLISHED,
    ...textSearch(q),
    category: optionalParam(params, 'category') ? { slug: optionalParam(params, 'category'), type: CategoryType.EVENT } : undefined,
    city: optionalParam(params, 'city') ? { slug: optionalParam(params, 'city') } : undefined,
    format: optionalParam(params, 'format') ? { equals: optionalParam(params, 'format'), mode: 'insensitive' } : undefined,
    startsAt: period === 'past' ? { lt: new Date() } : period === 'upcoming' ? { gte: new Date() } : undefined
  };
  const [total, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { startsAt: period === 'past' ? 'desc' : 'asc' }, { createdAt: 'desc' }],
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
    items: events.map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      summary: event.summary,
      label: event.category?.name,
      dateIso: event.startsAt.toISOString(),
      meta: [
        event.city?.name,
        event.locationName,
        getAdminOptionLabel(eventFormatOptions, event.format, ''),
        event.startsAt.toLocaleDateString('ru-RU')
      ].filter(Boolean) as string[],
      metaGroups: [
        { label: 'Дата', value: formatDateTimeLabel(event.startsAt), tone: 'accent' },
        { label: 'Место', value: eventPlaceLabel(event.locationName, event.city?.name) },
        event.format ? { label: 'Формат', value: getAdminOptionLabel(eventFormatOptions, event.format) } : undefined,
        { label: 'Аудитория', value: 'специалисты и команды' }
      ].filter(Boolean) as PublishedContentMetaGroup[],
      imageUrl: publicImageUrl(event.coverImage)
    }))
  });
}
