import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CategoryType } from '@prisma/client';
import { Building2, ClipboardList, Gift, GraduationCap, Headphones, MonitorPlay, Zap } from 'lucide-react';
import { EducationApplicationForms } from '@/components/public/education-application-forms';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PlatformFormatCard } from '@/components/public/platform-ui';
import { PublicFeaturedContent } from '@/components/public/public-featured-content';
import { PublicFilters } from '@/components/public/public-filters';
import { PublicPrelaunchSection } from '@/components/public/public-prelaunch-section';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import {
  getPublicApplicationResult,
  getPublicApplicationUtm,
  stripPublicApplicationResultParams
} from '@/lib/applications/public-form-helpers';
import { displayFont } from '@/lib/fonts';
import { getPublishedCourses, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getCourseFilterOptions, getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';
import { getEnv } from '@/lib/validation/env';

type EducationPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'Образование',
  description: 'Программы, интенсивы и практические занятия BARSYNERGY.'
};

type EducationFormType = 'course' | 'corporate' | 'certificate';

const educationFormats = [
  {
    label: 'Интенсив',
    title: 'Интенсив для специалистов',
    description: 'Короткий практический формат по сервису, меню, технике и работе с гостем.',
    audience: 'Для специалистов и руководителей, которым нужен быстрый результат.',
    outcome: 'Концентрированная программа и работа над реальным кейсом.',
    icon: Zap,
    formType: 'course',
    meta: []
  },
  {
    label: 'Лекция',
    title: 'Лекция или разбор',
    description: 'Встреча по одной теме: продукт, команда, сезон, сервис или операционная задача.',
    audience: 'Для тех, кому нужен короткий разбор одной рабочей темы.',
    outcome: 'Короткая встреча с понятной темой и ответами на вопросы.',
    icon: MonitorPlay,
    formType: 'course',
    meta: []
  },
  {
    label: 'Команда',
    title: 'Корпоративное обучение',
    description: 'Программа под конкретное заведение, смену, запуск или внутреннюю задачу команды.',
    audience: 'Для команд и компаний, которым нужно учиться вместе.',
    outcome: 'Программа под задачи заведения и уровень команды.',
    icon: Building2,
    formType: 'corporate',
    meta: []
  },
  {
    label: 'Меню',
    title: 'Разбор меню',
    description: 'Практическая сессия по напиткам, себестоимости, сезонным позициям и подаче.',
    audience: 'Для шефов, бар-менеджеров и концепт-команд.',
    outcome: 'Разбор меню и список понятных правок.',
    icon: ClipboardList,
    formType: 'course',
    meta: []
  },
  {
    label: 'Сервис',
    title: 'Сервисная сессия',
    description: 'Работа со стандартами, гостевым опытом, сменой и понятными действиями команды.',
    audience: 'Для команд зала и сервиса, которым нужно выровнять работу смены.',
    outcome: 'Разбор сервиса, стандартов и действий в смене.',
    icon: Headphones,
    formType: 'course',
    meta: []
  },
  {
    label: 'Управление',
    title: 'Программа для управляющих',
    description: 'Программа для управляющих: команда, закупки, деньги и процессы.',
    audience: 'Для управляющих ресторанов и тех, кто отвечает за работу точки.',
    outcome: 'Понятный план по команде, закупкам, деньгам и процессам.',
    icon: GraduationCap,
    formType: 'course',
    meta: []
  },
  {
    label: 'Подарок',
    title: 'Сертификат на обучение',
    description: 'Подарочный сертификат на занятие, интенсив или программу для команды.',
    audience: 'Для тех, кто хочет подарить обучение специалисту или команде.',
    outcome: 'Сертификат под нужный формат и сумму.',
    icon: Gift,
    formType: 'certificate',
    meta: []
  }
] as const satisfies readonly {
  label: string;
  title: string;
  description: string;
  audience: string;
  outcome: string;
  icon: typeof Zap;
  formType: EducationFormType;
  meta: readonly string[];
}[];

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getEducationFormType(value: string | string[] | undefined, courseTitle?: string): EducationFormType | undefined {
  const formType = firstParam(value);

  if (formType === 'course' || formType === 'corporate' || formType === 'certificate') {
    return formType;
  }

  return courseTitle?.trim() ? 'course' : undefined;
}

