import { Suspense } from 'react';
import { CategoryType } from '@prisma/client';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PublicFeaturedContent } from '@/components/public/public-featured-content';
import { PublicFilters } from '@/components/public/public-filters';
import { getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';
import { getPublishedArticles, type PublicContentSearchParams } from '@/lib/public/content';

type ArticlesPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = (await searchParams) ?? {};
  const [content, categories, cities] = await Promise.all([
    getPublishedArticles(params),
    getPublicCategoryOptions(CategoryType.ARTICLE),
    getPublicCityFilterOptions()
  ]);
  const featuredItem = content.page === 1 ? content.items[0] : undefined;

  return (
    <>
      <EditorialPublicPage
        eyebrow="Знания"
        title="Статьи, интервью и практические материалы"
        description="Редакционные материалы, интервью, разборы и прикладные гиды для специалистов барной индустрии."
        summary="Материалы доступны без оплаты: интервью, разборы, прикладные статьи и тематические подборки."
        metrics={[
          { value: '4', label: 'типа контента' },
          { value: 'Открыто', label: 'доступ к материалам' },
          { value: 'Без оплаты', label: 'публичное чтение' }
        ]}
        rows={[
          {
            label: 'Материалы',
            title: 'Редакционные статьи',
            description: 'Практические тексты о сервисе, команде, операционной работе, продуктах и региональном рынке.'
          },
          {
            label: 'Материалы',
            title: 'Интервью и кейсы',
            description: 'Истории специалистов, заведений и партнеров с акцентом на опыт, решения и ошибки.'
          },
          {
            label: 'Материалы',
            title: 'Гиды и подборки',
            description: 'Структурированные материалы, которые можно связать с обучением, событиями и каталогами.'
          }
        ]}
        primaryLink={{ label: 'Предложить тему', href: '/contacts' }}
        secondaryLink={{ label: 'О проекте', href: '/about' }}
      />
      <Suspense fallback={<div className="container py-6">Загрузка фильтров...</div>}>
        <PublicFilters categories={categories} cities={cities} />
      </Suspense>
      <PublicFeaturedContent
        actionLabel="Читать материал"
        basePath="/articles"
        description="Материал с темой, кратким описанием и переходом к полному тексту."
        eyebrow="Рекомендуем"
        item={featuredItem}
        title="Материал для начала"
      />
      <PublishedContentSection
        basePath="/articles"
        content={content}
        emptyDescription="Когда появятся новые материалы, они отобразятся здесь."
        emptyTitle="Материалов пока нет"
        excludedItemIds={featuredItem ? [featuredItem.id] : []}
        title="Материалы"
      />
    </>
  );
}
