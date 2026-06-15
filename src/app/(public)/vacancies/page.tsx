import type { Metadata } from 'next';
import { CategoryType } from '@/modules/content/shared/types';
import { PageHero } from '@/components/public/page-hero';
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
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { SpecialistListSection } from './specialist-list-section';

type VacanciesPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Вакансии',
  description: 'Работа для бариста, управляющих и специалистов кофейной индустрии.',
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

export default async function VacanciesPage({ searchParams }: VacanciesPageProps) {
  const params = (await searchParams) ?? {};
  const view = firstParam(params.view) ?? 'vacancies';

  if (view === 'specialists') {
    const contentParams = stripPublicApplicationResultParams(params);
    const [content, filterOptions] = await Promise.all([
      getPublishedSpecialists(contentParams),
      getSpecialistFilterOptions(),
    ]);

    return (
      <>
        <PageHero
          title="Специалисты"
          subtitle="Резюме и услуги специалистов барной индустрии."
          tone="graphite"
        >
          <VacanciesViewTabs />
          <VacanciesHeroActions />
        </PageHero>
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
  const [content, categories, cities, filterOptions] = await Promise.all([
    getPublishedVacancies(contentParams),
    getPublicCategoryOptions(CategoryType.VACANCY),
    getPublicCityFilterOptions(),
    getVacancyFilterOptions()
  ]);

  return (
    <>
      <PageHero
        title="Вакансии"
        subtitle="Работа для бариста, обжарщиков, управляющих и специалистов кофейной индустрии."
        tone="graphite"
      >
        <VacanciesViewTabs />
        <VacanciesHeroActions />
      </PageHero>
      <PublishedContentSectionOpportunity
        basePath="/vacancies"
        content={content}
        emptyActions={[
          { href: 'https://t.me/barsynergy', label: 'Открыть Telegram' }
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
    </>
  );
}
