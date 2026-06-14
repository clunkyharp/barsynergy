import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EventAgendaSection } from '@/components/public/platform-ui';
import { PageHero } from '@/components/public/page-hero';
import { PublicPrelaunchSection } from '@/components/public/public-prelaunch-section';
import { EventsSearchBar } from '@/components/public/events-page-header';
import { EventsHeroActions } from '@/app/(public)/events/events-hero-actions';
import { JsonLd } from '@/components/seo/json-ld';
import { stripPublicApplicationResultParams } from '@/lib/applications/public-form-helpers';
import { getPublishedEvents, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getEventFilterOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';


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
  const selectedQ = firstParam(contentParams.q);

  const eventListParams: PublicContentSearchParams = selectedPeriod
    ? contentParams
    : { ...contentParams, period: 'upcoming' };

  const [content, filterCities, filterOptions] = await Promise.all([
    getPublishedEvents(eventListParams),
    getPublicCityFilterOptions(),
    getEventFilterOptions()
  ]);

  const hasActiveSearch = hasActivePublicContentParams(contentParams, ['q', 'category', 'city', 'format', 'period']);
  const isEmpty = content.total === 0;
  const isPrelaunchEmpty = isEmpty && !hasActiveSearch;

  return (
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/events', 'События')} />

      <PageHero
        title="События"
        subtitle="Каппинги, чемпионаты, лекции, мастер-классы и встречи кофейного сообщества."
        tone="graphite"
      >
        <EventsHeroActions />
      </PageHero>

      <EventsSearchBar
        cities={filterCities}
        formats={filterOptions.formats}
        selectedCity={selectedCity}
        selectedFormat={selectedFormat}
        selectedQ={selectedQ}
      />

      {isPrelaunchEmpty ? (
        <PublicPrelaunchSection
          badges={['Афиша уже принимает заявки', 'Подходит для любых форматов']}
          cards={[
            {
              title: 'Каппинги и дегустации',
              description: 'Открытые дегустации кофе, чая, крепких напитков для профессиональной аудитории.'
            },
            {
              title: 'Чемпионаты и конкурсы',
              description: 'Соревнования для бариста, обжарщиков и специалистов индустрии.'
            },
            {
              title: 'Лекции и мастер-классы',
              description: 'Образовательные встречи, тренинги и практические занятия.'
            }
          ]}
          description="Добавьте мероприятие, если оно открыто для профессионального сообщества и связано с барной или кофейной культурой."
          eyebrow="Афиша"
          title="Какие события можно добавить"
        />
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

    </>
  );
}
