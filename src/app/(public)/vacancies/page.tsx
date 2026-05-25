import type { Metadata } from 'next';
import { CategoryType } from '@prisma/client';
import { PublicActionRow, PublicBodyText, PublicBreadcrumbs, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { Button } from '@/components/ui/button';
import {
  stripPublicApplicationResultParams
} from '@/lib/applications/public-form-helpers';
import {
  getPublishedVacancies,
  type PublicContentSearchParams
} from '@/lib/public/content';
import { getPublicCategoryOptions, getPublicCityFilterOptions, getVacancyFilterOptions } from '@/lib/public/filter-options';

type VacanciesPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'Вакансии',
  description: 'Вакансии для баров, кофеен и команд Северного Кавказа.'
};

export default async function VacanciesPage({ searchParams }: VacanciesPageProps) {
  const params = (await searchParams) ?? {};
  const contentParams = stripPublicApplicationResultParams(params);
  const [content, categories, cities, filterOptions] = await Promise.all([
    getPublishedVacancies(contentParams),
    getPublicCategoryOptions(CategoryType.VACANCY),
    getPublicCityFilterOptions(),
    getVacancyFilterOptions()
  ]);
  const vacancyContactHref = '/contacts?topic=vacancy-placement#contact-form';

  return (
    <>
      <section className="background-zone background-zone-hero border-b border-[var(--line)] py-7 md:py-10">
        <div className="container relative">
          <div className="min-w-0 max-w-5xl">
            <PublicBreadcrumbs current="Вакансии" />
            <PublicEyebrow className="mt-5">Вакансии</PublicEyebrow>
            <PublicDisplayTitle as="h1" className="mt-3 max-w-5xl text-[32px] sm:text-[42px] md:text-[50px] xl:text-[56px]" size="section">
              Работа для баров, кофеен и команд Северного Кавказа
            </PublicDisplayTitle>
            <PublicBodyText className="mt-4 max-w-2xl" size="md">
              Здесь можно найти открытую роль или отправить вакансию для публикации.
            </PublicBodyText>
            <PublicActionRow className="mt-5 items-start gap-3">
              <Button
                className="min-h-12 w-full max-w-[15rem] rounded-[var(--radius-md)] px-6 tracking-normal sm:w-auto"
                href={vacancyContactHref}
                variant="secondary"
              >
                Разместить вакансию
              </Button>
            </PublicActionRow>
          </div>
        </div>
      </section>
      <PublishedContentSection
        basePath="/vacancies"
        content={content}
        emptyActions={[]}
        emptyDescription="Открытых вакансий сейчас нет. Работодатели могут отправить вакансию для публикации или написать команде."
        emptyTitle="Вакансий пока нет"
        filters={
          <PublicFilters
            categories={categories}
            cities={cities}
            description="Отберите позиции по городу, категории и формату занятости."
            embedded
            extraFilters={[{ name: 'employmentType', label: 'Все форматы', options: filterOptions.employmentTypes }]}
            placeholder="поиск"
            variant="sidebar"
          />
        }
        sectionId="vacancy-list"
        listAction={{ href: vacancyContactHref, label: 'Разместить вакансию', variant: 'ghost' }}
        listLabel="Вакансии индустрии"
        rowVariant="opportunity"
        rowActionLabel="Откликнуться"
        sortLabel="Сначала новые"
        title="Открытые вакансии"
      />
    </>
  );
}
