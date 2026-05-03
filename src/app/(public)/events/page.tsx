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
import { getEnv } from '@/lib/validation/env';

type EventsPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'События',
  description: 'Афиша встреч, лекций и индустриальных событий BARSYNERGY.'
};

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
  const isEmpty = content.total === 0;

  return (
    <>
      <section className="border-b border-black/20 py-10 pt-[118px] md:py-14 md:pt-[132px]">
        <div className="container grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.48fr)] lg:items-center">
          <div className="min-w-0">
            <p className="text-sm leading-6 text-[var(--muted)]">
              <a className="muted-link" href="/">Главная</a> <span aria-hidden="true">›</span> События
            </p>
            <PublicDisplayTitle as="h1" className="mt-6" size="hero">
              События
            </PublicDisplayTitle>
            <h2 className="mt-3 text-[1.7rem] font-semibold uppercase leading-[1.1] text-[var(--text)] md:text-[2.2rem]">
              Афиша барной индустрии СКФО
            </h2>
            <PublicBodyText className="mt-5 max-w-3xl" size="md">
              Встречи, лекции и другие события для специалистов и команд.
            </PublicBodyText>
          </div>
          <Panel className="border-black/10 bg-[rgba(255,250,244,0.8)]" padding="lg">
            <IconBadge icon={CalendarDays} size="lg" tone="accent" />
            <h2 className="mt-5 text-2xl font-semibold uppercase leading-8 text-[var(--text)]">Добавьте своё событие</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Делитесь важными событиями с индустрией СКФО.
            </p>
            <Button className="mt-6 rounded-full px-5" href="#applications" variant="ghost">
              Предложить событие
              <ArrowUpRight size={16} />
            </Button>
          </Panel>
        </div>
      </section>
      {isEmpty ? (
        <PublicPrelaunchSection
          actions={[
            { href: '#applications', label: 'Предложить событие' },
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
              description: 'Форматы для комьюнити, где можно собрать рынок вокруг одной задачи.'
            }
          ]}
          description="Раздел уже принимает предложения по событиям и новым темам, даже если афиша ещё не заполнена."
          eyebrow="Pre-launch / События"
          title="Первые события ещё собираются"
        />
      ) : (
        <Suspense
          fallback={
            <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
              <div className="container">
                <div aria-hidden="true" className="h-40 animate-pulse rounded-[var(--radius-xl)] bg-black/6" />
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
      <EventApplicationForm
        cities={cities}
        enabled={applicationFormsEnabled}
        result={applicationResult}
        utm={applicationUtm}
      />
    </>
  );
}
