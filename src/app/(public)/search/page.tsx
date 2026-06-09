import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { Button } from '@/components/ui/button';
import { SearchResultsClient } from '@/components/public/search-results-client';
import type { SearchResultItem } from '@/components/public/search-results-client';
import {
  getPublishedArticles,
  getPublishedCourses,
  getPublishedEvents,
  getPublishedPartners,
  getPublishedSuppliers,
  getPublishedVacancies,
  type PublishedContentList,
  type PublicContentSearchParams
} from '@/lib/public/content';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';
import { JsonLd } from '@/components/seo/json-ld';

type SearchPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'Поиск',
  description: 'Поиск по вакансиям, поставщикам, материалам, обучению, событиям и партнёрам BARSYNERGY.',
  robots: {
    index: false,
    follow: true
  }
};

const SUGGESTION_CHIPS = ['бариста', 'кофе', 'каппинг', 'поставщики', 'обучение', 'оборудование'];

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function searchQuery(params: PublicContentSearchParams) {
  return firstParam(params.q)?.trim() ?? '';
}

function isPublishedContentList(value: PublishedContentList | undefined): value is PublishedContentList {
  return Boolean(value);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = (await searchParams) ?? {};
  const q = searchQuery(params);
  const hasQuery = q.length > 0;

  const [vacancies, suppliers, articles, courses, events, partners] = hasQuery
    ? await Promise.all([
        getPublishedVacancies({ q, pageSize: '8' }),
        getPublishedSuppliers({ q, pageSize: '8' }),
        getPublishedArticles({ q, pageSize: '8' }),
        getPublishedCourses({ q, pageSize: '8' }),
        getPublishedEvents({ q, pageSize: '8', period: 'all' }),
        getPublishedPartners({ q, pageSize: '8' })
      ])
    : [];

  const totalResults = [vacancies, suppliers, articles, courses, events, partners]
    .filter(isPublishedContentList)
    .reduce((sum, content) => sum + content.total, 0);

  const flatItems: SearchResultItem[] = [
    ...(articles?.items.map((item) => ({ ...item, contentType: 'article' as const, basePath: '/articles', actionLabel: 'Читать материал' })) ?? []),
    ...(vacancies?.items.map((item) => ({ ...item, contentType: 'vacancy' as const, basePath: '/vacancies', actionLabel: 'Смотреть вакансию' })) ?? []),
    ...(suppliers?.items.map((item) => ({ ...item, contentType: 'supplier' as const, basePath: '/suppliers', actionLabel: 'Открыть каталог' })) ?? []),
    ...(courses?.items.map((item) => ({ ...item, contentType: 'course' as const, basePath: '/education', actionLabel: 'Открыть программу' })) ?? []),
    ...(events?.items.map((item) => ({ ...item, contentType: 'event' as const, basePath: '/events', actionLabel: 'Подробнее' })) ?? []),
    ...(partners?.items.map((item) => ({ ...item, contentType: 'partner' as const, basePath: '/partners', actionLabel: 'Смотреть профиль' })) ?? []),
  ];

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

      {/* Search form */}
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
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTION_CHIPS.map((chip) => {
              const isActive = q.toLowerCase() === chip.toLowerCase();
              return (
                <Link
                  className={[
                    'inline-flex min-h-9 items-center rounded-[var(--radius-pill)] border px-3.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
                    isActive
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]',
                  ].join(' ')}
                  href={`/search?q=${encodeURIComponent(chip)}`}
                  key={chip}
                >
                  {chip}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Results */}
      {hasQuery ? (
        <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-8 md:py-12">
          <div className="container">
            {flatItems.length > 0 ? (
              <SearchResultsClient items={flatItems} query={q} />
            ) : (
              <div className="flex flex-col items-center gap-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-wash)] px-6 py-14 text-center">
                <Search aria-hidden className="text-[var(--muted)]" size={36} strokeWidth={1.4} />
                <div>
                  <p className="text-lg font-semibold text-[var(--text)]">Ничего не найдено</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Попробуйте изменить запрос или выбрать другой раздел.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {['бариста', 'поставщики', 'обучение'].map((chip) => (
                    <Link
                      className="inline-flex min-h-9 items-center rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--surface)] px-3.5 text-sm font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      href={`/search?q=${encodeURIComponent(chip)}`}
                      key={chip}
                    >
                      {chip}
                    </Link>
                  ))}
                </div>
                <Button className="rounded-[var(--radius-md)]" href="/search">
                  Сбросить поиск
                </Button>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-8 md:py-12">
          <div className="container">
            <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-wash)] px-6 py-14 text-center">
              <Search aria-hidden className="text-[var(--muted)]" size={36} strokeWidth={1.4} />
              <div>
                <p className="text-lg font-semibold text-[var(--text)]">Введите, что нужно найти</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Поиск смотрит по вакансиям, поставщикам, материалам, программам обучения и событиям.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
