import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import type { PublishedContentItem, PublishedContentList } from '@/lib/public/content';
import type { PublicTaxonomyOption } from '@/lib/public/filter-options';
import { ArticleCard } from './article-grid-card';
import { CategoryPill } from './article-grid-category-pill';
import { ArticleSearchField } from './article-grid-search-field';
import { pageHref, listingHref } from './article-grid-utils';

type ArticleGridSectionProps = {
  content: PublishedContentList;
  basePath: string;
  categories: PublicTaxonomyOption[];
  featuredItem?: PublishedContentItem;
  title: string;
};

export function ArticleGridSection({
  content,
  basePath,
  categories,
  featuredItem,
  title
}: ArticleGridSectionProps) {
  const visibleItems = featuredItem
    ? content.items.filter((item) => item.id !== featuredItem.id)
    : content.items;
  const currentCategory = typeof content.params.category === 'string'
    ? content.params.category
    : undefined;

  return (
    <section
      aria-label={title}
      className="public-catalog-section background-zone background-zone-ivory editorial-grid border-b border-[var(--line)] py-8 md:py-14"
      id="articles-list"
    >
      <div className="container">
        {/* Filter bar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <CategoryPill
              href={listingHref(content, basePath, { category: null })}
              active={!currentCategory}
            >
              Все
            </CategoryPill>
            {categories.map((cat) => (
              <CategoryPill
                key={cat.slug}
                href={listingHref(content, basePath, { category: cat.slug })}
                active={currentCategory === cat.slug}
              >
                {cat.name}
              </CategoryPill>
            ))}
          </div>
          <div className="shrink-0">
            <ArticleSearchField currentQuery={content.searchQuery} />
          </div>
        </div>

        {content.items.length === 0 ? (
          <Panel className="public-missing-state mt-6 space-y-4 border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
            <h3 className="text-xl font-semibold leading-7">
              {currentCategory || content.searchQuery
                ? 'По этим параметрам материалов нет'
                : 'Материалов пока нет'}
            </h3>
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
              {currentCategory || content.searchQuery
                ? 'Сбросьте фильтры или попробуйте другой запрос.'
                : 'Первые материалы появятся после публикации.'}
            </p>
            <Button
              className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal"
              href="/contacts?topic=article-topic#contact-form"
              variant="primary"
            >
              Предложить тему
            </Button>
          </Panel>
        ) : (
          <>
            {/* Count */}
            <MetaChip aria-live="polite" aria-atomic="true" className="mt-5 border-[var(--border-default)] bg-[var(--accent-soft)] text-[var(--accent)]" variant="filter">
              Материалов: {content.total}
            </MetaChip>

            {/* Grid */}
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredItem ? (
                <ArticleCard
                  basePath={basePath}
                  featured
                  item={featuredItem}
                />
              ) : null}
              {visibleItems.map((item) => (
                <ArticleCard
                  basePath={basePath}
                  item={item}
                  key={item.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {content.totalPages > 1 ? (
              <div className="public-catalog-pagination mt-8 flex flex-wrap items-center justify-between gap-3">
                <MetaChip className="border-[var(--border-default)] bg-transparent text-[var(--muted)]" variant="default">
                  Страница {content.page} из {content.totalPages}
                </MetaChip>
                <div className="flex flex-wrap gap-3">
                  <Button disabled={content.page <= 1} href={pageHref(content, basePath, content.page - 1)} variant="secondary">
                    Назад
                  </Button>
                  <Button disabled={content.page >= content.totalPages} href={pageHref(content, basePath, content.page + 1)} variant="secondary">
                    Вперед
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
