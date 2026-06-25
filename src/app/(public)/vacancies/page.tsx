import type { Metadata } from 'next';
import { CategoryType } from '@/modules/content/shared/types';
import { PageHero } from '@/components/public/page-hero';
import { PageInfoSection } from '@/components/public/page-info-section';
import { PublishedContentSectionOpportunity, PublishedContentSectionSpecialist } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { VacanciesHeroActions, VacanciesHeroStats } from '@/app/(public)/vacancies/vacancies-hero-actions';
import { VacanciesViewTabs } from '@/app/(public)/vacancies/vacancies-view-tabs';
import {
  stripPublicApplicationResultParams
} from '@/lib/applications/public-form-helpers';
import {
  getPublishedVacancies,
  getPublishedSpecialists,
  type PublicContentSearchParams
} from '@/lib/public/content';
import { getPublicCategoryOptions, getPublicCityFilterOptions, getVacancyFilterOptions, getSpecialistFilterOptions } from '@/lib/public/filter-options';
import { JsonLd } from '@/components/seo/json-ld';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';
import { HowItWorksSection } from '@/components/ui/how-it-works-steps';
import { SpecialistFilters } from './specialist-filters';

type VacanciesPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Вакансии бариста и специалистов кофейной индустрии в СКФО',
  description: 'Открытые вакансии для бариста, обжарщиков, управляющих и специалистов кофеен в Махачкале, Дагестане и СКФО. Проверенные работодатели, актуальные позиции.',
  path: '/vacancies'
});

const vacancySortOptions = [
  { value: 'recent', label: 'Сначала новые' },
  { value: 'verified', label: 'Сначала от проверенных компаний' },
  { value: 'company', label: 'По названию компании' }
] as const;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getVacancySortLabel(sort?: string) {
  return vacancySortOptions.find((option) => option.value === sort)?.label;
}

async function getDirectoryCounts() {
  const [vacancies, seekingSpecialists] = await Promise.all([
    getPublishedVacancies({ pageSize: '1' }),
    getPublishedSpecialists({ mode: 'seeking', pageSize: '1' })
  ]);

  return {
    vacancies: vacancies.total,
    specialists: seekingSpecialists.total
  };
}

function DirectoryBar({
  vacanciesCount,
  specialistsCount
}: {
  vacanciesCount: number;
  specialistsCount: number;
}) {
  return (
    <section className="vacancies-directory-tabs-section background-zone background-zone-graphite border-b border-[var(--line)]">
      <div className="container">
        <VacanciesViewTabs vacanciesCount={vacanciesCount} specialistsCount={specialistsCount} />
      </div>
    </section>
  );
}

