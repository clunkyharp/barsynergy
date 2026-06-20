import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleDetailBody } from '@/components/public/article-detail-body';
import { ArticleDetailHero } from '@/components/public/article-detail-hero';
import { ArticleRelatedSection } from '@/components/public/article-related-section';
import { JsonLd } from '@/components/seo/json-ld';
import { getPublishedArticleDetail, getPublishedArticles, parseToc } from '@/lib/public/content/articles';
import { buildMissingPublicContentMetadata, buildPublicContentMetadata } from '@/lib/public/metadata';
import { buildBreadcrumbJsonLd, buildPublicContentJsonLd } from '@/lib/public/structured-data';
import { compact } from '@/modules/content/shared/detail-helpers';

type ArticleDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const article = await getPublishedArticleDetail(slug);

  if (!article) {
    return buildMissingPublicContentMetadata({
      title: 'Материал не найден',
      description: 'Материал удалён или ещё не опубликован.'
    });
  }

  return buildPublicContentMetadata({
    detail: article,
    path: `/articles/${article.slug}`
  });
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const [article, related] = await Promise.all([getPublishedArticleDetail(slug), getPublishedArticles({ pageSize: '8' })]);

  if (!article) {
    notFound();
  }
  const detailPath = `/articles/${article.slug}`;
  const allRelated = related.items.filter((item) => item.slug !== slug);
  const sidebarRelated = allRelated.slice(0, 3);
  const bottomRelated = allRelated.slice(3, 6);

  const knownMetaItems = compact([article.cityName, article.authorName, article.readingTime]);
  const tags = article.meta.filter((item) => !knownMetaItems.includes(item));

  const toc = parseToc(article.body);

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: 'Главная', path: '/' },
            { name: 'Материалы', path: '/articles' },
            { name: article.title, path: detailPath }
          ]),
          buildPublicContentJsonLd({ detail: article, path: detailPath, kind: 'article' })
        ]}
      />
      <ArticleDetailHero
        authorName={article.authorName}
        cityName={article.cityName}
        image={article.imageUrl}
        label={article.label}
        publishedAtIso={article.publishedAtIso}
        readingTime={article.readingTime}
        slug={article.slug}
        summary={article.summary}
        tags={tags}
        title={article.title}
      />
      <ArticleDetailBody
        authorName={article.authorName}
        basePath="/articles"
        body={article.body}
        cityName={article.cityName}
        publishedAtIso={article.publishedAtIso}
        readingTime={article.readingTime}
        related={sidebarRelated}
        sourceReferences={article.sourceReferences}
        tags={tags}
        toc={toc}
      />
      <ArticleRelatedSection
        items={bottomRelated}
      />
    </>
  );
}
