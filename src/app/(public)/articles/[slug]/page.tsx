import { notFound } from 'next/navigation';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { getPublishedArticles } from '@/lib/public/content';
import { getPublishedArticleDetail } from '@/lib/public/content-details';

type ArticleDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const [article, related] = await Promise.all([getPublishedArticleDetail(slug), getPublishedArticles({ pageSize: '4' })]);

  if (!article) {
    notFound();
  }
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <PublicContentDetailPage
        backHref="/articles"
        backLabel="Ко всем материалам"
        body={article.body}
        eyebrow="Знания"
        facts={article.facts}
        imageUrl={article.imageUrl}
        label={article.label}
        meta={article.meta}
        primaryLink={{ href: '/articles', label: 'Смотреть все материалы' }}
        secondaryLink={{ href: '/about', label: 'О проекте' }}
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