export default async function VacanciesPage({ searchParams }: VacanciesPageProps) {
  const params = (await searchParams) ?? {};
  const view = firstParam(params.view) ?? 'vacancies';
  const directoryCountsPromise = getDirectoryCounts();

  if (view === 'specialists') {
    const contentParams = stripPublicApplicationResultParams(params);
    const [content, filterOptions, directoryCounts] = await Promise.all([
      getPublishedSpecialists({ ...contentParams, mode: 'seeking' }),
      getSpecialistFilterOptions(),
      directoryCountsPromise
    ]);

    return (
      <div className="vacancies-directory-page">
        <JsonLd data={buildStaticPageBreadcrumbJsonLd('/vacancies', 'Вакансии')} />
        <PageHero
          breadcrumbs={[{ href: '/', label: 'Главная' }, { label: 'Вакансии' }]}
          eyebrow="Работа в кофейной индустрии"
          title="Специалисты"
          subtitle="Резюме и анкеты специалистов, которые ищут работу в кофейнях, барах и ресторанах. Услуги и сервисные команды — в разделе «Мастера»."
          tone="graphite"
          media={{ kind: 'slot', children: <VacanciesHeroActions /> }}
        >
          <VacanciesHeroStats
            vacanciesCount={directoryCounts.vacancies}
            specialistsCount={directoryCounts.specialists}
          />
        </PageHero>
        <DirectoryBar
          vacanciesCount={directoryCounts.vacancies}
          specialistsCount={directoryCounts.specialists}
        />
        <PublishedContentSectionSpecialist
          basePath="/vacancies"
          resetHref="/vacancies?view=specialists"
          ignoredParamKeys={['page', 'sort', 'pageSize', 'view', 'mode']}
          backgroundZone="graphite"
          content={content}
          title="Каталог специалистов"
          listLabel="Специалисты"
          countForms={['специалист', 'специалиста', 'специалистов']}
          rowActionLabel="Подробнее"
          sectionId="specialist-list"
          emptyIcon="user"
          emptyTitle="Специалистов пока нет"
          emptyDescription="Когда специалисты опубликуют резюме, они появятся здесь."
          emptyActions={[
            { href: '/auth/register/user', label: 'Создать профиль специалиста', variant: 'primary' },
            { href: 'https://t.me/barsynergy', label: 'Следить в Telegram' }
          ]}
          showSidebarTitle={false}
          filters={<SpecialistFilters filterOptions={filterOptions} params={contentParams} />}
        />
      </div>
    );
  }

  const contentParams = stripPublicApplicationResultParams(params);
  const selectedSort = firstParam(contentParams.sort);
  const [content, categories, cities, filterOptions, directoryCounts] = await Promise.all([
    getPublishedVacancies(contentParams),
    getPublicCategoryOptions(CategoryType.VACANCY),
    getPublicCityFilterOptions(),
    getVacancyFilterOptions(),
    directoryCountsPromise
  ]);

  return (
    <div className="vacancies-directory-page">
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/vacancies', 'Вакансии')} />
      <PageHero
        breadcrumbs={[{ href: '/', label: 'Главная' }, { label: 'Вакансии' }]}
        eyebrow="Работа в кофейной индустрии"
        title="Вакансии"
        subtitle="Работа в кофейнях, барах, обжарках и сервисных командах СКФО."
        tone="graphite"
        media={{ kind: 'slot', children: <VacanciesHeroActions /> }}
      >
        <VacanciesHeroStats
          vacanciesCount={directoryCounts.vacancies}
          specialistsCount={directoryCounts.specialists}
        />
      </PageHero>
      <DirectoryBar
        vacanciesCount={directoryCounts.vacancies}
        specialistsCount={directoryCounts.specialists}
      />
      {content.total === 0 ? (
        <HowItWorksSection
          columns={4}
          steps={[
            { title: 'Отправляете вакансию', description: 'Заполните форму с описанием позиции, требованиями и контактами.' },
            { title: 'Редакция проверяет', description: 'Уточняем детали и сверяемся с форматом платформы.' },
            { title: 'Вакансия публикуется', description: 'После согласования появляется в каталоге.' },
            { title: 'Кандидаты пишут вам', description: 'Заинтересованные специалисты связываются напрямую.' },
          ]}
        />
      ) : null}
      <PublishedContentSectionOpportunity
        basePath="/vacancies"
        content={content}
        emptyIcon="vacancies"
        emptyActions={[
          { href: '/profile/settings/career#publish', label: 'Добавить резюме', variant: 'primary' },
          { href: 'https://t.me/barsynergy', label: 'Следить в Telegram' }
        ]}
        emptyDescription="Открытых вакансий сейчас нет. Подпишитесь на Telegram — публикуем вакансии там первыми."
        emptyTitle="Вакансий пока нет"
        countForms={['вакансия', 'вакансии', 'вакансий']}
        title="Открытые позиции"
        filters={
          <PublicFilters
            activeSummaryCountLabel="Фильтры вакансий"
            categories={categories}
            categoryMode="multiple"
            cities={cities}
            cityMode="multiple"
            description="Отберите позиции по городу, позиции и формату занятости."
            embedded
            extraFilters={[
              { name: 'employmentType', label: 'Все форматы', mode: 'multiple', options: filterOptions.employmentTypes },
              { name: 'verified', label: 'Статус', allLabel: 'Любой', options: [{ value: 'true', label: 'Проверенные компании' }] },
              { name: 'sort', label: 'Сортировка', allLabel: 'По умолчанию', options: [...vacancySortOptions] }
            ]}
            placeholder="Должность, компания или город"
            variant="sidebar"
          />
        }
        sectionId="vacancy-list"
        listLabel="Вакансии индустрии"
        rowActionLabel="Открыть вакансию"
        showSidebarTitle={false}
        sortLabel={getVacancySortLabel(selectedSort)}
      />
      <PageInfoSection
        eyebrow="Платформа"
        title="Вакансии кофейной индустрии в СКФО"
        sidebarLinks={[
          { href: 'https://t.me/barsynergy', label: 'Telegram-канал' },
          { href: '/vacancies?view=specialists', label: 'Каталог специалистов' },
          { href: '/profile/settings/career#publish', label: 'Добавить резюме' },
        ]}
      >
        <p>
          В этом разделе собраны вакансии для бариста, управляющих, обжарщиков, технологов и других специалистов кофейной индустрии СКФО —
          позиции в Махачкале, Грозном, Владикавказе, Нальчике и других городах региона.
        </p>
        <p>
          Здесь публикуются предложения от проверенных работодателей: кофейных сетей, независимых кофеен, обжарщиков, поставщиков оборудования
          и сервисных компаний. Каждая вакансия содержит описание позиции, формат занятости и контакты для связи.
        </p>
        <p>
          Если вы ищете работу бариста в Махачкале, позицию управляющего кофейни в Дагестане или вакансию обжарщика в СКФО — подпишитесь
          на обновления раздела или добавьте своё резюме в каталог специалистов.
        </p>
      </PageInfoSection>
    </div>
  );
}
