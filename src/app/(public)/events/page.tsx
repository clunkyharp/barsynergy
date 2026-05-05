import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CategoryType } from '@prisma/client';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { EventApplicationForm } from '@/components/public/event-application-form';
import { EventAgendaSection } from '@/components/public/platform-ui';
import { PublicBodyText, PublicDisplayTitle } from '@/components/public/public-primitives';
import { PublicFilters } from '@/components/public/public-filters';
import { PublicPrelaunchSection } from '@/components/public/public-prelaunch-section';
import { IconBadge } from '@/components/public/public-ui-adaptation';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import {
  getPublicApplicationResult,
  getPublicApplicationUtm,
  stripPublicApplicationResultParams
} from '@/lib/applications/public-form-helpers';
import { getPublishedEvents, type PublicContentSearchParams } from '@/lib/public/content';
import { getEventFilterOptions, getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';
import { displayFont } from '@/lib/fonts';
import { getEnv } from '@/lib/validation/env';

type EventsPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'События',
  description: 'Афиша встреч, лекций и индустриальных событий BARSYNERGY.'
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = (await searchParams) ?? {};
  const contentParams = stripPublicApplicationResultParams(params);
  const [content, filterCities, categories, filterOptions] = await Promise.all([
    getPublishedEvents(contentParams),
    getPublicCityFilterOptions(),
    getPublicCategoryOptions(CategoryType.EVENT),
    getEventFilterOptions()
  ]);
  const [cities] = await Promise.all([getApplicationCityOptions()]);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());
  const applicationResult = getPublicApplicationResult(params);
  const applicationUtm = getPublicApplicationUtm(params);
  const eventTitle = firstParam(params.eventTitle);
  const isEventProposal = firstParam(params.intent) === 'proposal';
  const shouldShowEventForm = Boolean(eventTitle?.trim() || isEventProposal || applicationResult);
  const isEmpty = content.total === 0;

  return (
    <>
      <section className="background-zone background-zone-hero border-b border-[var(--line)] py-10 md:py-14">
        <div className="container grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.48fr)] lg:items-center">
          <div className="min-w-0">
            <p className="text-sm leading-6 text-[var(--muted)]">
              <a className="muted-link" href="/">Главная</a> <span aria-hidden="true">›</span> События
            </p>
            <PublicDisplayTitle as="h1" className="mt-6" size="hero">
              События
            </PublicDisplayTitle>
            <h2 className={`${displayFont.className} mt-3 text-[2.1rem] font-semibold leading-none text-[var(--text)] md:text-[2.8rem]`}>
              Афиша барной индустрии СКФО
            </h2>
            <PublicBodyText className="mt-5 max-w-3xl" size="md">
              Встречи, лекции и другие события для специалистов и команд.
            </PublicBodyText>
          </div>
          <Panel className="border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
            <IconBadge icon={CalendarDays} size="lg" tone="accent" />
            <h2 className={`${displayFont.className} mt-5 text-[2rem] font-semibold leading-none text-[var(--text)]`}>Добавьте своё событие</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Добавьте событие для специалистов и команд СКФО.
            </p>
            <Button className="mt-6 rounded-[var(--radius-md)] px-5" href="/events?intent=proposal#applications" variant="ghost">
              Предложить событие
              <ArrowUpRight size={16} />
            </Button>
          </Panel>
        </div>
      </section>
      {isEmpty ? (
        <PublicPrelaunchSection
          actions={[
            { href: '/events?intent=proposal#applications', label: 'Предложить событие' },
            { href: '/partners', label: 'Обсудить партнёрство', variant: 'secondary' }
          ]}
          badges={['Афиша собирается', 'Можно предложить свой формат']}
          cards={[
            {
              title: 'Гостевые смены',
              description: 'Встречи и обмен опытом между командами, барами и кофейнями региона.'
            },
            {
              title: 'Лекции и дегустации',
              description: 'Практические события с экспертами, брендами и рабочими темами для специалистов.'
            },
            {
              title: 'Профессиональные встречи',
              description: 'Встречи для специалистов, заведений и брендов по одной рабочей теме.'
            }
          ]}
          description="Раздел уже принимает предложения по событиям и новым темам, даже если афиша ещё не заполнена."
          eyebrow="Раздел готовится"
          title="Первые события ещё собираются"
        />
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
            filters={
              <PublicFilters
                categories={categories}
                cities={filterCities}
                description="Найдите ближайшие встречи по городу, формату и дате."
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
                variant="toolbar"
              />
            }
          />
        </Suspense>
      )}
      {shouldShowEventForm ? (
        <EventApplicationForm
          cities={cities}
          defaults={{ eventTitle: eventTitle ?? (isEventProposal ? 'Предложение события' : undefined) }}
          enabled={applicationFormsEnabled}
          result={applicationResult}
          utm={applicationUtm}
        />
      ) : null}
    </>
  );
}
