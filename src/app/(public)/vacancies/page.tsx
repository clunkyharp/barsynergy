import { CategoryType } from '@prisma/client';
import { ArrowUpRight } from 'lucide-react';
import { PublicActionRow, PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { Button } from '@/components/ui/button';
import { getPublishedVacancies, type PublicContentSearchParams } from '@/lib/public/content';
import { getPublicCategoryOptions, getPublicCityFilterOptions, getVacancyFilterOptions } from '@/lib/public/filter-options';

type VacanciesPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

function stripApplicationResultParams(params: PublicContentSearchParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([key]) => key !== 'applicationSuccess' && key !== 'applicationError')
  );
}

export default async function VacanciesPage({ searchParams }: VacanciesPageProps) {
  const params = (await searchParams) ?? {};
  const [content, categories, cities, filterOptions] = await Promise.all([
    getPublishedVacancies(stripApplicationResultParams(params)),
    getPublicCategoryOptions(CategoryType.VACANCY),
    getPublicCityFilterOptions(),
    getVacancyFilterOptions()
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-black/20 py-10 md:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(153,44,38,0.1),transparent_18%),radial-gradient(circle_at_82%_22%,rgba(255,255,255,0.62),transparent_18%),radial-gradient(circle_at_76%_84%,rgba(20,20,18,0.06),transparent_24%)]"
        />
        <div className="container relative">
          <div className="min-w-0 max-w-5xl">
            <PublicEyebrow>Вакансии</PublicEyebrow>
            <PublicDisplayTitle as="h1" className="mt-3" size="hero">
              Работа для баров, кофеен и команд Северного Кавказа
            </PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-2xl" size="md">
              Здесь собраны открытые вакансии для баров, кофеен и команд региона. Можно откликнуться на роль или отправить свою вакансию на публикацию.
            </PublicBodyText>
            <PublicActionRow className="flex-col gap-3 sm:flex-row">
              <Button className="min-h-12 rounded-full px-6 tracking-[0.08em]" href="#vacancy-list">
                Смотреть позиции
                <ArrowUpRight size={18} />
              </Button>
              <Button className="min-h-12 px-6 tracking-[0.08em]" href="/contacts?topic=vacancy-placement" variant="secondary">
                Разместить вакансию
              </Button>
            </PublicActionRow>
          </div>
        </div>
      </section>
      <PublishedContentSection
        basePath="/vacancies"
        content={content}
        emptyActions={[
          { href: '/contacts?topic=vacancy-placement', label: 'Разместить вакансию' },
          { href: '/contacts', label: 'Связаться с командой', variant: 'secondary' }
        ]}
        emptyDescription="Сейчас открытых вакансий нет. Если ищете сотрудника, можно сразу отправить свою вакансию."
        emptyTitle="Вакансий пока нет"
        filters={
          <PublicFilters
            categories={categories}
            cities={cities}
            embedded
            extraFilters={[{ name: 'employmentType', label: 'Все форматы', options: filterOptions.employmentTypes }]}
            placeholder="Поиск по роли, компании или описанию..."
          />
        }
        sectionId="vacancy-list"
        listAction={{ href: '/contacts?topic=vacancy-placement', label: 'Разместить вакансию', variant: 'ghost' }}
        listLabel="Вакансии индустрии"
        rowVariant="opportunity"
        sortLabel="Сначала новые"
        title="Открытые вакансии"
      />
    </>
  );
}
