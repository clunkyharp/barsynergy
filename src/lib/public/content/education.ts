import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
import { courseFormatOptions, courseLevelOptions, getAdminOptionLabel } from '@/lib/admin/content-labels';
import { prisma } from '@/lib/db/prisma';
import {
  cleanPublicDetailText,
  compact,
  detailImage,
  formatDate,
  parseFacts,
  type PublicContentDetail
} from '@/modules/content/shared/detail-helpers';
import {
  getPage,
  getPageSize,
  listResult,
  listResultWithRelevance,
  optionalParam,
  publicImageUrl,
  type PublishedContentMetaGroup,
  type PublicContentSearchParams
} from './shared';

export async function getPublishedCourseDetail(slug: string): Promise<PublicContentDetail | null> {
  const course = await prisma.course.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: {
      category: { select: { name: true } },
      city: { select: { name: true } },
      coverImage: { select: { fileKey: true, bucket: true, visibility: true } }
    }
  });

  if (!course) {
    return null;
  }

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    summary: cleanPublicDetailText(course.summary),
    publishedAtIso: course.publishedAt?.toISOString(),
    updatedAtIso: course.updatedAt.toISOString(),
    body: course.program ? cleanPublicDetailText(course.program) : course.program,
    label: course.category?.name,
    meta: compact([
      course.city?.name,
      getAdminOptionLabel(courseFormatOptions, course.format, ''),
      getAdminOptionLabel(courseLevelOptions, course.level, ''),
      course.durationLabel
    ]),
    imageUrl: detailImage(course.coverImage, course.coverImageAlt, course.title),
    cityName: course.city?.name,
    facts: parseFacts(compact([
      course.priceLabel ? `Стоимость: ${course.priceLabel}` : undefined,
      course.instructorName ? `Преподаватель: ${course.instructorName}` : undefined,
      formatDate(course.publishedAt) ? `Опубликовано: ${formatDate(course.publishedAt)}` : undefined
    ])),
    sections: [
      {
        title: 'Параметры программы',
        items: compact([
          course.format ? `Формат: ${getAdminOptionLabel(courseFormatOptions, course.format)}.` : undefined,
          course.level ? `Уровень: ${getAdminOptionLabel(courseLevelOptions, course.level)}.` : undefined,
          course.durationLabel ? `Длительность: ${course.durationLabel}.` : undefined,
          course.instructorName ? `Преподаватель: ${course.instructorName}.` : undefined,
          course.priceLabel ? `Стоимость: ${course.priceLabel}.` : undefined
        ])
      },
      {
        title: 'Следующий шаг',
        items: [
          'Оставьте заявку, если хотите уточнить расписание, формат или состав группы.',
          'В заявке можно указать город, уровень подготовки и удобный контакт.'
        ]
      }
    ].filter((section) => section.items.length > 0)
  };
}

const courseSearchFields = (q: string): Prisma.CourseWhereInput[] => [
  { title: { contains: q, mode: 'insensitive' as const } },
  { summary: { contains: q, mode: 'insensitive' as const } },
  { instructorName: { contains: q, mode: 'insensitive' as const } },
  { city: { name: { contains: q, mode: 'insensitive' as const } } }
];

export async function getPublishedCourses(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const baseWhere: Prisma.CourseWhereInput = {
    status: ContentStatus.PUBLISHED,
    category: optionalParam(params, 'category') ? { slug: optionalParam(params, 'category'), type: CategoryType.COURSE } : undefined,
    city: optionalParam(params, 'city') ? { slug: optionalParam(params, 'city') } : undefined,
    format: optionalParam(params, 'format') ? { equals: optionalParam(params, 'format'), mode: 'insensitive' } : undefined,
    level: optionalParam(params, 'level') ? { equals: optionalParam(params, 'level'), mode: 'insensitive' } : undefined
  };

  const { items, total } = await listResultWithRelevance(
    q,
    page,
    pageSize,
    ({ idsOnly }) => {
      const selectIdAndTitle = { id: true, title: true } as const;
      const orderBy = [{ sortOrder: 'asc' as const }, { publishedAt: 'desc' as const }, { createdAt: 'desc' as const }];
      if (idsOnly) {
        const searchWhere: Prisma.CourseWhereInput = {
          ...baseWhere,
          ...(q ? { OR: courseSearchFields(q) } : {})
        };
        return prisma.course
          .findMany({ where: searchWhere, select: selectIdAndTitle, orderBy })
          .then(async (items) => {
            const total = await prisma.course.count({ where: searchWhere });
            return { ids: items, total };
          });
      }
      return prisma.course
        .findMany({ where: baseWhere, select: selectIdAndTitle, orderBy })
        .then(async (items) => {
          const total = await prisma.course.count({ where: baseWhere });
          return { ids: items, total };
        });
    },
    (ids) =>
      prisma.course.findMany({
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
    items: items.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      summary: course.summary,
      label: course.category?.name,
      meta: [
        course.city?.name,
        getAdminOptionLabel(courseFormatOptions, course.format, ''),
        getAdminOptionLabel(courseLevelOptions, course.level, ''),
        course.durationLabel,
        course.priceLabel
      ].filter(Boolean) as string[],
      metaGroups: [
        course.instructorName ? { label: 'Преподаватель', value: course.instructorName } : undefined,
        course.format ? { label: 'Формат', value: getAdminOptionLabel(courseFormatOptions, course.format) } : undefined,
        course.level ? { label: 'Уровень', value: getAdminOptionLabel(courseLevelOptions, course.level) } : undefined,
        course.durationLabel ? { label: 'Длительность', value: course.durationLabel } : undefined,
        course.priceLabel ? { label: 'Стоимость', value: course.priceLabel } : undefined
      ].filter(Boolean) as PublishedContentMetaGroup[],
      imageUrl: publicImageUrl(course.coverImage)
    }))
  });
}
