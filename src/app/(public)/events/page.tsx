import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CategoryType } from '@prisma/client';
import { EventAgendaSection } from '@/components/public/platform-ui';
import { PublicBodyText, PublicBreadcrumbs, PublicDisplayTitle } from '@/components/public/public-primitives';
import { PublicFilters } from '@/components/public/public-filters';
import { stripPublicApplicationResultParams } from '@/lib/applications/public-form-helpers';
import { getPublishedEvents, type PublicContentSearchParams } from '@/lib/public/content';
import { getEventFilterOptions, getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';

type EventsPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'События',
  description: 'Рабочая афиша встреч, лекций и событий для барной индустрии СКФО.'
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = (await searchParams) ?? {};
  const contentParams = stripPublicApplicationResultParams(params);
  const selectedPeriod = firstParam(contentParams.period);
  const eventListParams: PublicContentSearchParams = selectedPeriod
    ? contentParams
    : { ...contentParams, period: 'upcoming' };
  const [content, filterCities, categories, filterOptions] = await Promise.all([
    getPublishedEvents(eventListParams),
    getPublicCityFilterOptions(),
    getPublicCategoryOptions(CategoryType.EVENT),
    getEventFilterOptions()
  ]);

  return (
    <>
      <section className="background-zone background-zone-hero border-b border-[var(--line)] py-7 md:py-10">
        <div className="container">
          <div className="min-w-0">
            <PublicBreadcrumbs current="События" />
            <PublicDisplayTitle as="h1" className="mt-5 max-w-5xl text-[32px] sm:text-[42px] md:text-[50px] xl:text-[56px]" size="section">
              События
            </PublicDisplayTitle>
            <PublicBodyText className="mt-4 max-w-3xl" size="md">
              Афиша встреч, лекций, дегустаций и гостевых смен для специалистов и команд.
            </PublicBodyText>
          </div>
        </div>
      </section>
      <Suspense
        fallback={
          <section className="background-zone background-zone-ivory editorial-grid border-b border-[var(--line)] py-10 md:py-14">
            <div className="container">
              <div aria-hidden="true" className="h-40 animate-pulse rounded-[var(--radius-xl)] bg-[var(--skeleton-fill)]" />
            </div>
          </section>
        }
      >
        <EventAgendaSection
          content={content}
          filters={
            <PublicFilters
              activeSummaryLabel="Выбрано в афише"
              categories={categories}
              categoryAllLabel="Все типы"
              categoryLabel="Тип события"
              cities={filterCities}
              cityAllLabel="Все города"
              cityLabel="Город"
              contextItems={[{ label: 'Аудитория', value: 'специалисты и команды' }]}
              description="Фильтр по городу, дате и формату события."
              embedded
              compact
              extraFilters={[
                { name: 'format', label: 'Формат', allLabel: 'Все форматы', options: filterOptions.formats },
                {
                  name: 'period',
                  label: 'Дата',
                  allLabel: 'Предстоящие',
                  options: [
                    { value: 'upcoming', label: 'Предстоящие' },
                    { value: 'all', label: 'Все даты' },
                    { value: 'past', label: 'Прошедшие' }
                  ]
                }
              ]}
              placeholder="Название, площадка или тема"
              tone="directory"
              variant="sidebar"
            />
          }
        />
      </Suspense>
    </>
  );
}
