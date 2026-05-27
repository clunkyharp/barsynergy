import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
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

export async function getPublishedArticles(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const where: Prisma.ArticleWhereInput = {
    status: ContentStatus.PUBLISHED,
    ...textSearch(q),
    category: optionalParam(params, 'category') ? { slug: optionalParam(params, 'category'), type: CategoryType.ARTICLE } : undefined,
    city: optionalParam(params, 'city') ? { slug: optionalParam(params, 'city') } : undefined,
    tags: optionalParam(params, 'tag')
      ? { some: { tag: { slug: optionalParam(params, 'tag'), type: CategoryType.ARTICLE, isActive: true } } }
      : undefined
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
        coverImage: { select: { fileKey: true, bucket: true, visibility: true } },
        tags: {
          where: { tag: { isActive: true, type: CategoryType.ARTICLE } },
          orderBy: { tag: { sortOrder: 'asc' } },
          select: { tag: { select: { name: true } } }
        }
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
      meta: [
        article.city?.name,
        article.authorName,
        article.readingTimeMinutes ? `${article.readingTimeMinutes} мин` : undefined,
        ...article.tags.map((entry) => entry.tag.name)
      ].filter(Boolean) as string[],
      dateIso: (article.publishedAt ?? article.createdAt).toISOString(),
      updatedLabel: (article.publishedAt ?? article.createdAt).toLocaleDateString('ru-RU'),
      imageUrl: publicImageUrl(article.coverImage)
    }))
  });
}
