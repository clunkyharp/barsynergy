import { Suspense } from 'react';
import { CategoryType } from '@prisma/client';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PublicFeaturedContent } from '@/components/public/public-featured-content';
import { PublicFilters } from '@/components/public/public-filters';
import { getPublishedCourses, type PublicContentSearchParams } from '@/lib/public/content';
import { getCourseFilterOptions, getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';

type EducationPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export default async function EducationPage({ searchParams }: EducationPageProps) {
  const params = (await searchParams) ?? {};
  const [content, filterCities, categories, filterOptions] = await Promise.all([
    getPublishedCourses(params),
    getPublicCityFilterOptions(),
    getPublicCategoryOptions(CategoryType.COURSE),
    getCourseFilterOptions()
  ]);
  const featuredItem = content.page === 1 ? content.items[0] : undefined;

  return (
    <>
      <EditorialPublicPage
        eyebrow="Образование"
        title="Программы, интенсивы и практические занятия"
        description="Обучение для специалистов и команд: от мастер-классов до корпоративных программ."
        summary="Можно выбрать очные занятия, материалы для самостоятельной работы или обучение под команду."
        metrics={[
          { value: '3', label: 'формата обучения' },
          { value: 'СКФО', label: 'региональный фокус' },
          { value: 'Практика', label: 'прикладной формат' }
        ]}
        rows={[
          {
            label: 'Формат',
            title: 'Интенсивы и мастер-классы',
            description: 'Короткие очные занятия для практики, дегустаций и работы в команде.'
          },
          {
            label: 'Формат',
            title: 'Онлайн-лекции и материалы',
            description: 'Материалы для самостоятельного обучения и повторения базы.'
          },
          {
            label: 'Формат',
            title: 'Корпоративное обучение',
            description: 'Программы для команд: сервис, бар, меню, продажи и внутренняя подготовка.'
          }
        ]}
        primaryLink={{ label: 'Перейти к материалам', href: '#education-list' }}
        secondaryLink={{ label: 'Предложить формат', href: '/contacts' }}
      />
      <Suspense
        fallback={
          <section className="border-b border-black/10 bg-[var(--surface-muted)] py-6">
            <div className="container">
              <div aria-hidden="true" className="h-14 animate-pulse rounded-[var(--radius-lg)] bg-black/6" />
            </div>
          </section>
        }
      >
        <PublicFilters
          categories={categories}
          cities={filterCities}
          extraFilters={[
            { name: 'format', label: 'Все форматы', options: filterOptions.formats },
            { name: 'level', label: 'Все уровни', options: filterOptions.levels }
          ]}
        />
      </Suspense>
      <PublicFeaturedContent
        actionLabel="Открыть программу"
        basePath="/education"
        eyebrow="Рекомендуем"
        item={featuredItem}
        title="Программа в фокусе"
      />
      <PublishedContentSection
        basePath="/education"
        content={content}
        countLabel="Программ в списке"
        emptyDescription="Список пока пуст. Можно сразу написать, какое обучение вам нужно."
        emptyActions={[
          { href: '/contacts?topic=education-program', label: 'Предложить программу' },
          { href: '/contacts?topic=education-launch', label: 'Получить уведомление о запуске', variant: 'secondary' },
          { href: '/contacts', label: 'Связаться с командой', variant: 'secondary' }
        ]}
        emptyTitle="Программ пока нет"
        excludedItemIds={featuredItem ? [featuredItem.id] : []}
        sectionId="education-list"
        title="Программы"
      />
    </>
  );
}
