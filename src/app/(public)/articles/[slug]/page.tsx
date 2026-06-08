import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { JsonLd } from '@/components/seo/json-ld';
import { getPublishedArticles } from '@/lib/public/content';
import { getPublishedArticleDetail } from '@/lib/public/content';
import { buildMissingPublicContentMetadata, buildPublicContentMetadata } from '@/lib/public/metadata';
import { buildBreadcrumbJsonLd, buildPublicContentJsonLd } from '@/lib/public/structured-data';

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
  const [article, related] = await Promise.all([getPublishedArticleDetail(slug), getPublishedArticles({ pageSize: '4' })]);

  if (!article) {
    notFound();
  }
  const detailPath = `/articles/${article.slug}`;
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);

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
      <PublicContentDetailPage
        backHref="/articles"
        backLabel="Ко всем материалам"
        body={article.body}
        eyebrow="Материалы"
        facts={article.facts}
        imageUrl={article.imageUrl}
        label={article.label}
        meta={article.meta}
        primaryLink={{ href: '/articles', label: 'Смотреть все материалы' }}
        sections={article.sections}
        summary={article.summary}
        title={article.title}
      />
      <PublicRelatedContentSection
        basePath="/articles"
        items={relatedItems}
        title="Еще по теме"
      />
    </>
  );
}
