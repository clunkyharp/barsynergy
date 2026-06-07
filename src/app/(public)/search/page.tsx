import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublicBodyText, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import {
  getPublishedArticles,
  getPublishedCourses,
  getPublishedEvents,
  getPublishedPartners,
  getPublishedSuppliers,
  getPublishedVacancies,
  type PublishedContentItem,
  type PublishedContentList,
  type PublicContentSearchParams
} from '@/lib/public/content';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';
import { JsonLd } from '@/components/seo/json-ld';

type SearchPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

type SearchResultsSectionProps = {
  title: string;
  description: string;
  basePath: string;
  actionLabel: string;
  content: PublishedContentList;
  query: string;
};

export const metadata: Metadata = {
  title: 'Поиск',
  description: 'Поиск по вакансиям, поставщикам, материалам, обучению, событиям и партнёрам BARSYNERGY.',
  robots: {
    index: false,
    follow: true
  }
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function searchQuery(params: PublicContentSearchParams) {
  return firstParam(params.q)?.trim() ?? '';
}

function sectionHref(basePath: string, query: string) {
  const params = new URLSearchParams({ q: query });
  return `${basePath}?${params.toString()}`;
}

function detailHref(basePath: string, item: PublishedContentItem) {
  return `${basePath}/${item.slug}`;
}

function isPublishedContentList(value: PublishedContentList | undefined): value is PublishedContentList {
  return Boolean(value);
}

function SearchResultRow({
  item,
  basePath,
  actionLabel
}: {
  item: PublishedContentItem;
  basePath: string;
  actionLabel: string;
}) {
  return (
    <li className="border-t border-[var(--line)] first:border-t-0">
      <a
        className="group grid gap-2 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
        href={detailHref(basePath, item)}
      >
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {item.label ?? 'Материал'}
            </span>
            {item.subtitle ? (
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">{item.subtitle}</span>
            ) : null}
          </span>
          <span className="mt-1 block text-lg font-semibold leading-7 text-[var(--text)] group-hover:text-[var(--accent)]">
            {item.title}
          </span>
          <span className="mt-1 block text-sm leading-6 text-[var(--muted)] line-clamp-2">{item.summary}</span>
          {item.meta.length > 0 ? (
            <span className="mt-2 flex flex-wrap gap-2">
              {item.meta.slice(0, 3).map((entry) => (
                <MetaChip className="border-[var(--border-subtle)] bg-transparent text-[var(--muted)]" key={entry} variant="filter">
                  {entry}
                </MetaChip>
              ))}
            </span>
          ) : null}
        </span>
        <span className="text-sm font-semibold text-[var(--accent)]">{actionLabel}</span>
      </a>
    </li>
  );
}

function SearchResultsSection({
  title,
  description,
  basePath,
  actionLabel,
  content,
  query
}: SearchResultsSectionProps) {
  return (
    <Panel className="border-[var(--border-default)] bg-[var(--surface-card)]" padding="none">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] p-4 md:p-5">
        <div className="min-w-0">
          <PublicEyebrow tone="muted">{title}</PublicEyebrow>
          <PublicBodyText className="mt-2 max-w-2xl text-sm leading-6">{description}</PublicBodyText>
        </div>
        <MetaChip className="border-[var(--border-default)] bg-[var(--accent-soft)] text-[var(--accent)]" variant="filter">
          {content.total}
        </MetaChip>
      </div>
      {content.items.length > 0 ? (
        <ul className="px-5">
          {content.items.map((item) => (
            <SearchResultRow actionLabel={actionLabel} basePath={basePath} item={item} key={item.id} />
          ))}
        </ul>
      ) : (
        <div className="p-5">
          <PublicBodyText className="text-sm leading-6">Ничего не найдено в этом разделе.</PublicBodyText>
        </div>
      )}
      <div className="border-t border-[var(--line)] p-4 md:p-5">
        <Button className="min-h-11 rounded-[var(--radius-md)] px-5 tracking-normal" href={sectionHref(basePath, query)} variant="secondary">
          Смотреть раздел
        </Button>
      </div>
    </Panel>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = (await searchParams) ?? {};
  const q = searchQuery(params);
  const searchParamsForLists = { q, pageSize: '4' };
  const hasQuery = q.length > 0;
  const [vacancies, suppliers, articles, courses, events, partners] = hasQuery
    ? await Promise.all([
        getPublishedVacancies(searchParamsForLists),
        getPublishedSuppliers(searchParamsForLists),
        getPublishedArticles(searchParamsForLists),
        getPublishedCourses(searchParamsForLists),
        getPublishedEvents({ ...searchParamsForLists, period: 'all' }),
        getPublishedPartners(searchParamsForLists)
      ])
    : [];
  const totalResults = [vacancies, suppliers, articles, courses, events, partners]
    .filter(isPublishedContentList)
    .reduce((sum, content) => sum + content.total, 0);
  const resultSections = [
    vacancies
      ? {
          actionLabel: 'Смотреть вакансию',
          basePath: '/vacancies',
          content: vacancies,
          description: 'Открытые позиции от кофеен, баров, обжарщиков и поставщиков.',
          title: 'Вакансии'
        }
      : null,
    suppliers
      ? {
          actionLabel: 'Смотреть профиль',
          basePath: '/suppliers',
          content: suppliers,
          description: 'Компании, продукты, сервисы и контакты для заведений.',
          title: 'Поставщики'
        }
      : null,
    articles
      ? {
          actionLabel: 'Читать материал',
          basePath: '/articles',
          content: articles,
          description: 'Редакционные материалы, интервью и практические разборы.',
          title: 'Материалы'
        }
      : null,
    courses
      ? {
          actionLabel: 'Смотреть программу',
          basePath: '/education',
          content: courses,
          description: 'Интенсивы, разборы и программы для специалистов и команд.',
          title: 'Обучение'
        }
      : null,
    events
      ? {
          actionLabel: 'Подробнее о событии',
          basePath: '/events',
          content: events,
          description: 'Афиша встреч, лекций, дегустаций и гостевых смен.',
          title: 'События'
        }
      : null,
    partners
      ? {
          actionLabel: 'Смотреть профиль',
          basePath: '/partners',
          content: partners,
          description: 'Партнёрские форматы для брендов, школ и заведений.',
          title: 'Партнёры'
        }
      : null
  ].filter((section): section is NonNullable<typeof section> => Boolean(section && section.content.total > 0));

  return (
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/search', 'Поиск')} />
      <EditorialPublicPage
        eyebrow="Поиск"
        path="/search"
        title="Поиск по платформе"
        description="Ищите вакансии, поставщиков, материалы, обучение, события и партнёров одним запросом."
        summary="Введите запрос и перейдите в нужный раздел, если нужны дополнительные фильтры."
        density="compact"
        metrics={hasQuery ? [{ value: String(totalResults), label: 'результатов' }] : []}
        rows={[]}
      />
      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-8 md:py-12">
        <div className="container">
          <form
            action="/search"
            aria-label="Глобальный поиск по платформе"
            className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-card)] md:grid-cols-[minmax(0,1fr)_auto]"
            method="get"
            role="search"
          >
            <label className="sr-only" htmlFor="global-search-query">
              Глобальный поиск по платформе
            </label>
            <div className="grid min-h-12 grid-cols-[2.5rem_minmax(0,1fr)] items-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3">
              <Search aria-hidden="true" className="text-[var(--muted)]" size={20} strokeWidth={1.8} />
              <input
                className="min-w-0 bg-transparent text-base text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                defaultValue={q}
                id="global-search-query"
                name="q"
                placeholder="Например: вакансии, зерно, каппинг"
                required
                type="search"
              />
            </div>
            <Button className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal" type="submit">
              Найти
            </Button>
          </form>
        </div>
      </section>
      {hasQuery ? (
        <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-8 md:py-12">
          <div className="container grid gap-4">
            {resultSections.length > 0 ? (
              resultSections.map((section) => (
                <SearchResultsSection
                  actionLabel={section.actionLabel}
                  basePath={section.basePath}
                  content={section.content}
                  description={section.description}
                  key={section.basePath}
                  query={q}
                  title={section.title}
                />
              ))
            ) : (
              <Panel className="border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
                <PublicEyebrow tone="muted">Результаты</PublicEyebrow>
                <h2 className="mt-3 text-2xl font-semibold leading-8 text-[var(--text)]">По запросу ничего не найдено</h2>
                <PublicBodyText className="mt-3 max-w-2xl">
                  Попробуйте другой запрос или откройте нужный раздел и уточните фильтры там.
                </PublicBodyText>
              </Panel>
            )}
          </div>
        </section>
      ) : (
        <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-8 md:py-12">
          <div className="container">
            <Panel className="border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
              <PublicEyebrow tone="muted">Запрос</PublicEyebrow>
              <h2 className="mt-3 text-2xl font-semibold leading-8 text-[var(--text)]">Введите, что нужно найти</h2>
              <PublicBodyText className="mt-3 max-w-2xl">
                Поиск смотрит по опубликованным вакансиям, поставщикам, материалам, программам обучения и событиям.
              </PublicBodyText>
            </Panel>
          </div>
        </section>
      )}
    </>
  );
}
