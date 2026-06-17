'use client';

import { LayoutGrid, List, Pencil } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { Select } from '@/components/ui/select';
import type { PublishedContentItem, PublishedContentList } from '@/lib/public/content';
import type { PublicTaxonomyOption } from '@/lib/public/filter-options';
import { cn } from '@/lib/utils';
import { ArticleCard, ArticleFeaturedCard, ArticleListItem } from './article-grid-card';
import { CategoryPill } from './article-grid-category-pill';
import { listingHref, pageHref } from './article-grid-utils';
import { ContentSubscribeForm } from '@/components/public/content-subscribe-form';
import { PublicPrelaunchSection, type PrelaunchCard } from '@/components/public/public-prelaunch-section';

type ArticleGridSectionProps = {
  content: PublishedContentList;
  basePath: string;
  categories: PublicTaxonomyOption[];
  featuredItem?: PublishedContentItem;
  prelaunchCards?: PrelaunchCard[];
  prelaunchBadges?: string[];
};

const SUBMIT_TOPIC_HREF = '/contacts?topic=article-topic#contact-form';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' }
] as const;

export function ArticleGridSection({
  content,
  basePath,
  categories,
  featuredItem,
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
        <div className="flex items-start justify-end">
          <Button className="w-full gap-2 sm:w-auto sm:shrink-0" href={SUBMIT_TOPIC_HREF} variant="primary">
            <Pencil size={14} />
            Предложить тему
          </Button>
        </div>

        {/* Category pills */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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
        </div>

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
              <Button
                className="min-h-12 rounded-[var(--radius-md)] px-6"
                href={SUBMIT_TOPIC_HREF}
                variant="primary"
              >
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

            {/* Показать ещё */}
            {content.totalPages > 1 && content.page < content.totalPages ? (
              <div className="mt-10 flex justify-center">
                <Button
                  className="min-w-[160px]"
                  onClick={() => {
                    router.push(pageHref(content, basePath, content.page + 1), { scroll: false });
                  }}
                  variant="secondary"
                >
                  Следующая страница →
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
