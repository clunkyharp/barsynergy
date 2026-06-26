import { ArrowUpRight, BadgeCheck } from 'lucide-react';
import { VERIFIED_SUPPLIER_ARIA } from '@/lib/public/content/trust-labels';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { HighlightChip } from '@/components/ui/highlight-chip';
import { MetaChip } from '@/components/ui/meta-chip';
import { displayFont } from '@/lib/fonts';
import type { PublishedContentItem, PublishedContentMetaGroup } from '@/lib/public/content';
import { detailHref, metaGroupValue } from './published-content-section-builders';

function directoryChips(item: PublishedContentItem) {
  const priority = ['Категория', 'Опыт', 'Формат', 'Сертификаты'];
  const usedLabels = new Set<string>();
  const entries = item.metaGroups?.filter((entry) => !['Продукты / услуги', 'География'].includes(entry.label ?? '')) ?? [];
  const compactEntries: PublishedContentMetaGroup[] = [];

  for (const label of priority) {
    const entry = entries.find((candidate) => candidate.label === label);
    if (entry) {
      compactEntries.push(entry);
      usedLabels.add(label);
    }
  }
  for (const entry of entries) {
    if (compactEntries.length >= 2) break;
    if (!entry.label || usedLabels.has(entry.label)) continue;
    compactEntries.push(entry);
  }
  compactEntries.splice(2);
  if (!compactEntries.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
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
  primaryActionHash
}: {
  item: PublishedContentItem;
  basePath: string;
  actionLabel?: string;
  profileLabel?: string;
  primaryActionHash?: string;
}) {
  const profileHref = detailHref(basePath, item.slug);
  const primaryHref = primaryActionHash ? `${profileHref}#${primaryActionHash}` : profileHref;
  const category = item.label;
  const geography = metaGroupValue(item, 'География') ?? metaGroupValue(item, 'Город');
  const name = item.subtitle && item.subtitle !== item.title ? item.subtitle : item.title;
  const summary = item.summary?.trim();

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[var(--border-strong)] focus-within:border-[var(--border-strong)]">
      {item.imageUrl ? (
        <div className="relative flex h-[124px] items-center justify-center overflow-hidden bg-[var(--surface-muted)]">
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[var(--motion-duration-media)] ease-[var(--motion-ease-move)] group-hover:scale-[1.04] motion-reduce:transition-none"
            style={{ backgroundImage: `url("${item.imageUrl}")` }}
          />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          {category ? (
            <span className="absolute left-3 top-3 inline-flex items-center rounded-[var(--radius-pill)] border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-white backdrop-blur-sm">
              {category}
            </span>
          ) : null}
          {item.statusLabel ? (
            <span className="absolute right-3 top-3">
              <HighlightChip variant="fresh">{item.statusLabel}</HighlightChip>
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-5">
        {!item.imageUrl && (category || item.statusLabel) ? (
          <div className="flex items-center justify-between gap-3">
            {category ? (
              <span className={`${displayFont.className} text-[11px] font-semibold uppercase leading-tight tracking-[var(--tracking-eyebrow-sm)] text-[var(--muted)]`}>
                {category}
              </span>
            ) : <span />}
            {item.statusLabel ? <HighlightChip variant="fresh">{item.statusLabel}</HighlightChip> : null}
          </div>
        ) : null}
        <div className="min-w-0">
          <h3 className="text-[1.1rem] font-bold leading-[1.25] text-[var(--text)]">
            <AppLink
              className="inline-flex items-center gap-1.5 transition-colors after:absolute after:inset-0 after:rounded-[inherit] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:underline"
              href={profileHref}
            >
              <span className="min-w-0 break-words">{name}</span>
              {item.isVerified ? (
                <BadgeCheck aria-label={VERIFIED_SUPPLIER_ARIA} className="shrink-0 text-[var(--accent)]" size={16} strokeWidth={1.8} />
              ) : null}
            </AppLink>
          </h3>
          {geography ? <span className="mt-1 block text-[13px] text-[var(--muted)]">{geography}</span> : null}
        </div>

        {directoryChips(item)}

        {summary ? <p className="line-clamp-2 text-[13px] leading-5 text-[var(--muted)]">{summary}</p> : null}

        <Button
          className="relative z-10 mt-auto w-full justify-center rounded-[var(--radius-md)] px-5 tracking-normal"
          href={primaryHref}
          variant="primary"
        >
          {actionLabel}
          <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.8} />
        </Button>
      </div>
    </article>
  );
}
