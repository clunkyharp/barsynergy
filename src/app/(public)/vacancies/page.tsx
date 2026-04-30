import { CategoryType } from '@prisma/client';
import { ArrowUpRight } from 'lucide-react';
import { PublicActionRow, PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
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
  const vacancyCount = content.total;
  const hasVacancies = vacancyCount > 0;

  return (
    <>
      <section className="relative overflow-hidden border-b border-black/20 py-10 md:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(153,44,38,0.1),transparent_18%),radial-gradient(circle_at_82%_22%,rgba(255,255,255,0.62),transparent_18%),radial-gradient(circle_at_76%_84%,rgba(20,20,18,0.06),transparent_24%)]"
        />
        <div className="container relative grid gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:items-end">
          <div className="min-w-0">
            <PublicEyebrow>Вакансии</PublicEyebrow>
            <PublicDisplayTitle as="h1" className="mt-3" size="hero">
              Работа для баров, кофеен и команд Северного Кавказа
            </PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-2xl" size="md">
              Здесь собраны опубликованные вакансии, отклики по открытым ролям и отправка новых позиций от заведений.
            </PublicBodyText>
            <PublicActionRow className="flex-col gap-3 sm:flex-row">
              <Button className="min-h-12 rounded-full px-6 tracking-[0.08em]" href="#vacancy-list">
                Смотреть позиции
                <ArrowUpRight size={18} />
              </Button>
              <Button className="min-h-12 px-6 tracking-[0.08em]" href="/contacts" variant="secondary">
                Связаться
              </Button>
            </PublicActionRow>
          </div>
          <div className="grid gap-3">
            <StatCard
              className="backdrop-blur"
              description={
                hasVacancies
                  ? 'опубликованные вакансии'
                  : 'открытых вакансий сейчас нет'
              }
              label="Вакансии"
              value={vacancyCount}
              valueClassName="text-4xl font-semibold tracking-[-0.05em]"
            />
          </div>
        </div>
      </section>
      <PublishedContentSection
        basePath="/vacancies"
        content={content}
        emptyAction={{ href: '/contacts', label: 'Связаться' }}
        emptyDescription="Сейчас опубликованных позиций нет. Новые вакансии появятся после публикации командой."
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
        title="Актуальные позиции"
      />
    </>
  );
}
