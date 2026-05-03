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
import { getEnv } from '@/lib/validation/env';

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
              Здесь собраны открытые вакансии для баров, кофеен и команд региона. Можно открыть конкретную роль и отправить свою вакансию на публикацию.
            </PublicBodyText>
            <PublicActionRow className="flex-col gap-3 sm:flex-row">
              <Button className="min-h-12 rounded-full px-6 tracking-[0.08em]" href="#vacancy-list">
                Смотреть вакансии
                <ArrowUpRight size={18} />
              </Button>
              <Button className="min-h-12 px-6 tracking-[0.08em]" href="#vacancy-submission" variant="secondary">
                Разместить вакансию
              </Button>
            </PublicActionRow>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[26px] border border-black/10 bg-[rgba(255,250,244,0.8)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Я ищу работу</p>
                <h2 className="mt-4 text-[1.4rem] font-semibold leading-8 text-[var(--text)] md:text-[1.55rem]">
                  Смотреть роли и откликнуться
                </h2>
                <p className="mt-3 max-w-[34ch] text-sm leading-7 text-[var(--muted)]">
                  Отклик открывается на странице конкретной вакансии, чтобы заявка сразу была привязана к роли.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button className="rounded-full px-5" href="#vacancy-list" size="sm">
                    Смотреть вакансии
                  </Button>
                </div>
              </div>
              <div className="rounded-[26px] border border-black/10 bg-[rgba(255,250,244,0.8)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Я ищу сотрудника</p>
                <h2 className="mt-4 text-[1.4rem] font-semibold leading-8 text-[var(--text)] md:text-[1.55rem]">
                  Разместить вакансию и получить отклики
                </h2>
                <p className="mt-3 max-w-[34ch] text-sm leading-7 text-[var(--muted)]">
                  Отправьте роль, условия и контакт. Если понадобится, команда поможет уточнить детали перед публикацией.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button className="rounded-full px-5" href="#vacancy-submission" size="sm">
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
      <VacancyApplicationForms
        enabled={applicationFormsEnabled}
        options={formOptions}
        result={applicationResult}
        utm={applicationUtm}
      />
    </>
  );
}
