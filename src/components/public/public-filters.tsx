'use client';

import { useEffect, useId, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { Panel } from '@/components/ui/panel';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type SelectOption = {
  value: string;
  label: string;
};

type ExtraFilter = {
  name: string;
  label: string;
  allLabel?: string;
  options: SelectOption[];
};

type FilterContextItem = {
  label: string;
  value: string;
};

type PublicFiltersProps = {
  activeSummaryLabel?: string;
  categoryAllLabel?: string;
  categoryLabel?: string;
  categories?: CategoryOption[];
  cityAllLabel?: string;
  cityLabel?: string;
  cities?: CategoryOption[];
  compact?: boolean;
  contextItems?: FilterContextItem[];
  embedded?: boolean;
  extraFilters?: ExtraFilter[];
  placeholder?: string;
  description?: string;
  title?: string;
  tone?: 'default' | 'directory';
  variant?: 'stacked' | 'toolbar' | 'sidebar';
};

type ActiveFilter = {
  name: string;
  label: string;
  value: string;
};

export function PublicFilters({
  activeSummaryLabel = 'Сейчас выбрано',
  categoryAllLabel = 'Все категории',
  categoryLabel = 'Категория',
  categories = [],
  cityAllLabel = 'Все города',
  cityLabel = 'Город',
  cities = [],
  compact = false,
  contextItems = [],
  embedded = false,
  extraFilters = [],
  placeholder = 'Поиск по названию или теме…',
  description = 'Город, категория и формат.',
  title = 'Фильтры',
  tone = 'default',
  variant
}: PublicFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [draftQuery, setDraftQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const filterInstanceId = useId();
  const searchInputId = `${filterInstanceId}-search`;
  const filterPanelId = `${filterInstanceId}-fields`;
  const filterIdPrefix = `${filterInstanceId}-filter`;

  const currentQ = searchParams?.get('q') ?? '';
  const currentCategory = searchParams?.get('category') ?? '';
  const currentCity = searchParams?.get('city') ?? '';
  const hasFilters = categories.length > 0 || cities.length > 0 || extraFilters.length > 0;

  useEffect(() => {
    setDraftQuery(currentQ);
  }, [currentQ]);

  function pushParams(params: URLSearchParams, options?: { replace?: boolean }) {
    const query = params.toString();
    const nextPath = pathname ?? '/';

    startTransition(() => {
      const nextUrl = query ? `${nextPath}?${query}` : nextPath;

      if (options?.replace) {
        router.replace(nextUrl, { scroll: false });
        return;
      }

      router.push(nextUrl, { scroll: false });
    });
  }

  function handleFilter(name: string, value: string, options?: { replace?: boolean }) {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    params.delete('page');
    pushParams(params, options);
  }

  function clearAllFilters() {
    setDraftQuery('');
    pushParams(new URLSearchParams());
  }

  function clearSingleFilter(name: string) {
    if (name === 'q') {
      setDraftQuery('');
    }

    handleFilter(name, '', { replace: name === 'q' });
  }

  useEffect(() => {
    const normalizedDraft = draftQuery.trim();
    const normalizedCurrent = currentQ.trim();

    if (normalizedDraft === normalizedCurrent) {
      return;
    }

    const timerId = window.setTimeout(() => {
      handleFilter('q', normalizedDraft, { replace: true });
    }, 300);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [draftQuery, currentQ, pathname, router, searchParams]);

  const activeFilters = useMemo(() => {
    const items: ActiveFilter[] = [];

    if (currentQ.trim()) {
      items.push({ name: 'q', label: 'Поиск', value: currentQ.trim() });
    }

    if (currentCategory) {
      const category = categories.find((item) => item.slug === currentCategory);

      if (category) {
        items.push({ name: 'category', label: categoryLabel, value: category.name });
      }
    }

    if (currentCity) {
      const city = cities.find((item) => item.slug === currentCity);

      if (city) {
        items.push({ name: 'city', label: cityLabel, value: city.name });
      }
    }

    extraFilters.forEach((filter) => {
      const value = searchParams?.get(filter.name) ?? '';

      if (!value) {
        return;
      }

      const option = filter.options.find((item) => item.value === value);

      if (option) {
        items.push({ name: filter.name, label: filter.label, value: option.label });
      }
    });

    return items;
  }, [categories, categoryLabel, cities, cityLabel, currentCategory, currentCity, currentQ, extraFilters, searchParams]);

  const hasActiveFilters = activeFilters.length > 0;
  const resolvedVariant = variant ?? (embedded ? 'sidebar' : 'stacked');
  const isDirectoryTone = tone === 'directory';
  const panelSurfaceClass = isDirectoryTone
    ? 'relative overflow-visible border-[var(--accent)]/20 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--surface),white_18%),var(--surface-wash))] shadow-none'
    : 'border-[var(--border-default)] bg-[var(--surface-wash)]';
  const searchSurfaceClass = isDirectoryTone
    ? 'relative overflow-hidden border-[var(--accent)]/15 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--surface),white_20%),var(--surface-wash))] shadow-none'
    : 'border-[var(--border-default)] bg-[var(--surface-wash)]';
  const filterTitleClassName = isDirectoryTone
    ? 'text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]'
    : 'text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]';
  const fieldShellClassName = cn('w-full', isDirectoryTone && 'space-y-1.5');
  const fieldLabelClassName = 'text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]';
  const controlClassName = isDirectoryTone
    ? cn(
        'rounded-[var(--radius-sm)] border-[var(--accent)]/18 bg-[var(--surface-wash-strong)] shadow-none',
        compact ? 'min-h-10 text-[13px]' : 'min-h-12 text-[14px]'
      )
    : undefined;
  const panelPadding = isDirectoryTone || compact ? 'sm' : 'md';
  const activeChipClassName = cn(
    'inline-flex max-w-full items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-3 py-1.5 text-[11px] leading-5 text-[var(--accent)] transition hover:border-[var(--accent)]/40',
    isDirectoryTone && 'border-[var(--accent)]/22 bg-[color-mix(in_oklab,var(--accent-soft),transparent_18%)]'
  );
  const shouldShowSearchLabel = isDirectoryTone && resolvedVariant === 'toolbar';

  function renderDirectoryFieldLabel(label: string) {
    if (!isDirectoryTone) {
      return null;
    }

    return <span className={fieldLabelClassName}>{label}</span>;
  }

  const searchField = (
    <div className={fieldShellClassName}>
      <label className={shouldShowSearchLabel ? fieldLabelClassName : 'sr-only'} htmlFor={searchInputId}>
        Поиск по списку
      </label>
      <SearchInput
        aria-label="Поиск по списку"
        autoComplete="off"
        id={searchInputId}
        inputMode="search"
        name="q"
        className={controlClassName}
        onChange={(e) => setDraftQuery(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        type="search"
        value={draftQuery}
      />
    </div>
  );

  const contextSummary =
    contextItems.length > 0 ? (
      <div className={cn('flex flex-wrap', compact ? 'gap-1.5' : 'gap-2')}>
        {contextItems.map((item) => (
          <span
            className={cn(
              'inline-flex max-w-full items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-transparent text-[11px] leading-5 text-[var(--muted)]',
              compact ? 'px-2.5 py-1' : 'px-3 py-1.5'
            )}
            key={`${item.label}-${item.value}`}
          >
            <span className="font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{item.label}</span>
            <span className="break-words text-[var(--text)]">{item.value}</span>
          </span>
        ))}
      </div>
    ) : null;

  const filterFields = (
    <>
      {categories.length > 0 ? (
        <div className={fieldShellClassName}>
          {renderDirectoryFieldLabel(categoryLabel)}
          <Select
            aria-label={categoryLabel}
            className={controlClassName}
            id={`${filterIdPrefix}-category`}
            name="category"
            value={currentCategory}
            onChange={(e) => handleFilter('category', e.target.value)}
          >
            <option value="">{categoryAllLabel}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      {cities.length > 0 ? (
        <div className={fieldShellClassName}>
          {renderDirectoryFieldLabel(cityLabel)}
          <Select
            aria-label={cityLabel}
            className={controlClassName}
            id={`${filterIdPrefix}-city`}
            name="city"
            value={currentCity}
            onChange={(e) => handleFilter('city', e.target.value)}
          >
            <option value="">{cityAllLabel}</option>
            {cities.map((city) => (
              <option key={city.id} value={city.slug}>
                {city.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      {extraFilters.map((filter) => {
        const currentValue = searchParams?.get(filter.name) ?? '';

        return (
          <div className={fieldShellClassName} key={filter.name}>
            {renderDirectoryFieldLabel(filter.label)}
            <Select
              aria-label={filter.label}
              className={controlClassName}
              id={`${filterIdPrefix}-${filter.name}`}
              name={filter.name}
              value={currentValue}
              onChange={(e) => handleFilter(filter.name, e.target.value)}
            >
              <option value="">{filter.allLabel ?? filter.label}</option>
              {filter.options.map((option) => (
                <option key={`${filter.name}-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        );
      })}
    </>
  );

  if (resolvedVariant === 'toolbar') {
    const toolbarContent = (
      <div className={cn('grid', compact ? 'gap-2' : 'gap-3', embedded ? '' : 'container')}>
        <Panel
          className={cn(
            'border-[var(--border-default)] bg-[var(--surface-wash)]',
            compact ? 'shadow-none' : 'shadow-[0_18px_50px_rgba(20,20,18,0.04)]'
          )}
          padding={compact ? 'sm' : 'md'}
        >
          <div
            className={cn(
              'grid max-md:pb-[calc(24px+env(safe-area-inset-bottom))] md:grid-cols-2',
              compact
                ? 'gap-2 xl:grid-cols-[minmax(14rem,1fr)_repeat(4,minmax(7.8rem,0.64fr))]'
                : 'gap-3 xl:grid-cols-[minmax(16rem,1.15fr)_repeat(4,minmax(8.75rem,0.75fr))]'
            )}
          >
            {searchField}
            {filterFields}
          </div>

          <div className={cn('flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)]', compact ? 'mt-3 pt-3' : 'mt-4 pt-4')}>
            <div className={cn('grid', compact ? 'gap-1.5' : 'gap-2')}>
              <p className={cn('leading-6 text-[var(--muted)]', compact ? 'text-xs' : 'text-sm')}>
                {description}
                {hasActiveFilters ? ` ${activeSummaryLabel}: ${activeFilters.length}.` : null}
              </p>
              {contextSummary}
            </div>
            <div className="flex items-center gap-3">
              {isPending ? (
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Обновляем…
                </span>
              ) : null}
              {hasActiveFilters ? (
                <button
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
                  onClick={clearAllFilters}
                  type="button"
                >
                  <RotateCcw size={14} strokeWidth={1.8} />
                  Сбросить
                </button>
              ) : null}
            </div>
          </div>

          {hasActiveFilters ? (
            <div className={cn('flex flex-wrap', compact ? 'mt-3 gap-1.5' : 'mt-4 gap-2')}>
              {activeFilters.map((filter) => (
                <button
                  aria-label={`Убрать фильтр: ${filter.label} ${filter.value}`}
                  className={activeChipClassName}
                  key={`${filter.name}-${filter.value}`}
                  onClick={() => clearSingleFilter(filter.name)}
                  type="button"
                >
                  <span className="font-semibold uppercase tracking-[0.12em]">{filter.label}</span>
                  <span className="break-words text-[var(--text)]">{filter.value}</span>
                  <X size={12} strokeWidth={1.8} />
                </button>
              ))}
            </div>
          ) : null}
        </Panel>
      </div>
    );

    if (embedded) {
      return toolbarContent;
    }

    return (
      <section className="border-b border-[var(--line)] bg-[var(--surface-muted)] py-6">
        {toolbarContent}
      </section>
    );
  }

  const content = (
    <div className={cn('grid gap-3', embedded ? '' : 'container')}>
      <Panel className={searchSurfaceClass} padding={panelPadding}>
        {isDirectoryTone ? (
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Поиск в каталоге</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)] sm:inline">
              BARSYNERGY / поставщики
            </span>
          </div>
        ) : null}
        {searchField}
      </Panel>

      {hasFilters ? (
        <Panel className={panelSurfaceClass} padding={panelPadding}>
          {isDirectoryTone ? <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,var(--accent),transparent_68%)]" /> : null}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={filterTitleClassName}>{title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
              {contextSummary ? <div className="mt-3">{contextSummary}</div> : null}
              {hasActiveFilters ? (
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {activeSummaryLabel}: {activeFilters.length}.
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters ? (
                <button
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
                  onClick={clearAllFilters}
                  type="button"
                >
                  <RotateCcw size={14} />
                  Сбросить
                </button>
              ) : null}
              {embedded ? (
                <button
                  aria-controls={filterPanelId}
                  aria-expanded={showFilters}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text)] transition hover:border-[var(--accent)]/35 md:hidden',
                    isDirectoryTone && 'rounded-[var(--radius-sm)] border-[var(--accent)]/22 bg-[var(--surface-wash)]'
                  )}
                  onClick={() => setShowFilters((value) => !value)}
                  type="button"
                >
                  <SlidersHorizontal size={14} />
                  {isDirectoryTone ? 'Параметры' : 'Фильтры'}
                  <ChevronDown className={cn('transition-transform duration-300', showFilters && 'rotate-180')} size={14} />
                </button>
              ) : null}
            </div>
          </div>

          {hasActiveFilters ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <button
                  aria-label={`Убрать фильтр: ${filter.label} ${filter.value}`}
                  className={activeChipClassName}
                  key={`${filter.name}-${filter.value}`}
                  onClick={() => clearSingleFilter(filter.name)}
                  type="button"
                >
                  <span className="font-semibold uppercase tracking-[0.12em]">{filter.label}</span>
                  <span className="break-words text-[var(--text)]">{filter.value}</span>
                  <X size={12} />
                </button>
              ))}
            </div>
          ) : null}

          <div
            id={filterPanelId}
            className={cn(
              'mt-4 gap-2.5 max-md:pb-[calc(24px+env(safe-area-inset-bottom))]',
              isDirectoryTone && 'border-t border-[var(--line)] pt-4',
              embedded ? 'hidden md:grid' : 'grid md:grid-cols-2 xl:grid-cols-4',
              embedded && showFilters && 'grid',
              embedded && !showFilters && 'md:grid'
            )}
          >
            {filterFields}
          </div>

          {isPending ? (
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Обновляем список…</p>
          ) : null}
        </Panel>
      ) : null}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <section className="border-b border-[var(--line)] bg-[var(--surface-muted)] py-6">
      {content}
    </section>
  );
}
