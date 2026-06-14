import { cn } from '@/lib/utils';
import type { PublishedContentItem, PublishedContentMetaGroup, PublishedContentList } from '@/lib/public/content';

type ActionVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'inverse';

export type { ActionVariant };

export function pageHref(content: PublishedContentList, basePath: string, page: number) {
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

export function detailHref(basePath: string, slug: string) {
  return `${basePath}/${slug}`;
}

export function buildEmptyActions(
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

export function metaGroupValue(item: PublishedContentItem, label: string) {
  return item.metaGroups?.find((entry) => entry.label === label)?.value;
}

export function renderOpportunityChip(entry: PublishedContentMetaGroup) {
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
      {entry.label ? <span className="font-semibold uppercase tracking-[var(--tracking-marker)] text-[var(--muted)]">{entry.label}</span> : null}
      <span className="break-words">{entry.value}</span>
    </span>
  );
}

export function renderCompactChips(entries: PublishedContentMetaGroup[]) {
  if (entries.length === 0) {
    return null;
  }

  return <div className="flex flex-wrap gap-2.5">{entries.map((entry) => renderOpportunityChip(entry))}</div>;
}

export function titleInitials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function directoryFallbackKind(item: PublishedContentItem) {
  if (item.kind === 'partner') {
    return 'Партнёр';
  }

  return 'Поставщик';
}

export function encodedContactHref(topic: string, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams({ topic });

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  return `/contacts?${searchParams.toString()}#contact-form`;
}
