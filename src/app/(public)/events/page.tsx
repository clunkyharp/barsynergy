import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EventAgendaSection } from '@/components/public/platform-ui';
import { PageHero } from '@/components/public/page-hero';
import { PageInfoSection } from '@/components/public/page-info-section';
import { PublicPrelaunchSection } from '@/components/public/public-prelaunch-section';
import { EventCityTabs, EventsSearchBar } from '@/components/public/events-page-header';
import { EventsHeroActions } from '@/app/(public)/events/events-hero-actions';
import { ContentSubscribeForm } from '@/components/public/content-subscribe-form';
import { JsonLd } from '@/components/seo/json-ld';
import { stripPublicApplicationResultParams } from '@/lib/applications/public-form-helpers';
import { getPublishedEvents, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getEventFilterOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';
import { HowItWorksSection } from '@/components/ui/how-it-works-steps';


type EventsPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Кофейные события и мастер-классы в СКФО',
  description: 'Каппинги, чемпионаты бариста, лекции, мастер-классы и встречи кофейного сообщества в Махачкале, Дагестане и СКФО. Афиша и заявки.',
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
  const selectedCityOption = selectedCity ? filterCities.find((city) => city.slug === selectedCity) : undefined;

  const hasActiveSearch = hasActivePublicContentParams(contentParams, ['q', 'category', 'city', 'format', 'period']);
  const isEmpty = content.total === 0;
  const isPrelaunchEmpty = isEmpty && !hasActiveSearch;

  return (
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/events', 'События')} />

      <PageHero
        breadcrumbs={[{ href: '/', label: 'Главная' }, { label: 'События' }]}
        title="События"
        subtitle="Каппинги, чемпионаты, лекции, мастер-классы и встречи кофейного сообщества."
        tone="graphite"
      >
        <EventsHeroActions />
      </PageHero>

      {isPrelaunchEmpty ? (
        <HowItWorksSection
          columns={3}
          steps={[
            { title: 'Отправляете событие', description: 'Заполните форму с названием, компанией и контактами.' },
            { title: 'Редакция проверяет', description: 'Уточняем детали и проверяем формат.' },
            { title: 'Анонс в афише', description: 'После согласования событие появляется на платформе.' },
          ]}
        />
      ) : null}

      <EventCityTabs
        cities={filterCities}
        selectedCity={selectedCity}
        preserve={{ q: selectedQ, format: selectedFormat, period: selectedPeriod }}
      />
      <EventsSearchBar
        formats={filterOptions.formats}
        selectedCity={selectedCity}
        selectedFormat={selectedFormat}
        selectedPeriod={selectedPeriod}
        selectedQ={selectedQ}
      />

      {isPrelaunchEmpty ? (
        <>
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
          <section className="border-b border-[var(--line)] py-8 md:py-12">
            <div className="container">
              <div className="mx-auto max-w-3xl rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-card)] p-6 md:p-8">
                <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]">Подписка</span>
                <h3 className="mt-2 text-[1.15rem] font-semibold leading-tight text-[var(--text)]">Не пропустите события</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">Пришлём анонс, когда появятся новые каппинги, чемпионаты и мастер-классы в регионе.</p>
                <ContentSubscribeForm className="mt-5" topic="EVENTS" label="Узнать о новых событиях" />
              </div>
            </div>
          </section>
        </>
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
          <EventAgendaSection
            cityName={selectedCityOption?.name}
            content={content}
          />
        </Suspense>
      )}

      <PageInfoSection
        eyebrow="Платформа"
        title="Кофейные события, мастер-классы и дегустации в СКФО"
        sidebarLinks={[
          { href: 'https://t.me/barsynergy', label: 'Telegram-канал' },
          { href: '/events', label: 'Афиша событий' },
        ]}
      >
        <p>
          Афиша BARSYNERGY собирает профессиональные события кофейной и барной индустрии Северного Кавказа: каппинги, чемпионаты бариста,
          лекции, мастер-классы, тренинги и открытые дегустации в Махачкале, Грозном, Владикавказе и других городах региона.
        </p>
        <p>
          Раздел подходит как для участников, которые хотят найти ближайшие мероприятия, так и для организаторов, которые хотят добавить
          событие в афишу. Заявки на размещение события принимаются через форму на странице.
        </p>
        <p>
          Следите за расписанием, чтобы не пропустить обучающие форматы, конкурсы и встречи кофейного сообщества СКФО.
        </p>
      </PageInfoSection>
    </>
  );
}
