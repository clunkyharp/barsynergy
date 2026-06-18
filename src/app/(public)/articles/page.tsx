import type { Metadata } from 'next';
import { CategoryType } from '@/modules/content/shared/types';
import { ArticleGridSection, type ArticleRubricSection } from '@/components/public/article-grid-section';
import { PageHero } from '@/components/public/page-hero';
import { PageInfoSection } from '@/components/public/page-info-section';
import { JsonLd } from '@/components/seo/json-ld';
import { getPublishedArticles, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getPublicCategoryOptions } from '@/lib/public/filter-options';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';

type ArticlesPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

const ARTICLE_RUBRIC_SLUGS = ['equipment', 'business', 'menu'] as const;

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Материалы о кофейном бизнесе и HoReCa',
  description: 'Статьи, интервью, обзоры и практические разборы для владельцев кофеен, бариста и специалистов кофейной индустрии СКФО.',
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
  const rubricCandidates = ARTICLE_RUBRIC_SLUGS
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((category): category is NonNullable<typeof category> => Boolean(category));
  const fallbackRubrics = categories.filter((category) => !rubricCandidates.some((rubric) => rubric.slug === category.slug));
  const selectedRubrics = [...rubricCandidates, ...fallbackRubrics].slice(0, 3);
  const rubricSections: ArticleRubricSection[] = [];
  const excludedArticleIds = featuredItem ? [featuredItem.id] : [];

  if (!hasActiveFilters && content.page === 1) {
    for (const rubric of selectedRubrics) {
      const rubricContent = await getPublishedArticles({ category: rubric.slug, pageSize: '3', excludeId: excludedArticleIds });

      if (rubricContent.items.length === 0) {
        continue;
      }

      rubricSections.push({
        categoryName: rubric.name,
        categorySlug: rubric.slug,
        items: rubricContent.items
      });
      excludedArticleIds.push(...rubricContent.items.map((item) => item.id));
    }
  }

  return (
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/articles', 'Материалы')} />
      <PageHero
        breadcrumbs={[{ href: '/', label: 'Главная' }, { label: 'Материалы' }]}
        title="Материалы"
        subtitle="Редакционные материалы, интервью, обзоры и практические разборы для кофейной индустрии."
        tone="graphite"
      />
      <ArticleGridSection
        basePath="/articles"
        categories={categories}
        content={content}
        featuredItem={featuredItem}
        rubricSections={rubricSections}
      />
      <PageInfoSection
        eyebrow="Платформа"
        title="Материалы о кофейном бизнесе и индустрии СКФО"
        sidebarLinks={[
          { href: 'https://t.me/barsynergy', label: 'Telegram-канал' },
          { href: '/vacancies', label: 'Вакансии' },
          { href: '/tools/cost-calculator', label: 'Калькулятор себестоимости' },
        ]}
      >
        <p>
          Редакция BARSYNERGY публикует статьи, интервью, обзоры и практические разборы для владельцев кофеен, бариста, управляющих
          и всех, кто работает в кофейной и барной индустрии Северного Кавказа.
        </p>
        <p>
          Темы раздела: как рассчитать себестоимость напитков, как выбрать поставщика кофе, что написать в вакансии бариста,
          как подготовить кофейню к мастер-классу, какие расходники нужны на старте и другие вопросы запуска и развития заведения.
        </p>
        <p>
          Материалы основаны на опыте действующих специалистов региона и дополняют инструменты платформы: калькулятор себестоимости,
          каталог поставщиков и раздел вакансий.
        </p>
      </PageInfoSection>
    </>
  );
}
