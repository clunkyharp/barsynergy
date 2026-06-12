import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type CardAction = {
  href: string;
  label: string;
};

type RoleTaskCardProps = {
  action?: CardAction;
  className?: string;
  code?: ReactNode;
  density?: 'compact' | 'standard';
  description: ReactNode;
  eyebrow?: ReactNode;
  meta?: ReactNode;
  metaLabel?: ReactNode;
  presentation?: 'card' | 'row';
  priority?: boolean;
  quickLinks?: readonly CardAction[];
  title: ReactNode;
};

type FeatureCardDetail = {
  label: ReactNode;
  value: ReactNode;
};

type FeatureCardProps = {
  action?: CardAction;
  className?: string;
  code?: ReactNode;
  description: ReactNode;
  details?: FeatureCardDetail[];
  eyebrow?: ReactNode;
  footer?: ReactNode;
  index?: ReactNode;
  kind?: ReactNode;
  presentation?: 'card' | 'row';
  result?: ReactNode;
  resultLabel?: ReactNode;
  title: ReactNode;
};

function CardLabel({ children }: { children: ReactNode }) {
  return <span className="public-meta-label public-card-label">{children}</span>;
}

function CardCode({ children }: { children: ReactNode }) {
  return <span className="public-route-label public-card-code">{children}</span>;
}