function getEducationApplicationHref(format: (typeof educationFormats)[number]) {
  const params = new URLSearchParams({ formType: format.formType });

  if (format.formType === 'course') {
    params.set('courseTitle', format.title);
  }

  if (format.formType === 'corporate') {
    params.set('trainingRequest', `Нужно обучение для команды: ${format.title}.`);
  }

  return `/education?${params.toString()}#applications`;
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
  const [cities] = await Promise.all([getApplicationCityOptions()]);
  const featuredItem = content.page === 1 ? content.items[0] : undefined;
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());
  const applicationResult = getPublicApplicationResult(params);
  const applicationUtm = getPublicApplicationUtm(params);
  const courseTitle = firstParam(params.courseTitle);
  const trainingRequest = firstParam(params.trainingRequest);
  const formType = getEducationFormType(params.formType, courseTitle);
  const hasSelectedEducationFormat = Boolean(formType || applicationResult);
  const isEmpty = content.total === 0;
  const hasActiveFilters = hasActivePublicContentParams(contentParams, ['q', 'category', 'city', 'format', 'level']);
  const isPrelaunchEmpty = isEmpty && !hasActiveFilters;

  return (
    <>
      <EditorialPublicPage
        eyebrow="Образование"
        title="Программы, интенсивы и практические занятия"
        description="Обучение для специалистов и команд: от мастер-классов до корпоративных программ."
        summary="Можно выбрать очные занятия, материалы для самостоятельной работы или обучение под команду."
        metrics={[
          { value: '3', label: 'формата обучения' },
          { value: 'СКФО', label: 'региональный фокус' },
          { value: 'Практика', label: 'работа с задачами' }
        ]}
        rows={[
          {
            label: 'Формат',
            title: 'Интенсивы и мастер-классы',
            description: 'Короткие очные занятия для практики, дегустаций и работы в команде.'
          },
          {
            label: 'Формат',
            title: 'Онлайн-лекции и материалы',
            description: 'Материалы для самостоятельного обучения и повторения базы.'
          },
          {
            label: 'Формат',
            title: 'Корпоративное обучение',
            description: 'Программы для команд: сервис, бар, меню, продажи и внутренняя подготовка.'
          }
        ]}
        primaryLink={{ label: 'Выбрать формат', href: '#education-formats' }}
        secondaryLink={{ label: 'Посмотреть события', href: '/events' }}
      />
      <section className="background-zone background-zone-beige editorial-grid border-b border-[var(--line)] py-10 md:py-14" id="education-formats">
        <div className="container grid gap-8 xl:grid-cols-[minmax(16rem,0.58fr)_minmax(0,1.42fr)]">
          <div className="xl:sticky xl:top-24 xl:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Форматы</p>
            <h2 className={`${displayFont.className} mt-4 max-w-sm text-[2.8rem] font-semibold leading-none tracking-normal text-[var(--text)]`}>
              Какие форматы есть
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {educationFormats.map((format) => (
              <PlatformFormatCard
                key={format.title}
                {...format}
                action={{
                  href: getEducationApplicationHref(format),
                  label: 'Запросить'
                }}
              />
            ))}
          </div>
        </div>
      </section>
      {isPrelaunchEmpty ? (
        <PublicPrelaunchSection
          actions={[
            { href: getEducationApplicationHref(educationFormats[0]), label: 'Запросить интенсив' },
            { href: '/contacts?topic=education-program', label: 'Предложить тему', variant: 'secondary' },
            { href: '/events', label: 'Посмотреть события', variant: 'ghost' }
          ]}
          badges={[]}
          cards={[
            {
              title: 'Интенсивы для специалистов',
              description: 'Практические занятия по сервису, меню, технике и работе с гостем.',
              details: [
                { label: 'Формат', value: 'интенсив' },
                { label: 'Для кого', value: 'специалисты и руководители смен' },
                { label: 'Статус', value: 'принимаем запросы' }
              ],
              hint: 'Можно запросить тему и город.'
            },
            {
              title: 'Корпоративное обучение для команд',
              description: 'Программа под конкретное заведение, смену, запуск или внутреннюю задачу.',
              details: [
                { label: 'Формат', value: 'командная программа' },
                { label: 'Для кого', value: 'заведения и барные команды' },
                { label: 'Статус', value: 'собираем задачи' }
              ],
              hint: 'Опишите задачу команды.'
            },
            {
              title: 'Лекции и разборы',
              description: 'Короткие встречи с экспертами и практиками индустрии.',
              details: [
                { label: 'Формат', value: 'лекция или разбор' },
                { label: 'Для кого', value: 'специалисты и владельцы' },
                { label: 'Статус', value: 'принимаем темы' }
              ],
              hint: 'Предложите тему для запуска.'
            }
          ]}
          description="Сейчас мы собираем первые программы. Пока можно оставить заявку, описать задачу команды или предложить тему для запуска."
          eyebrow="Раздел готовится"
          title="Раздел уже принимает запросы"
        />
      ) : (
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
            actionLabel="Открыть программу"
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
              { href: '/contacts?topic=education-program', label: 'Предложить программу' },
              { href: '/contacts?topic=education-launch', label: 'Получить уведомление о запуске', variant: 'secondary' },
              { href: '/contacts', label: 'Связаться с командой', variant: 'secondary' }
            ]}
            emptyTitle="Программ пока нет"
            excludedItemIds={featuredItem ? [featuredItem.id] : []}
            rowActionLabel="Открыть программу"
            sectionId="education-list"
            title="Программы"
          />
        </>
      )}
      {hasSelectedEducationFormat ? (
        <EducationApplicationForms
          cities={cities}
          defaults={{ courseTitle, formType, trainingRequest }}
          enabled={applicationFormsEnabled}
          result={applicationResult}
          utm={applicationUtm}
        />
      ) : null}
    </>
  );
}
