import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CategoryType } from '@prisma/client';
import { Building2, ClipboardList, GraduationCap, Headphones, MonitorPlay, Zap } from 'lucide-react';
import { EducationApplicationForms } from '@/components/public/education-application-forms';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PlatformFormatCard, ToolTeaser } from '@/components/public/platform-ui';
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
import { getPublishedCourses, type PublicContentSearchParams } from '@/lib/public/content';
import { getCourseFilterOptions, getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';
import { getEnv } from '@/lib/validation/env';

type EducationPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'Образование',
  description: 'Программы, интенсивы и практические занятия BARSYNERGY.'
};

const educationFormats = [
  {
    label: 'Интенсив',
    title: 'Интенсив для специалистов',
    description: 'Короткий практический формат по сервису, меню, технике и работе с гостем.',
    audience: 'Для специалистов и руководителей, которым нужен быстрый результат.',
    outcome: 'Концентрированная программа и работа над реальным кейсом.',
    icon: Zap,
    meta: ['Скоро на платформе']
  },
  {
    label: 'Лекция',
    title: 'Лекция или разбор',
    description: 'Встреча по одной теме: продукт, команда, сезон, сервис или операционная задача.',
    audience: 'Для тех, кто хочет быть в курсе трендов и получать новые инсайты.',
    outcome: 'Актуальные знания от лидеров индустрии в удобном формате.',
    icon: MonitorPlay,
    meta: ['Скоро на платформе']
  },
  {
    label: 'Команда',
    title: 'Корпоративное обучение',
    description: 'Программа под конкретное заведение, смену, запуск или внутреннюю задачу команды.',
    audience: 'Для команд и компаний, которым важно расти вместе.',
    outcome: 'Индивидуальная программа под задачи бизнеса.',
    icon: Building2,
    meta: ['Скоро на платформе']
  },
  {
    label: 'Меню',
    title: 'Разбор меню',
    description: 'Практическая сессия по напиткам, себестоимости, сезонным позициям и подаче.',
    audience: 'Для шефов, бар-менеджеров и концепт-команд.',
    outcome: 'Экспертная оценка меню и рекомендации по улучшению.',
    icon: ClipboardList,
    meta: ['Скоро на платформе']
  },
  {
    label: 'Сервис',
    title: 'Сервисная сессия',
    description: 'Работа со стандартами, гостевым опытом, сменой и понятными действиями команды.',
    audience: 'Для команд зала и сервиса, стремящихся к уровню.',
    outcome: 'Разбор сервиса, стандартов и клиентского опыта.',
    icon: Headphones,
    meta: ['Скоро на платформе']
  },
  {
    label: 'Управление',
    title: 'Программа для управляющих',
    description: 'Формат для тех, кто отвечает за людей, процессы, закупки и развитие точки.',
    audience: 'Для управляющих ресторанов и операционных лидеров.',
    outcome: 'Системный подход к управлению, финансам и команде.',
    icon: GraduationCap,
    meta: ['Скоро на платформе']
  }
] as const;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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
  const isEmpty = content.total === 0;

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
          { value: 'Практика', label: 'прикладной формат' }
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
        primaryLink={{ label: 'Запросить обучение', href: '#applications' }}
        secondaryLink={{ label: 'Посмотреть события', href: '/events' }}
      />
      <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[minmax(16rem,0.58fr)_minmax(0,1.42fr)]">
          <div className="xl:sticky xl:top-24 xl:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Форматы</p>
            <h2 className="mt-4 max-w-sm text-[2.4rem] font-semibold uppercase leading-[0.98] tracking-[-0.02em] text-[var(--text)]">
              Что можно собрать
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {educationFormats.map((format) => (
              <PlatformFormatCard
                key={format.title}
                {...format}
                action={{
                  href: `/education?courseTitle=${encodeURIComponent(format.title)}#applications`,
                  label: 'Запросить'
                }}
              />
            ))}
          </div>
        </div>
      </section>
      {isEmpty ? (
        <PublicPrelaunchSection
          actions={[
            { href: '#applications', label: 'Запросить обучение' },
            { href: '/contacts?topic=education-program', label: 'Предложить тему', variant: 'secondary' },
            { href: '/contacts?topic=education-launch', label: 'Узнать о запуске', variant: 'secondary' },
            { href: '/events', label: 'Посмотреть события', variant: 'ghost' }
          ]}
          badges={['Скоро здесь появятся первые программы', 'Заявки на обучение уже открыты']}
          cards={[
            {
              title: 'Интенсивы для специалистов',
              description: 'Практические занятия по сервису, меню, технике и работе с гостем.'
            },
            {
              title: 'Корпоративное обучение для команд',
              description: 'Программа под конкретное заведение, смену, запуск или внутреннюю задачу.'
            },
            {
              title: 'Лекции и разборы',
              description: 'Короткие образовательные встречи с экспертами и практиками индустрии.'
            }
          ]}
          description="Сейчас мы собираем первые программы. Пока можно оставить заявку, описать задачу команды или предложить тему для запуска."
          eyebrow="Pre-launch / Образование"
          title="Раздел уже принимает запросы"
        />
      ) : (
        <>
          <Suspense
            fallback={
              <section className="border-b border-black/10 bg-[var(--surface-muted)] py-6">
                <div className="container">
                  <div aria-hidden="true" className="h-14 animate-pulse rounded-[var(--radius-lg)] bg-black/6" />
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
      <ToolTeaser />
      <EducationApplicationForms
        cities={cities}
        defaults={{ courseTitle }}
        enabled={applicationFormsEnabled}
        result={applicationResult}
        utm={applicationUtm}
      />
    </>
  );
}
