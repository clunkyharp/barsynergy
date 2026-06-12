import { ArrowUpRight } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { cn } from '@/lib/utils';
import type { PublishedContentItem } from '@/lib/public/content';
import {
  detailHref,
  metaGroupValue,
  titleInitials
} from './published-content-section-builders';

function directoryLead(item: PublishedContentItem) {
  const value = metaGroupValue(item, 'Продукты / услуги') ?? metaGroupValue(item, 'География') ?? item.label ?? 'Поставки для заведений';
  return <span className="text-[1.35rem] font-bold text-[var(--text)]">{value}</span>;
}

function directoryDescription(item: PublishedContentItem) {
  const geography = metaGroupValue(item, 'География') ?? metaGroupValue(item, 'Город');
  const hasProductsLead = Boolean(metaGroupValue(item, 'Продукты / услуги'));
  const summary = hasProductsLead ? null : item.summary?.trim() ?? null;
  return [geography, summary].filter(Boolean).join('. ');
}

function directoryMeta(item: PublishedContentItem) {
  const compactEntries = item.metaGroups
    ?.filter((entry) => !['Продукты / услуги', 'География'].includes(entry.label ?? ''))
    .slice(0, 3);
  if (!compactEntries?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {compactEntries.map((entry) => (
        <MetaChip key={entry.label} variant="filter">
          {entry.value}
        </MetaChip>
      ))}
    </div>
  );
}

export function DirectoryListRow({
  item,
  basePath,
  actionLabel = 'Связаться',
  profileLabel = 'Профиль'
}: {
  item: PublishedContentItem;
  basePath: string;
  actionLabel?: string;
  profileLabel?: string;
}) {
  const media = item.imageUrl ? (
    <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] sm:h-14 sm:w-14 md:h-16 md:w-16">
      <span aria-hidden="true" className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${item.imageUrl}")` }} />
    </div>
  ) : (
    <div className="grid size-12 place-items-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] sm:size-14 md:size-16">
      <span className="text-sm font-bold text-[var(--accent)]">
        {titleInitials(item.subtitle ?? item.title)}
      </span>
    </div>
  );

  return (
    <article className="public-list-row-shell public-list-row-shell-hh public-list-row-shell-directory">
      <div className="grid min-w-0 gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">{item.label ?? 'Поставщик'}</span>
            {item.updatedLabel ? (
              <span className="text-[11px] font-medium text-[var(--muted)]">{item.updatedLabel}</span>
            ) : null}
            {item.statusLabel ? (
              <span className="inline-flex items-center rounded-full bg-[var(--warning-bg)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--warning-text)]">
                {item.statusLabel}
              </span>
            ) : null}
          </div>
          <h3 className="public-list-row-title mt-3 text-balance text-[1.35rem] font-bold leading-[1.15] text-[var(--text)] md:text-[1.55rem]">
            {item.title}
          </h3>
          <div className="public-list-row-lead mt-3 text-[1.25rem] font-semibold leading-8 text-[var(--text)] md:text-[1.45rem]">
            {directoryLead(item)}
          </div>
          <div className="public-list-row-meta mt-4">{directoryMeta(item)}</div>
        </div>
        <div className="public-list-row-company min-w-0">
          <div className="grid grid-cols-[3.25rem_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[4rem_minmax(0,1fr)]">
            {media}
            <div className="min-w-0">
              {item.subtitle ? (
                <div className="text-[1.05rem] font-semibold leading-7 text-[var(--text)]">
                  <span className="min-w-0 break-words">{item.subtitle}</span>
                </div>
              ) : null}
              <div className={cn('text-[15px] leading-7 text-[var(--muted)]', item.subtitle ? 'mt-3' : '')}>
                {directoryDescription(item)}
              </div>
            </div>
          </div>
        </div>
        <div className="public-list-row-actions flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <Button
            className="public-list-row-primary-action rounded-[var(--radius-md)] px-5 tracking-normal max-sm:w-full"
            href={detailHref(basePath, item.slug)}
            size="lg"
            variant="primary"
          >
            {actionLabel}
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.8} />
          </Button>
          <Button
            className="public-list-row-secondary-action rounded-[var(--radius-md)] px-5 tracking-normal max-sm:w-full"
            href={detailHref(basePath, item.slug)}
            size="lg"
            variant="secondary"
          >
            {profileLabel}
          </Button>
        </div>
        {item.websiteUrl ? (
          <div className="public-list-row-website min-w-0">
            <AppLink className="text-sm leading-6 text-[var(--muted)] transition-colors hover:text-[var(--accent)]" href={item.websiteUrl}>
              {item.websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}
            </AppLink>
          </div>
        ) : null}
      </div>
    </article>
  );
}
