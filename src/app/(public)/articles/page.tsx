import type { Metadata } from 'next';
import { CategoryType } from '@/modules/content/shared/types';
import { ArticleGridSection } from '@/components/public/article-grid-section';
import { PageHero } from '@/components/public/page-hero';
import { JsonLd } from '@/components/seo/json-ld';
import { getPublishedArticles, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getPublicCategoryOptions } from '@/lib/public/filter-options';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';

type ArticlesPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Материалы',
  description: 'Редакционные материалы, интервью, обзоры и практические разборы для кофейной индустрии.',
  path: '/articles'
});

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = (await searchParams) ?? {};
  const [content, categories] = await Promise.all([
    getPublishedArticles(params),
    getPublicCategoryOptions(CategoryType.ARTICLE)
  ]);
  const hasActiveFilters = hasActivePublicContentParams(params, ['q', 'category', 'city', 'tag']);
  const featuredItem = !hasActiveFilters && content.page === 1 ? content.items[0] : undefined;

  return (
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/articles', 'Материалы')} />
      <PageHero
        title="Материалы"
        subtitle="Редакционные материалы, интервью, обзоры и практические разборы для кофейной индустрии."
        tone="graphite"
      />
      <ArticleGridSection
        basePath="/articles"
        categories={categories}
        content={content}
        featuredItem={featuredItem}
      />
    </>
  );
}
