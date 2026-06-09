import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import {
  compact,
  cleanPublicDetailText,
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
  type PublicContentSearchParams
} from './shared';

export async function getPublishedArticleDetail(slug: string): Promise<PublicContentDetail | null> {
  const article = await prisma.article.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
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
  });

  if (!article) {
    return null;
  }

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: cleanPublicDetailText(article.summary),
    publishedAtIso: article.publishedAt?.toISOString(),
    updatedAtIso: article.updatedAt.toISOString(),
    body: article.body ? cleanPublicDetailText(article.body) : article.body,
    label: article.category?.name,
    meta: compact([
      article.city?.name,
      article.authorName,
      article.readingTimeMinutes ? `${article.readingTimeMinutes} мин` : undefined,
      ...article.tags.map((entry) => entry.tag.name)
    ]),
    imageUrl: detailImage(article.coverImage, article.coverImageAlt, article.title),
    facts: parseFacts(compact([
      article.sourceLabel ? `Источник: ${article.sourceLabel}` : undefined,
      formatDate(article.publishedAt) ? `Опубликовано: ${formatDate(article.publishedAt)}` : undefined
    ])),
    sections: [
      {
        title: 'В материале',
        items: compact([
          article.category?.name ? `Тема: ${article.category.name}.` : undefined,
          article.city?.name ? `Городской контекст: ${article.city.name}.` : undefined,
          article.authorName ? `Автор: ${article.authorName}.` : undefined,
          article.readingTimeMinutes ? `Время чтения: ${article.readingTimeMinutes} мин.` : undefined
        ])
      },
      {
        title: 'Как использовать',
        items: compact([
          'Сохраните материал как ориентир по теме.',
          article.tags.length > 0 ? `Связанные метки: ${article.tags.map((entry) => entry.tag.name).join(', ')}.` : undefined,
          'Переходите к похожим материалам ниже, если нужен следующий контекст.'
        ])
      }
    ].filter((section) => section.items.length > 0)
  };
}

export async function getPublishedArticles(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const sort = optionalParam(params, 'sort');
  const publishedAtOrder = sort === 'oldest' ? ('asc' as const) : ('desc' as const);
  const baseWhere: Prisma.ArticleWhereInput = {
    status: ContentStatus.PUBLISHED,
    category: optionalParam(params, 'category') ? { slug: optionalParam(params, 'category'), type: CategoryType.ARTICLE } : undefined,
    city: optionalParam(params, 'city') ? { slug: optionalParam(params, 'city') } : undefined,
    tags: optionalParam(params, 'tag')
      ? { some: { tag: { slug: optionalParam(params, 'tag'), type: CategoryType.ARTICLE, isActive: true } } }
      : undefined
  };

  const { items, total } = await listResultWithRelevance(
    q,
    page,
    pageSize,
    ({ idsOnly }) => {
      const selectIdAndTitle = { id: true, title: true } as const;
      const orderBy = [{ sortOrder: 'asc' as const }, { publishedAt: publishedAtOrder }, { createdAt: 'desc' as const }];
      const articleSearchFields = (q: string): Prisma.ArticleWhereInput[] => [
        { title: { contains: q, mode: 'insensitive' as const } },
        { summary: { contains: q, mode: 'insensitive' as const } }
      ];
      if (idsOnly) {
        const searchWhere: Prisma.ArticleWhereInput = {
          ...baseWhere,
          ...(q ? { OR: articleSearchFields(q) } : {})
        };
        return prisma.article
          .findMany({ where: searchWhere, select: selectIdAndTitle, orderBy })
          .then(async (items) => {
            const total = await prisma.article.count({ where: searchWhere });
            return { ids: items, total };
          });
      }
      return prisma.article
        .findMany({ where: baseWhere, select: selectIdAndTitle, orderBy })
        .then(async (items) => {
          const total = await prisma.article.count({ where: baseWhere });
          return { ids: items, total };
        });
    },
    (ids) =>
      prisma.article.findMany({
        where: { id: { in: ids }, status: ContentStatus.PUBLISHED },
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
  );

  return listResult({
    params,
    page,
    pageSize,
    total,
    searchQuery: q,
    items: items.map((article) => ({
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
      imageUrl: publicImageUrl(article.coverImage),
      authorName: article.authorName ?? undefined
    }))
  });
}
