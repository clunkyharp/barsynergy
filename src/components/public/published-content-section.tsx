import { Fragment, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import type { PublishedContentList } from '@/lib/public/content';
import { cn } from '@/lib/utils';
import { DefaultListRow } from './published-content-row-default';
import { OpportunityListRow } from './published-content-row-opportunity';
import { DirectoryListRow } from './published-content-row-directory';
import { CourseListRow } from './published-content-row-course';
import {
  pageHref,
  buildEmptyActions,
  type ActionVariant
} from './published-content-section-builders';

type PublishedContentSectionProps = {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  content: PublishedContentList;
  basePath: string;
  sectionId?: string;
  excludedItemIds?: string[];
  emptyAction?: {
    href: string;
    label: string;
    variant?: ActionVariant;
  };
  emptyActions?: Array<{
    href: string;
    label: string;
    variant?: ActionVariant;
  }>;
  secondaryEmptyTitle?: string;
  secondaryEmptyDescription?: string;
  secondaryEmptyActions?: Array<{
    href: string;
    label: string;
    variant?: ActionVariant;
  }>;
  filters?: ReactNode;
  countLabel?: string;
  listLabel?: string;
  listAction?: {
    href: string;
    label: string;
    variant?: ActionVariant;
  };
  sortLabel?: string;
  rowActionLabel?: string;
  showSidebarTitle?: boolean;
};

function PublishedContentSectionLayout({
  title,
  emptyTitle,
  emptyDescription,
  content,
  basePath,
  sectionId,
  excludedItemIds = [],
  emptyAction,
  emptyActions,
  secondaryEmptyTitle = 'Других записей пока нет',
  secondaryEmptyDescription = 'Главная рекомендация уже показана выше. Когда появятся новые записи с такими фильтрами, они будут здесь.',
  secondaryEmptyActions = [],
  filters,
  countLabel = 'Найдено',
  listLabel = 'Список',
  listAction,
  sortLabel,
  showSidebarTitle = true,
  renderRow,
  listClassName
}: PublishedContentSectionProps & { renderRow: (item: PublishedContentList['items'][number]) => ReactNode; listClassName?: string }) {
  const visibleItems = content.items.filter((item) => !excludedItemIds.includes(item.id));
  const resolvedEmptyActions = emptyActions ?? (emptyAction ? [emptyAction] : []);
  const hasActiveFilters = Object.keys(content.params).length > 0;
  const noResultsTitle = hasActiveFilters ? 'По этим параметрам ничего не найдено' : emptyTitle;
  const noResultsDescription = hasActiveFilters
    ? 'Сбросьте фильтры или измените запрос. Так можно вернуться к полному списку.'
    : emptyDescription;
  const emptyStateActions = buildEmptyActions(basePath, hasActiveFilters, resolvedEmptyActions);
  const listToolbar = (
    <div className="public-catalog-toolbar flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[var(--accent)]">{countLabel}: {content.total}</span>
        <span className="text-xs text-[var(--muted)]">{listLabel}</span>
      </div>
      <div className="flex items-center gap-3">
        {sortLabel ? (
          <span className="text-xs text-[var(--muted)]">↓ {sortLabel}</span>
        ) : null}
        {listAction ? (
          <Button className="gap-2 px-4 text-sm tracking-normal" href={listAction.href} size="sm" variant={listAction.variant ?? 'link'}>
            {listAction.label}
            <ArrowUpRight size={14} />
          </Button>
        ) : null}
      </div>
    </div>
  );

  return (
    <section
      aria-label={showSidebarTitle ? undefined : title}
      className="public-catalog-section background-zone background-zone-ivory editorial-grid border-b border-[var(--line)] py-8 md:py-14"
      id={sectionId}
    >
      <div className="container">
        <PublicDisplayTitle
          as="h2"
          className={cn('public-catalog-title max-w-sm', !showSidebarTitle && 'sr-only')}
        >
          {title}
        </PublicDisplayTitle>
      </div>
      <div className={cn('container grid gap-6 md:gap-8 xl:grid-cols-[minmax(16rem,0.48fr)_minmax(0,1.52fr)] xl:gap-8', showSidebarTitle && 'mt-5 md:mt-6')}>
        <aside className="public-catalog-sidebar min-w-0 xl:self-start">
          {filters}
        </aside>

        {content.items.length === 0 ? (
          <Panel className="public-missing-state space-y-4 border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
            <div>
              <PublicEyebrow tone="muted">{listLabel}</PublicEyebrow>
              <h3 className="mt-3 text-2xl font-semibold leading-8">{noResultsTitle}</h3>
            </div>
            <PublicBodyText className="max-w-2xl">{noResultsDescription}</PublicBodyText>
            {emptyStateActions.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {emptyStateActions.map((action) => (
                  <Button
                    className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal"
                    href={action.href}
                    key={`${action.href}-${action.label}`}
                    variant={action.variant ?? 'primary'}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </Panel>
        ) : visibleItems.length === 0 ? (
          <Panel className="public-missing-state public-missing-state-secondary space-y-4 border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
            <h3 className="text-xl font-semibold leading-7">{secondaryEmptyTitle}</h3>
            <PublicBodyText className="max-w-2xl">{secondaryEmptyDescription}</PublicBodyText>
            {secondaryEmptyActions.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {secondaryEmptyActions.map((action) => (
                  <Button
                    className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal"
                    href={action.href}
                    key={`${action.href}-${action.label}`}
                    variant={action.variant ?? 'primary'}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </Panel>
        ) : (
          <Panel className="public-catalog-list-panel min-w-0 overflow-hidden border-[var(--border-default)] bg-[var(--surface-card)]" padding="none">
            {listToolbar}

            <div className={cn('public-catalog-list-rows', listClassName ?? 'divide-y divide-[var(--line)] border-y border-[var(--line)] md:flex md:flex-col md:gap-4 md:divide-y-0 md:border-y-0')}>
              {visibleItems.map((item) => <Fragment key={item.id}>{renderRow(item)}</Fragment>)}
            </div>

            <div className="public-catalog-pagination flex flex-wrap items-center justify-between gap-3">
              {content.totalPages > 1 ? (
                <div className="flex w-full items-center justify-between gap-3">
                  <Button disabled={content.page <= 1} href={pageHref(content, basePath, content.page - 1)} variant="secondary">
                    ← Назад
                  </Button>
                  <span className="text-sm text-[var(--muted)]">{content.page} / {content.totalPages}</span>
                  <Button disabled={content.page >= content.totalPages} href={pageHref(content, basePath, content.page + 1)} variant="secondary">
                    Вперед →
                  </Button>
                </div>
              ) : null}
            </div>
          </Panel>
        )}
      </div>
    </section>
  );
}

export function PublishedContentSectionDefault(props: PublishedContentSectionProps) {
  return (
    <PublishedContentSectionLayout
      {...props}
      renderRow={(item) => (
        <DefaultListRow
          actionLabel={props.rowActionLabel ?? 'Подробнее'}
          href={`${props.basePath}/${item.slug}`}
          item={item}
        />
      )}
    />
  );
}

export function PublishedContentSectionOpportunity(props: PublishedContentSectionProps) {
  return (
    <PublishedContentSectionLayout
      {...props}
      listClassName="grid gap-3 md:flex md:flex-col md:gap-4"
      renderRow={(item) => (
        <OpportunityListRow
          actionLabel={props.rowActionLabel}
          basePath={props.basePath}
          item={item}
        />
      )}
    />
  );
}

export function PublishedContentSectionDirectory(props: PublishedContentSectionProps) {
  return (
    <PublishedContentSectionLayout
      {...props}
      listClassName="grid gap-3 md:flex md:flex-col md:gap-4"
      renderRow={(item) => (
        <DirectoryListRow
          basePath={props.basePath}
          item={item}
        />
      )}
    />
  );
}

/**
 * @deprecated Use PublishedContentSectionDefault, PublishedContentSectionOpportunity, or PublishedContentSectionDirectory instead.
 */
export function PublishedContentSectionCourse(props: PublishedContentSectionProps) {
  return (
    <PublishedContentSectionLayout
      {...props}
      renderRow={(item) => (
        <CourseListRow
          actionLabel={props.rowActionLabel ?? 'Записаться'}
          basePath={props.basePath}
          item={item}
        />
      )}
    />
  );
}

/**
 * @deprecated Use PublishedContentSectionDefault, PublishedContentSectionOpportunity, PublishedContentSectionDirectory, or PublishedContentSectionCourse instead.
 */
export function PublishedContentSection(props: PublishedContentSectionProps & { rowVariant?: 'default' | 'opportunity' | 'directory' }) {
  const variant = props.rowVariant ?? 'default';

  if (variant === 'opportunity') {
    return <PublishedContentSectionOpportunity {...props} />;
  }

  if (variant === 'directory') {
    return <PublishedContentSectionDirectory {...props} />;
  }

  return <PublishedContentSectionDefault {...props} />;
}
