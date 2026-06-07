import { BadgeCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PublishedContentItem } from '@/lib/public/content';
import {
  encodedContactHref,
  metaGroupValue,
  renderCompactChips,
  titleInitials,
  directoryFallbackKind
} from './published-content-section-builders';

function directoryLabel(item: PublishedContentItem) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{item.label ?? 'Запись'}</p>;
}

function directoryLabelMeta(item: PublishedContentItem) {
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

function directoryMeta(item: PublishedContentItem) {
  if (!item.metaGroups || item.metaGroups.length === 0) {
    return null;
  }
  const compactEntries = item.metaGroups
    .filter((entry) => !['Продукты / услуги', 'География'].includes(entry.label ?? ''))
    .slice(0, 3);
  return renderCompactChips(compactEntries);
}

function supplierLead(item: PublishedContentItem) {
  return metaGroupValue(item, 'Продукты / услуги') ?? metaGroupValue(item, 'География') ?? item.label ?? 'Поставки для заведений';
}

function directoryDescription(item: PublishedContentItem) {
  const geography = metaGroupValue(item, 'География') ?? metaGroupValue(item, 'Город');
  const summary = item.summary?.trim();
  return [geography, summary].filter(Boolean).join('. ');
}

function directoryActions(item: PublishedContentItem, basePath: string) {
  return [
    {
      href: encodedContactHref('supplier-contact', {
        companyName: item.title,
        supplierCategory: item.label ?? undefined
      }),
      label: 'Связаться'
    },
    { href: `${basePath}/${item.slug}`, label: 'Профиль', variant: 'secondary' as const }
  ];
}

export function DirectoryListRow({
  item,
  basePath
}: {
  item: PublishedContentItem;
  basePath: string;
}) {
  const actions = directoryActions(item, basePath);
  const media = item.imageUrl ? (
    <div
      aria-label={`${directoryFallbackKind(item)} логотип`}
      className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)]"
    >
      <span aria-hidden="true" className="h-full w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url("${item.imageUrl}")` }} />
    </div>
  ) : (
    <div
      aria-label={`${directoryFallbackKind(item)} без логотипа`}
      className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)]"
    >
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold uppercase tracking-[0.06em] text-[var(--accent)]"
        data-logo-fallback={item.kind ?? 'directory'}
      >
        {titleInitials(item.subtitle ?? item.title) || '—'}
      </span>
    </div>
  );

  return (
    <article className="public-list-row-shell public-list-row-shell-hh public-list-row-shell-supplier">
      <div className="grid min-w-0 gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <div>{directoryLabel(item)}</div>
            <div>{directoryLabelMeta(item)}</div>
          </div>
          <h3 className="public-list-row-title mt-3 text-balance text-[1.85rem] font-bold leading-[1.08] text-[var(--text)] md:text-[2.2rem]">
            {item.title}
          </h3>
          <div className="public-list-row-lead mt-3 text-[1.25rem] font-semibold leading-8 text-[var(--text)] md:text-[1.45rem]">
            {supplierLead(item)}
          </div>
          {directoryMeta(item) ? <div className="public-list-row-meta mt-4">{directoryMeta(item)}</div> : null}
        </div>
        <div className="public-list-row-company min-w-0">
          <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[5rem_minmax(0,1fr)]">
            {media}
            <div className="min-w-0">
              {item.subtitle ? (
                <div className="flex min-w-0 flex-wrap items-center gap-2 text-[1.05rem] font-semibold leading-7 text-[var(--text)]">
                  <span className="min-w-0 break-words">{item.subtitle}</span>
                  <BadgeCheck aria-label="Проверено" className="shrink-0 text-[var(--accent)]" size={18} strokeWidth={2.2} />
                  {item.websiteUrl ? (
                    <a
                      className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
                      href={item.websiteUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Сайт
                      <ExternalLink size={14} strokeWidth={1.8} />
                    </a>
                  ) : null}
                </div>
              ) : item.websiteUrl ? (
                <div className="flex items-center gap-2">
                  <a
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
                    href={item.websiteUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Сайт
                    <ExternalLink size={14} strokeWidth={1.8} />
                  </a>
                </div>
              ) : null}
              <div className={cn('text-[15px] leading-7 text-[var(--muted)]', item.subtitle || item.websiteUrl ? 'mt-3' : '')}>
                {directoryDescription(item)}
              </div>
            </div>
          </div>
        </div>
        {actions.length > 0 ? (
          <div className="public-list-row-actions flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            {actions.map((action, index) => (
              <Button
                className={cn(
                  'rounded-[var(--radius-md)] px-5 tracking-normal max-sm:w-full',
                  index === 0 ? 'public-list-row-primary-action' : 'public-list-row-secondary-action'
                )}
                href={action.href}
                key={`${action.href}-${action.label}`}
                size="lg"
                variant={action.variant ?? (index === 0 ? 'primary' : 'secondary')}
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
