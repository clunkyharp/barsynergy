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
  action: CardAction;
  className?: string;
  code?: ReactNode;
  density?: 'compact' | 'standard';
  description: ReactNode;
  eyebrow: ReactNode;
  meta?: ReactNode;
  metaLabel?: ReactNode;
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
  title: ReactNode;
};

function CardLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
      {children}
    </span>
  );
}

function CardCode({ children }: { children: ReactNode }) {
  return <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">{children}</span>;
}

export function RoleTaskCard({
  action,
  className,
  code,
  density = 'standard',
  description,
  eyebrow,
  meta,
  metaLabel,
  quickLinks,
  title
}: RoleTaskCardProps) {
  return (
    <article
      className={cn(
        'group flex h-full min-h-0 flex-col rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[color-mix(in_oklab,var(--surface),white_18%)] p-4 shadow-[0_12px_34px_rgba(20,20,18,0.028)] transition-colors hover:border-[var(--accent)]/32 hover:bg-[color-mix(in_oklab,var(--surface),white_24%)] focus-within:border-[var(--accent)]/32 md:p-5',
        density === 'compact' ? 'sm:min-h-[15rem]' : 'md:min-h-[24rem]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <CardLabel>{eyebrow}</CardLabel>
        {code ? <CardCode>{code}</CardCode> : null}
      </div>
      <h3
        className={cn(
          `${displayFont.className} mt-5 text-[1.65rem] font-semibold leading-[1.03] text-[var(--text)] group-hover:text-[var(--accent)] md:text-[2rem]`,
          density === 'compact' ? 'sm:min-h-[4.2rem]' : 'md:min-h-[4.8rem]'
        )}
      >
        {title}
      </h3>

      <div className="flex flex-1 flex-col">
        <p className={cn('text-sm leading-6 text-[var(--muted)]', density === 'compact' ? 'sm:min-h-[3.7rem]' : 'md:min-h-[4.6rem]')}>
          {description}
        </p>

        {quickLinks?.length ? (
          <div className={cn('mt-5', density === 'compact' ? 'sm:min-h-[7.4rem]' : 'md:min-h-[8.7rem]')}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Быстрые переходы</p>
            <div className="mt-2 grid gap-2">
              {quickLinks.map((link) => (
                <Link
                  className="group/link flex min-h-10 items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-2 text-sm font-semibold leading-5 text-[var(--text)] transition hover:border-[var(--accent)]/32 hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--field-focus-ring)]"
                  href={link.href}
                  key={link.href}
                >
                  <span className="truncate">{link.label}</span>
                  <ArrowUpRight className="shrink-0 transition-transform group-hover/link:translate-x-0.5" size={14} strokeWidth={1.8} />
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {meta ? (
          <div className={cn('mt-5', density === 'compact' ? 'sm:min-h-[3.3rem]' : 'md:min-h-[3.8rem]')}>
            {metaLabel ? <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{metaLabel}</p> : null}
            <p
              className={cn(
                'mt-1 inline-flex w-fit rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-2.5 py-1 text-xs font-semibold leading-5 text-[var(--text)]',
                !metaLabel && 'mt-0'
              )}
            >
              {meta}
            </p>
          </div>
        ) : null}
      </div>

      <Link
        className="mt-6 flex min-h-11 items-center justify-between gap-3 border-t border-[var(--line)] pt-4 text-sm font-semibold text-[var(--accent)] transition hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--field-focus-ring)]"
        href={action.href}
      >
        {action.label}
        <ArrowUpRight className="transition-transform group-hover:translate-x-1" size={16} strokeWidth={1.8} />
      </Link>
    </article>
  );
}

export function FeatureCard({ action, className, code, description, details, eyebrow, footer, title }: FeatureCardProps) {
  return (
    <article
      className={cn(
        'flex h-full min-h-0 flex-col rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4 transition-colors hover:border-[var(--accent)]/24 hover:bg-[var(--surface-wash-strong)] md:p-5',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {eyebrow ? <CardLabel>{eyebrow}</CardLabel> : <span aria-hidden="true" className="h-px w-12 bg-[var(--accent)]/45" />}
        {code ? <CardCode>{code}</CardCode> : null}
      </div>
      <h3 className={`${displayFont.className} mt-4 text-[1.45rem] font-semibold leading-[1.05] text-[var(--text)] md:min-h-[3.6rem] md:text-[1.7rem]`}>
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)] md:min-h-[4.5rem]">{description}</p>

      {details?.length ? (
        <dl className="mt-4 grid gap-2 border-t border-[var(--line)] pt-4 md:min-h-[8.8rem]">
          {details.map((detail, index) => (
            <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3" key={index}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{detail.label}</dt>
              <dd className="text-sm leading-6 text-[var(--text)]">{detail.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {(footer || action) ? (
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-3 md:pt-4">
          {footer ? <div className="text-sm font-semibold leading-6 text-[var(--accent)]">{footer}</div> : null}
          {action ? (
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] text-sm font-semibold text-[var(--accent)] transition hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--field-focus-ring)]"
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
