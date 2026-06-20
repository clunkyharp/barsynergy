import { Fragment, type ReactNode } from 'react';

function pluralRu(n: number, [one, few, many]: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
import { ArrowUpRight } from 'lucide-react';
import { PublicDisplayTitle } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { PublicEmptyState } from '@/components/public/public-empty-state';
import type { PublishedContentList } from '@/lib/public/content';
import { cn } from '@/lib/utils';
import { DefaultListRow } from './published-content-row-default';
import { DirectoryListRow } from './published-content-row-directory';
import { OpportunityListRow } from './published-content-row-opportunity';
import { CourseListRow } from './published-content-row-course';
import { SpecialistCard } from './specialist-card';
import { ContentSubscribeForm } from '@/components/public/content-subscribe-form';
import type { SpecialistCardItem } from '@/lib/public/content';
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
  countForms?: [string, string, string];
  listLabel?: string;
  listAction?: {
    href: string;
    label: string;
    variant?: ActionVariant;
  };
  sortLabel?: string;
  rowActionLabel?: string;
  showSidebarTitle?: boolean;
  subscribeTopic?: string;
  resetHref?: string;
  ignoredParamKeys?: string[];
  backgroundZone?: 'ivory' | 'graphite';
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
  countForms,
  listLabel = 'Список',
  listAction,
  sortLabel,
  showSidebarTitle = true,
  subscribeTopic,
  resetHref,
  ignoredParamKeys,
  backgroundZone = 'ivory',
  renderRow,
  listClassName
}: PublishedContentSectionProps & { renderRow: (item: PublishedContentList['items'][number]) => ReactNode; listClassName?: string }) {
  const visibleItems = content.items.filter((item) => !excludedItemIds.includes(item.id));
  const resolvedEmptyActions = emptyActions ?? (emptyAction ? [emptyAction] : []);
  const ignored = ignoredParamKeys ?? ['page', 'sort', 'pageSize'];
  const activeParamCount = Object.keys(content.params).filter((k) => !ignored.includes(k)).length;
  const hasActiveFilters = activeParamCount > 0;
  const resetBase = resetHref ?? basePath;
  const noResultsTitle = hasActiveFilters ? 'По этим параметрам ничего не найдено' : emptyTitle;
  const noResultsDescription = hasActiveFilters
    ? 'Сбросьте фильтры или измените запрос.'
    : emptyDescription;
  const emptyStateActions = buildEmptyActions(resetBase, hasActiveFilters, resolvedEmptyActions);
  const resolvedCountLabel = countForms ? pluralRu(content.total, countForms) : countLabel.toLowerCase();
  const listToolbar = (
    <div className="public-catalog-toolbar flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm text-[var(--muted)]">{content.total} {resolvedCountLabel}</span>
      <div className="flex items-center gap-3">
        {sortLabel ? (
          <span className="text-xs text-[var(--muted)]">↓ {sortLabel}</span>
        ) : null}
        {activeParamCount > 0 ? (
          <a
            className="text-xs font-semibold text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            href={resetBase}
          >
            Сбросить
          </a>
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
      className={`public-catalog-section background-zone background-zone-${backgroundZone} editorial-grid border-b border-[var(--line)] py-8 md:py-14`}
      id={sectionId}
    >
      {showSidebarTitle ? (
        <div className="container mb-6 md:mb-8">
          <PublicDisplayTitle
            as="h2"
            className="public-catalog-title max-w-sm"
          >
            {title}
          </PublicDisplayTitle>
        </div>
      ) : null}
      <div className="public-catalog-layout container grid gap-6 md:gap-8 xl:grid-cols-[minmax(16rem,0.48fr)_minmax(0,1.52fr)] xl:items-start xl:gap-8">
        <aside className="public-catalog-sidebar min-w-0 xl:self-stretch">
          <div className="xl:sticky xl:top-14 xl:max-h-[calc(100dvh-5rem)] xl:overflow-y-auto">
            {filters}
          </div>
        </aside>

        {content.items.length === 0 ? (
          <PublicEmptyState
            actions={emptyStateActions}
            description={noResultsDescription}
            eyebrow={listLabel}
            title={noResultsTitle}
          >
            {subscribeTopic && !hasActiveFilters ? (
              <ContentSubscribeForm topic={subscribeTopic} />
            ) : null}
          </PublicEmptyState>
        ) : visibleItems.length === 0 ? (
          <PublicEmptyState
            actions={secondaryEmptyActions}
            className="public-missing-state-secondary"
            compact
            description={secondaryEmptyDescription}
            title={secondaryEmptyTitle}
          />
        ) : (
          <div className="public-catalog-list-wrapper min-w-0">
            <div className="sticky top-14 lg:top-16 z-20 rounded-t-[var(--radius-md)] border-l border-r border-t border-[var(--border-default)] bg-[var(--surface-card)] px-5 py-3">
              {listToolbar}
            </div>
            <Panel className="public-catalog-list-panel min-w-0 overflow-hidden rounded-t-none border-t-0 border-[var(--border-default)] bg-[var(--surface-card)]" padding="none">
              <div className={cn('public-catalog-list-rows pt-8', listClassName ?? 'divide-y divide-[var(--line)] border-y border-[var(--line)] md:flex md:flex-col md:gap-4 md:divide-y-0 md:border-y-0')}>
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
          </div>
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
          actionLabel={props.rowActionLabel ?? 'Открыть вакансию'}
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
          primaryActionHash="supplier-contact-rail"
        />
      )}
    />
  );
}

export function PublishedContentSectionMaster(props: PublishedContentSectionProps) {
  return (
    <PublishedContentSectionLayout
      {...props}
      listClassName="grid gap-3 md:flex md:flex-col md:gap-4"
      renderRow={(item) => (
        <DirectoryListRow
          actionLabel={props.rowActionLabel ?? 'Смотреть профиль'}
          basePath={props.basePath}
          item={item}
          profileLabel="Подробнее"
        />
      )}
    />
  );
}

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

export function PublishedContentSectionSpecialist(props: PublishedContentSectionProps) {
  return (
    <PublishedContentSectionLayout
      {...props}
      listClassName="flex flex-col gap-3 md:gap-4"
      renderRow={(item) => (
        <SpecialistCard
          item={item as SpecialistCardItem}
          rowActionLabel={props.rowActionLabel}
        />
      )}
    />
  );
}
