import { BadgeCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DirectoryCardAction = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
};

type DirectoryCardMeta = {
  label: string;
  value: string;
};

type DirectoryCardProps = {
  label: string;
  labelMeta?: string;
  statusLabel?: string;
  title: string;
  lead?: string;
  subtitle?: string;
  subtitleMeta?: string;
  description?: string;
  logoUrl?: string;
  logoFallback?: string;
  meta?: DirectoryCardMeta[];
  actions?: DirectoryCardAction[];
  websiteUrl?: string;
  verified?: boolean;
  className?: string;
};

export function DirectoryCard({
  label,
  labelMeta,
  statusLabel,
  title,
  lead,
  subtitle,
  description,
  logoUrl,
  logoFallback,
  meta,
  actions,
  websiteUrl,
  verified,
  className
}: DirectoryCardProps) {
  return (
    <article className={cn('public-list-row-shell md:p-6', className)}>
      <div className="grid min-w-0 gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">{label}</p>
            {statusLabel || labelMeta ? (
              <div className="flex flex-wrap items-center gap-2">
                {statusLabel ? (
                  <span className="inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--accent)]/20 bg-[var(--accent-soft)] px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--accent)]">
                    {statusLabel}
                  </span>
                ) : null}
                {labelMeta ? (
                  <span className="text-[11px] font-medium text-[var(--muted)]">{labelMeta}</span>
                ) : null}
              </div>
            ) : null}
          </div>

          <h3 className="public-list-row-title mt-3 text-balance text-[1.35rem] font-bold leading-[1.15] text-[var(--text)] md:text-[1.55rem]">
            {title}
          </h3>

          {lead ? (
            <div className="public-list-row-lead mt-3 text-[1.25rem] font-semibold leading-8 text-[var(--text)] md:text-[1.45rem]">
              {lead}
            </div>
          ) : null}

          {meta && meta.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {meta.map((item) => (
                <span
                  className="inline-flex items-center rounded-[var(--radius-full)] border border-[var(--border-subtle)] bg-[var(--surface-wash)] px-2.5 py-1 text-[11px] font-medium text-[var(--muted)]"
                  key={`${item.label}-${item.value}`}
                >
                  {item.value}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {(subtitle || logoUrl || description) ? (
          <div className="public-list-row-company min-w-0">
            <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[5rem_minmax(0,1fr)]">
              {logoUrl ? (
                <div
                  aria-label={`${logoFallback ?? label} логотип`}
                  className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)]"
                >
                  <span aria-hidden="true" className="h-full w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url("${logoUrl}")` }} />
                </div>
              ) : logoFallback ? (
                <div
                  aria-label={`${logoFallback} без логотипа`}
                  className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)]"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-9 place-items-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold uppercase tracking-[0.06em] text-[var(--accent)]"
                  >
                    {logoFallback.slice(0, 2)}
                  </span>
                </div>
              ) : null}

              <div className="min-w-0">
                {subtitle ? (
                  <div className="flex min-w-0 flex-wrap items-center gap-2 text-[1.05rem] font-semibold leading-7 text-[var(--text)]">
                    <span className="min-w-0 break-words">{subtitle}</span>
                    {verified ? (
                      <BadgeCheck aria-label="Проверено" className="shrink-0 text-[var(--accent)]" size={18} strokeWidth={2.2} />
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
          <div className="public-list-row-actions flex flex-col gap-2.5 border-t border-[var(--line)] pt-4 sm:flex-row sm:flex-wrap">
            {actions.map((action, index) => (
              <Button
                className="rounded-[var(--radius-md)] px-5 tracking-normal max-sm:w-full"
                href={action.href}
                key={`${action.href}-${action.label}`}
                size="md"
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
