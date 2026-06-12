'use client';

import { useCallback, useEffect, useId, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { PublicFiltersProps, ActiveFilter } from './public-filters-types';
import { resolveFilterVariant } from './public-filters-fallback';
import { PublicFiltersToolbarVariant } from './public-filters-variant-toolbar';
import { PublicFiltersSidebarVariant } from './public-filters-variant-sidebar';
import { PublicFiltersStackedVariant } from './public-filters-variant-stacked';
import {
  PublicFiltersSearchField,
  PublicFiltersSelectField,
  PublicFiltersMultiSelectField
} from '@/components/public/public-filters-fields';
import { cn } from '@/lib/utils';

function getParamValues(searchParams: URLSearchParams, name: string): string[] {
  const raw = searchParams?.get(name) ?? '';
  return raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseSingleParam(searchParams: URLSearchParams, name: string): string {
  return searchParams?.get(name) ?? '';
}

export function PublicFiltersContent({
  activeSummaryLabel = 'Сейчас выбрано',
  activeSummaryCountLabel,
  categoryAllLabel = 'Все категории',
  categoryLabel = 'Категория',
  categories = [],
  categoryMode = 'single',
  cityAllLabel = 'Все города',
  cityLabel = 'Город',
  cities = [],
  cityMode = 'single',
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

  const params = useMemo(() => searchParams ?? new URLSearchParams(), [searchParams]);

  const currentQ = parseSingleParam(params, 'q');
  const currentCategory = parseSingleParam(params, 'category');
  const currentCity = parseSingleParam(params, 'city');
  const currentCategories = categoryMode === 'multiple' ? getParamValues(params, 'category') : [];
  const currentCities = cityMode === 'multiple' ? getParamValues(params, 'city') : [];
  const hasFilters = categories.length > 0 || cities.length > 0 || extraFilters.length > 0;

  useEffect(() => { setDraftQuery(currentQ); }, [currentQ]);

  const pushParams = useCallback((nextParams: URLSearchParams, options?: { replace?: boolean }) => {
    const query = nextParams.toString();
    const nextPath = pathname ?? '/';
    startTransition(() => {
      const nextUrl = query ? `${nextPath}?${query}` : nextPath;
      if (options?.replace) { router.replace(nextUrl, { scroll: false }); return; }
      router.push(nextUrl, { scroll: false });
    });
  }, [pathname, router]);

  const handleFilter = useCallback((name: string, value: string, options?: { replace?: boolean }) => {
    const nextParams = new URLSearchParams(params.toString());
    if (value) { nextParams.set(name, value); } else { nextParams.delete(name); }
    nextParams.delete('page');
    pushParams(nextParams, options);
  }, [params, pushParams]);

  const handleMultiSelect = useCallback((name: string, values: string[]) => {
    const nextParams = new URLSearchParams(params.toString());
    if (values.length > 0) {
      nextParams.set(name, values.join(','));
    } else {
      nextParams.delete(name);
    }
    nextParams.delete('page');
    pushParams(nextParams);
  }, [params, pushParams]);

  function clearAllFilters() {
    setDraftQuery('');
    pushParams(new URLSearchParams());
  }

  const clearSingleFilter = useCallback((name: string, value?: string) => {
    if (name === 'q') { setDraftQuery(''); handleFilter('q', '', { replace: true }); return; }
    if (value !== undefined) {
      const currentValues = getParamValues(params, name);
      const nextValues = currentValues.filter((v) => v !== value);
      if (nextValues.length > 0) {
        const nextParams = new URLSearchParams(params.toString());
        nextParams.set(name, nextValues.join(','));
        nextParams.delete('page');
        pushParams(nextParams);
      } else {
        handleFilter(name, '');
      }
    } else {
      handleFilter(name, '');
    }
  }, [handleFilter, params, pushParams]);

  useEffect(() => {
    const normalizedDraft = draftQuery.trim();
    const normalizedCurrent = currentQ.trim();
    if (normalizedDraft === normalizedCurrent) { return; }
    const timerId = window.setTimeout(() => { handleFilter('q', normalizedDraft, { replace: true }); }, 300);
    return () => { window.clearTimeout(timerId); };
  }, [draftQuery, currentQ, handleFilter]);

  const activeFilters = useMemo(() => {
    const items: ActiveFilter[] = [];

    if (currentQ.trim()) {
      items.push({
        name: 'q',
        label: 'Поиск',
        mode: 'single',
        values: [{ label: currentQ.trim(), value: currentQ.trim() }]
      });
    }

    if (categoryMode === 'multiple') {
      const selectedCategories = currentCategories
        .map((slug) => {
          const cat = categories.find((item) => item.slug === slug);
          return cat ? { label: cat.name, value: cat.slug } : null;
        })
        .filter(Boolean) as { label: string; value: string }[];
      if (selectedCategories.length > 0) {
        items.push({ name: 'category', label: categoryLabel, mode: 'multiple', values: selectedCategories });
      }
    } else if (currentCategory) {
      const category = categories.find((item) => item.slug === currentCategory);
      items.push({
        name: 'category',
        label: categoryLabel,
        mode: 'single',
        values: [{ label: category?.name ?? currentCategory, value: currentCategory }]
      });
    }

    if (cityMode === 'multiple') {
      const selectedCities = currentCities
        .map((slug) => {
          const city = cities.find((item) => item.slug === slug);
          return city ? { label: city.name, value: city.slug } : null;
        })
        .filter(Boolean) as { label: string; value: string }[];
      if (selectedCities.length > 0) {
        items.push({ name: 'city', label: cityLabel, mode: 'multiple', values: selectedCities });
      }
    } else if (currentCity) {
      const city = cities.find((item) => item.slug === currentCity);
      items.push({
        name: 'city',
        label: cityLabel,
        mode: 'single',
        values: [{ label: city?.name ?? currentCity, value: currentCity }]
      });
    }

    extraFilters.forEach((filter) => {
      const mode = filter.mode ?? 'single';
      if (mode === 'multiple') {
        const values = getParamValues(params, filter.name);
        if (values.length === 0) return;
        const matched = values
          .map((v) => {
            const option = filter.options.find((item) => item.value === v);
            return option ? { label: option.label, value: option.value } : null;
          })
          .filter(Boolean) as { label: string; value: string }[];
        if (matched.length > 0) {
          items.push({ name: filter.name, label: filter.label, mode: 'multiple', values: matched });
        }
      } else {
        const value = parseSingleParam(params, filter.name);
        if (!value) return;
        const option = filter.options.find((item) => item.value === value);
        items.push({
          name: filter.name,
          label: filter.label,
          mode: 'single',
          values: [{ label: option?.label ?? value, value }]
        });
      }
    });

    return items;
  }, [
    categories, categoryLabel, categoryMode, cities, cityLabel, cityMode,
    currentCategory, currentCategories, currentCity, currentCities, currentQ,
    extraFilters, params
  ]);

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
    'public-filter-chip inline-flex max-w-full items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-white/[0.04] px-3 py-1.5 text-[11px] leading-5 text-[var(--text)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-white/15 hover:bg-white/[0.07] motion-reduce:transition-none group',
    isDirectoryTone && 'border-[var(--accent)]/18'
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
      {categories.length > 0 ? categoryMode === 'multiple' ? (
        <PublicFiltersMultiSelectField
          activeValues={currentCategories} allLabel={categoryAllLabel} ariaLabel={categoryLabel}
          controlClassName={controlClassName} fieldLabelClassName={fieldLabelClassName}
          id={`${filterIdPrefix}-category`} label={categoryLabel} name="category"
          onChange={(values) => handleMultiSelect('category', values)}
          onClear={clearSingleFilter}
          options={categories.map((cat) => ({ label: cat.name, value: cat.slug }))}
          wrapperClassName={fieldShellClassName}
        />
      ) : (
        <PublicFiltersSelectField
          activeValue={currentCategory} allLabel={categoryAllLabel} ariaLabel={categoryLabel}
          controlClassName={controlClassName} fieldLabelClassName={fieldLabelClassName}
          id={`${filterIdPrefix}-category`} label={categoryLabel} name="category"
          onChange={(event) => handleFilter('category', event.target.value)}
          onClear={clearSingleFilter}
          options={categories.map((cat) => ({ label: cat.name, value: cat.slug }))}
          wrapperClassName={fieldShellClassName}
        />
      ) : null}
      {cities.length > 0 ? cityMode === 'multiple' ? (
        <PublicFiltersMultiSelectField
          activeValues={currentCities} allLabel={cityAllLabel} ariaLabel={cityLabel}
          controlClassName={controlClassName} fieldLabelClassName={fieldLabelClassName}
          id={`${filterIdPrefix}-city`} label={cityLabel} name="city"
          onChange={(values) => handleMultiSelect('city', values)}
          onClear={clearSingleFilter}
          options={cities.map((ct) => ({ label: ct.name, value: ct.slug }))}
          wrapperClassName={fieldShellClassName}
        />
      ) : (
        <PublicFiltersSelectField
          activeValue={currentCity} allLabel={cityAllLabel} ariaLabel={cityLabel}
          controlClassName={controlClassName} fieldLabelClassName={fieldLabelClassName}
          id={`${filterIdPrefix}-city`} label={cityLabel} name="city"
          onChange={(event) => handleFilter('city', event.target.value)}
          onClear={clearSingleFilter}
          options={cities.map((ct) => ({ label: ct.name, value: ct.slug }))}
          wrapperClassName={fieldShellClassName}
        />
      ) : null}
      {extraFilters.map((filter) => {
        const mode = filter.mode ?? 'single';
        if (mode === 'multiple') {
          const currentValues = getParamValues(params, filter.name);
          return (
            <PublicFiltersMultiSelectField
              activeValues={currentValues} allLabel={filter.allLabel ?? filter.label} ariaLabel={filter.label}
              controlClassName={controlClassName} fieldLabelClassName={fieldLabelClassName}
              id={`${filterIdPrefix}-${filter.name}`} key={filter.name} label={filter.label} name={filter.name}
              onChange={(values) => handleMultiSelect(filter.name, values)}
              onClear={clearSingleFilter}
              options={filter.options}
              wrapperClassName={fieldShellClassName}
            />
          );
        }
        const currentValue = parseSingleParam(params, filter.name);
        return (
          <PublicFiltersSelectField
            activeValue={currentValue} allLabel={filter.allLabel ?? filter.label} ariaLabel={filter.label}
            controlClassName={controlClassName} fieldLabelClassName={fieldLabelClassName}
            id={`${filterIdPrefix}-${filter.name}`} key={filter.name} label={filter.label} name={filter.name}
            onChange={(event) => handleFilter(filter.name, event.target.value)}
            onClear={clearSingleFilter}
            options={filter.options}
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
      activeChipClassName={activeChipClassName}
      activeFilters={activeFilters}
      activeSummaryCountLabel={activeSummaryCountLabel}
      areSidebarFieldsCollapsed={areSidebarFieldsCollapsed}
      collapseLabel={collapseLabel} contextSummary={contextSummary} description={description}
      embedded={embedded} expandLabel={expandLabel}
      filterFields={filterFields} filterPanelId={filterPanelId} filterStatusId={filterStatusId}
      filterTitleClassName={filterTitleClassName}
      hasActiveFilters={hasActiveFilters} hasFilters={hasFilters}
      isDirectoryTone={isDirectoryTone} isPending={isPending} liveStatusText={liveStatusText}
      onClearAll={clearAllFilters}
      onClearFilter={clearSingleFilter}
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
