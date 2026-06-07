'use client';

import type { ReactNode } from 'react';
import { Panel } from '@/components/ui/panel';
import { cn } from '@/lib/utils';
import type { PublicFiltersProps } from './public-filters-types';

export function resolveFilterVariant(input: Pick<PublicFiltersProps, 'embedded' | 'variant'>) {
  return input.variant ?? (input.embedded ? 'sidebar' : 'stacked');
}

export function PublicFiltersSkeletonBlock({ className }: { className?: string }) {
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

export function PublicFiltersFallback({
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
