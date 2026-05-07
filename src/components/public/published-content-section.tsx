import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { EditorialListRow } from '@/components/ui/editorial-list-row';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import type { PublishedContentItem, PublishedContentList, PublishedContentMetaGroup } from '@/lib/public/content';
import { cn } from '@/lib/utils';

type ActionVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'inverse';

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
  filters?: ReactNode;
  countLabel?: string;
  listLabel?: string;
  listAction?: {
    href: string;
    label: string;
    variant?: ActionVariant;
  };
  sortLabel?: string;
  rowVariant?: 'default' | 'opportunity' | 'directory';
  rowActionLabel?: string;
};

function pageHref(content: PublishedContentList, basePath: string, page: number) {
  const params = new URLSearchParams();

  Object.entries(content.params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    if (value) {
      params.set(key, value);
    }
  });

  if (page > 1) {
    params.set('page', String(page));
  } else {
    params.delete('page');
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function detailHref(basePath: string, slug: string) {
  return `${basePath}/${slug}`;
}

function buildEmptyActions(
  basePath: string,
  hasActiveFilters: boolean,
  actions: Array<{ href: string; label: string; variant?: ActionVariant }>
) {
  if (!hasActiveFilters) {
    return actions;
  }

  const resetAction = { href: basePath, label: 'Сбросить фильтры', variant: 'primary' as const };
  return [resetAction, ...actions.filter((action) => action.href !== basePath)];
}

function renderOpportunityChip(entry: PublishedContentMetaGroup) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-1.5 text-[11px] leading-5 text-[var(--text)]',
        entry.tone === 'accent'
          ? 'border-[var(--accent)]/22 bg-[var(--accent-soft)] font-semibold text-[var(--accent)]'
          : 'border-[var(--border-default)] bg-[var(--surface-wash)]'
      )}
      key={`${entry.label ?? 'meta'}-${entry.value}`}
    >
      {entry.label ? <span className="font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{entry.label}</span> : null}
      <span className="break-words">{entry.value}</span>
    </span>
  );
}

function metaGroupValue(item: PublishedContentItem, label: string) {
  return item.metaGroups?.find((entry) => entry.label === label)?.value;
}

