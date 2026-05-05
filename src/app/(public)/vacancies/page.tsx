import type { Metadata } from 'next';
import { CategoryType } from '@prisma/client';
import { ArrowUpRight } from 'lucide-react';
import { PublicActionRow, PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { VacancyApplicationForms } from '@/components/public/vacancy-application-forms';
import { Button } from '@/components/ui/button';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import {
  getPublicApplicationResult,
  getPublicApplicationUtm,
  stripPublicApplicationResultParams
} from '@/lib/applications/public-form-helpers';
import {
  getPublishedVacancies,
  getVacancyApplicationFormOptions,
  type PublicContentSearchParams
} from '@/lib/public/content';
import { getPublicCategoryOptions, getPublicCityFilterOptions, getVacancyFilterOptions } from '@/lib/public/filter-options';
import { displayFont } from '@/lib/fonts';
import { getEnv } from '@/lib/validation/env';

type VacanciesPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'Вакансии',
  description: 'Вакансии для баров, кофеен и команд Северного Кавказа.'
};

const moderationSteps = ['Отправка', 'Проверка', 'Уточнение', 'Публикация', 'Отклики'] as const;

export default async function VacanciesPage({ searchParams }: VacanciesPageProps) {
  const params = (await searchParams) ?? {};
  const contentParams = stripPublicApplicationResultParams(params);
  const [content, categories, cities, filterOptions, formOptions] = await Promise.all([
    getPublishedVacancies(contentParams),
    getPublicCategoryOptions(CategoryType.VACANCY),
    getPublicCityFilterOptions(),
    getVacancyFilterOptions(),
    getVacancyApplicationFormOptions()
  ]);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());
  const applicationResult = getPublicApplicationResult(params);
  const applicationUtm = getPublicApplicationUtm(params);

  return (
    <>
      <section className="background-zone background-zone-hero border-b border-[var(--line)] py-10 md:py-14">
        <div className="container relative">
          <div className="min-w-0 max-w-5xl">
            <PublicEyebrow>Вакансии</PublicEyebrow>
            <PublicDisplayTitle as="h1" className="mt-3" size="hero">
              Работа для баров, кофеен и команд Северного Кавказа
            </PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-2xl" size="md">
              Здесь можно найти открытую роль или отправить вакансию на публикацию.
            </PublicBodyText>
            <PublicActionRow className="items-start gap-3">
              <Button className="min-h-12 w-full max-w-[14.5rem] rounded-[var(--radius-md)] px-6 tracking-normal sm:w-auto" href="#vacancy-list">
                Смотреть вакансии
                <ArrowUpRight size={18} />
              </Button>
              <Button
                className="min-h-12 w-full max-w-[15rem] rounded-[var(--radius-md)] px-6 tracking-normal sm:w-auto"
                href="#vacancy-submission"
                variant="secondary"
              >
                Разместить вакансию
              </Button>
            </PublicActionRow>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Я ищу работу</p>
                <h2 className={`${displayFont.className} mt-4 text-[1.8rem] font-semibold leading-none text-[var(--text)]`}>
                  Смотреть роли и откликнуться
                </h2>
                <p className="mt-3 max-w-[34ch] text-sm leading-7 text-[var(--muted)]">
                  Отклик открывается на странице конкретной вакансии, чтобы заявка сразу была привязана к роли.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button className="w-full max-w-[13.5rem] rounded-[var(--radius-md)] px-5 sm:w-auto" href="#vacancy-list" size="sm">
                    Смотреть вакансии
                  </Button>
                </div>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Я ищу сотрудника</p>
                <h2 className={`${displayFont.className} mt-4 text-[1.8rem] font-semibold leading-none text-[var(--text)]`}>
                  Разместить вакансию и получить отклики
                </h2>
                <p className="mt-3 max-w-[34ch] text-sm leading-7 text-[var(--muted)]">
                  Отправьте роль, условия и контакт. Если понадобится, команда поможет уточнить детали перед публикацией.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button className="w-full max-w-[14rem] rounded-[var(--radius-md)] px-5 sm:w-auto" href="#vacancy-submission" size="sm">
                    Разместить вакансию
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PublishedContentSection
        basePath="/vacancies"
        content={content}
        emptyActions={[
          { href: '#vacancy-submission', label: 'Разместить вакансию' },
          { href: '/contacts', label: 'Написать команде', variant: 'secondary' }
        ]}
        emptyDescription="Сейчас открытых вакансий нет. Но можно уже отправить вакансию для публикации или написать команде."
        emptyTitle="Вакансий пока нет"
        filters={
          <PublicFilters
            categories={categories}
            cities={cities}
            description="Отфильтруйте позиции по городу, категории и формату занятости."
            embedded
            extraFilters={[{ name: 'employmentType', label: 'Все форматы', options: filterOptions.employmentTypes }]}
            placeholder="Поиск по роли, компании или описанию…"
            variant="sidebar"
          />
        }
        sectionId="vacancy-list"
        listAction={{ href: '#vacancy-submission', label: 'Разместить вакансию', variant: 'ghost' }}
        listLabel="Вакансии индустрии"
        rowVariant="opportunity"
        rowActionLabel="Откликнуться"
        sortLabel="Сначала новые"
        title="Открытые вакансии"
      />
      <section className="background-zone background-zone-beige border-b border-[var(--line)] py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[minmax(16rem,0.58fr)_minmax(0,1.42fr)]">
          <div>
            <PublicEyebrow>Проверка вакансий</PublicEyebrow>
            <h2 className={`${displayFont.className} mt-4 max-w-sm text-[2.6rem] font-semibold leading-none text-[var(--text)] md:text-[3.15rem]`}>
              Как вакансия попадает на сайт
            </h2>
            <PublicBodyText className="mt-4 max-w-md">
              Команда проверяет карточку перед публикацией, чтобы кандидат видел понятные условия, а заведение получало подходящие отклики.
            </PublicBodyText>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {moderationSteps.map((step, index) => (
              <div
                className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4"
                key={step}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className={`${displayFont.className} mt-4 text-[1.55rem] font-semibold leading-none text-[var(--text)]`}>{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      <VacancyApplicationForms
        enabled={applicationFormsEnabled}
        options={formOptions}
        result={applicationResult}
        utm={applicationUtm}
      />
    </>
  );
}
