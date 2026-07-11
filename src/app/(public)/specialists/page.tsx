import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CategoryType } from '@/modules/content/shared/types';
import { PageHero } from '@/components/public/page-hero';
import { PageInfoSection } from '@/components/public/page-info-section';
import { PublishedContentSectionSpecialist } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { PublicPrelaunchSection } from '@/components/public/public-prelaunch-section';
import { SpecialistModeTabs } from './specialist-mode-tabs';
import { stripPublicApplicationResultParams } from '@/lib/applications/public-form-helpers';
import {
  getPublishedSpecialists,
  hasActivePublicContentParams,
  type PublicContentSearchParams
} from '@/lib/public/content';
import {
  getSpecialistFilterOptions,
  getMasterFilterOptions,
  getPublicCategoryOptions,
  getPublicCityFilterOptions
} from '@/lib/public/filter-options';
import { JsonLd } from '@/components/seo/json-ld';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';

type SpecialistsPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Специалисты кофейной индустрии СКФО',
  description: 'Каталог специалистов, мастеров и сервисных команд для кофеен, баров и ресторанов Северного Кавказа.',
  path: '/specialists'
});

const masterSortOptions = [
  { value: 'recent', label: 'Сначала новые' },
  { value: 'verified', label: 'Сначала проверенные' },
  { value: 'experience', label: 'По опыту' },
  { value: 'name', label: 'По названию' }
] as const;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function getModeCounts() {
  const [job, services, teams] = await Promise.all([
    getPublishedSpecialists({ mode: 'seeking', pageSize: '1' }),
    getPublishedSpecialists({ mode: 'offering', entityType: 'INDIVIDUAL', pageSize: '1' }),
    getPublishedSpecialists({ mode: 'offering', entityType: 'BUSINESS', pageSize: '1' })
  ]);
  return { job: job.total, services: services.total, teams: teams.total };
}

