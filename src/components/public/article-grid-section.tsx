'use client';

import { LayoutGrid, List } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { Select } from '@/components/ui/select';
import type { PublishedContentItem, PublishedContentList } from '@/lib/public/content';
import type { PublicTaxonomyOption } from '@/lib/public/filter-options';
import { cn } from '@/lib/utils';
import { ArticleCard, ArticleFeaturedCard, ArticleListItem } from './article-grid-card';
import { CategoryPill } from './article-grid-category-pill';
import { ChipFilterRow } from '@/components/ui/chip-filter-row';
import { listingHref, pageHref } from './article-grid-utils';
import { ContentSubscribeForm } from '@/components/public/content-subscribe-form';
import { PublicPrelaunchSection, type PrelaunchCard } from '@/components/public/public-prelaunch-section';

export type ArticleRubricSection = {
  categoryName: string;
  categorySlug: string;
  items: PublishedContentItem[];
};

type ArticleGridSectionProps = {
  content: PublishedContentList;
  basePath: string;
  categories: PublicTaxonomyOption[];
  featuredItem?: PublishedContentItem;
  rubricSections?: ArticleRubricSection[];
  prelaunchCards?: PrelaunchCard[];
  prelaunchBadges?: string[];
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' }
] as const;

function buildPageList(current: number, total: number): (number | 'ellipsis')[] {
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const result: (number | 'ellipsis')[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (n - prev > 1) result.push('ellipsis');
    result.push(n);
    prev = n;
  }
  return result;
}

const pageBtnClass =
  'inline-flex h-10 min-w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] px-2 text-sm font-medium text-[var(--muted)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)]';
const pageBtnInteractive = 'hover:border-[var(--accent)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]';

function ListPagination({ content, basePath }: { content: PublishedContentList; basePath: string }) {
  if (content.totalPages <= 1) return null;
  const { page, totalPages } = content;

  return (
    <nav aria-label="Страницы материалов" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <AppLink aria-label="Предыдущая страница" className={cn(pageBtnClass, pageBtnInteractive)} href={pageHref(content, basePath, page - 1)}>
          ←
        </AppLink>
      ) : (
        <span aria-disabled="true" className={cn(pageBtnClass, 'opacity-30')}>←</span>
      )}
      {buildPageList(page, totalPages).map((p, index) =>
        p === 'ellipsis' ? (
          <span className={cn(pageBtnClass, 'border-transparent')} key={`ellipsis-${index}`}>
            …
          </span>
        ) : p === page ? (
          <span
            aria-current="page"
            className={cn(pageBtnClass, 'border-[var(--accent)] bg-[var(--accent)] font-semibold text-[var(--accent-contrast)]')}
            key={p}
          >
            {p}
          </span>
        ) : (
          <AppLink className={cn(pageBtnClass, pageBtnInteractive)} href={pageHref(content, basePath, p)} key={p}>
            {p}
          </AppLink>
        )
      )}
      {page < totalPages ? (
        <AppLink aria-label="Следующая страница" className={cn(pageBtnClass, pageBtnInteractive)} href={pageHref(content, basePath, page + 1)}>
          →
        </AppLink>
      ) : (
        <span aria-disabled="true" className={cn(pageBtnClass, 'opacity-30')}>→</span>
      )}
    </nav>
  );
}

