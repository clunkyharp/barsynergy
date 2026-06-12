'use client';

import type { ReactNode } from 'react';
import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { PublicFiltersActiveChip } from '@/components/public/public-filters-fields';
import { Panel } from '@/components/ui/panel';
import { cn } from '@/lib/utils';
import type { ActiveFilter } from './public-filters-types';

type Props = {
  title: string;
  embedded: boolean;
  filterStatusId: string;
  liveStatusText: string;
  searchField: ReactNode;
  filterPanelId: string;
  isDirectoryTone: boolean;
  filterTitleClassName: string;
  shouldShowFilterIntro: boolean;
  description: string;
  contextSummary: ReactNode | null;
  hasActiveFilters: boolean;
  activeFilters: ActiveFilter[];
  onClearFilter: (name: string, value?: string) => void;
  hasFilters: boolean;
  onClearAll: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filterFields: ReactNode;
  isPending: boolean;
  panelSurfaceClass: string;
  panelPadding: 'sm' | 'md';
  activeChipClassName: string;
  searchSurfaceClass: string;
  activeSummaryLabel: string;
};

export function PublicFiltersStackedVariant({
  title,
  embedded,
  filterStatusId,
  liveStatusText,
  searchField,
  filterPanelId,
  isDirectoryTone,
  filterTitleClassName,
  shouldShowFilterIntro,
  description,
  contextSummary,
  hasActiveFilters,
  activeFilters,
  onClearFilter,
  hasFilters,
  onClearAll,
  showFilters,
  onToggleFilters,
  filterFields,
  isPending,
  panelSurfaceClass,
  panelPadding,
  activeChipClassName,
  searchSurfaceClass,
  activeSummaryLabel
}: Props) {
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
                  onClick={onClearAll}
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
                  onClick={onToggleFilters}
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
            <div className="mt-4 flex flex-wrap gap-1.5">
              {activeFilters.flatMap((filter) =>
                filter.values.map((v) => (
                  <PublicFiltersActiveChip
                    className={activeChipClassName}
                    filter={{ label: filter.label, name: filter.name, value: v.value, displayValue: v.label }}
                    key={`${filter.name}-${v.value}`}
                    onClear={onClearFilter}
                  />
                ))
              )}
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