function renderVacancyFacts(item: PublishedContentItem) {
  const company = metaGroupValue(item, 'Компания') ?? item.subtitle;
  const city = metaGroupValue(item, 'Город');
  const facts = [
    { label: 'Компания / город', value: [company, city].filter(Boolean).join(' / ') || 'уточняется' },
    { label: 'График', value: metaGroupValue(item, 'График') ?? 'уточняется' },
    { label: 'Опыт', value: metaGroupValue(item, 'Опыт') ?? 'уточняется' },
    { label: 'Оплата', value: metaGroupValue(item, 'Оплата') ?? 'по договорённости' }
  ];

  return (
    <dl className="grid divide-y divide-[var(--line)] border-y border-[var(--line)]">
      {facts.map((fact) => (
        <div className="grid gap-1 py-2.5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-3" key={fact.label}>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{fact.label}</dt>
          <dd className="text-sm leading-6 text-[var(--text)]">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function compactMetaEntries(metaGroups: PublishedContentMetaGroup[], rowVariant: 'default' | 'opportunity' | 'directory') {
  if (rowVariant === 'opportunity') {
    return metaGroups.filter((entry) => ['Компания', 'Город', 'График', 'Опыт', 'Оплата'].includes(entry.label ?? '')).slice(0, 4);
  }

  if (rowVariant === 'directory') {
    return metaGroups
      .filter((entry) => !['Продукты / услуги', 'География'].includes(entry.label ?? ''))
      .slice(0, 3);
  }

  return metaGroups.slice(0, 3);
}

function renderCompactMetaLine(entries: PublishedContentMetaGroup[]) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <p className="line-clamp-2 text-[12px] font-medium leading-5 text-[var(--muted)] sm:hidden">
      {entries.map((entry, index) => (
        <span className={entry.tone === 'accent' ? 'font-semibold text-[var(--accent)]' : undefined} key={`${entry.label ?? 'meta'}-${entry.value}`}>
          {index > 0 ? <span className="px-1.5 text-[var(--line-strong)]">/</span> : null}
          {entry.label ? <span className="uppercase tracking-[0.1em]">{entry.label}: </span> : null}
          {entry.value}
        </span>
      ))}
    </p>
  );
}

function buildLabel(item: PublishedContentItem, rowVariant: 'default' | 'opportunity' | 'directory') {
  if (rowVariant === 'opportunity') {
    const city = item.metaGroups?.find((entry) => entry.label === 'Город')?.value;

    return (
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{item.label ?? 'Вакансия'}</span>
        {city ? <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">{city}</span> : null}
      </div>
    );
  }

  return <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{item.label ?? 'Запись'}</p>;
}

function buildLabelMeta(item: PublishedContentItem, rowVariant: 'default' | 'opportunity' | 'directory') {
  if (rowVariant === 'opportunity') {
    return item.updatedLabel ? <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">{item.updatedLabel}</span> : null;
  }

  if (rowVariant !== 'directory') {
    return null;
  }

  if (!item.statusLabel && !item.updatedLabel) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {item.statusLabel ? (
        <span className="inline-flex items-center rounded-[var(--radius-sm)] border border-[rgba(101,32,27,0.2)] bg-[rgba(101,32,27,0.05)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
          {item.statusLabel}
        </span>
      ) : null}
      {item.updatedLabel ? (
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">{item.updatedLabel}</span>
      ) : null}
    </div>
  );
}

function buildMeta(item: PublishedContentItem, rowVariant: 'default' | 'opportunity' | 'directory') {
  if (rowVariant === 'opportunity') {
    return renderVacancyFacts(item);
  }

  if (rowVariant === 'directory' && item.metaGroups && item.metaGroups.length > 0) {
    const compactEntries = compactMetaEntries(item.metaGroups, rowVariant);

    return (
      <div>
        {renderCompactMetaLine(compactEntries)}
        <div className="hidden flex-wrap gap-2.5 sm:flex">{item.metaGroups.map((entry) => renderOpportunityChip(entry))}</div>
      </div>
    );
  }

  if (item.meta.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 flex flex-wrap gap-2">
      {item.meta.map((entry) => (
        <MetaChip key={entry} variant="filter">
          {entry}
        </MetaChip>
      ))}
    </div>
  );
}

function titleInitials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function buildListMedia(item: PublishedContentItem, rowVariant: 'default' | 'opportunity' | 'directory') {
  if (rowVariant === 'opportunity') {
    return (
      <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] text-base font-semibold uppercase text-[var(--text)] md:h-16 md:w-16 md:text-lg">
        {item.imageUrl ? (
          <span aria-hidden="true" className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${item.imageUrl}")` }} />
        ) : (
          <span>{titleInitials(item.subtitle ?? item.title)}</span>
        )}
      </div>
    );
  }

  if (rowVariant === 'directory') {
    return (
      <div className="grid h-14 min-h-14 w-14 place-items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-2 text-center text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text)] md:h-auto md:min-h-28 md:w-full md:px-4 md:text-lg">
        {item.imageUrl ? (
          <span aria-hidden="true" className="h-full min-h-14 w-full bg-contain bg-center bg-no-repeat md:min-h-28" style={{ backgroundImage: `url("${item.imageUrl}")` }} />
        ) : (
          <span>{titleInitials(item.subtitle ?? item.title)}</span>
        )}
      </div>
    );
  }

  if (item.imageUrl) {
    return (
      <div
        aria-hidden="true"
        className="aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        style={{ backgroundImage: `url("${item.imageUrl}")` }}
      />
    );
  }

  return null;
}

export function PublishedContentSection({
  title,
  emptyTitle,
  emptyDescription,
  content,
  basePath,
  sectionId,
  excludedItemIds = [],
  emptyAction,
  emptyActions,
  filters,
  countLabel = 'Найдено',
  listLabel = 'Список',
  listAction,
  sortLabel,
  rowVariant = 'default',
  rowActionLabel = 'Открыть запись'
}: PublishedContentSectionProps) {
  const visibleItems = content.items.filter((item) => !excludedItemIds.includes(item.id));
  const resolvedEmptyActions = emptyActions ?? (emptyAction ? [emptyAction] : []);
  const hasActiveFilters = Object.keys(content.params).length > 0;
  const noResultsTitle = hasActiveFilters ? 'По этим параметрам ничего не найдено' : emptyTitle;
  const noResultsDescription = hasActiveFilters
    ? 'Сбросьте фильтры или измените запрос. Так можно вернуться к полному списку.'
    : emptyDescription;
  const emptyStateActions = buildEmptyActions(basePath, hasActiveFilters, resolvedEmptyActions);

  return (
    <section className="background-zone background-zone-ivory editorial-grid border-b border-[var(--line)] py-8 md:py-14" id={sectionId}>
      <div className="container grid gap-6 md:gap-8 xl:grid-cols-[minmax(16rem,0.58fr)_minmax(0,1.42fr)] xl:gap-10">
        <div className="xl:sticky xl:top-24 xl:self-start">
          <PublicDisplayTitle className="max-w-sm">{title}</PublicDisplayTitle>
          <div className="mt-5 flex flex-wrap gap-2">
            <MetaChip className="border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--text)]" variant="filter">
              {countLabel}: {content.total}
            </MetaChip>
          </div>
          {filters ? <div className="mt-5">{filters}</div> : null}
        </div>

        {content.items.length === 0 ? (
          <Panel className="space-y-4 border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
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
          <Panel className="space-y-4 border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
            <h3 className="text-xl font-semibold leading-7">Других записей пока нет</h3>
            <PublicBodyText className="max-w-2xl">
              Главная рекомендация уже показана выше. Когда появятся новые записи с такими фильтрами, они будут здесь.
            </PublicBodyText>
          </Panel>
        ) : (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <PublicEyebrow tone="muted">{listLabel}</PublicEyebrow>
                <span className="text-sm font-medium text-[var(--muted)]">{content.total} в списке</span>
                {sortLabel ? <span className="text-sm text-[var(--muted)]">{sortLabel}</span> : null}
              </div>
              {listAction ? (
                <Button className="gap-2 px-0 text-sm tracking-normal" href={listAction.href} size="sm" variant={listAction.variant ?? 'ghost'}>
                  {listAction.label}
                  <ArrowUpRight size={14} />
                </Button>
              ) : null}
            </div>

            <div className="divide-y divide-[var(--line)] border-y border-[var(--line)] md:flex md:flex-col md:gap-4 md:divide-y-0 md:border-y-0">
              {visibleItems.map((item) => (
                <EditorialListRow
                  actionLabel={rowActionLabel}
                  columns="content"
                  description={item.summary}
                  href={detailHref(basePath, item.slug)}
                  key={item.id}
                  label={buildLabel(item, rowVariant)}
                  labelMeta={buildLabelMeta(item, rowVariant)}
                  media={buildListMedia(item, rowVariant)}
                  meta={buildMeta(item, rowVariant)}
                  subtitle={item.subtitle}
                  title={item.title}
                  variant={rowVariant}
                />
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3">
              <MetaChip className="border-[var(--border-default)] bg-transparent text-[var(--muted)]" variant="default">
                Страница {content.page} из {content.totalPages}
              </MetaChip>
              {content.totalPages > 1 ? (
                <div className="flex flex-wrap gap-3">
                  <Button disabled={content.page <= 1} href={pageHref(content, basePath, content.page - 1)} variant="secondary">
                    Назад
                  </Button>
                  <Button disabled={content.page >= content.totalPages} href={pageHref(content, basePath, content.page + 1)} variant="secondary">
                    Вперед
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
