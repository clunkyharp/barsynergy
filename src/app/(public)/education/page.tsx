import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import { ArrowUpRight, HelpCircle, Plus } from 'lucide-react';
import { CategoryType } from '@/modules/content/shared/types';
import { ProgramFormatMatrix } from '@/components/public/editorial-display-primitives';
import { Button } from '@/components/ui/button';
import { AppLink } from '@/components/ui/app-link';
import { CourseGridCard } from '@/components/public/course-grid-card';
import { PublicBreadcrumbs } from '@/components/public/public-primitives';
import { PublishedContentSectionCourse } from '@/components/public/published-content-section';
import { EducationBenefitsStrip } from '@/components/public/education-benefits-strip';
import { EducationFilterBar } from '@/components/public/education-filter-bar';
import { JsonLd } from '@/components/seo/json-ld';
import { stripPublicApplicationResultParams } from '@/lib/applications/public-form-helpers';
import { getPublishedCourses, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getCourseFilterOptions, getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';
import { displayFont } from '@/lib/fonts';
import type { PublishedContentItem } from '@/lib/public/content';
import { cn } from '@/lib/utils';

type EducationPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Обучение',
  description: 'Обучение для бариста, управляющих и команд кофейных баров.',
  path: '/education'
});

const FEATURED_COUNT = 4;

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
  if (format.formType === 'corporate') return 'Описать задачу команды';
  if (format.formType === 'certificate') return 'Заказать сертификат';
  if (format.label === 'Интенсив') return 'Записаться на интенсив';
  if (format.label === 'Лекция') return 'Записаться на разбор';
  if (format.label === 'Меню') return 'Записаться на разбор меню';
  if (format.label === 'Сервис') return 'Записаться на сессию';
  if (format.label === 'Управление') return 'Записаться на программу';
  return 'Описать задачу обучения';
}

function EducationHero() {
  return (
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/education', 'Обучение')} />
      <section className="relative isolate overflow-hidden border-b border-[var(--line)] bg-[var(--editorial-dark-surface)] text-[var(--editorial-dark-text)]">
        {/* Background image — full-width cover */}
        <Image
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
          fill
          priority
          sizes="100vw"
          src="/images/home/education-hero.png"
        />
        {/* Subtle overlay: keeps text readable on left, image visible across full width */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,9,8,0.82)_0%,rgba(10,9,8,0.60)_40%,rgba(10,9,8,0.22)_70%,rgba(10,9,8,0.08)_100%)]"
        />
        <div className="container relative z-10">
          <div className="flex min-h-[360px] max-w-xl flex-col justify-center pt-3 pb-10 md:min-h-[400px] md:pt-3 md:pb-14">
            <PublicBreadcrumbs current="Обучение" />
            <h1
              className={cn(
                displayFont.className,
                'mt-4 text-[clamp(2.4rem,5.5vw,4.2rem)] font-semibold leading-none'
              )}
            >
              Обучение
            </h1>
            <p className="mt-4 text-[15px] leading-7 text-white/65">
              Курсы, мастер-классы и практические программы для специалистов кофейной индустрии.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                className="gap-2 rounded-[var(--radius-md)]"
                href="/contacts?topic=education-program#contact-form"
              >
                <Plus aria-hidden="true" size={15} />
                Добавить программу
              </Button>
              <Button
                className="gap-2 rounded-[var(--radius-md)] border-white/20 text-white hover:border-white/40 hover:bg-white/8"
                href="#education-formats"
                variant="secondary"
              >
                <HelpCircle aria-hidden="true" size={15} />
                Как это работает?
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function EducationFeaturedSection({
  items,
  basePath
}: {
  items: PublishedContentItem[];
  basePath: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="border-b border-[var(--line)] bg-[var(--surface)] py-10 md:py-14">
      <div className="container">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className={cn(displayFont.className, 'text-[1.5rem] font-semibold leading-none text-[var(--text)]')}>
            Рекомендуем
          </h2>
          <AppLink
            className="flex items-center gap-1 text-sm font-semibold text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)] hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] motion-reduce:transition-none"
            href={basePath}
          >
            Смотреть все
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.8} />
          </AppLink>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <CourseGridCard
              actionLabel="Подробнее"
              basePath={basePath}
              isFeatured={i === 0}
              item={item}
              key={item.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
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
  const featuredItems = !hasActiveFilters && content.page === 1
    ? content.items.slice(0, FEATURED_COUNT)
    : [];
  const excludedIds = featuredItems.map((item) => item.id);
  const isPrelaunchEmpty = isEmpty && !hasActiveFilters;

  return (
    <>
      <EducationHero />

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
            <EducationFilterBar
              basePath="/education"
              categories={categories}
              cities={filterCities}
              formats={filterOptions.formats}
              levels={filterOptions.levels}
            />
          </Suspense>

          <EducationFeaturedSection
            basePath="/education"
            items={featuredItems}
          />

          <PublishedContentSectionCourse
            basePath="/education"
            content={content}
            countLabel="Все программы"
            emptyDescription="Список пока пуст. Можно сразу написать, какое обучение вам нужно."
            emptyActions={[
              { href: '/contacts?topic=education-program#contact-form', label: 'Предложить программу' },
              { href: '/contacts?topic=education-launch#contact-form', label: 'Написать о запуске', variant: 'secondary' },
              { href: '/contacts', label: 'Связаться с командой', variant: 'secondary' }
            ]}
            emptyTitle="Программ пока нет"
            excludedItemIds={excludedIds}
            rowActionLabel="Записаться"
            sectionId="education-list"
            secondaryEmptyActions={[
              { href: '/contacts?topic=education-program#contact-form', label: 'Написать' }
            ]}
            secondaryEmptyDescription="Напишите нам, если нужен другой формат."
            secondaryEmptyTitle="Больше программ скоро"
            title="Программы"
          />
        </>
      ) : null}

      <EducationFormatsGrid />

      {isPrelaunchEmpty ? (
        <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-16">
          <div className="container text-center">
            <p className="text-[var(--muted)]">Конкретные программы с датами и записью скоро появятся. Напишите нам, если хотите попасть на ближайший запуск.</p>
            <Button className="mt-6" href="/contacts?topic=education-program#contact-form">
              Предложить программу
            </Button>
          </div>
        </section>
      ) : null}

      <EducationBenefitsStrip />
    </>
  );
}
