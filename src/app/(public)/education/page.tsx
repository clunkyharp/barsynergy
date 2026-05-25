import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CategoryType } from '@prisma/client';
import { ProgramFormatMatrix } from '@/components/public/editorial-display-primitives';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PublicFeaturedContent } from '@/components/public/public-featured-content';
import { PublicFilters } from '@/components/public/public-filters';
import { stripPublicApplicationResultParams } from '@/lib/applications/public-form-helpers';
import { getPublishedCourses, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getCourseFilterOptions, getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';

type EducationPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'Образование',
  description: 'Практические форматы обучения для специалистов и команд барной индустрии.'
};

type EducationFormType = 'course' | 'corporate' | 'certificate';

const educationFormats = [
  {
    label: 'Интенсив',
    title: 'Интенсив для специалистов',
    description: 'Короткий практический формат по сервису, меню, технике и работе с гостем.',
    audience: 'Для специалистов и руководителей, которым нужно быстро разобрать рабочую тему.',
    outcome: 'Концентрированная программа и работа над реальным кейсом.',
    formType: 'course',
    meta: []
  },
  {
    label: 'Лекция',
    title: 'Лекция или разбор',
    description: 'Встреча по одной теме: продукт, команда, сезон, сервис или задача заведения.',
    audience: 'Для тех, кому нужен короткий разбор одной рабочей темы.',
    outcome: 'Короткая встреча по выбранной теме и ответы на вопросы.',
    formType: 'course',
    meta: []
  },
  {
    label: 'Команда',
    title: 'Корпоративное обучение',
    description: 'Программа под заведение, смену, запуск или внутреннюю задачу команды.',
    audience: 'Для команд и компаний, которым нужно учиться вместе.',
    outcome: 'Программа под задачи заведения и уровень команды.',
    formType: 'corporate',
    meta: []
  },
  {
    label: 'Меню',
    title: 'Разбор меню',
    description: 'Практическая сессия по напиткам, себестоимости, сезонным позициям и подаче.',
    audience: 'Для шефов, бар-менеджеров и концепт-команд.',
    outcome: 'Разбор меню и список правок для запуска.',
    formType: 'course',
    meta: []
  },
  {
    label: 'Сервис',
    title: 'Сервисная сессия',
    description: 'Работа со стандартами, гостевым опытом, сменой и действиями команды.',
    audience: 'Для команд зала и сервиса, которым нужно договориться о работе смены.',
    outcome: 'Разбор сервиса, стандартов и действий в смене.',
    formType: 'course',
    meta: []
  },
  {
    label: 'Управление',
    title: 'Программа для управляющих',
    description: 'Программа для управляющих: команда, закупки, деньги и процессы.',
    audience: 'Для управляющих ресторанов и тех, кто отвечает за работу точки.',
    outcome: 'План по команде, закупкам, деньгам и процессам.',
    formType: 'course',
    meta: []
  },
  {
    label: 'Подарок',
    title: 'Сертификат на обучение',
    description: 'Подарочный сертификат на занятие, интенсив или программу для команды.',
    audience: 'Для подарка специалисту или команде.',
    outcome: 'Сертификат под нужный формат и сумму.',
    formType: 'certificate',
    meta: []
  }
] as const satisfies readonly {
  label: string;
  title: string;
  description: string;
  audience: string;
  outcome: string;
  formType: EducationFormType;
  meta: readonly string[];
}[];

function getEducationApplicationHref(format: (typeof educationFormats)[number]) {
  const params = new URLSearchParams({ topic: 'education-program', topicTitle: format.title });

  return `/contacts?${params.toString()}#contact-form`;
}

function getEducationActionLabel(format: (typeof educationFormats)[number]) {
  if (format.formType === 'corporate') {
    return 'Описать задачу команды';
  }

  if (format.formType === 'certificate') {
    return 'Заказать сертификат';
  }

  if (format.label === 'Интенсив') {
    return 'Записаться на интенсив';
  }

  if (format.label === 'Лекция') {
    return 'Записаться на разбор';
  }

  if (format.label === 'Меню') {
    return 'Записаться на разбор меню';
  }

  if (format.label === 'Сервис') {
    return 'Записаться на сессию';
  }

  if (format.label === 'Управление') {
    return 'Записаться на программу';
  }

  return 'Оставить заявку на обучение';
}

