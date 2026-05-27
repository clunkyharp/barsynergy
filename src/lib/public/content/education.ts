import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
import { courseFormatOptions, courseLevelOptions, getAdminOptionLabel } from '@/lib/admin/content-labels';
import { prisma } from '@/lib/db/prisma';
import {
  getPage,
  getPageSize,
  listResult,
  optionalParam,
  publicImageUrl,
  textSearch,
  type PublicContentSearchParams
} from './shared';

export async function getPublishedCourses(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const where: Prisma.CourseWhereInput = {
    status: ContentStatus.PUBLISHED,
    ...textSearch(q),
    category: optionalParam(params, 'category') ? { slug: optionalParam(params, 'category'), type: CategoryType.COURSE } : undefined,
    city: optionalParam(params, 'city') ? { slug: optionalParam(params, 'city') } : undefined,
    format: optionalParam(params, 'format') ? { equals: optionalParam(params, 'format'), mode: 'insensitive' } : undefined,
    level: optionalParam(params, 'level') ? { equals: optionalParam(params, 'level'), mode: 'insensitive' } : undefined
  };
  const [total, courses] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
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
    items: courses.map((course) => ({
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
      imageUrl: publicImageUrl(course.coverImage)
    }))
  });
}