export function RoleTaskCard({
  action,
  className,
  code,
  description,
  eyebrow,
  meta,
  metaLabel,
  presentation = 'card',
  priority = false,
  quickLinks,
  title
}: RoleTaskCardProps) {
  const hasHeaderMeta = Boolean(eyebrow || code || meta);

  if (presentation === 'row') {
    return (
      <article
        className={cn(
          'group grid gap-3 border-b border-[var(--line)] py-4 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.1fr)_auto] md:items-center md:gap-5',
          className
        )}
        data-priority={priority || undefined}
      >
        <div className="min-w-0">
          {hasHeaderMeta ? (
            <div className="flex flex-wrap items-center gap-2">
              {eyebrow ? <CardLabel>{eyebrow}</CardLabel> : null}
              {code ? <CardCode>{code}</CardCode> : null}
              {meta ? (
                <span className="public-card-meta">
                  {metaLabel ? <span className="sr-only">{metaLabel}: </span> : null}
                  {meta}
                </span>
              ) : null}
            </div>
          ) : null}
          <h3
            className={cn(
              `${displayFont.className} text-[1.45rem] font-semibold leading-[1.08] text-[var(--text)] md:text-[1.75rem]`,
              hasHeaderMeta && 'mt-3'
            )}
          >
            {title}
          </h3>
        </div>

        <div className="min-w-0">
          <p className="text-sm leading-6 text-[var(--muted)]">{description}</p>
          {quickLinks?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <Link
                  className="public-card-meta group/link min-h-10 gap-2 transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--card-border-hover)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--field-focus-ring)] motion-reduce:transition-none"
                  href={link.href}
                  key={link.href}
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="shrink-0" size={13} strokeWidth={1.8} />
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {action ? (
          <Link
            className="public-card-action min-h-11 w-fit focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--field-focus-ring)] md:justify-self-end"
            href={action.href}
          >
            {action.label}
            <ArrowUpRight size={16} strokeWidth={1.8} />
          </Link>
        ) : null}
      </article>
    );
  }

  return (
    <article
      className={cn(
        'public-card-shell group flex h-full min-h-0 flex-col p-4 md:p-5',
        className
      )}
      data-priority={priority || undefined}
    >
      {hasHeaderMeta ? (
        <div className="flex items-start justify-between gap-3">
          {eyebrow ? <CardLabel>{eyebrow}</CardLabel> : null}
          {code ? <CardCode>{code}</CardCode> : null}
        </div>
      ) : null}
      <h3
        className={cn(
          `${displayFont.className} text-[1.45rem] font-semibold leading-[1.08] text-[var(--text)] md:text-[1.65rem]`,
          hasHeaderMeta && 'mt-4'
        )}
      >
        {title}
      </h3>

      <div className="flex flex-1 flex-col">
        <p className={cn('text-sm leading-6 text-[var(--muted)]')}>
          {description}
        </p>

        {quickLinks?.length ? (
          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Быстрые переходы</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <Link
                  className="public-card-meta group/link min-h-8 gap-2 transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--card-border-hover)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--field-focus-ring)] motion-reduce:transition-none"
                  href={link.href}
                  key={link.href}
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="shrink-0" size={13} strokeWidth={1.8} />
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {meta ? (
          <div className="mt-4">
            {metaLabel ? <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{metaLabel}</p> : null}
            <p
              className={cn(
                'public-card-meta mt-1 w-fit',
                !metaLabel && 'mt-0'
              )}
            >
              {meta}
            </p>
          </div>
        ) : null}
      </div>

      {action ? (
        <Link
          className="public-card-action mt-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--field-focus-ring)]"
          href={action.href}
        >
          {action.label}
          <ArrowUpRight size={16} strokeWidth={1.8} />
        </Link>
      ) : null}
    </article>
  );
}

export function FeatureCard({
  action,
  className,
  code,
  description,
  details,
  eyebrow,
  footer,
  index,
  kind,
  presentation = 'card',
  result,
  resultLabel = 'Результат',
  title
}: FeatureCardProps) {
  if (presentation === 'row') {
    const hasLeftMeta = Boolean(index || kind || code || eyebrow);

    return (
      <article
        className={cn(
          'group grid grid-cols-1 gap-3 border-b border-[var(--line)] py-4 transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:bg-[var(--surface-wash)] focus-within:bg-[var(--surface-wash)] motion-reduce:transition-none md:grid-cols-[minmax(7rem,0.28fr)_minmax(0,1fr)_minmax(12rem,0.46fr)] md:items-start md:gap-5 md:px-3 md:py-5',
          className
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2 md:block">
          {index ? <span className="public-route-label">{index}</span> : null}
          {kind ? <span className="public-meta-label md:mt-3 md:flex">{kind}</span> : null}
          {!kind && eyebrow ? <CardLabel>{eyebrow}</CardLabel> : null}
          {!index && code ? <CardCode>{code}</CardCode> : null}
        </div>

        <div className="min-w-0">
          <h3 className={`${displayFont.className} text-[1.45rem] font-semibold leading-[1.08] text-[var(--text)] md:text-[1.75rem]`}>
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
          {details?.length ? (
            <dl className="mt-3 grid gap-2">
              {details.map((detail, index) => (
                <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-card-muted)] px-3 py-2.5" key={index}>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{detail.label}</dt>
                  <dd className="text-sm leading-6 text-[var(--text)]">{detail.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className={cn('min-w-0', !hasLeftMeta && 'md:col-start-3')}>
          {result ? (
            <>
              <span className="public-meta-label">{resultLabel}</span>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text)]">{result}</p>
            </>
          ) : null}
          {footer ? <div className="text-sm font-semibold leading-6 text-[var(--accent)]">{footer}</div> : null}
          {action ? (
            <Link
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] text-sm font-semibold text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--field-focus-ring)] motion-reduce:transition-none"
              href={action.href}
            >
              {action.label}
              <ArrowUpRight size={16} strokeWidth={1.8} />
            </Link>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        'public-card-shell flex h-full min-h-0 flex-col p-4 md:p-5',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {eyebrow ? <CardLabel>{eyebrow}</CardLabel> : <span aria-hidden="true" className="h-px w-12 bg-[var(--accent)]/45" />}
        {code ? <CardCode>{code}</CardCode> : null}
      </div>
      <h3 className={`${displayFont.className} mt-4 text-[1.45rem] font-semibold leading-[1.05] text-[var(--text)] md:text-[1.7rem]`}>
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>

      {details?.length ? (
        <dl className="mt-4 grid gap-2">
          {details.map((detail, index) => (
            <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-card-muted)] px-3 py-2.5" key={index}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{detail.label}</dt>
              <dd className="text-sm leading-6 text-[var(--text)]">{detail.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {(footer || action) ? (
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3 md:pt-4">
          {footer ? <div className="text-sm font-semibold leading-6 text-[var(--accent)]">{footer}</div> : null}
          {action ? (
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] text-sm font-semibold text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--field-focus-ring)] motion-reduce:transition-none"
              href={action.href}
            >
              {action.label}
              <ArrowUpRight size={16} strokeWidth={1.8} />
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
