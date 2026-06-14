import { ArrowUpRight, BadgeCheck } from 'lucide-react';
import { VERIFIED_COMPANY_ARIA } from '@/lib/public/content/trust-labels';
import { AvatarFallback } from '@/components/ui/avatar-fallback';
import { Button } from '@/components/ui/button';
import { HighlightChip } from '@/components/ui/highlight-chip';
import { cn } from '@/lib/utils';
import type { PublishedContentItem, PublishedContentMetaGroup } from '@/lib/public/content';
import {
  detailHref,
  metaGroupValue,
  renderCompactChips,
  titleInitials
} from './published-content-section-builders';

function opportunityLabel(item: PublishedContentItem) {
  const city = item.metaGroups?.find((entry) => entry.label === 'Город')?.value;
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]">{item.label ?? 'Вакансия'}</span>
      {city ? <span className="text-[11px] font-medium text-[var(--muted)]">{city}</span> : null}
    </div>
  );
}

function opportunityLabelMeta(item: PublishedContentItem) {
  return item.updatedLabel ? <span className="text-[11px] font-medium text-[var(--muted)]">{item.updatedLabel}</span> : null;
}

function opportunityMeta(item: PublishedContentItem) {
  const compactEntries: PublishedContentMetaGroup[] = ['Опыт', 'Формат', 'График']
    .map((label): PublishedContentMetaGroup | null => {
      const value = metaGroupValue(item, label);
      return value ? { label, value } : null;
    })
    .filter((entry): entry is PublishedContentMetaGroup => Boolean(entry));
  return renderCompactChips(compactEntries);
}

function vacancyLead(item: PublishedContentItem) {
  const value = metaGroupValue(item, 'Оплата') ?? 'по договорённости';
  return <span className="tabular-nums text-[1.35rem] font-semibold text-[var(--accent)]">{value}</span>;
}

function opportunityDescription(item: PublishedContentItem) {
  const city = metaGroupValue(item, 'Город');
  const summary = item.summary?.trim();
  return [city, summary].filter(Boolean).join('. ');
}

function opportunityActions(item: PublishedContentItem, basePath: string, actionLabel: string) {
  return [
    { href: detailHref(basePath, item.slug), label: actionLabel, variant: 'primary' as const }
  ];
}

export function OpportunityListRow({
  item,
  basePath,
  actionLabel = 'Открыть вакансию'
}: {
  item: PublishedContentItem;
  basePath: string;
  actionLabel?: string;
}) {
  const actions = opportunityActions(item, basePath, actionLabel);
  const media = item.imageUrl ? (
    <div className="hidden sm:block">
      <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] md:h-16 md:w-16">
        <span aria-hidden="true" className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${item.imageUrl}")` }} />
      </div>
    </div>
  ) : (
    <div className="hidden sm:block">
      <AvatarFallback initials={titleInitials(item.subtitle ?? item.title)} />
    </div>
  );

  return (
    <article className="public-list-row-shell public-list-row-shell-hh public-list-row-shell-vacancy">
      <div className="grid min-w-0 gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <div>{opportunityLabel(item)}</div>
            <div>{opportunityLabelMeta(item)}</div>
            {item.isNew ? (
              <HighlightChip variant="fresh">Новая</HighlightChip>
            ) : null}
          </div>
          <h3 className="public-list-row-title mt-3 text-balance text-[1.35rem] font-bold leading-[1.15] text-[var(--text)] md:text-[1.55rem]">
            {item.title}
          </h3>
          <div className="public-list-row-lead mt-3 text-[1.25rem] font-semibold leading-8 text-[var(--text)] md:text-[1.45rem]">
            {vacancyLead(item)}
          </div>
          <div className="public-list-row-meta mt-5 sm:mt-4">{opportunityMeta(item)}</div>
        </div>
        <div className="public-list-row-company min-w-0">
          <div className="grid gap-3 sm:grid-cols-[4rem_minmax(0,1fr)] sm:items-start">
            {media}
            <div className="min-w-0">
              {item.subtitle ? (
                <div className="flex min-w-0 flex-wrap items-center gap-2 text-[1.05rem] font-semibold leading-7 text-[var(--text)]">
                  <span className="min-w-0 break-words">{item.subtitle}</span>
                  {item.isVerified ? (
                    <BadgeCheck aria-label={VERIFIED_COMPANY_ARIA} size={18} strokeWidth={1.8} className="shrink-0 text-[var(--accent)]" />
                  ) : null}
                </div>
              ) : null}
              <div className={cn('text-[15px] leading-7 text-[var(--muted)]', item.subtitle ? 'mt-3' : '')}>
                {opportunityDescription(item)}
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
                {index === 0 ? <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.8} /> : null}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
