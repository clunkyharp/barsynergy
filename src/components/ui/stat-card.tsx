import type { HTMLAttributes, ReactNode } from 'react';
import { Panel } from '@/components/ui/panel';
import { cn } from '@/lib/utils';

type StatCardProps = HTMLAttributes<HTMLDivElement> & {
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

export function StatCard({
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
  ...props
}: StatCardProps) {
  const isInverse = tone === 'inverse';

  return (
    <Panel
      className={cn(
        'space-y-3 border-[var(--border-default)] shadow-none',
        isInverse ? 'bg-[var(--surface-inverse)]' : 'bg-[var(--surface)]',
        className
      )}
      padding="md"
      tone={isInverse ? 'inverse' : 'default'}
      {...props}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.16em]',
              isInverse ? 'text-white/58' : 'text-[var(--muted)]',
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
          <div className={cn(isInverse ? 'text-xs font-semibold text-white/72' : 'text-xs font-semibold text-[var(--muted)]', statusClassName)}>
            {status}
          </div>
        ) : null}
      </div>
      {description || delta ? (
        <div className={cn('flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-6', isInverse ? 'text-white/72' : 'text-[var(--muted)]', descriptionClassName)}>
          {description ? <span>{description}</span> : null}
          {delta ? (
            <span className={cn('text-xs font-semibold uppercase tracking-[0.08em]', isInverse ? 'text-white/72' : 'text-[var(--muted)]', deltaClassName)}>
              {delta}
            </span>
          ) : null}
        </div>
      ) : null}
    </Panel>
  );
}
