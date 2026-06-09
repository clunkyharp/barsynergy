import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CategoryType } from '@/modules/content/shared/types';
import { EventAgendaSection } from '@/components/public/platform-ui';
import { EventsHeroSection, EventsSearchBar, EventsQuickFilters, EventsCtaBanner } from '@/components/public/events-page-header';
import { JsonLd } from '@/components/seo/json-ld';
import { stripPublicApplicationResultParams } from '@/lib/applications/public-form-helpers';
import { getPublishedEvents, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getEventFilterOptions, getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';
import { Button } from '@/components/ui/button';

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
  const selectedCity = firstParam(contentParams.city);
  const selectedFormat = firstParam(contentParams.format);
  const selectedCategory = firstParam(contentParams.category);
  const selectedQ = firstParam(contentParams.q);

  const eventListParams: PublicContentSearchParams = selectedPeriod
    ? contentParams
    : { ...contentParams, period: 'upcoming' };

  const [content, filterCities, categories, filterOptions] = await Promise.all([
    getPublishedEvents(eventListParams),
    getPublicCityFilterOptions(),
    getPublicCategoryOptions(CategoryType.EVENT),
    getEventFilterOptions()
  ]);

  const hasActiveSearch = hasActivePublicContentParams(contentParams, ['q', 'category', 'city', 'format', 'period']);
  const isEmpty = content.total === 0;
  const isPrelaunchEmpty = isEmpty && !hasActiveSearch;

  return (
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/events', 'События')} />

      <EventsHeroSection />

      <EventsSearchBar
        cities={filterCities}
        formats={filterOptions.formats}
        selectedCity={selectedCity}
        selectedFormat={selectedFormat}
        selectedQ={selectedQ}
      />

      <EventsQuickFilters
        categories={categories}
        formats={filterOptions.formats}
        selectedCategory={selectedCategory}
        selectedFormat={selectedFormat}
        selectedPeriod={selectedPeriod}
      />

      {isPrelaunchEmpty ? (
        <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-16">
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
            <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-10 md:py-14">
              <div className="container">
                <div aria-hidden="true" className="h-40 animate-pulse rounded-[var(--radius-xl)] bg-[var(--skeleton-fill)]" />
              </div>
            </section>
          }
        >
          <EventAgendaSection content={content} />
        </Suspense>
      )}

      <EventsCtaBanner />
    </>
  );
}
