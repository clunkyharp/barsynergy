import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { PageHero } from '@/components/public/page-hero';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
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

type SearchChipSource = {
  label: string;
  total: number;
  items: SearchResultItem[];
};

export const metadata: Metadata = {
  title: 'Поиск',
  description: 'Поиск по вакансиям, поставщикам, материалам, обучению, событиям и партнёрам BARSYNERGY.',
  robots: {
    index: false,
    follow: true
  }
};

const SEARCH_CHIP_STOP_WORDS = new Set([
  'для',
  'как',
  'или',
  'что',
  'это',
  'где',
  'под',
  'без',
  'the',
  'and'
]);

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function searchQuery(params: PublicContentSearchParams) {
  return firstParam(params.q)?.trim() ?? '';
}

function isPublishedContentList(value: PublishedContentList | undefined): value is PublishedContentList {
  return Boolean(value);
}

function addChipWeight(counts: Map<string, number>, value: string, weight: number) {
  const normalized = value.trim().toLowerCase();

  if (
    normalized.length < 4 ||
    SEARCH_CHIP_STOP_WORDS.has(normalized) ||
    /^\d+$/.test(normalized)
  ) {
    return;
  }

  counts.set(normalized, (counts.get(normalized) ?? 0) + weight);
}

function extractSearchChipCandidates(sources: SearchChipSource[]) {
  const counts = new Map<string, number>();

  for (const source of sources) {
    if (source.total <= 0) {
      continue;
    }

    const sectionWeight = Math.max(1, Math.ceil(source.total / Math.max(source.items.length, 1)));
    addChipWeight(counts, source.label, sectionWeight * 3);

    for (const item of source.items) {
      const weightedChunks: Array<[string, number]> = [
        [item.title, sectionWeight * 2],
        [item.summary, sectionWeight],
        [item.subtitle ?? '', sectionWeight],
        [item.label ?? '', sectionWeight * 2],
        [item.meta.join(' '), sectionWeight]
      ];

      for (const [chunk, weight] of weightedChunks) {
        const words = chunk.toLowerCase().match(/[a-zа-яё0-9-]+/gi) ?? [];

        for (const word of words) {
          addChipWeight(counts, word, weight);
        }
      }
    }
  }

  const ranked = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'))
    .map(([word]) => word)
    .slice(0, 6);

  if (ranked.length > 0) {
    return ranked;
  }

  return sources
    .filter((source) => source.total > 0)
    .map((source) => source.label.toLowerCase())
    .slice(0, 6);
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
    : await Promise.all([
        getPublishedVacancies({ pageSize: '6' }),
        getPublishedSuppliers({ pageSize: '6' }),
        getPublishedArticles({ pageSize: '6' }),
        getPublishedCourses({ pageSize: '6' }),
        getPublishedEvents({ pageSize: '6', period: 'all' }),
        getPublishedPartners({ pageSize: '6' })
      ]);

  const totalResults = [vacancies, suppliers, articles, courses, events, partners]
    .filter(isPublishedContentList)
    .reduce((sum, content) => sum + content.total, 0);

  const articleItems = articles.items.map((item) => ({ ...item, contentType: 'article' as const, basePath: '/articles', actionLabel: 'Читать материал' }));
  const vacancyItems = vacancies.items.map((item) => ({ ...item, contentType: 'vacancy' as const, basePath: '/vacancies', actionLabel: 'Смотреть вакансию' }));
  const supplierItems = suppliers.items.map((item) => ({ ...item, contentType: 'supplier' as const, basePath: '/suppliers', actionLabel: 'Смотреть поставщика' }));
  const courseItems = courses.items.map((item) => ({ ...item, contentType: 'course' as const, basePath: '/education', actionLabel: 'Смотреть программу' }));
  const eventItems = events.items.map((item) => ({ ...item, contentType: 'event' as const, basePath: '/events', actionLabel: 'Подробнее' }));
  const partnerItems = partners.items.map((item) => ({ ...item, contentType: 'partner' as const, basePath: '/partners', actionLabel: 'Смотреть профиль' }));

  const flatItems: SearchResultItem[] = [
    ...articleItems,
    ...vacancyItems,
    ...supplierItems,
    ...courseItems,
    ...eventItems,
    ...partnerItems,
  ];
  const suggestionSources: SearchChipSource[] = [
    { label: 'материалы', total: articles.total, items: articleItems },
    { label: 'вакансии', total: vacancies.total, items: vacancyItems },
    { label: 'поставщики', total: suppliers.total, items: supplierItems },
    { label: 'обучение', total: courses.total, items: courseItems },
    { label: 'события', total: events.total, items: eventItems },
    { label: 'партнёры', total: partners.total, items: partnerItems },
  ];
  const suggestionChips = extractSearchChipCandidates(suggestionSources);

  return (
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/search', 'Поиск')} />
      <PageHero
        breadcrumbs={[{ label: 'Поиск' }]}
        eyebrow="Поиск"
        title="Поиск по платформе"
        subtitle="Ищите вакансии, поставщиков, материалы, обучение, события и партнёров одним запросом."
        tone="graphite"
        density="compact"
        bottom={hasQuery ? { kind: 'stats' as const, items: [{ value: String(totalResults), label: 'результатов' }] } : undefined}
      />

      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-4 md:py-6">
        <div className="container">
          <form
            action="/search"
            aria-label="Глобальный поиск по платформе"
            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
            method="get"
            role="search"
          >
            <label className="sr-only" htmlFor="global-search-query">
              Глобальный поиск по платформе
            </label>
            <SearchInput
              aria-label="Глобальный поиск по платформе"
              autoComplete="off"
              className="public-filter-control min-h-12 rounded-[var(--radius-md)] bg-[var(--surface-wash)] text-base"
              defaultValue={q}
              enterKeyHint="search"
              id="global-search-query"
              inputMode="search"
              name="q"
              placeholder="Например: вакансии, зерно, каппинг"
              required
              spellCheck={false}
              type="search"
            />
            <Button className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal" type="submit">
              Найти
            </Button>
          </form>

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
                  {suggestionChips.slice(0, 3).map((chip) => (
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
              {suggestionChips.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestionChips.slice(0, 4).map((chip) => (
                    <Link
                      className="inline-flex min-h-9 items-center rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--surface)] px-3.5 text-sm font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      href={`/search?q=${encodeURIComponent(chip)}`}
                      key={chip}
                    >
                      {chip}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-2">
                  {['вакансии', 'поставщики', 'обучение', 'события'].map((chip) => (
                    <Link
                      className="inline-flex min-h-9 items-center rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--surface)] px-3.5 text-sm font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      href={`/search?q=${encodeURIComponent(chip)}`}
                      key={chip}
                    >
                      {chip}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
