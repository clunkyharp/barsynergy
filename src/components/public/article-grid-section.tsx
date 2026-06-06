'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import { SearchInput } from '@/components/ui/search-input';
import { displayFont } from '@/lib/fonts';
import type { PublishedContentItem, PublishedContentList } from '@/lib/public/content';
import type { PublicTaxonomyOption } from '@/lib/public/filter-options';
import { cn } from '@/lib/utils';

function extractReadingTime(meta: string[]): string | undefined {
  return meta.find((entry) => /\d+\s*мин/.test(entry));
}

function pageHref(content: PublishedContentList, basePath: string, page: number) {
  const params = new URLSearchParams();
  Object.entries(content.params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }
    if (value) {
      params.set(key, value);
    }
  });
  if (page > 1) {
    params.set('page', String(page));
  } else {
    params.delete('page');
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function listingHref(
  content: PublishedContentList,
  basePath: string,
  patch: Record<string, string | null>
) {
  const params = new URLSearchParams();

  Object.entries(content.params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    if (value) {
      params.set(key, value);
    }
  });

  Object.entries(patch).forEach(([key, value]) => {
    params.delete(key);

    if (value) {
      params.set(key, value);
    }
  });

  params.delete('page');

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function ArticleCard({
  item,
  basePath,
  featured
}: {
  item: PublishedContentItem;
  basePath: string;
  featured?: boolean;
}) {
  const href = `${basePath}/${item.slug}`;
  const readingTime = extractReadingTime(item.meta);

  function getArticleFallbackImage(label?: string): string {
    const upper = (label ?? '').toUpperCase();
    if (upper === 'МЕНЮ' || upper === 'ЭКОНОМИКА') return '/images/generated/content-guide.jpg';
    if (upper === 'КОМАНДА' || upper === 'СЕРВИС') return '/images/generated/content-service.jpg';
    if (upper === 'СОБЫТИЯ') return '/images/home/hero-bar-counter-bundo.jpg';
    return '/images/home/hero-coffee-counter-haberdoedas.jpg';
  }

  const coverStyle = item.imageUrl
    ? { backgroundImage: `url("${item.imageUrl}")`, backgroundSize: 'cover' as const, backgroundPosition: 'center' as const }
    : { backgroundImage: `url("${getArticleFallbackImage(item.label)}")`, backgroundSize: 'cover' as const, backgroundPosition: 'center' as const };

  return (
    <AppLink
      className={cn(
        'group relative block overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-card)] transition-shadow duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none',
        featured && 'sm:col-span-full'
      )}
      href={href}
    >
      <div
        className={cn(
          'w-full',
          featured ? 'aspect-[4/1] sm:aspect-[6/1]' : 'aspect-[3/1] sm:aspect-[4/1]'
        )}
        style={coverStyle}
        aria-hidden="true"
      />
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            {item.label ?? 'Статья'}
          </span>
          {readingTime ? (
            <span className="shrink-0 text-[11px] text-[var(--muted)]">
              {readingTime}
            </span>
          ) : null}
        </div>
        <h3 className={cn(
          displayFont.className,
          'mt-2 font-semibold leading-[1.1] text-[var(--text)] line-clamp-2',
          featured ? 'text-[1.45rem] sm:text-[2rem]' : 'text-[1.2rem] sm:text-[1.35rem]'
        )}>
          {item.title}
        </h3>
        {item.summary ? (
          <p className={cn(
            'mt-2 text-[14px] leading-6 text-[var(--muted)] line-clamp-2',
            featured && 'sm:text-[15px] sm:leading-7'
          )}>
            {item.summary}
          </p>
        ) : null}
      </div>
    </AppLink>
  );
}

function CategoryPill({
  href,
  active,
  children
}: {
  href: string;
  active: boolean;
  children: string;
}) {
  return (
    <a
      className={cn(
        'inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] font-semibold leading-5 transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 motion-reduce:transition-none',
        active
          ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
          : 'bg-[var(--surface-wash)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]'
      )}
      href={href}
    >
      {children}
    </a>
  );
}

function ArticleSearchField({ currentQuery = '' }: { currentQuery?: string }) {
  const [open, setOpen] = useState(Boolean(currentQuery));
  const [draftQuery, setDraftQuery] = useState(currentQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputId = useId();
  const hasQuery = Boolean(draftQuery.trim() || currentQuery.trim());
  const isActive = open || hasQuery;

  useEffect(() => {
    setDraftQuery(currentQuery);
    if (currentQuery) {
      setOpen(true);
    }
  }, [currentQuery]);

  const buildSearchHref = useCallback(
    (nextQuery: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');

      params.delete('page');

      if (nextQuery) {
        params.set('q', nextQuery);
      } else {
        params.delete('q');
      }

      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams]
  );

  const pushSearch = useCallback(
    (nextQuery: string) => {
      router.push(buildSearchHref(nextQuery), { scroll: false });
    },
    [buildSearchHref, router]
  );

  useEffect(() => {
    const normalizedDraft = draftQuery.trim();
    const normalizedCurrent = currentQuery.trim();

    if (normalizedDraft === normalizedCurrent) {
      return;
    }

    const timerId = window.setTimeout(() => {
      pushSearch(normalizedDraft);
    }, 250);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [currentQuery, draftQuery, pushSearch]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      pushSearch(draftQuery.trim());
    },
    [draftQuery, pushSearch]
  );

  const handlePrimaryAction = useCallback(() => {
    if (hasQuery) {
      setDraftQuery('');
      setOpen(true);
      inputRef.current?.focus();
      pushSearch('');
      return;
    }

    setOpen((value) => {
      const nextValue = !value;

      if (nextValue) {
        window.setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
      }

      return nextValue;
    });
  }, [hasQuery, pushSearch]);

  return (
    <form className="flex w-full items-center gap-1" onSubmit={handleSubmit}>
      <div
        className="min-w-0 flex-1 transition-[max-width,opacity,transform,visibility] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none"
        style={{
          maxWidth: isActive ? 200 : 0,
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'translateX(0)' : 'translateX(0.5rem)',
          visibility: isActive ? 'visible' : 'hidden'
        }}
      >
        <SearchInput
          aria-label="Поиск по материалам"
          autoComplete="off"
          className="h-8 rounded-full bg-[var(--surface-wash)] pr-3 py-0 text-[13px] text-[var(--text)] outline-none placeholder:text-[var(--muted)] sm:w-48"
          enterKeyHint="search"
          id={searchInputId}
          inputMode="search"
          name="q"
          onChange={(event) => setDraftQuery(event.target.value)}
          placeholder="Поиск..."
          ref={inputRef}
          spellCheck={false}
          type="text"
          value={draftQuery}
        />
      </div>
      <button
        aria-controls={searchInputId}
        aria-expanded={isActive}
        aria-label={hasQuery ? 'Очистить поиск' : isActive ? 'Скрыть поиск' : 'Поиск по материалам'}
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--surface-wash)] p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
        onClick={handlePrimaryAction}
        type="button"
      >
        {isActive ? <X size={16} /> : <Search size={16} />}
      </button>
    </form>
  );
}

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
        <div className="flex items-center justify-between gap-3">
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
            <MetaChip className="mt-5 border-[var(--border-default)] bg-[var(--accent-soft)] text-[var(--accent)]" variant="filter">
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
