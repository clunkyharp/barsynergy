'use client';

import type { ReactNode } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { PublicFiltersActiveChip, PublicFiltersResetButton } from '@/components/public/public-filters-fields';
import { Panel } from '@/components/ui/panel';
import { cn } from '@/lib/utils';
import type { ActiveFilter } from './public-filters-types';

type Props = {
  title: string;
  compact: boolean;
  embedded: boolean;
  filterStatusId: string;
  liveStatusText: string;
  searchField: ReactNode;
  filterPanelId: string;
  hasFilters: boolean;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  activeFilters: ActiveFilter[];
  onClearFilter: (name: string, value?: string) => void;
  activeChipClassName: string;
  filterFields: ReactNode;
  isPending: boolean;
  onClearAll: () => void;
  isDirectoryTone: boolean;
  collapseLabel: string;
  expandLabel: string;
  activeSummaryLabel: string;
};

export function PublicFiltersToolbarVariant({
  title,
  compact,
  embedded,
  filterStatusId,
  liveStatusText,
  searchField,
  filterPanelId,
  hasFilters,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  activeFilters,
  onClearFilter,
  activeChipClassName,
  filterFields,
  isPending,
  onClearAll,
  isDirectoryTone,
  collapseLabel,
  expandLabel,
  activeSummaryLabel
}: Props) {
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
                'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 py-2 text-[12px] font-semibold tracking-normal text-[var(--text)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--accent)]/35 motion-reduce:transition-none',
                isDirectoryTone && 'border-[var(--accent)]/22 bg-[var(--surface-wash)]'
              )}
              onClick={onToggleFilters}
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

        {(hasActiveFilters || isPending) ? (
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
                <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">
                  Обновляем…
                </span>
              ) : null}
              {hasActiveFilters ? (
                <PublicFiltersResetButton onClick={onClearAll} />
              ) : null}
            </div>
          </div>
        ) : null}

        {hasActiveFilters ? (
          <div className={cn('flex flex-wrap', compact ? 'mt-3 gap-1.5' : 'mt-4 gap-2')}>
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
