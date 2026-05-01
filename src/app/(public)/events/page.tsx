import { Suspense } from 'react';
import { CategoryType } from '@prisma/client';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { getPublishedEvents, type PublicContentSearchParams } from '@/lib/public/content';
import { getEventFilterOptions, getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';

type EventsPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = (await searchParams) ?? {};
  const [content, filterCities, categories, filterOptions] = await Promise.all([
    getPublishedEvents(params),
    getPublicCityFilterOptions(),
    getPublicCategoryOptions(CategoryType.EVENT),
    getEventFilterOptions()
  ]);
  return (
    <>
      <EditorialPublicPage
        eyebrow="События"
        title="Афиша встреч, лекций и индустриальных событий"
        description="Встречи, лекции и другие события для специалистов и команд."
        summary="Здесь публикуются лекции, дегустации и партнёрские события со всей основной информацией."
        metrics={[
          { value: 'СКФО', label: 'регион событий' },
          { value: 'Открыто', label: 'форматы участия' },
          { value: 'Афиша', label: 'раздел событий' }
        ]}
        rows={[
          {
            label: 'Тип',
            title: 'Открытые встречи',
            description: 'Встречи для знакомства, обмена опытом и обсуждения рабочих задач.'
          },
          {
            label: 'Тип',
            title: 'Лекции и дегустации',
            description: 'События с экспертами, брендами и преподавателями, где можно разобрать тему на практике.'
          },
          {
            label: 'Тип',
            title: 'Партнерские мероприятия',
            description: 'События для школ, брендов и заведений с отдельной координацией.'
          }
        ]}
        primaryLink={{ label: 'Перейти к афишам', href: '#events-list' }}
        secondaryLink={{ label: 'Партнерство', href: '/partners' }}
      />
      <Suspense
        fallback={
          <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
            <div className="container">
              <div aria-hidden="true" className="h-40 animate-pulse rounded-[var(--radius-xl)] bg-black/6" />
            </div>
          </section>
        }
      >
        <PublishedContentSection
          basePath="/events"
          content={content}
          emptyDescription="Когда появятся новые события, они будут здесь."
          emptyTitle="Событий пока нет"
          filters={
            <PublicFilters
              categories={categories}
              cities={filterCities}
              embedded
              extraFilters={[
                { name: 'format', label: 'Все форматы', options: filterOptions.formats },
                {
                  name: 'period',
                  label: 'Все даты',
                  options: [
                    { value: 'upcoming', label: 'Предстоящие' },
                    { value: 'past', label: 'Прошедшие' }
                  ]
                }
              ]}
            />
          }
          sectionId="events-list"
          title="Афиша"
        />
      </Suspense>
    </>
  );
}
