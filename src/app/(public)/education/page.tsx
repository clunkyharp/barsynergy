import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BookOpen } from 'lucide-react';
import { CategoryType } from '@prisma/client';
import { ProgramFormatMatrix } from '@/components/public/editorial-display-primitives';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { Button } from '@/components/ui/button';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PublicFeaturedContent } from '@/components/public/public-featured-content';
import { PublicFilters } from '@/components/public/public-filters';
import { stripPublicApplicationResultParams } from '@/lib/applications/public-form-helpers';
import { getPublishedCourses, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getCourseFilterOptions, getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';
import { buildPublicPageMetadata } from '@/lib/public/metadata';

type EducationPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Обучение',
  description: 'Обучение для бариста, управляющих и команд кофейных баров.',
  path: '/education'
});

type EducationFormType = 'course' | 'corporate' | 'certificate';

const educationFormats = [
  {
    label: 'Интенсив',
    title: 'Интенсив для бариста',
    description: 'Разберёте параметры экстракции, настроите помол под зерно и отработаете стабильный эспрессо.',
    audience: 'Для бариста, которые работают за стойкой и хотят точнее управлять вкусом.',
    outcome: 'Понятный рецепт, контроль помола и повторяемая чашка на смене.',
    formType: 'course',
    meta: []
  },
  {
    label: 'Лекция',
    title: 'Лекция или каппинг-разбор',
    description: 'Одна тема за встречу: зерно, обработка, молоко, сервис или сезонное меню.',
    audience: 'Для специалистов и команд, которым нужен быстрый профессиональный разбор.',
    outcome: 'Конспект, ответы на вопросы и список действий для следующей смены.',
    formType: 'course',
    meta: []
  },
  {
    label: 'Команда',
    title: 'Корпоративное обучение',
    description: 'Программа под кофейный бар: эспрессо, молочные напитки, стандарты смены и контроль качества.',
    audience: 'Для владельцев и управляющих, которые обучают команду целиком.',
    outcome: 'Единый протокол напитков, смены и проверки результата.',
    formType: 'corporate',
    meta: []
  },
  {
    label: 'Меню',
    title: 'Разбор меню',
    description: 'Практическая сессия по эспрессо, фильтру, авторским напиткам, себестоимости и подаче.',
    audience: 'Для шефов, бар-менеджеров и концепт-команд.',
    outcome: 'Разбор меню и список правок для запуска.',
    formType: 'course',
    meta: []
  },
  {
    label: 'Сервис',
    title: 'Сервисная сессия',
    description: 'Работа со стандартами смены, скоростью выдачи, коммуникацией с гостем и качеством напитка.',
    audience: 'Для команд зала и сервиса, которым нужно договориться о работе смены.',
    outcome: 'Разбор сервиса, стандартов и действий в смене.',
    formType: 'course',
    meta: []
  },
  {
    label: 'Управление',
    title: 'Программа для управляющих',
    description: 'Команда, закупки зерна и молока, списания, себестоимость и операционные процессы.',
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

  return 'Описать задачу обучения';
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
  const isEmpty = content.total === 0;
  const hasActiveFilters = hasActivePublicContentParams(contentParams, ['q', 'category', 'city', 'format', 'level']);
  const featuredItem = !hasActiveFilters && content.page === 1 ? content.items[0] : undefined;
  const isPrelaunchEmpty = isEmpty && !hasActiveFilters;

  return (
    <>
      <EditorialPublicPage
        eyebrow="Обучение"
        path="/education"
        title="Обучение"
        description="Интенсивы, каппинг-разборы и командные сессии для кофейных баров."
        summary="Выберите формат или откройте фильтры опубликованных программ."
        chips={['Бариста', 'Команды', 'Управляющие', 'Сертификаты']}
        density="compact"
        metrics={[]}
        rows={[]}
        primaryLink={{ label: 'Посмотреть форматы обучения', href: '#education-formats' }}
        accentGradient="radial-gradient(ellipse 90% 60% at 50% 10%, rgba(80,180,120,0.14), transparent)"
        accentIcon={BookOpen}
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
              variant="sidebar"
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
            secondaryEmptyActions={[
              { href: '/contacts?topic=education-program#contact-form', label: 'Написать' }
            ]}
            secondaryEmptyDescription="Напишите нам, если нужен другой формат."
            secondaryEmptyTitle="Больше программ скоро"
            title="Программы"
          />
        </>
      ) : (
        <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-16">
          <div className="container text-center">
            <p className="text-[var(--muted)]">Первые программы готовятся к публикации.</p>
            <Button className="mt-6" href="/contacts?topic=education-program#contact-form">
              Предложить программу
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
