import type { HTMLAttributes, ReactNode } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { Panel } from '@/components/ui/panel';
import { cn } from '@/lib/utils';

type StatCardProps = HTMLAttributes<HTMLDivElement> & {
  href?: string;
  label: string;
  value: ReactNode;
  description?: ReactNode;
  status?: ReactNode;
  delta?: ReactNode;
  tone?: 'default' | 'inverse';
  valueClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  statusClassName?: string;
  deltaClassName?: string;
};

function StatCardInner({
  className,
  label,
  value,
  description,
  status,
  delta,
  tone = 'default',
  valueClassName,
  labelClassName,
  descriptionClassName,
  statusClassName,
  deltaClassName,
}: StatCardProps) {
  const isInverse = tone === 'inverse';

  return (
    <Panel
      className={cn(
        'flex h-full flex-col justify-between space-y-3 border-[var(--border-default)] shadow-none',
        isInverse ? 'bg-[var(--surface-inverse)]' : 'bg-[var(--surface)]',
        className
      )}
      padding="md"
      tone={isInverse ? 'inverse' : 'default'}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              'overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)]',
              isInverse ? 'text-[var(--editorial-dark-label)]' : 'text-[var(--muted)]',
              labelClassName
            )}
          >
            {label}
          </p>
          <div className={cn('mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em] text-[var(--text)]', isInverse && 'text-white', valueClassName)}>
            {value}
          </div>
        </div>
        {status ? (
          <div
            className={cn(
              isInverse ? 'text-xs font-semibold text-[var(--editorial-dark-muted)]' : 'text-xs font-semibold text-[var(--muted)]',
              statusClassName
            )}
          >
            {status}
          </div>
        ) : null}
      </div>
      {description || delta ? (
        <div
          className={cn(
            'flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-6',
            isInverse ? 'text-[var(--editorial-dark-muted)]' : 'text-[var(--muted)]',
            descriptionClassName
          )}
        >
          {description ? <span>{description}</span> : null}
          {delta ? (
            <span
              className={cn(
                'text-xs font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)]',
                isInverse ? 'text-[var(--editorial-dark-muted)]' : 'text-[var(--muted)]',
                deltaClassName
              )}
            >
              {delta}
            </span>
          ) : null}
        </div>
      ) : null}
    </Panel>
  );
}

export function StatCard({ href, ...props }: StatCardProps) {
  if (href) {
      return (
      <AppLink
        className="block h-full rounded-[var(--radius-md)] transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        href={href}
      >
        <StatCardInner {...props} />
      </AppLink>
    );
  }

  return <StatCardInner {...props} />;
}
