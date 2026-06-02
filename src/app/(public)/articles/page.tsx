import type { Metadata } from 'next';
import { CategoryType } from '@prisma/client';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PublicFeaturedContent } from '@/components/public/public-featured-content';
import { PublicFilters } from '@/components/public/public-filters';
import { getPublishedArticles, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getPublicCategoryOptions } from '@/lib/public/filter-options';
import { buildPublicPageMetadata } from '@/lib/public/metadata';

type ArticlesPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Материалы',
  description: 'Материалы для работы с меню, сервисом, командой и поставщиками.',
  path: '/articles'
});

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = (await searchParams) ?? {};
  const [content, categories] = await Promise.all([
    getPublishedArticles(params),
    getPublicCategoryOptions(CategoryType.ARTICLE)
  ]);
  const isEmpty = content.total === 0;
  const hasActiveFilters = hasActivePublicContentParams(params, ['q', 'category', 'city', 'tag']);
  const featuredItem = !hasActiveFilters && content.page === 1 ? content.items[0] : undefined;
  const isPrelaunchEmpty = isEmpty && !hasActiveFilters;
  const filters = (
    <PublicFilters
      activeSummaryLabel="Выбрано в материалах"
      categories={categories}
      categoryAllLabel="Все темы"
      categoryLabel="Тема"
      compact
      description="Поиск по названию, теме или краткому описанию."
      embedded
      placeholder="Название, тема или описание..."
      title="Фильтры"
      variant="sidebar"
    />
  );

  return (
    <>
      <EditorialPublicPage
        eyebrow="Материалы"
        path="/articles"
        title="Материалы"
        description="Статьи, интервью и разборы для работы с меню, сервисом и командой."
        summary={isPrelaunchEmpty ? 'Первые материалы готовятся. Уже можно предложить тему для публикации.' : 'Читайте интервью, разборы, рабочие тексты и подборки.'}
        density="compact"
        metrics={[]}
        rows={[]}
        primaryLink={{ label: 'Предложить тему', href: '/contacts?topic=article-topic#contact-form' }}
      />
      {isPrelaunchEmpty ? null : (
        <>
          <PublicFeaturedContent
            actionLabel="Читать материал"
            basePath="/articles"
            eyebrow="Рекомендуем"
            item={featuredItem}
            title="Рекомендуемый материал"
          />
          <PublishedContentSection
            basePath="/articles"
            content={content}
            countLabel="Материалов"
            emptyActions={[
              { href: '/contacts?topic=article-topic#contact-form', label: 'Предложить тему' }
            ]}
            emptyDescription="Сбросьте выбранную тему или предложите материал, которого сейчас не хватает."
            emptyTitle="По этим параметрам материалов нет"
            excludedItemIds={featuredItem ? [featuredItem.id] : []}
            filters={filters}
            listLabel="Материалы"
            rowActionLabel="Читать материал"
            sectionId="articles-list"
            secondaryEmptyActions={[
              { href: '/contacts?topic=article-topic#contact-form', label: 'Предложить тему' }
            ]}
            secondaryEmptyDescription="Главная рекомендация уже показана выше. Другие материалы появятся здесь после публикации."
            secondaryEmptyTitle="Других материалов пока нет"
            showSidebarTitle={false}
            title="Последние публикации"
          />
        </>
      )}
    </>
  );
}