export function ArticleGridSection({
  content,
  basePath,
  categories,
  featuredItem,
  rubricSections = [],
  prelaunchCards,
  prelaunchBadges
}: ArticleGridSectionProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = (searchParams?.get('sort') ?? 'newest') as 'newest' | 'oldest';

  const handleSortChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.delete('page');
      if (value === 'newest') {
        params.delete('sort');
      } else {
        params.set('sort', value);
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const visibleItems = featuredItem
    ? content.items.filter((item) => item.id !== featuredItem.id)
    : content.items;
  const currentCategory =
    typeof content.params.category === 'string' ? content.params.category : undefined;

  return (
    <section aria-label="Материалы" className="border-b border-[var(--line)] pt-6 pb-10 sm:pb-14" id="articles-list">
      <div className="container">
        {/* Category pills */}
        <ChipFilterRow aria-label="Категории материалов" className="mt-6">
          <CategoryPill
            active={!currentCategory}
            href={listingHref(content, basePath, { category: null })}
          >
            Все
          </CategoryPill>
          {categories.map((cat) => (
            <CategoryPill
              active={currentCategory === cat.slug}
              href={listingHref(content, basePath, { category: cat.slug })}
              key={cat.slug}
            >
              {cat.name}
            </CategoryPill>
          ))}
        </ChipFilterRow>

        {content.items.length === 0 ? (
          currentCategory || content.searchQuery ? (
            <Panel
              className="public-missing-state mt-8 space-y-4 border-[var(--border-default)] bg-[var(--surface-wash)]"
              padding="lg"
            >
              <h3 className="text-xl font-semibold leading-7">
                По этим параметрам материалов нет
              </h3>
              <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Сбросьте фильтры или попробуйте другой запрос.
              </p>
              <Button href="/contacts?topic=article-topic#contact-form" variant="secondary">
                Предложить тему
              </Button>
            </Panel>
          ) : (
            <>
              <PublicPrelaunchSection
                badges={prelaunchBadges ?? ['Раздел уже принимает заявки', 'Подходит для любых тем']}
                cards={prelaunchCards ?? [
                  {
                    title: 'Практические руководства',
                    description: 'Разборы себестоимости, ROI оборудования, чек-листы запуска кофейни.'
                  },
                  {
                    title: 'Интервью с экспертами',
                    description: 'Опыт управляющих, бариста и поставщиков региона.'
                  },
                  {
                    title: 'Обзоры рынка',
                    description: 'Цены, поставщики, тренды и зарплаты в индустрии СКФО.'
                  }
                ]}
                description="Добавьте материал, если он помогает специалистам или владельцам заведений развивать бизнес."
                eyebrow="Материалы"
                title="Какие материалы можно добавить"
              />
              <div className="container pb-8">
                <ContentSubscribeForm topic="ARTICLES" />
              </div>
            </>
          )
        ) : (
          <>
            {/* Featured hero card */}
            {featuredItem ? (
              <div className="mt-8">
                <ArticleFeaturedCard basePath={basePath} item={featuredItem} />
              </div>
            ) : null}

            {rubricSections.length > 0 ? (
              <div className="mt-12 space-y-8" aria-label="Рубрики">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent-ink)]">
                      Рубрики
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-[var(--text)]">
                      Читать по темам
                    </h2>
                  </div>
                  <AppLink
                    className="inline-flex items-center text-sm font-semibold text-[var(--accent-ink)] transition-colors hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                    href={basePath}
                  >
                    Все материалы
                  </AppLink>
                </div>
                {rubricSections.map((section) => (
                  <section className="border-t border-[var(--line)] pt-6" key={section.categorySlug}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-[1.05rem] font-semibold text-[var(--text)]">{section.categoryName}</h3>
                      <AppLink
                        className="inline-flex items-center text-sm font-semibold text-[var(--accent-ink)] transition-colors hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                        href={listingHref(content, basePath, { category: section.categorySlug })}
                      >
                        Все в рубрике
                      </AppLink>
                    </div>
                    <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {section.items.map((item) => (
                        <ArticleCard basePath={basePath} item={item} key={item.id} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : null}

            {/* All articles */}
            <div className="mt-10">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-[var(--text)]">Все материалы</h2>
                <div className="flex items-center gap-2">
                  {/* Sort dropdown */}
                  <div className="hidden sm:block">
                    <Select
                      aria-label="Сортировка"
                      className="min-h-[3.25rem] min-w-[12.5rem] rounded-full border-[3px] border-[var(--accent)] bg-[var(--surface-card)] px-5 pr-9 text-base font-medium leading-none text-[var(--text)] shadow-[inset_0_0_0_3px_var(--surface-card)] hover:border-[var(--accent)]"
                      onChange={(e) => handleSortChange(e.target.value)}
                      value={currentSort}
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {/* View toggle */}
                  <div className="flex items-center gap-0.5">
                    <button
                      aria-label="Вид сеткой"
                      aria-pressed={view === 'grid'}
                      className={cn(
                        'rounded-[var(--radius-md)] p-1.5 transition-colors duration-[var(--motion-duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2',
                        view === 'grid'
                          ? 'text-[var(--accent)]'
                          : 'text-[var(--muted)] hover:text-[var(--text-secondary)]'
                      )}
                      onClick={() => setView('grid')}
                      type="button"
                    >
                      <LayoutGrid size={18} />
                    </button>
                    <button
                      aria-label="Вид списком"
                      aria-pressed={view === 'list'}
                      className={cn(
                        'rounded-[var(--radius-md)] p-1.5 transition-colors duration-[var(--motion-duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2',
                        view === 'list'
                          ? 'text-[var(--accent)]'
                          : 'text-[var(--muted)] hover:text-[var(--text-secondary)]'
                      )}
                      onClick={() => setView('list')}
                      type="button"
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {view === 'grid' ? (
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleItems.map((item) => (
                    <ArticleCard basePath={basePath} item={item} key={item.id} />
                  ))}
                </div>
              ) : (
                <div className="mt-4 divide-y divide-[var(--line)]">
                  {visibleItems.map((item) => (
                    <ArticleListItem basePath={basePath} item={item} key={item.id} />
                  ))}
                </div>
              )}
            </div>

            <ListPagination basePath={basePath} content={content} />
          </>
        )}
      </div>
    </section>
  );
}
