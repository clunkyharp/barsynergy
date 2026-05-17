import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CategoryType } from '@prisma/client';
import { ArrowUpRight } from 'lucide-react';
import { EventApplicationForm } from '@/components/public/event-application-form';
import { EventAgendaSection } from '@/components/public/platform-ui';
import { PublicBodyText, PublicDisplayTitle } from '@/components/public/public-primitives';
import { PublicFilters } from '@/components/public/public-filters';
import { PublicPrelaunchSection } from '@/components/public/public-prelaunch-section';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import {
  getPublicApplicationResult,
  getPublicApplicationUtm,
  stripPublicApplicationResultParams
} from '@/lib/applications/public-form-helpers';
import { displayFont } from '@/lib/fonts';
import { getPublishedEvents, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getEventFilterOptions, getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';
import { getEnv } from '@/lib/validation/env';

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

function EventSubmissionNotice() {
  return (
    <section className="background-zone background-zone-cta border-b border-[var(--line)] py-10 md:py-14" id="event-proposal">
      <div className="container">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-5 md:grid md:grid-cols-[minmax(0,0.62fr)_minmax(0,1fr)_auto] md:items-center md:gap-6 md:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Предложение события</p>
            <h2 className={`${displayFont.className} mt-3 text-[1.75rem] font-semibold leading-none text-[var(--text)] md:text-[2.25rem]`}>
              Добавить событие в афишу
            </h2>
          </div>
          <dl className="mt-5 grid gap-2 text-sm leading-6 md:mt-0 md:grid-cols-3">
            <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-2.5">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">Подходит, если</dt>
          <dd className="text-[var(--text)]">Событие связано с барами, HoReCa или обучением команд в СКФО.</dd>
        </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-2.5">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">Кто</dt>
          <dd className="text-[var(--text)]">Заведение, бренд, школа, организатор или команда.</dd>
        </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-2.5">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">Что указать</dt>
          <dd className="text-[var(--text)]">Тему, город, дату, площадку и контакт организатора.</dd>
        </div>
      </dl>
          <Button className="mt-5 rounded-[var(--radius-md)] px-5 md:mt-0" href="/events?intent=proposal#event-request" size="sm" variant="secondary">
            Предложить событие
            <ArrowUpRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
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
  const eventSlug = firstParam(params.event);
  const isEventProposal = firstParam(params.intent) === 'proposal';
  const isEmpty = content.total === 0;
  const hasActiveFilters = hasActivePublicContentParams(contentParams, ['q', 'category', 'city', 'format', 'period']);
  const isPrelaunchEmpty = isEmpty && !hasActiveFilters;

  return (
    <>
      <section className="background-zone background-zone-hero border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <div className="min-w-0">
            <p className="text-sm leading-6 text-[var(--muted)]">
              <AppLink className="muted-link" href="/">Главная</AppLink> <span aria-hidden="true">›</span> События
            </p>
            <PublicDisplayTitle as="h1" className="mt-6" size="hero">
              События
            </PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-3xl" size="md">
              Афиша встреч, лекций, дегустаций и гостевых смен для специалистов и команд.
            </PublicBodyText>
          </div>
        </div>
      </section>
      {isPrelaunchEmpty ? (
        <PublicPrelaunchSection
          actions={[
            { href: '/events?intent=proposal#event-request', label: 'Предложить событие' },
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
              title: 'Встречи по рабочей теме',
              description: 'Формат для специалистов, заведений и брендов: одна тема, дата, площадка и контакт организатора.'
            }
          ]}
          description="Пока афиша собирается. Можно предложить событие, площадку или тему для встречи."
          eyebrow="Афиша"
          title="Первые события собираются"
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
                    allLabel: 'Любая дата',
                    options: [
                      { value: 'upcoming', label: 'Предстоящие' },
                      { value: 'past', label: 'Прошедшие' }
                    ]
                  }
                ]}
                placeholder="Название, площадка или тема"
                tone="directory"
                variant="toolbar"
              />
            }
          />
        </Suspense>
      )}
      <EventSubmissionNotice />
      <EventApplicationForm
        cities={cities}
        defaults={{ eventTitle: eventTitle ?? eventSlug ?? (isEventProposal ? 'Предложение события' : undefined) }}
        enabled={applicationFormsEnabled}
        result={applicationResult}
        utm={applicationUtm}
      />
    </>
  );
}
