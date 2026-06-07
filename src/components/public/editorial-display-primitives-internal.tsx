'use client';

import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { AppLink } from '@/components/ui/app-link';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { EditorialAction, PrimitiveShellProps } from './editorial-display-primitives-types';

export function InlineAction({ action, className }: { action: EditorialAction; className?: string }) {
  return (
    <AppLink
      aria-label={action.ariaLabel}
      className={cn(
        'inline-flex min-h-10 w-fit items-center gap-2 rounded-[var(--radius-sm)] text-sm font-semibold text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none',
        'min-h-11 lg:min-h-10',
        className
      )}
      href={action.href}
    >
      <span>{action.label}</span>
      <ArrowUpRight className="shrink-0" size={16} strokeWidth={1.8} />
    </AppLink>
  );
}

export function CompactMark({ children }: { children: ReactNode }) {
  return (
    <span className="public-route-label">
      {children}
    </span>
  );
}

export function MetaText({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('public-meta-label', className)}>{children}</span>;
}

export function StatusPill({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <span
      className="public-status-badge"
      data-tone={accent ? 'accent' : 'muted'}
    >
      {children}
    </span>
  );
}

export function textValue(value: ReactNode) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

export function PrimitiveShell({ eyebrow, title, description, className, children, ...props }: PrimitiveShellProps) {
  const hasDescription = Boolean(description);

  return (
    <section className={cn('border-y border-[var(--line)] py-7', className)} {...props}>
      {(eyebrow || title || description) ? (
        <div className={cn('mb-6 grid gap-4', hasDescription && 'md:grid-cols-[minmax(12rem,0.44fr)_minmax(0,1fr)] md:items-end')}>
          <div>
            {eyebrow ? <PublicEyebrow>{eyebrow}</PublicEyebrow> : null}
            {title ? (
              <PublicDisplayTitle className={cn('mt-3 !text-[clamp(2rem,4vw,3.4rem)]', hasDescription ? 'max-w-xl' : 'max-w-none')} size="section">
                {title}
              </PublicDisplayTitle>
            ) : null}
          </div>
          {description ? (
            <PublicBodyText className="max-w-2xl md:justify-self-end" size="md">
              {description}
            </PublicBodyText>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

type LabeledValue = {
  label: ReactNode;
  value: ReactNode;
};

export function FactList({ items, compact = false }: { items: LabeledValue[]; compact?: boolean }) {
  return (
    <dl className={cn('grid gap-2', compact ? 'text-sm' : '')}>
      {items.map((item, index) => (
        <div
          className={cn(
            'rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-card-muted)] px-3 py-2.5',
            compact ? 'sm:grid sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-3' : ''
          )}
          key={index}
        >
          <dt>
            <MetaText>{item.label}</MetaText>
          </dt>
          <dd className={cn('text-sm leading-6 text-[var(--text)]', compact && 'mt-1 sm:mt-0')}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StructuredCard({
  action,
  children,
  className,
  description,
  footer,
  mark,
  status,
  title
}: {
  action?: EditorialAction;
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  footer?: ReactNode;
  mark: ReactNode;
  status?: ReactNode;
  title: ReactNode;
}) {
  return (
    <article
      className={cn(
        'public-card-shell flex flex-col p-4 md:p-5',
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <MetaText>{mark}</MetaText>
        </div>
        {status ? <StatusPill accent>{status}</StatusPill> : null}
      </div>
      <h3 className={`${displayFont.className} mt-4 text-[1.55rem] font-semibold leading-none text-[var(--text)] md:text-[1.8rem]`}>
        {title}
      </h3>
      {description ? <p className="mt-4 max-w-prose text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
      {footer ? <div className="mt-6 border-t border-[var(--line)] pt-5">{footer}</div> : null}
      {action ? (
        <div className="mt-auto pt-5">
          <InlineAction action={action} />
        </div>
      ) : null}
    </article>
  );
}
