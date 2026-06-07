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
  filterTitleClassName: string;
  shouldShowFilterIntro: boolean;
  description: string;
  searchField: ReactNode;
  hasFilters: boolean;
  filterPanelId: string;
  areSidebarFieldsCollapsed: boolean;
  onToggleSidebarFields: () => void;
  isDirectoryTone: boolean;
  expandLabel: string;
  collapseLabel: string;
  contextSummary: ReactNode | null;
  hasActiveFilters: boolean;
  activeFilters: ActiveFilter[];
  onClearFilter: (name: string) => void;
  activeChipClassName: string;
  filterFields: ReactNode;
  isPending: boolean;
  onClearAll: () => void;
  panelSurfaceClass: string;
  panelPadding: 'sm' | 'md';
};

export function PublicFiltersSidebarVariant({
  title,
  embedded,
  filterStatusId,
  liveStatusText,
  filterTitleClassName,
  shouldShowFilterIntro,
  description,
  searchField,
  hasFilters,
  filterPanelId,
  areSidebarFieldsCollapsed,
  onToggleSidebarFields,
  isDirectoryTone,
  expandLabel,
  collapseLabel,
  contextSummary,
  hasActiveFilters,
  activeFilters,
  onClearFilter,
  activeChipClassName,
  filterFields,
  isPending,
  onClearAll,
  panelSurfaceClass,
  panelPadding
}: Props) {
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
              'mt-3 inline-flex min-h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] border border-[var(--border-default)] px-2.5 py-1.5 text-[12px] font-semibold tracking-normal text-[var(--muted)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--accent)]/35 hover:text-[var(--text)] motion-reduce:transition-none',
              isDirectoryTone && 'border-[var(--accent)]/22 bg-[var(--surface-wash)]'
            )}
            onClick={onToggleSidebarFields}
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
              <PublicFiltersActiveChip
                className={activeChipClassName}
                filter={filter}
                key={`${filter.name}-${filter.value}`}
                onClear={onClearFilter}
              />
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
                onClick={onClearAll}
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
