import type { Metadata } from 'next';

import { Suspense } from 'react';
import { ArrowUpRight, BarChart2, Clock, Monitor, User } from 'lucide-react';
import { CategoryType } from '@/modules/content/shared/types';
import { AppLink } from '@/components/ui/app-link';
import { EditorialCard } from '@/components/ui/cards';
import { metaGroupValue } from '@/components/public/published-content-section-builders';
import { PublishedContentSectionCourse } from '@/components/public/published-content-section';
import { EducationFilterBar } from '@/components/public/education-filter-bar';
import { PublicPrelaunchSection } from '@/components/public/public-prelaunch-section';
import { EducationHeroActions } from '@/app/(public)/education/education-hero-actions';
import { PageHero } from '@/components/public/page-hero';
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

function EducationHero() {
  return (
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/education', 'Обучение')} />
      <PageHero
        title="Обучение"
        subtitle="Курсы, мастер-классы и практические программы для специалистов кофейной индустрии."
        tone="graphite"
      >
        <EducationHeroActions />
      </PageHero>
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
          {items.map((item, i) => {
            const href = `${basePath}/${item.slug}`;
            const instructor = metaGroupValue(item, 'Преподаватель');
            const duration = metaGroupValue(item, 'Длительность');
            const level = metaGroupValue(item, 'Уровень');
            const format = metaGroupValue(item, 'Формат');
            const hasMeta = Boolean(instructor || duration || level || format);
            return (
              <EditorialCard
                action={{ href: `${href}#course-request`, label: 'Подробнее' }}
                eyebrow={item.label ?? undefined}
                href={href}
                isFeatured={i === 0}
                key={item.id}
                media={item.imageUrl ? { kind: 'image' as const, src: item.imageUrl } : undefined}
                meta={hasMeta ? (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                    {instructor ? <span className="flex items-center gap-1"><User aria-hidden="true" className="shrink-0 text-[var(--accent)]" size={12} />{instructor}</span> : null}
                    {duration ? <span className="flex items-center gap-1"><Clock aria-hidden="true" className="shrink-0 text-[var(--accent)]" size={12} />{duration}</span> : null}
                    {level ? <span className="flex items-center gap-1"><BarChart2 aria-hidden="true" className="shrink-0 text-[var(--accent)]" size={12} />{level}</span> : null}
                    {format ? <span className="flex items-center gap-1"><Monitor aria-hidden="true" className="shrink-0 text-[var(--accent)]" size={12} />{format}</span> : null}
                  </div>
                ) : undefined}
                summary={item.summary ?? undefined}
                title={item.title}
              />
            );
          })}
        </div>
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

      {isPrelaunchEmpty ? (
        <PublicPrelaunchSection
          actions={[
            { href: '/contacts?topic=education-program#contact-form', label: 'Предложить программу' },
            { href: '/contacts?topic=education-launch#contact-form', label: 'Связаться с нами', variant: 'secondary' }
          ]}
          badges={['Раздел уже принимает заявки', 'Подходит для открытых и корпоративных форматов']}
          cards={[
            {
              title: 'Интенсивы и мастер-классы',
              description: 'Короткие практические форматы для бариста, менеджеров и команд.'
            },
            {
              title: 'Корпоративное обучение',
              description: 'Программы под запуск, адаптацию команды и развитие внутренних стандартов.'
            },
            {
              title: 'Онлайн и долгие программы',
              description: 'Лекции, циклы занятий и системные треки с записью или набором.'
            }
          ]}
          description="Добавьте программу, если она помогает специалистам или командам заведений развивать навыки в барной индустрии."
          eyebrow="Обучение"
          title="Какие программы можно добавить"
        />
      ) : null}

    </>
  );
}
