import { BadgeCheck, ExternalLink, MapPin } from 'lucide-react';
import { VERIFIED_SUPPLIER_ARIA } from '@/lib/public/content/trust-labels';
import { AvatarFallback } from '@/components/ui/avatar-fallback';
import { Button } from '@/components/ui/button';
import { HighlightChip } from '@/components/ui/highlight-chip';
import { cn } from '@/lib/utils';
import type { CardAction, CardMedia, CardDensity } from './card-types';

type DirectoryCardMeta = {
  label: string;
  value: string;
};

type DirectoryCardProps = {
  label: string;
  labelMeta?: string;
  labelMetaKind?: 'location' | 'default';
  statusLabel?: string;
  title: string;
  lead?: string;
  leadLabel?: string;
  leadAccent?: boolean;
  subtitle?: string;
  subtitleMeta?: string;
  description?: string;
  media?: CardMedia;
  meta?: DirectoryCardMeta[];
  actions?: CardAction[];
  websiteUrl?: string;
  verified?: boolean;
  density?: CardDensity;
  className?: string;
};

function MediaBlock({ media, label, logoFallback }: { media: CardMedia; label: string; logoFallback?: string }) {
  if (media.kind === 'none') return null;

  if (media.kind === 'logo') {
    if (media.src) {
      return (
        <div
          aria-label={`${logoFallback ?? label} логотип`}
          className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)]"
        >
          <span aria-hidden="true" className="h-full w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url("${media.src}")` }} />
        </div>
      );
    }

    return (
      <div
        aria-label={`${logoFallback ?? label} без логотипа`}
        className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)]"
      >
        <AvatarFallback initials={media.initials ?? logoFallback?.slice(0, 2) ?? label.slice(0, 2)} size="sm" />
      </div>
    );
  }

  if (media.kind === 'image' && media.src) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] bg-[var(--surface-muted)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${media.src}")` }}
        />
      </div>
    );
  }

  return null;
}

export function DirectoryCard({
  label,
  labelMeta,
  labelMetaKind = 'default',
  statusLabel,
  title,
  lead,
  leadLabel,
  leadAccent = false,
  subtitle,
  description,
  verified,
  media = { kind: 'none' },
  meta,
  actions,
  websiteUrl,
  density = 'comfortable',
  className
}: DirectoryCardProps) {
  const isCompact = density === 'compact';

  return (
    <article className={cn(
      'public-list-row-shell',
      isCompact ? 'md:p-5' : 'md:p-6',
      isCompact && 'gap-3',
      className
    )}>
      <div className="grid min-w-0 gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent-ink)]">
              {label}
            </span>
            {statusLabel ? (
              <HighlightChip variant="fresh">{statusLabel}</HighlightChip>
            ) : null}
            {labelMeta ? (
              <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--border-subtle)] bg-[var(--surface-wash)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--muted)]">
                {labelMetaKind === 'location' ? <MapPin aria-hidden="true" size={10} strokeWidth={2.2} /> : null}
                {labelMeta}
              </span>
            ) : null}
          </div>

          <h3 className={cn(
            'text-balance font-bold leading-[1.15] text-[var(--text)]',
            isCompact ? 'mt-2.5 text-[1.2rem] md:text-[1.35rem]' : 'mt-3 text-[1.35rem] md:text-[1.55rem]'
          )}>
            {title}
          </h3>

          {lead ? (
            <div className={cn('leading-snug', isCompact ? 'mt-2' : 'mt-3')}>
              {leadLabel ? (
                <span className="block text-[11px] font-medium uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--muted)]">
                  {leadLabel}
                </span>
              ) : null}
              <span className={cn(
                'tabular-nums font-semibold',
                isCompact ? 'text-[1.15rem] md:text-[1.3rem]' : 'text-[1.25rem] md:text-[1.45rem]',
                leadAccent ? 'text-[var(--accent)]' : 'text-[var(--text)]'
              )}>
                {lead}
              </span>
            </div>
          ) : null}

          {meta && meta.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {meta.slice(0, 3).map((item) => (
                <span
                  className="inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--border-subtle)] bg-[var(--surface-wash)] px-2.5 py-1 text-[11px] font-medium text-[var(--muted)]"
                  key={`${item.label}-${item.value}`}
                >
                  {item.label ? `${item.label}: ${item.value}` : item.value}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {(subtitle || websiteUrl || description || media.kind !== 'none') ? (
          <div className="public-list-row-company min-w-0">
            <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[5rem_minmax(0,1fr)]">
              {media.kind !== 'none' ? <MediaBlock media={media} label={label} /> : null}

              <div className="min-w-0">
                {subtitle ? (
                  <div className="flex min-w-0 flex-wrap items-center gap-2 text-[1.05rem] font-semibold leading-7 text-[var(--text)]">
                    <span className="min-w-0 break-words">{subtitle}</span>
                    {verified ? (
                      <BadgeCheck aria-label={VERIFIED_SUPPLIER_ARIA} size={14} strokeWidth={1.8} className="shrink-0 text-[var(--accent)]" />
                    ) : null}
                    {websiteUrl ? (
                      <a
                        className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
                        href={websiteUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Сайт
                        <ExternalLink size={14} strokeWidth={1.8} />
                      </a>
                    ) : null}
                  </div>
                ) : websiteUrl ? (
                  <div className="flex items-center gap-2">
                    <a
                      className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
                      href={websiteUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Сайт
                      <ExternalLink size={14} strokeWidth={1.8} />
                    </a>
                  </div>
                ) : null}

                {description ? (
                  <div className={cn('text-[15px] leading-7 text-[var(--muted)]', subtitle || websiteUrl ? 'mt-3' : '')}>
                    {description}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {actions && actions.length > 0 ? (
          <div className="flex flex-col gap-2.5 border-t border-[var(--line)] pt-4 sm:flex-row sm:flex-wrap">
            {actions.map((action, index) => (
              <Button
                className="rounded-[var(--radius-md)] px-5 tracking-normal max-sm:w-full"
                href={action.href}
                key={`${action.href}-${action.label}`}
                size={isCompact ? 'md' : 'lg'}
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
