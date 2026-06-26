import { BadgeCheck } from 'lucide-react';
import { VERIFIED_COMPANY_ARIA } from '@/lib/public/content/trust-labels';
import { AppLink } from '@/components/ui/app-link';
import { HighlightChip } from '@/components/ui/highlight-chip';
import type { PublishedContentItem, PublishedContentMetaGroup } from '@/lib/public/content';
import {
  detailHref,
  metaGroupValue,
  renderCompactChips,
  titleInitials
} from './published-content-section-builders';

function opportunityMeta(item: PublishedContentItem) {
  const compactEntries: PublishedContentMetaGroup[] = ['Опыт', 'Формат', 'График']
    .map((label): PublishedContentMetaGroup | null => {
      const value = metaGroupValue(item, label);
      return value ? { label, value } : null;
    })
    .filter((entry): entry is PublishedContentMetaGroup => Boolean(entry));
  return renderCompactChips(compactEntries);
}

function vacancySalary(item: PublishedContentItem) {
  const value = metaGroupValue(item, 'Оплата') ?? 'по договорённости';
  return <span className="tabular-nums text-[1.3rem] font-semibold text-[var(--accent-ink)]">{value}</span>;
}

export function OpportunityListRow({
  item,
  basePath
}: {
  item: PublishedContentItem;
  basePath: string;
  actionLabel?: string;
}) {
  return (
    <article className="public-list-row-shell public-list-row-shell-hh public-list-row-shell-vacancy group relative flex flex-col gap-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {item.imageUrl ? (
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)]">
              <span
                aria-hidden="true"
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${item.imageUrl}")` }}
              />
            </span>
          ) : (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] text-[13px] font-bold text-[var(--muted)]">
              {titleInitials(item.subtitle ?? item.title)}
            </span>
          )}
          <div className="min-w-0">
            {item.subtitle ? (
              <div className="flex items-center gap-1.5 text-[0.95rem] font-semibold leading-5 text-[var(--text)]">
                <span className="truncate">{item.subtitle}</span>
                {item.isVerified ? (
                  <BadgeCheck aria-label={VERIFIED_COMPANY_ARIA} className="shrink-0 text-[var(--accent)]" size={15} strokeWidth={1.8} />
                ) : null}
              </div>
            ) : null}
            {(() => {
              const city = metaGroupValue(item, 'Город');
              return city ? <span className="text-[12px] text-[var(--muted)]">{city}</span> : null;
            })()}
          </div>
        </div>
        {item.isNew ? (
          <HighlightChip variant="fresh">Новая</HighlightChip>
        ) : item.updatedLabel ? (
          <span className="shrink-0 text-[11px] text-[var(--muted)]">{item.updatedLabel}</span>
        ) : null}
      </div>

      <h3 className="text-[1.2rem] font-bold leading-[1.2] text-[var(--text)] md:text-[1.3rem]">
        <AppLink
          className="transition-colors after:absolute after:inset-0 after:rounded-[inherit] focus-visible:outline-none group-hover:text-[var(--accent)]"
          href={detailHref(basePath, item.slug)}
        >
          {item.title}
        </AppLink>
      </h3>

      <div>{vacancySalary(item)}</div>
      <div>{opportunityMeta(item)}</div>
    </article>
  );
}