export default async function SpecialistsPage({ searchParams }: SpecialistsPageProps) {
  const params = (await searchParams) ?? {};
  const rawMode = firstParam(params.mode) ?? 'job';

  if (rawMode !== 'job' && rawMode !== 'services' && rawMode !== 'teams') {
    redirect('/specialists?mode=job');
  }

  const mode = rawMode as 'job' | 'services' | 'teams';
  const contentParams = stripPublicApplicationResultParams(params);
  const countsPromise = getModeCounts();

  if (mode === 'job') {
    const [content, filterOptions, counts] = await Promise.all([
      getPublishedSpecialists({ ...contentParams, mode: 'seeking' }),
      getSpecialistFilterOptions(),
      countsPromise
    ]);
    const hasActiveFilters = hasActivePublicContentParams(contentParams, ['q', 'category', 'city', 'employmentType', 'jobSearchStatus']);
    const isPrelaunchEmpty = content.total === 0 && !hasActiveFilters;

    return (
      <div className="vacancies-directory-page">
        <JsonLd data={buildStaticPageBreadcrumbJsonLd('/specialists', 'Специалисты')} />
        <PageHero
          breadcrumbs={[{ href: '/', label: 'Главная' }, { label: 'Специалисты' }]}
          eyebrow="Работа в кофейной индустрии"
          title="Специалисты"
          subtitle="Резюме, услуги и сервисные команды для кофеен, баров и ресторанов СКФО."
          tone="graphite"
        />
        <section className="vacancies-directory-tabs-section background-zone background-zone-graphite border-b border-[var(--line)]">
          <div className="container">
            <SpecialistModeTabs counts={counts} />
          </div>
        </section>
        {isPrelaunchEmpty ? (
          <PublicPrelaunchSection
            compact
            badges={['Каталог принимает заявки', 'Подходит для бариста, обжарщиков и управляющих']}
            cards={[
              { title: 'Ищут работу', description: 'Специалисты с резюме — бариста, обжарщики, управляющие.' },
              { title: 'Предлагают услуги', description: 'Частные мастера для запуска, аудита и обслуживания.' },
              { title: 'Сервисные команды', description: 'Компании для комплексных проектов и сервиса.' }
            ]}
            description="Создайте профиль специалиста — работодатели и заведения найдут вас напрямую."
            eyebrow="Каталог"
            title="Какие профили можно добавить"
          />
        ) : (
          <PublishedContentSectionSpecialist
            basePath="/specialists"
            resetHref="/specialists?mode=job"
            ignoredParamKeys={['page', 'sort', 'pageSize', 'mode']}
            backgroundZone="graphite"
            content={content}
            title="Ищут работу"
            listLabel="Специалисты"
            countForms={['специалист', 'специалиста', 'специалистов']}
            rowActionLabel="Подробнее"
            sectionId="specialist-list"
            emptyIcon="user"
            emptyTitle="Специалистов пока нет"
            emptyDescription="Когда специалисты опубликуют резюме, они появятся здесь."
            emptyActions={[
              { href: '/auth/register/user', label: 'Создать профиль', variant: 'primary' },
              { href: 'https://t.me/barsynergy', label: 'Следить в Telegram' }
            ]}
            showSidebarTitle={false}
            filters={
              <PublicFilters
                activeSummaryLabel="Параметры каталога"
                activeSummaryCountLabel="Фильтры каталога"
                cities={filterOptions.cities}
                cityAllLabel="Все города"
                cityLabel="Город"
                cityMode="multiple"
                embedded
                extraFilters={[
                  { name: 'category', label: 'Профессия', allLabel: 'Любая', mode: 'multiple', options: filterOptions.professions },
                  { name: 'employmentType', label: 'Занятость', allLabel: 'Любая', mode: 'multiple', options: filterOptions.employmentTypes },
                  { name: 'jobSearchStatus', label: 'Статус поиска', allLabel: 'Любой', options: filterOptions.jobSearchStatuses }
                ]}
                placeholder="Имя, профессия или навык…"
                title="Фильтры"
                tone="directory"
                variant="sidebar"
              />
            }
          />
        )}
      </div>
    );
  }

  const [content, filterCities, categories, filterOptions, counts] = await Promise.all([
    getPublishedSpecialists({
      ...contentParams,
      mode: 'offering',
      entityType: mode === 'teams' ? 'BUSINESS' : 'INDIVIDUAL'
    }),
    getPublicCityFilterOptions(),
    getPublicCategoryOptions(CategoryType.MASTER),
    getMasterFilterOptions(),
    countsPromise
  ]);
  const hasActiveFilters = hasActivePublicContentParams(contentParams);
  const isPrelaunchEmpty = content.total === 0 && !hasActiveFilters;
  const modeLabel = mode === 'teams' ? 'Сервисные команды' : 'Услуги специалистов';

  return (
    <div className="masters-directory-page">
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/specialists', 'Специалисты')} />
      <PageHero
        breadcrumbs={[{ href: '/', label: 'Главная' }, { label: 'Специалисты' }]}
        eyebrow="Каталог"
        title="Специалисты"
        subtitle={mode === 'teams'
          ? 'Компании для запуска, обучения, аудита и обслуживания оборудования.'
          : 'Частные мастера для запуска, обучения, аудита и обслуживания оборудования.'}
        tone="graphite"
      />
      <section className="vacancies-directory-tabs-section background-zone background-zone-graphite border-b border-[var(--line)]">
        <div className="container">
          <SpecialistModeTabs counts={counts} />
        </div>
      </section>
      {isPrelaunchEmpty ? (
        <PublicPrelaunchSection
          compact
          badges={mode === 'teams'
            ? ['Каталог принимает заявки', 'Подходит для сервисных компаний']
            : ['Каталог принимает заявки', 'Подходит для частных мастеров']}
          cards={[
            { title: 'Запуск бара', description: 'Помощь с процессами, станцией, картой и первыми сменами.' },
            { title: 'Обучение команды', description: 'Практические тренинги для бариста и менеджеров смены.' },
            { title: 'Сервис оборудования', description: 'Диагностика, настройка и регулярное обслуживание техники.' }
          ]}
          description="Добавьте профиль, если помогаете заведениям запускаться, обучать команду или обслуживать оборудование."
          eyebrow="Каталог"
          title="Какие услуги можно добавить"
        />
      ) : (
        <PublishedContentSectionSpecialist
          basePath="/specialists"
          resetHref={`/specialists?mode=${mode}`}
          ignoredParamKeys={['page', 'sort', 'pageSize', 'mode', 'entityType']}
          backgroundZone="graphite"
          content={content}
          title={modeLabel}
          listLabel={mode === 'teams' ? 'Команды' : 'Мастера'}
          countForms={mode === 'teams'
            ? ['команда', 'команды', 'команд']
            : ['мастер', 'мастера', 'мастеров']}
          rowActionLabel="Смотреть профиль"
          sectionId="specialist-list"
          emptyIcon="handshake"
          emptyTitle={mode === 'teams' ? 'Команд пока нет' : 'Мастеров пока нет'}
          emptyDescription="Каталог пополняется. Добавьте профиль, если работаете с заведениями."
          emptyActions={[
            { href: '/specialists/svc/new', label: 'Добавить профиль', variant: 'primary' },
            { href: 'https://t.me/barsynergy', label: 'Следить в Telegram' }
          ]}
          showSidebarTitle={false}
          filters={
            <PublicFilters
              activeSummaryLabel="Параметры каталога"
              activeSummaryCountLabel="Фильтры каталога"
              categories={categories}
              categoryAllLabel="Все услуги"
              categoryLabel="Услуга"
              categoryMode="multiple"
              cities={filterCities}
              cityAllLabel="Все города"
              cityLabel="Город"
              cityMode="multiple"
              embedded
              extraFilters={[
                { name: 'specialization', label: 'Специализация', allLabel: 'Любая', mode: 'multiple', options: filterOptions.specializations },
                { name: 'experience', label: 'Опыт', allLabel: 'Любой опыт', options: filterOptions.experienceBuckets },
                { name: 'verified', label: 'Статус', allLabel: 'Любой статус', options: filterOptions.verified },
                { name: 'sort', label: 'Сортировка', allLabel: 'По умолчанию', options: [...masterSortOptions] }
              ]}
              placeholder="Имя, услуга или специализация…"
              title="Фильтры"
              tone="directory"
              variant="sidebar"
            />
          }
        />
      )}
      <PageInfoSection
        eyebrow="Платформа"
        title="Специалисты и мастера для кофеен СКФО"
        sidebarLinks={[
          { href: 'https://t.me/barsynergy', label: 'Telegram-канал' },
          { href: '/specialists?mode=job', label: 'Ищут работу' },
          { href: '/specialists/svc/new', label: 'Добавить профиль мастера' }
        ]}
      >
        <p>
          В каталоге специалистов — бариста, обжарщики, управляющие, частные мастера и сервисные команды,
          которые работают с кофейнями, барами и ресторанами Северного Кавказа.
        </p>
        <p>
          Три режима каталога: специалисты с резюме, частные мастера с услугами и сервисные команды для комплексных проектов.
        </p>
      </PageInfoSection>
    </div>
  );
}
