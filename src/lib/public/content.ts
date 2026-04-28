import { CategoryType, ContentStatus, FileVisibility, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getPublicFileUrl } from '@/lib/storage/public-url';

export const PUBLIC_CONTENT_PAGE_SIZE = 12;
export const PUBLIC_CONTENT_MAX_PAGE_SIZE = 24;

export type PublicContentSearchParams = Record<string, string | string[] | undefined>;

type PublishedContentItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  label?: string;
  meta: string[];
  imageUrl?: string;
};

export type PublishedContentList = {
  items: PublishedContentItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  searchQuery?: string;
  params: PublicContentSearchParams;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function optionalParam(params: PublicContentSearchParams, key: string) {
  const value = firstParam(params[key])?.trim();
  return value && value.length > 0 ? value : undefined;
}

function getPage(params: PublicContentSearchParams) {
  const value = Number.parseInt(firstParam(params.page) ?? '1', 10);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function getPageSize(params: PublicContentSearchParams) {
  const value = Number.parseInt(firstParam(params.pageSize) ?? String(PUBLIC_CONTENT_PAGE_SIZE), 10);

  if (!Number.isFinite(value) || value <= 0) {
    return PUBLIC_CONTENT_PAGE_SIZE;
  }

  return Math.min(value, PUBLIC_CONTENT_MAX_PAGE_SIZE);
}

function publicImageUrl(
  file: { fileKey: string; bucket: string | null; visibility: FileVisibility } | null | undefined
) {
  if (!file || file.visibility !== FileVisibility.PUBLIC) {
    return undefined;
  }

  return getPublicFileUrl({
    fileKey: file.fileKey,
    bucket: file.bucket ?? undefined,
    visibility: 'public'
  });
}

function normalizeParams(params: PublicContentSearchParams) {
  return Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          const values = value.map((item) => item.trim()).filter(Boolean);
          return values.length > 0 ? [key, values] : undefined;
        }

        const normalizedValue = value?.trim();
        return normalizedValue ? [key, normalizedValue] : undefined;
      })
      .filter(Boolean) as [string, string | string[]][]
  );
}

function listResult(input: {
  items: PublishedContentItem[];
  page: number;
  pageSize: number;
  total: number;
  searchQuery?: string;
  params: PublicContentSearchParams;
}): PublishedContentList {
  return {
    ...input,
    params: normalizeParams(input.params),
    totalPages: Math.max(1, Math.ceil(input.total / input.pageSize))
  };
}

function textSearch(query?: string) {
  return query
    ? {
        OR: [
          { title: { contains: query, mode: 'insensitive' as const } },
          { summary: { contains: query, mode: 'insensitive' as const } }
        ]
      }
    : {};
}

export async function getPublishedArticles(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const where: Prisma.ArticleWhereInput = {
    status: ContentStatus.PUBLISHED,
    ...textSearch(q),
    category: optionalParam(params, 'category') ? { slug: optionalParam(params, 'category'), type: CategoryType.ARTICLE } : undefined,
    city: optionalParam(params, 'city') ? { slug: optionalParam(params, 'city') } : undefined,
    tags: optionalParam(params, 'tag') ? { some: { tag: { slug: optionalParam(params, 'tag'), type: CategoryType.ARTICLE } } } : undefined
  };
  const [total, articles] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
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
    items: articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      summary: article.summary,
      label: article.category?.name,
      meta: [article.city?.name, article.authorName, article.readingTimeMinutes ? `${article.readingTimeMinutes} мин` : undefined].filter(
        Boolean
      ) as string[],
      imageUrl: publicImageUrl(article.coverImage)
    }))
  });
}

export async function getPublishedEvents(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const period = optionalParam(params, 'period');
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
      meta: [event.city?.name, event.format, event.startsAt.toLocaleDateString('ru-RU')].filter(Boolean) as string[],
      imageUrl: publicImageUrl(event.coverImage)
    }))
  });
}

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
      meta: [course.city?.name, course.format, course.level, course.durationLabel, course.priceLabel].filter(Boolean) as string[],
      imageUrl: publicImageUrl(course.coverImage)
    }))
  });
}

export async function getPublishedVacancies(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const where: Prisma.VacancyWhereInput = {
    status: ContentStatus.PUBLISHED,
    ...textSearch(q),
    category: optionalParam(params, 'category') ? { slug: optionalParam(params, 'category'), type: CategoryType.VACANCY } : undefined,
    city: optionalParam(params, 'city') ? { slug: optionalParam(params, 'city') } : undefined,
    employmentType: optionalParam(params, 'employmentType')
      ? { equals: optionalParam(params, 'employmentType'), mode: 'insensitive' }
      : undefined
  };
  const [total, vacancies] = await Promise.all([
    prisma.vacancy.count({ where }),
    prisma.vacancy.findMany({
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
    items: vacancies.map((vacancy) => ({
      id: vacancy.id,
      title: vacancy.title,
      slug: vacancy.slug,
      summary: vacancy.summary,
      label: vacancy.category?.name,
      meta: [vacancy.city?.name, vacancy.companyName, vacancy.employmentType, vacancy.salaryLabel].filter(Boolean) as string[],
      imageUrl: publicImageUrl(vacancy.coverImage)
    }))
  });
}

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
      label: supplier.category?.name,
      meta: [supplier.city?.name, supplier.companyName, supplier.isVerified ? 'Проверен' : undefined, supplier.serviceArea].filter(Boolean) as string[],
      imageUrl: publicImageUrl(supplier.coverImage)
    }))
  });
}

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
      label: partner.category?.name,
      meta: [partner.companyName, partner.partnerType, partner.isFeatured ? 'В подборке' : undefined].filter(Boolean) as string[],
      imageUrl: publicImageUrl(partner.coverImage)
    }))
  });
}
