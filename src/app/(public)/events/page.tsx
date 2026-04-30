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
        description="Публичный раздел мероприятий: встречи, лекции и отраслевые форматы для специалистов и команд."
        summary="Здесь публикуются встречи, лекции, дегустации и партнерские события с понятным форматом участия."
        metrics={[
          { value: 'СКФО', label: 'регион событий' },
          { value: 'Открыто', label: 'форматы участия' },
          { value: 'Афиша', label: 'публичный раздел' }
        ]}
        rows={[
          {
            label: 'Тип',
            title: 'Открытые встречи',
            description: 'Встречи для знакомства, обмена опытом и обсуждения рабочих задач заведений.'
          },
          {
            label: 'Тип',
            title: 'Лекции и дегустации',
            description: 'События с экспертами, брендами и преподавателями, где можно разобрать тему на практике.'
          },
          {
            label: 'Тип',
            title: 'Партнерские мероприятия',
            description: 'Форматы для школ, брендов и заведений с персональной координацией по каждому запросу.'
          }
        ]}
        primaryLink={{ label: 'Смотреть афишу', href: '#events-list' }}
        secondaryLink={{ label: 'Партнерство', href: '/partners' }}
      />
      <Suspense fallback={<div className="container py-6">Загрузка фильтров...</div>}>
        <PublishedContentSection
          basePath="/events"
          content={content}
          emptyDescription="Когда появятся новые события, они отобразятся здесь."
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