function EducationFormatsGrid() {
  return (
    <section className="background-zone background-zone-beige editorial-grid border-b border-[var(--line)] py-10 md:py-14" id="education-formats">
      <div className="container">
        <ProgramFormatMatrix
          className="border-0 py-0"
          description="Выберите разбор, интенсив, обучение для команды или сертификат. В каждой строке видно, кому подходит формат и что будет на выходе."
          eyebrow="Форматы"
          items={educationFormats.map((format) => ({
            action: {
              href: getEducationApplicationHref(format),
              label: getEducationActionLabel(format)
            },
            audience: format.audience,
            format: format.title,
            includes: format.description,
            result: format.outcome,
            status: 'Заявки принимаются'
          }))}
          title="Какие форматы есть"
        />
      </div>
    </section>
  );
}

export default async function EducationPage({ searchParams }: EducationPageProps) {
  const params = (await searchParams) ?? {};
  const contentParams = stripPublicApplicationResultParams(params);
  const [content, filterCities, categories, filterOptions] = await Promise.all([
    getPublishedCourses(contentParams),
    getPublicCityFilterOptions(),
    getPublicCategoryOptions(CategoryType.COURSE),
    getCourseFilterOptions()
  ]);
  const featuredItem = content.page === 1 ? content.items[0] : undefined;
  const isEmpty = content.total === 0;
  const hasActiveFilters = hasActivePublicContentParams(contentParams, ['q', 'category', 'city', 'format', 'level']);
  const isPrelaunchEmpty = isEmpty && !hasActiveFilters;

  return (
    <>
      <EditorialPublicPage
        eyebrow="Образование"
        title="Программы, интенсивы и практические занятия"
        description="Практические форматы для специалистов и команд: занятие, разбор, интенсив или программа под задачу заведения."
        summary="Можно выбрать очное занятие, материал для самостоятельной работы или обучение для команды."
        density="compact"
        metrics={[]}
        rows={[]}
        primaryLink={{ label: 'Посмотреть форматы обучения', href: '#education-formats' }}
        secondaryLink={{ label: 'Посмотреть события', href: '/events' }}
      />
      <EducationFormatsGrid />
      {!isPrelaunchEmpty ? (
        <>
          <Suspense
            fallback={
              <section className="border-b border-[var(--line)] bg-[var(--surface-muted)] py-6">
                <div className="container">
                  <div aria-hidden="true" className="h-14 animate-pulse rounded-[var(--radius-lg)] bg-[var(--skeleton-fill)]" />
                </div>
              </section>
            }
          >
            <PublicFilters
              categories={categories}
              cities={filterCities}
              description="Выберите программы по городу, формату и уровню подготовки."
              extraFilters={[
                { name: 'format', label: 'Все форматы', options: filterOptions.formats },
                { name: 'level', label: 'Все уровни', options: filterOptions.levels }
              ]}
            />
          </Suspense>
          <PublicFeaturedContent
            actionLabel="Смотреть программу"
            basePath="/education"
            eyebrow="Рекомендуем"
            item={featuredItem}
            title="Программа в фокусе"
          />
          <PublishedContentSection
            basePath="/education"
            content={content}
            countLabel="Программ в списке"
            emptyDescription="Список пока пуст. Можно сразу написать, какое обучение вам нужно."
            emptyActions={[
              { href: '/contacts?topic=education-program#contact-form', label: 'Предложить программу' },
              { href: '/contacts?topic=education-launch#contact-form', label: 'Написать о запуске', variant: 'secondary' },
              { href: '/contacts', label: 'Связаться с командой', variant: 'secondary' }
            ]}
            emptyTitle="Программ пока нет"
            excludedItemIds={featuredItem ? [featuredItem.id] : []}
            rowActionLabel="Смотреть программу"
            sectionId="education-list"
            title="Программы"
          />
        </>
      ) : null}
    </>
  );
}
