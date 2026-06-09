import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
import { eventFormatOptions, eventRegistrationModeOptions, getAdminOptionLabel } from '@/lib/admin/content-labels';
import { prisma } from '@/lib/db/prisma';
import { getRenderableExternalUrl } from '@/lib/validation/external-url';
import {
  cleanPublicDetailText,
  compact,
  detailImage,
  formatDate,
  formatDateTime,
  parseFacts,
  type PublicContentDetail
} from '@/modules/content/shared/detail-helpers';
import {
  eventPlaceLabel,
  getPage,
  getPageSize,
  listResult,
  listResultWithRelevance,
  optionalParam,
  publicImageUrl,
  type PublishedContentMetaGroup,
  type PublicContentSearchParams
} from './shared';

function formatTime(date: Date) {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' });
}

function formatDateOnlyLabel(date: Date) {
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    weekday: 'short'
  });
}

export async function getPublishedEventDetail(slug: string): Promise<PublicContentDetail | null> {
  const event = await prisma.event.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: {
      category: { select: { name: true } },
      city: { select: { name: true } },
      coverImage: { select: { fileKey: true, bucket: true, visibility: true } }
    }
  });

  if (!event) {
    return null;
  }
  const registrationUrl = getRenderableExternalUrl(event.registrationUrl);

  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    summary: cleanPublicDetailText(event.summary),
    startsAtIso: event.startsAt.toISOString(),
    endsAtIso: event.endsAt?.toISOString(),
    publishedAtIso: event.publishedAt?.toISOString(),
    updatedAtIso: event.updatedAt.toISOString(),
    label: event.category?.name,
    meta: compact([event.city?.name, getAdminOptionLabel(eventFormatOptions, event.format, ''), formatDate(event.startsAt)]),
    imageUrl: detailImage(event.coverImage, event.coverImageAlt, event.title),
    cityName: event.city?.name,
    locationName: event.locationName ?? undefined,
    address: event.address ?? undefined,
    externalUrl: registrationUrl,
    externalUrlLabel: registrationUrl ? 'Записаться' : undefined,
    facts: parseFacts(compact([
      event.city?.name ? `Город: ${event.city.name}` : undefined,
      formatDateTime(event.startsAt) ? `Дата и время: ${formatDateTime(event.startsAt)}` : undefined,
      formatDateTime(event.endsAt) ? `Окончание: ${formatDateTime(event.endsAt)}` : undefined,
      event.locationName ? `Место: ${event.locationName}` : undefined,
      event.address ? `Адрес: ${event.address}` : undefined,
      event.format ? `Формат: ${getAdminOptionLabel(eventFormatOptions, event.format)}` : undefined,
      'Для кого: специалисты, команды и партнёры индустрии',
      event.registrationMode
        ? `Регистрация: ${getAdminOptionLabel(eventRegistrationModeOptions, event.registrationMode)}`
        : 'Регистрация: заявки принимаются через BARSYNERGY',
      'Участие: бесплатно или по условиям организатора',
      'Организатор: BARSYNERGY / партнёры',
      typeof event.capacity === 'number' ? `Мест: ${event.capacity}` : undefined
    ])),
    sections: [
      {
        title: 'Перед участием',
        items: compact([
          formatDateTime(event.startsAt) ? `Дата и время: ${formatDateTime(event.startsAt)}.` : undefined,
          event.locationName || event.city?.name ? `Место: ${eventPlaceLabel(event.locationName, event.city?.name)}.` : undefined,
          event.format ? `Формат: ${getAdminOptionLabel(eventFormatOptions, event.format)}.` : undefined,
          registrationUrl
            ? 'Запись: доступна по внешней ссылке.'
            : event.registrationMode
            ? `Регистрация: ${getAdminOptionLabel(eventRegistrationModeOptions, event.registrationMode)}.`
            : 'Регистрация проходит через форму BARSYNERGY.'
        ])
      },
      {
        title: 'Кому подходит',
        items: [
          'Барменам, бар-менеджерам и управляющим, которым нужны практические примеры.',
          'Заведениям, которым нужен контакт с экспертами, брендами или поставщиками.',
          'Брендам и партнёрам, которые хотят понять аудиторию СКФО.'
        ]
      }
    ]
  };
}

