'use client';

import { useEffect, useId, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { PublicFiltersProps, ActiveFilter } from './public-filters-types';
import { resolveFilterVariant } from './public-filters-fallback';
import { PublicFiltersToolbarVariant } from './public-filters-variant-toolbar';
import { PublicFiltersSidebarVariant } from './public-filters-variant-sidebar';
import { PublicFiltersStackedVariant } from './public-filters-variant-stacked';
import { PublicFiltersSearchField, PublicFiltersSelectField } from '@/components/public/public-filters-fields';
import { cn } from '@/lib/utils';

export function PublicFiltersContent({
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

  useEffect(() => { setDraftQuery(currentQ); }, [currentQ]);

  function pushParams(params: URLSearchParams, options?: { replace?: boolean }) {
    const query = params.toString();
    const nextPath = pathname ?? '/';
    startTransition(() => {
      const nextUrl = query ? `${nextPath}?${query}` : nextPath;
      if (options?.replace) { router.replace(nextUrl, { scroll: false }); return; }
      router.push(nextUrl, { scroll: false });
    });
  }

  function handleFilter(name: string, value: string, options?: { replace?: boolean }) {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (value) { params.set(name, value); } else { params.delete(name); }
    params.delete('page');
    pushParams(params, options);
  }

  function clearAllFilters() {
    setDraftQuery('');
    pushParams(new URLSearchParams());
  }

  function clearSingleFilter(name: string) {
    if (name === 'q') { setDraftQuery(''); }
    handleFilter(name, '', { replace: name === 'q' });
  }

  useEffect(() => {
    const normalizedDraft = draftQuery.trim();
    const normalizedCurrent = currentQ.trim();
    if (normalizedDraft === normalizedCurrent) { return; }
    const timerId = window.setTimeout(() => { handleFilter('q', normalizedDraft, { replace: true }); }, 300);
    return () => { window.clearTimeout(timerId); };
  }, [draftQuery, currentQ, pathname, router, searchParams]);

  const activeFilters = useMemo(() => {
    const items: ActiveFilter[] = [];
    if (currentQ.trim()) { items.push({ name: 'q', label: 'Поиск', value: currentQ.trim() }); }
    if (currentCategory) {
      const category = categories.find((item) => item.slug === currentCategory);
      items.push({ name: 'category', label: categoryLabel, value: category?.name ?? currentCategory });
    }
    if (currentCity) {
      const city = cities.find((item) => item.slug === currentCity);
      items.push({ name: 'city', label: cityLabel, value: city?.name ?? currentCity });
    }
    extraFilters.forEach((filter) => {
      const value = searchParams?.get(filter.name) ?? '';
      if (!value) { return; }
      const option = filter.options.find((item) => item.value === value);
      items.push({ name: filter.name, label: filter.label, value: option?.label ?? value });
    });
    return items;
  }, [categories, categoryLabel, cities, cityLabel, currentCategory, currentCity, currentQ, extraFilters, searchParams]);

  const hasActiveFilters = activeFilters.length > 0;

  useEffect(() => { if (hasActiveFilters) { setAreSidebarFieldsCollapsed(false); } }, [hasActiveFilters]);

  const isDirectoryTone = tone === 'directory';
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
    : hasActiveFilters ? `${activeSummaryLabel}: ${activeFilters.length}.` : 'Фильтры не выбраны.';

  const searchField = (
    <PublicFiltersSearchField
      controlClassName={controlClassName} fieldLabelClassName={fieldLabelClassName}
      id={searchInputId} onChange={(event) => setDraftQuery(event.target.value)}
      placeholder={placeholder} shouldShowLabel={shouldShowSearchLabel}
      value={draftQuery} wrapperClassName={fieldShellClassName}
    />
  );

  const contextSummary = contextItems.length > 0 ? (
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
        <PublicFiltersSelectField
          activeValue={currentCategory} allLabel={categoryAllLabel} ariaLabel={categoryLabel}
          controlClassName={controlClassName} fieldLabelClassName={fieldLabelClassName}
          id={`${filterIdPrefix}-category`} label={categoryLabel} name="category"
          onChange={(event) => handleFilter('category', event.target.value)}
          onClear={clearSingleFilter}
          options={categories.map((category) => ({ label: category.name, value: category.slug }))}
          wrapperClassName={fieldShellClassName}
        />
      ) : null}
      {cities.length > 0 ? (
        <PublicFiltersSelectField
          activeValue={currentCity} allLabel={cityAllLabel} ariaLabel={cityLabel}
          controlClassName={controlClassName} fieldLabelClassName={fieldLabelClassName}
          id={`${filterIdPrefix}-city`} label={cityLabel} name="city"
          onChange={(event) => handleFilter('city', event.target.value)}
          onClear={clearSingleFilter}
          options={cities.map((city) => ({ label: city.name, value: city.slug }))}
          wrapperClassName={fieldShellClassName}
        />
      ) : null}
      {extraFilters.map((filter) => {
        const currentValue = searchParams?.get(filter.name) ?? '';
        return (
          <PublicFiltersSelectField
            activeValue={currentValue} allLabel={filter.allLabel ?? filter.label} ariaLabel={filter.label}
            controlClassName={controlClassName} fieldLabelClassName={fieldLabelClassName}
            id={`${filterIdPrefix}-${filter.name}`} key={filter.name} label={filter.label} name={filter.name}
            onChange={(event) => handleFilter(filter.name, event.target.value)}
            onClear={clearSingleFilter} options={filter.options}
            wrapperClassName={fieldShellClassName}
          />
        );
      })}
    </>
  );

  if (resolvedVariant === 'toolbar') {
    return <PublicFiltersToolbarVariant
      activeChipClassName={activeChipClassName} activeFilters={activeFilters}
      activeSummaryLabel={activeSummaryLabel} collapseLabel={collapseLabel}
      compact={compact} embedded={embedded} expandLabel={expandLabel}
      filterFields={filterFields} filterPanelId={filterPanelId} filterStatusId={filterStatusId}
      hasActiveFilters={hasActiveFilters} hasFilters={hasFilters}
      isDirectoryTone={isDirectoryTone} isPending={isPending} liveStatusText={liveStatusText}
      onClearAll={clearAllFilters} onClearFilter={clearSingleFilter}
      onToggleFilters={() => setShowFilters((value) => !value)}
      searchField={searchField} showFilters={showFilters} title={title}
    />;
  }

  if (resolvedVariant === 'sidebar') {
    return <PublicFiltersSidebarVariant
      activeChipClassName={activeChipClassName} activeFilters={activeFilters}
      areSidebarFieldsCollapsed={areSidebarFieldsCollapsed}
      collapseLabel={collapseLabel} contextSummary={contextSummary} description={description}
      embedded={embedded} expandLabel={expandLabel}
      filterFields={filterFields} filterPanelId={filterPanelId} filterStatusId={filterStatusId}
      filterTitleClassName={filterTitleClassName}
      hasActiveFilters={hasActiveFilters} hasFilters={hasFilters}
      isDirectoryTone={isDirectoryTone} isPending={isPending} liveStatusText={liveStatusText}
      onClearAll={clearAllFilters} onClearFilter={clearSingleFilter}
      onToggleSidebarFields={() => setAreSidebarFieldsCollapsed((value) => !value)}
      panelPadding={panelPadding} panelSurfaceClass={panelSurfaceClass}
      searchField={searchField} shouldShowFilterIntro={shouldShowFilterIntro} title={title}
    />;
  }

  return <PublicFiltersStackedVariant
    activeChipClassName={activeChipClassName} activeFilters={activeFilters}
    activeSummaryLabel={activeSummaryLabel}
    contextSummary={contextSummary} description={description} embedded={embedded}
    filterFields={filterFields} filterPanelId={filterPanelId} filterStatusId={filterStatusId}
    filterTitleClassName={filterTitleClassName}
    hasActiveFilters={hasActiveFilters} hasFilters={hasFilters}
    isDirectoryTone={isDirectoryTone} isPending={isPending} liveStatusText={liveStatusText}
    onClearAll={clearAllFilters} onClearFilter={clearSingleFilter}
    onToggleFilters={() => setShowFilters((value) => !value)}
    panelPadding={panelPadding} panelSurfaceClass={panelSurfaceClass}
    searchField={searchField} searchSurfaceClass={searchSurfaceClass}
    shouldShowFilterIntro={shouldShowFilterIntro} showFilters={showFilters} title={title}
  />;
}
