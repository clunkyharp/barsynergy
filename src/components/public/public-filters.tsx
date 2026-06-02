'use client';

import { Suspense, type ReactNode, useEffect, useId, useMemo, useState, useTransition } from 'react';
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
  collapseLabel?: string;
  defaultCollapsed?: boolean;
  embedded?: boolean;
  expandLabel?: string;
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

function resolveFilterVariant(input: Pick<PublicFiltersProps, 'embedded' | 'variant'>) {
  return input.variant ?? (input.embedded ? 'sidebar' : 'stacked');
}

function PublicFiltersSkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-[var(--radius-sm)] bg-[var(--skeleton-fill)]', className)}
    />
  );
}

function wrapPublicFiltersFallback(content: ReactNode, embedded: boolean) {
  if (embedded) {
    return content;
  }

  return (
    <section className="border-b border-[var(--line)] bg-[var(--surface-muted)] py-6">
      {content}
    </section>
  );
}

function PublicFiltersFallback({
  compact = false,
  embedded = false,
  title = 'Фильтры',
  tone = 'default',
  variant
}: PublicFiltersProps) {
  const resolvedVariant = resolveFilterVariant({ embedded, variant });
  const isDirectoryTone = tone === 'directory';
  const panelPadding = isDirectoryTone || compact ? 'sm' : 'md';
  const panelSurfaceClass = isDirectoryTone
    ? 'relative overflow-visible border-[var(--card-border-hover)] bg-[var(--surface-card)] shadow-none'
    : 'border-[var(--border-default)] bg-[var(--surface-wash)]';
  const searchSurfaceClass = isDirectoryTone
    ? 'relative overflow-hidden border-[var(--card-border-hover)] bg-[var(--surface-card)] shadow-none'
    : 'border-[var(--border-default)] bg-[var(--surface-wash)]';

  if (resolvedVariant === 'toolbar') {
    const toolbarContent = (
      <search aria-label={title} className={cn('grid', compact ? 'gap-2' : 'gap-3', embedded ? '' : 'container')}>
        <Panel
          className={cn(
            'public-filter-toolbar-panel',
            'border-[var(--border-default)] bg-[var(--surface-wash)]',
            compact ? 'shadow-none' : 'shadow-[var(--shadow-card)]'
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
            <PublicFiltersSkeletonBlock className={compact ? 'h-10' : 'h-12'} />
            <PublicFiltersSkeletonBlock className={compact ? 'h-10' : 'h-12'} />
            <PublicFiltersSkeletonBlock className={compact ? 'h-10' : 'h-12'} />
          </div>
        </Panel>
      </search>
    );

    return wrapPublicFiltersFallback(toolbarContent, embedded);
  }

  if (resolvedVariant === 'sidebar') {
    const sidebarContent = (
      <search aria-label={title} className={cn('grid gap-3', embedded ? '' : 'container')}>
        <Panel className={cn('public-filter-panel public-filter-sidebar-panel', panelSurfaceClass)} padding={panelPadding}>
          <div className="grid gap-3">
            <PublicFiltersSkeletonBlock className="h-5 max-w-32" />
            <PublicFiltersSkeletonBlock className={compact ? 'h-10' : 'h-12'} />
            <div className="grid gap-2.5 border-t border-[var(--line)] pt-4">
              <PublicFiltersSkeletonBlock className={compact ? 'h-10' : 'h-12'} />
              <PublicFiltersSkeletonBlock className={compact ? 'h-10' : 'h-12'} />
            </div>
          </div>
        </Panel>
      </search>
    );

    return wrapPublicFiltersFallback(sidebarContent, embedded);
  }

  const content = (
    <search aria-label={title} className={cn('grid gap-3', embedded ? '' : 'container')}>
      <Panel className={cn('public-filter-search-panel', searchSurfaceClass)} padding={panelPadding}>
        <PublicFiltersSkeletonBlock className={compact ? 'h-10' : 'h-12'} />
      </Panel>
      <Panel className={cn('public-filter-panel', panelSurfaceClass)} padding={panelPadding}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <PublicFiltersSkeletonBlock className={compact ? 'h-10' : 'h-12'} />
          <PublicFiltersSkeletonBlock className={compact ? 'h-10' : 'h-12'} />
        </div>
      </Panel>
    </search>
  );

  return wrapPublicFiltersFallback(content, embedded);
}

export function PublicFilters(props: PublicFiltersProps) {
  return (
    <Suspense fallback={<PublicFiltersFallback {...props} />}>
      <PublicFiltersContent {...props} />
    </Suspense>
  );
}

function PublicFiltersContent({
  activeSummaryLabel = 'Сейчас выбрано',
  categoryAllLabel = 'Все категории',
  categoryLabel = 'Категория',
  categories = [],
  cityAllLabel = 'Все города',
  cityLabel = 'Город',
  cities = [],
  collapseLabel = 'Свернуть параметры',
  compact = false,
  contextItems = [],
  defaultCollapsed: defaultCollapsedProp,
  embedded = false,
  expandLabel = 'Показать параметры',
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
  const resolvedVariant = resolveFilterVariant({ embedded, variant });
  // defaultCollapsed = resolvedVariant === 'sidebar' unless a caller overrides it.
  const defaultCollapsed = defaultCollapsedProp ?? (resolvedVariant === 'sidebar');
  const [showFilters, setShowFilters] = useState(false);
  const [areSidebarFieldsCollapsed, setAreSidebarFieldsCollapsed] = useState(defaultCollapsed);
  const filterInstanceId = useId();
  const searchInputId = `${filterInstanceId}-search`;
  const filterPanelId = `${filterInstanceId}-fields`;
  const filterIdPrefix = `${filterInstanceId}-filter`;
  const filterStatusId = `${filterInstanceId}-status`;

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

  useEffect(() => {
    if (hasActiveFilters) {
      setAreSidebarFieldsCollapsed(false);
    }
  }, [hasActiveFilters]);

  const isDirectoryTone = tone === 'directory';
  const showToolbarStatus = hasActiveFilters || isPending;
  const panelSurfaceClass = isDirectoryTone
    ? 'relative overflow-visible border-[var(--card-border-hover)] bg-[var(--surface-card)] shadow-none'
    : 'border-[var(--border-default)] bg-[var(--surface-wash)]';
  const searchSurfaceClass = isDirectoryTone
    ? 'relative overflow-hidden border-[var(--card-border-hover)] bg-[var(--surface-card)] shadow-none'
    : 'border-[var(--border-default)] bg-[var(--surface-wash)]';
  const filterTitleClassName = cn('public-filter-title text-[var(--text)]');
  const fieldShellClassName = cn('public-filter-field w-full', isDirectoryTone && 'space-y-1.5');
  const fieldLabelClassName = 'public-filter-label text-[var(--muted)]';
  const controlClassName = cn(
    'public-filter-control',
    isDirectoryTone && 'border-[var(--accent)]/18 bg-[var(--surface-wash-strong)] shadow-none',
    compact ? 'min-h-10 text-[13px]' : 'min-h-12 text-[14px]'
  );
  const panelPadding = isDirectoryTone || compact ? 'sm' : 'md';
  const activeChipClassName = cn(
    'public-filter-chip inline-flex max-w-full items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-3 py-1.5 text-[11px] leading-5 text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--accent)]/40 motion-reduce:transition-none',
    isDirectoryTone && 'border-[var(--accent)]/22 bg-[color-mix(in_oklab,var(--accent-soft),transparent_18%)]'
  );
  const shouldShowSearchLabel = isDirectoryTone || resolvedVariant === 'sidebar';
  const shouldShowFilterIntro = !(isDirectoryTone && resolvedVariant === 'sidebar');
  const liveStatusText = isPending
    ? 'Обновляем список.'
    : hasActiveFilters
      ? `${activeSummaryLabel}: ${activeFilters.length}.`
      : 'Фильтры не выбраны.';

  function renderDirectoryFieldLabel(label: string, htmlFor: string) {
    return (
      <label className={fieldLabelClassName} htmlFor={htmlFor}>
        {label}
      </label>
    );
  }

  function renderClearButton(name: string, label: string, activeValue: string) {
    if (!activeValue) {
      return null;
    }

    return (
      <button
        aria-label={`Сбросить фильтр: ${label}`}
        className="inline-flex min-h-9 items-center gap-1.5 justify-self-start rounded-[var(--radius-sm)] border border-[var(--border-default)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] transition-colors hover:border-[var(--accent)]/35 hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none"
        onClick={() => clearSingleFilter(name)}
        type="button"
      >
        <X aria-hidden="true" size={12} />
        Сбросить
      </button>
    );
  }

  const searchField = (
    <div className={fieldShellClassName}>
      <label className={shouldShowSearchLabel ? fieldLabelClassName : 'sr-only'} htmlFor={searchInputId}>
        Поиск по списку
      </label>
      <SearchInput
        aria-label="Поиск по списку"
        autoComplete="off"
        enterKeyHint="search"
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
          {renderDirectoryFieldLabel(categoryLabel, `${filterIdPrefix}-category`)}
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
          {renderClearButton('category', categoryLabel, currentCategory)}
        </div>
      ) : null}

      {cities.length > 0 ? (
        <div className={fieldShellClassName}>
          {renderDirectoryFieldLabel(cityLabel, `${filterIdPrefix}-city`)}
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
          {renderClearButton('city', cityLabel, currentCity)}
        </div>
      ) : null}

      {extraFilters.map((filter) => {
        const currentValue = searchParams?.get(filter.name) ?? '';

        return (
          <div className={fieldShellClassName} key={filter.name}>
            {renderDirectoryFieldLabel(filter.label, `${filterIdPrefix}-${filter.name}`)}
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
            {renderClearButton(filter.name, filter.label, currentValue)}
          </div>
        );
      })}
    </>
  );

  if (resolvedVariant === 'toolbar') {
    const toolbarContent = (
      <search aria-label={title} className={cn('grid', compact ? 'gap-2' : 'gap-3', embedded ? '' : 'container')}>
        <p aria-atomic="true" aria-live="polite" className="sr-only" id={filterStatusId}>
          {liveStatusText}
        </p>
        <Panel
          className={cn(
            'public-filter-toolbar-panel',
            'border-[var(--border-default)] bg-[var(--surface-wash)]',
            compact ? 'shadow-none' : 'shadow-[var(--shadow-card)]'
          )}
          padding={compact ? 'sm' : 'md'}
        >
          <div
            className={cn(
              'grid',
              compact
                ? 'gap-2 xl:grid-cols-[minmax(16rem,1fr)_max-content]'
                : 'gap-3 xl:grid-cols-[minmax(20rem,1fr)_max-content]'
            )}
          >
            <div className="toolbar-search-row min-w-0">
              {searchField}
            </div>
            {hasFilters ? (
              <button
                aria-controls={filterPanelId}
                aria-expanded={showFilters}
                className={cn(
                  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--accent)]/35 motion-reduce:transition-none',
                  isDirectoryTone && 'border-[var(--accent)]/22 bg-[var(--surface-wash)]'
                )}
                onClick={() => setShowFilters((value) => !value)}
                type="button"
              >
                <SlidersHorizontal size={14} />
                {showFilters ? collapseLabel : expandLabel}
                <ChevronDown
                  className={cn('transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none', showFilters && 'rotate-180')}
                  size={14}
                />
              </button>
            ) : null}
            <div
              className={cn(
                'col-span-full gap-2 max-md:pb-[calc(24px+env(safe-area-inset-bottom))] xl:grid-cols-4',
                showFilters || hasActiveFilters ? 'grid md:grid' : 'hidden'
              )}
              id={filterPanelId}
            >
              {filterFields}
            </div>
          </div>

          {showToolbarStatus ? (
            <div
              className={cn(
                'flex flex-wrap items-center gap-3 border-t border-[var(--line)]',
                hasActiveFilters ? 'justify-between' : 'justify-end',
                compact ? 'mt-3 pt-3' : 'mt-4 pt-4'
              )}
            >
              {hasActiveFilters ? (
                <p className={cn('leading-6 text-[var(--muted)]', compact ? 'text-xs' : 'text-sm')}>
                  {activeSummaryLabel}: {activeFilters.length}.
                </p>
              ) : null}
              <div className="flex items-center gap-3">
                {isPending ? (
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                    Обновляем…
                  </span>
                ) : null}
                {hasActiveFilters ? (
                  <button
                    className="inline-flex min-h-11 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:text-[var(--accent-strong)] motion-reduce:transition-none"
                    onClick={clearAllFilters}
                    type="button"
                  >
                    <RotateCcw size={14} strokeWidth={1.8} />
                    Сбросить
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

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
      </search>
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

  if (resolvedVariant === 'sidebar') {
    const sidebarContent = (
      <search aria-label={title} className={cn('grid gap-3', embedded ? '' : 'container')}>
        <p aria-atomic="true" aria-live="polite" className="sr-only" id={filterStatusId}>
          {liveStatusText}
        </p>
        <Panel className={cn('public-filter-panel public-filter-sidebar-panel', panelSurfaceClass)} padding={panelPadding}>
          <p className={filterTitleClassName}>{title}</p>
          {shouldShowFilterIntro ? <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">{description}</p> : null}

          <div className="mt-3">{searchField}</div>

          {hasFilters ? (
            <button
              aria-controls={filterPanelId}
              aria-expanded={!areSidebarFieldsCollapsed}
              className={cn(
                'mt-3 inline-flex min-h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] border border-[var(--border-default)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--accent)]/35 hover:text-[var(--text)] motion-reduce:transition-none',
                isDirectoryTone && 'border-[var(--accent)]/22 bg-[var(--surface-wash)]'
              )}
              onClick={() => setAreSidebarFieldsCollapsed((value) => !value)}
              type="button"
            >
              <SlidersHorizontal size={13} />
              {areSidebarFieldsCollapsed ? expandLabel : collapseLabel}
              <ChevronDown
                className={cn('transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none', !areSidebarFieldsCollapsed && 'rotate-180')}
                size={12}
              />
            </button>
          ) : null}

          {contextSummary && !areSidebarFieldsCollapsed ? <div className="mt-3">{contextSummary}</div> : null}

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

          {hasFilters && !areSidebarFieldsCollapsed ? (
            <div
              id={filterPanelId}
              className={cn(
                'mt-4 grid gap-2.5 border-t border-[var(--line)] pt-4',
                embedded && 'pb-1'
              )}
            >
              {filterFields}
            </div>
          ) : null}

          {(hasActiveFilters || isPending) ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-4">
              {hasActiveFilters ? (
                <button
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--accent)]/35 hover:text-[var(--accent)] motion-reduce:transition-none"
                  onClick={clearAllFilters}
                  type="button"
                >
                  <RotateCcw size={14} />
                  Сбросить фильтры
                </button>
              ) : null}
              {isPending ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Обновляем список…</p>
              ) : null}
            </div>
          ) : null}
        </Panel>
      </search>
    );

    if (embedded) {
      return sidebarContent;
    }

    return (
      <section className="border-b border-[var(--line)] bg-[var(--surface-muted)] py-6">
        {sidebarContent}
      </section>
    );
  }

  const content = (
    <search aria-label={title} className={cn('grid gap-3', embedded ? '' : 'container')}>
      <p aria-atomic="true" aria-live="polite" className="sr-only" id={filterStatusId}>
        {liveStatusText}
      </p>
      <Panel className={cn('public-filter-search-panel', searchSurfaceClass)} padding={panelPadding}>
        {isDirectoryTone ? (
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Поиск в каталоге</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)] sm:inline">
              Каталог поставщиков
            </span>
          </div>
        ) : null}
        {searchField}
      </Panel>

      {hasFilters ? (
        <Panel className={cn('public-filter-panel', panelSurfaceClass)} padding={panelPadding}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={filterTitleClassName}>{title}</p>
              {shouldShowFilterIntro ? <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
              {shouldShowFilterIntro && contextSummary ? <div className="mt-3">{contextSummary}</div> : null}
              {shouldShowFilterIntro && hasActiveFilters ? (
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {activeSummaryLabel}: {activeFilters.length}.
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {hasActiveFilters ? (
                <button
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:text-[var(--accent-strong)] motion-reduce:transition-none"
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
                    'inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--accent)]/35 motion-reduce:transition-none md:hidden',
                    isDirectoryTone && 'rounded-[var(--radius-sm)] border-[var(--accent)]/22 bg-[var(--surface-wash)]'
                  )}
                  onClick={() => setShowFilters((value) => !value)}
                  type="button"
                >
                  <SlidersHorizontal size={14} />
                  {isDirectoryTone ? 'Параметры' : 'Фильтры'}
                  <ChevronDown
                    className={cn('transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none', showFilters && 'rotate-180')}
                    size={14}
                  />
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
    </search>
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