function buildStartsAtFilter(period: string | undefined): Prisma.DateTimeFilter | undefined {
  if (!period) return undefined;
  const now = new Date();
  if (period === 'past') return { lt: now };
  if (period === 'upcoming') return { gte: now };
  if (period === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return { gte: start, lt: end };
  }
  if (period === 'this_week') {
    const dow = now.getDay();
    const toMonday = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + toMonday);
    const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + toMonday + 7);
    return { gte: monday, lt: nextMonday };
  }
  return undefined;
}

const eventSearchFields = (q: string): Prisma.EventWhereInput[] => [
  { title: { contains: q, mode: 'insensitive' as const } },
  { summary: { contains: q, mode: 'insensitive' as const } },
  { locationName: { contains: q, mode: 'insensitive' as const } },
  { address: { contains: q, mode: 'insensitive' as const } },
  { city: { name: { contains: q, mode: 'insensitive' as const } } }
];

export async function getPublishedEvents(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const periodParam = optionalParam(params, 'period');
  const period = periodParam === 'all' ? undefined : periodParam;
  const baseWhere: Prisma.EventWhereInput = {
    status: ContentStatus.PUBLISHED,
    category: optionalParam(params, 'category') ? { slug: optionalParam(params, 'category'), type: CategoryType.EVENT } : undefined,
    city: optionalParam(params, 'city') ? { slug: optionalParam(params, 'city') } : undefined,
    format: optionalParam(params, 'format') ? { equals: optionalParam(params, 'format'), mode: 'insensitive' } : undefined,
    startsAt: buildStartsAtFilter(period)
  };

  const { items, total } = await listResultWithRelevance(
    q,
    page,
    pageSize,
    ({ idsOnly }) => {
      const selectIdAndTitle = { id: true, title: true } as const;
      if (idsOnly) {
        const searchWhere: Prisma.EventWhereInput = {
          ...baseWhere,
          ...(q ? { OR: eventSearchFields(q) } : {})
        };
        return prisma.event
          .findMany({
            where: searchWhere,
            select: selectIdAndTitle,
            orderBy: [{ sortOrder: 'asc' }, { startsAt: 'asc' }, { createdAt: 'desc' }]
          })
          .then(async (items) => {
            const total = await prisma.event.count({ where: searchWhere });
            return { ids: items, total };
          });
      }
      const defaultWhere = baseWhere;
      return prisma.event
        .findMany({
          where: defaultWhere,
          select: selectIdAndTitle,
          orderBy: [{ sortOrder: 'asc' }, { startsAt: period === 'past' ? 'desc' : 'asc' }, { createdAt: 'desc' }]
        })
        .then(async (items) => {
          const total = await prisma.event.count({ where: defaultWhere });
          return { ids: items, total };
        });
    },
    (ids) =>
      prisma.event.findMany({
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
    items: items.map((event) => ({
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
        { label: 'Дата', value: formatDateOnlyLabel(event.startsAt), tone: 'accent' },
        event.endsAt
          ? { label: 'Время', value: `${formatTime(event.startsAt)} – ${formatTime(event.endsAt)}` }
          : { label: 'Время', value: formatTime(event.startsAt) },
        { label: 'Место', value: eventPlaceLabel(event.locationName, event.city?.name) },
        event.format ? { label: 'Формат', value: getAdminOptionLabel(eventFormatOptions, event.format) } : undefined,
        { label: 'Аудитория', value: 'специалисты и команды' }
      ].filter(Boolean) as PublishedContentMetaGroup[],
      imageUrl: publicImageUrl(event.coverImage),
      statusLabel: typeof event.capacity === 'number' ? `Мест: ${event.capacity}` : undefined
    }))
  });
}
