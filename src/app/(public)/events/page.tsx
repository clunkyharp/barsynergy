import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CalendarDays } from 'lucide-react';
import { CategoryType } from '@prisma/client';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { EventAgendaSection } from '@/components/public/platform-ui';
import { PublicFilters } from '@/components/public/public-filters';
import { stripPublicApplicationResultParams } from '@/lib/applications/public-form-helpers';
import { getPublishedEvents, type PublicContentSearchParams } from '@/lib/public/content';
import { getEventFilterOptions, getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';
import { Button } from '@/components/ui/button';
import { buildPublicPageMetadata } from '@/lib/public/metadata';

type EventsPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'События',
  description: 'Рабочая афиша встреч, лекций и событий для барной индустрии СКФО.',
  path: '/events'
});

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

  const hasActiveSearch = Boolean(
    contentParams.q || contentParams.category || contentParams.city || contentParams.format || (contentParams.period && contentParams.period !== 'upcoming')
  );
  const showFilters = content.total > 0 || hasActiveSearch;
  const isEmpty = content.total === 0;
  const isPrelaunchEmpty = isEmpty && !hasActiveSearch;

  return (
    <>
      <EditorialPublicPage
        eyebrow="События"
        path="/events"
        title="Афиша"
        description="Встречи, лекции, каппинги, дегустации и гостевые смены для специалистов и команд."
        summary="Предстоящие события показываем сразу. Фильтры можно раскрыть по кнопке."
        chips={['Встречи', 'Лекции', 'Каппинги', 'Дегустации']}
        density="compact"
        metrics={[]}
        rows={[]}
        primaryLink={{ label: 'Предложить событие', href: '/contacts?topic=event#contact-form' }}
        accentGradient="radial-gradient(ellipse 90% 60% at 80% 20%, rgba(50,120,210,0.14), transparent)"
        accentIcon={CalendarDays}
      />
      {isPrelaunchEmpty ? (
        <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-16">
          <div className="container text-center">
            <p className="text-[var(--muted)]">Первые события готовятся к публикации.</p>
            <Button className="mt-6" href="/contacts?topic=event#contact-form">
              Предложить событие
            </Button>
          </div>
        </section>
      ) : (
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
            filters={showFilters ? (
              <PublicFilters
                activeSummaryLabel="Выбрано в афише"
                categories={categories}
                categoryAllLabel="Все типы"
                categoryLabel="Тип события"
                cities={filterCities}
                cityAllLabel="Все города"
                cityLabel="Город"
                description="Фильтр по городу, дате и формату события."
                embedded
                compact
                contextItems={selectedPeriod ? [] : [{ label: 'Дата', value: 'Предстоящие' }]}
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
            ) : null}
        />
      </Suspense>
      )}
    </>
  );
}
