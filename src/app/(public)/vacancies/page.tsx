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
import { JsonLd } from '@/components/seo/json-ld';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';
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
        <JsonLd data={buildStaticPageBreadcrumbJsonLd('/vacancies', 'Вакансии')} />
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
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/vacancies', 'Вакансии')} />
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
          { href: '/specialists/svc/new', label: 'Создать профиль', variant: 'primary' },
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
      <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-10 md:py-14">
        <div className="container prose prose-invert max-w-3xl">
          <h2>Вакансии кофейной индустрии в СКФО</h2>
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
        </div>
      </section>
    </>
  );
}
