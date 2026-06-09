import type { Metadata } from 'next';
import { CategoryType } from '@/modules/content/shared/types';
import { Briefcase } from 'lucide-react';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSectionOpportunity } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import {
  stripPublicApplicationResultParams
} from '@/lib/applications/public-form-helpers';
import {
  getPublishedVacancies,
  type PublicContentSearchParams
} from '@/lib/public/content';
import { getPublicCategoryOptions, getPublicCityFilterOptions, getVacancyFilterOptions } from '@/lib/public/filter-options';
import { buildPublicPageMetadata } from '@/lib/public/metadata';

type VacanciesPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Вакансии',
  description: 'Вакансии для баров, кофеен и команд Северного Кавказа.',
  path: '/vacancies'
});

export default async function VacanciesPage({ searchParams }: VacanciesPageProps) {
  const params = (await searchParams) ?? {};
  const contentParams = stripPublicApplicationResultParams(params);
  const [content, categories, cities, filterOptions] = await Promise.all([
    getPublishedVacancies(contentParams),
    getPublicCategoryOptions(CategoryType.VACANCY),
    getPublicCityFilterOptions(),
    getVacancyFilterOptions()
  ]);
  const vacancyContactHref = '/contacts?topic=vacancy#contact-form';

  return (
    <>
      <EditorialPublicPage
        eyebrow="Вакансии"
        path="/vacancies"
        title="Вакансии"
        description="Открытые позиции в барах, кофейнях, обжарках и сервисных командах региона."
        summary="Поиск виден сразу. Дополнительные фильтры раскрываются по кнопке."
        chips={['Бариста', 'Управляющие', 'Тренеры']}
        density="compact"
        metrics={[]}
        rows={[]}
        primaryLink={{ label: 'Добавить вакансию для команды', href: vacancyContactHref }}
        accentGradient="radial-gradient(ellipse 90% 60% at 20% 30%, rgba(210,150,50,0.14), transparent)"
        accentIcon={Briefcase}
      />
      <PublishedContentSectionOpportunity
        basePath="/vacancies"
        content={content}
        emptyActions={[]}
        emptyDescription="Открытых вакансий сейчас нет. Подпишитесь на Telegram-канал — публикуем вакансии там первыми."
        emptyTitle="Вакансий пока нет"
        title="Открытые позиции"
        filters={
          <PublicFilters
            categories={categories}
            cities={cities}
            description="Отберите позиции по городу, позиции и формату занятости."
            embedded
            extraFilters={[{ name: 'employmentType', label: 'Все форматы', options: filterOptions.employmentTypes }]}
            placeholder="Должность, компания или город"
            variant="sidebar"
          />
        }
        sectionId="vacancy-list"
        listLabel="Вакансии индустрии"
        rowActionLabel="Открыть вакансию"
      />
    </>
  );
}
