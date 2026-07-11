import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CategoryType } from '@/modules/content/shared/types';
import { PageHero } from '@/components/public/page-hero';
import { PageInfoSection } from '@/components/public/page-info-section';
import { PublishedContentSectionOpportunity } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { VacanciesHeroActions, VacanciesHeroStats } from '@/app/(public)/vacancies/vacancies-hero-actions';
import {
  stripPublicApplicationResultParams
} from '@/lib/applications/public-form-helpers';
import {
  getPublishedVacancies,
  getPublishedSpecialists,
  hasActivePublicContentParams,
  type PublicContentSearchParams
} from '@/lib/public/content';
import { getPublicCategoryOptions, getPublicCityFilterOptions, getVacancyFilterOptions } from '@/lib/public/filter-options';
import { JsonLd } from '@/components/seo/json-ld';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';
import { HowItWorksSection } from '@/components/ui/how-it-works-steps';
import { PublicPrelaunchSection } from '@/components/public/public-prelaunch-section';

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

export default async function VacanciesPage({ searchParams }: VacanciesPageProps) {
  const params = (await searchParams) ?? {};
  const view = firstParam(params.view) ?? 'vacancies';

  if (view === 'specialists') {
    redirect('/specialists?mode=job');
  }

  const contentParams = stripPublicApplicationResultParams(params);
  const selectedSort = firstParam(contentParams.sort);
  const [content, categories, cities, filterOptions, directoryCounts] = await Promise.all([
    getPublishedVacancies(contentParams),
    getPublicCategoryOptions(CategoryType.VACANCY),
    getPublicCityFilterOptions(),
    getVacancyFilterOptions(),
    getDirectoryCounts()
  ]);
  const hasActiveFilters = hasActivePublicContentParams(contentParams, ['q', 'category', 'city', 'employmentType', 'verified', 'sort']);
  const isPrelaunchEmpty = content.total === 0 && !hasActiveFilters;

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
      {isPrelaunchEmpty ? (
        <>
          <HowItWorksSection
            columns={4}
            steps={[
              { title: 'Отправляете вакансию', description: 'Заполните форму с описанием позиции, требованиями и контактами.' },
              { title: 'Редакция проверяет', description: 'Уточняем детали и сверяемся с форматом платформы.' },
              { title: 'Вакансия публикуется', description: 'После согласования появляется в каталоге.' },
              { title: 'Кандидаты пишут вам', description: 'Заинтересованные специалисты связываются напрямую.' },
            ]}
          />
          <PublicPrelaunchSection
            compact
            badges={['Каталог принимает вакансии', 'Подходит для кофеен, баров и обжарок']}
            cards={[
              { title: 'Бариста', description: 'Позиции в кофейнях и барах региона.' },
              { title: 'Обжарщик', description: 'Работа на обжарочных производствах.' },
              { title: 'Управляющий', description: 'Заведование кофейней или баром.' }
            ]}
            description="Разместите вакансию — специалисты откликаются напрямую."
            eyebrow="Вакансии"
            title="Какие позиции можно разместить"
          />
        </>
      ) : (
      <PublishedContentSectionOpportunity
        basePath="/vacancies"
        content={content}
        emptyIcon="vacancies"
        emptyActions={[
          { href: '/specialists?mode=job', label: 'Найти специалиста', variant: 'primary' },
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
      )}
      <PageInfoSection
        eyebrow="Платформа"
        title="Вакансии кофейной индустрии в СКФО"
        sidebarLinks={[
          { href: 'https://t.me/barsynergy', label: 'Telegram-канал' },
          { href: '/specialists', label: 'Каталог специалистов' },
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
