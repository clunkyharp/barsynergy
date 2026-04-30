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
        description="Раздел собирает образовательные форматы для специалистов и команд: от коротких мастер-классов до корпоративного обучения."
        summary="Здесь можно выбрать формат обучения: очные занятия, онлайн-материалы или корпоративную программу для команды."
        metrics={[
          { value: '3', label: 'формата обучения' },
          { value: 'СКФО', label: 'региональный фокус' },
          { value: 'Практика', label: 'прикладной формат' }
        ]}
        rows={[
          {
            label: 'Формат',
            title: 'Интенсивы и мастер-классы',
            description: 'Короткие очные события для практики, дегустаций, командной работы и знакомства с экспертами.'
          },
          {
            label: 'Формат',
            title: 'Онлайн-лекции и материалы',
            description: 'Материалы для самостоятельного изучения и повторения базовых тем.'
          },
          {
            label: 'Формат',
            title: 'Корпоративное обучение',
            description: 'Программы для команд заведений: сервис, бар, меню, продажи и внутреннее обучение.'
          }
        ]}
        primaryLink={{ label: 'Смотреть программы', href: '#education-list' }}
        secondaryLink={{ label: 'События', href: '/events' }}
      />
      <Suspense fallback={<div className="container py-6">Загрузка фильтров...</div>}>
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
        description="Курс с форматом, уровнем, городом и кнопкой перехода к подробностям."
        eyebrow="Рекомендуем"
        item={featuredItem}
        title="Программа в фокусе"
      />
      <PublishedContentSection
        basePath="/education"
        content={content}
        emptyDescription="Когда появятся новые программы, они отобразятся здесь."
        emptyTitle="Программ пока нет"
        excludedItemIds={featuredItem ? [featuredItem.id] : []}
        sectionId="education-list"
        title="Программы"
      />
    </>
  );
}
