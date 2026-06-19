import type { Metadata } from 'next';
import { CategoryType } from '@/modules/content/shared/types';
import { PageHero } from '@/components/public/page-hero';
import { PageInfoSection } from '@/components/public/page-info-section';
import { PublishedContentSectionOpportunity } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { VacanciesHeroActions } from '@/app/(public)/vacancies/vacancies-hero-actions';
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
import { SpecialistListSection } from './specialist-list-section';

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
  const [vacancies, seekingSpecialists, offeringSpecialists] = await Promise.all([
    getPublishedVacancies({ pageSize: '1' }),
    getPublishedSpecialists({ mode: 'seeking', pageSize: '1' }),
    getPublishedSpecialists({ mode: 'offering', pageSize: '1' })
  ]);

  return {
    vacancies: vacancies.total,
    specialists: seekingSpecialists.total + offeringSpecialists.total
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
    <section className="background-zone background-zone-graphite border-b border-[var(--line)] pt-6 pb-6 md:pt-8 md:pb-8">
      <div className="container">
        <div className="inline-flex max-w-full flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-card)_72%,transparent)] px-3 py-2 sm:gap-4 sm:px-4">
          <span className="text-[11px] font-bold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]">Каталог</span>
          <div className="flex items-center gap-3 text-sm leading-none text-[var(--muted)]">
            <span className="tabular-nums"><strong className="text-[var(--text)]">{vacanciesCount}</strong> вакансий</span>
            <span className="text-[var(--line)]">·</span>
            <span className="tabular-nums"><strong className="text-[var(--text)]">{specialistsCount}</strong> специалистов</span>
          </div>
          <div className="ml-auto">
            <VacanciesViewTabs vacanciesCount={vacanciesCount} specialistsCount={specialistsCount} />
          </div>
        </div>
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
      getPublishedSpecialists(contentParams),
      getSpecialistFilterOptions(),
      directoryCountsPromise
    ]);

    return (
      <>
        <JsonLd data={buildStaticPageBreadcrumbJsonLd('/vacancies', 'Вакансии')} />
        <PageHero
          breadcrumbs={[{ href: '/', label: 'Главная' }, { label: 'Вакансии' }]}
          title="Вакансии и специалисты"
          subtitle="Работа, специалисты и проекты для барной индустрии."
          tone="graphite"
          density="compact"
        >
          <VacanciesHeroActions />
        </PageHero>
        <DirectoryBar
          vacanciesCount={directoryCounts.vacancies}
          specialistsCount={directoryCounts.specialists}
        />
        <SpecialistListSection
          content={content}
          filterOptions={filterOptions}
          params={contentParams}
        />
      </>
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
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/vacancies', 'Вакансии')} />
      <PageHero
        breadcrumbs={[{ label: 'Вакансии' }]}
        title="Вакансии и специалисты"
        subtitle="Работа, специалисты и проекты для барной индустрии."
        tone="graphite"
        density="compact"
      >
        <VacanciesHeroActions />
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
        emptyActions={[
          { href: '/profile/settings/career#publish', label: 'Добавить резюме', variant: 'primary' },
          { href: 'https://t.me/barsynergy', label: 'Следить в Telegram' }
        ]}
        emptyDescription="Открытых вакансий сейчас нет. Подпишитесь на Telegram — публикуем вакансии там первыми."
        emptyTitle="Вакансий пока нет"
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
          BARSYNERGY собирает актуальные вакансии для бариста, обжарщиков, управляющих кофеен, технологов и других специалистов барной индустрии
          Северо-Кавказского федерального округа. Раздел охватывает позиции в Махачкале, Грозном, Владикавказе, Нальчике и других городах региона.
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
    </>
  );
}
