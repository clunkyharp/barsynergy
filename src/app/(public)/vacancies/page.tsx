import type { Metadata } from 'next';
import { CategoryType } from '@prisma/client';
import { ArrowUpRight } from 'lucide-react';
import { ProcessStepsInline } from '@/components/public/editorial-display-primitives';
import { PublicActionRow, PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { RequestDisclosureTrigger } from '@/components/public/request-disclosure';
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

const moderationSteps = [
  {
    title: 'Отправка',
    description: 'Работодатель отправляет роль, условия, город, график и контакт для связи.'
  },
  {
    title: 'Проверка',
    description: 'Команда смотрит, хватает ли кандидату данных о роли, графике, условиях и контакте.'
  },
  {
    title: 'Уточнение',
    description: 'Если нужно, просим добавить зарплатный диапазон, обязанности или формат занятости.'
  },
  {
    title: 'Публикация',
    description: 'После проверки вакансия появляется в списке и получает отдельную страницу.'
  },
  {
    title: 'Отклики',
    description: 'Кандидаты откликаются с привязкой к конкретной роли, без повторного выбора вакансии.'
  }
] as const;

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
              <RequestDisclosureTrigger
                className="min-h-12 w-full max-w-[15rem] rounded-[var(--radius-md)] px-6 tracking-normal sm:w-auto"
                targetId="submit-vacancy"
                variant="secondary"
              >
                Разместить вакансию
              </RequestDisclosureTrigger>
            </PublicActionRow>
            <div className="mt-8 grid divide-y divide-[var(--line)] border-y border-[var(--line)] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              <div className="py-5 lg:pr-6">
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
              <div className="py-5 lg:pl-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Я ищу сотрудника</p>
                <h2 className={`${displayFont.className} mt-4 text-[1.8rem] font-semibold leading-none text-[var(--text)]`}>
                  Разместить вакансию для кандидатов
                </h2>
                <p className="mt-3 max-w-[34ch] text-sm leading-7 text-[var(--muted)]">
                  Отправьте роль, условия и контакт. Если понадобится, команда поможет уточнить детали перед публикацией.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <RequestDisclosureTrigger className="w-full max-w-[14rem] rounded-[var(--radius-md)] px-5 sm:w-auto" size="sm" targetId="submit-vacancy">
                    Разместить вакансию
                  </RequestDisclosureTrigger>
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
          { href: '#submit-vacancy', label: 'Разместить вакансию' },
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
        listAction={{ href: '#submit-vacancy', label: 'Разместить вакансию', variant: 'ghost' }}
        listLabel="Вакансии индустрии"
        rowVariant="opportunity"
        rowActionLabel="Откликнуться"
        sortLabel="Сначала новые"
        title="Открытые вакансии"
      />
      <section className="background-zone background-zone-beige border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <ProcessStepsInline
            className="border-0 py-0"
            description="Команда проверяет карточку перед публикацией, чтобы кандидат видел роль, город, график, условия и контакт."
            eyebrow="Проверка вакансий"
            steps={moderationSteps}
            title="Как вакансия попадает на сайт"
          />
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
