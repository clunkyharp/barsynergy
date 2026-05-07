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
        <p
          className={cn(
            'text-[11px] font-semibold uppercase tracking-[0.16em]',
            isInverse ? 'text-white/58' : 'text-[var(--muted)]',
            labelClassName
          )}
        >
          {label}
        </p>
        {status ? (
          <div className={cn(isInverse ? 'text-xs font-semibold text-white/72' : 'text-xs font-semibold text-[var(--muted)]', statusClassName)}>
            {status}
          </div>
        ) : null}
      </div>
      <div className={cn('h-px w-full', isInverse ? 'bg-white/14' : 'bg-[var(--line)]')} />
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <div className={cn('min-w-0 text-2xl font-semibold tracking-normal text-[var(--text)]', isInverse && 'text-white', valueClassName)}>
          {value}
        </div>
        {delta ? (
          <div className={cn(isInverse ? 'text-xs font-semibold text-white/72' : 'text-xs font-semibold text-[var(--muted)]', deltaClassName)}>
            {delta}
          </div>
        ) : null}
      </div>
      {description ? (
        <div className={cn(isInverse ? 'text-sm leading-6 text-white/72' : 'text-sm leading-6 text-[var(--muted)]', descriptionClassName)}>
          {description}
        </div>
      ) : null}
    </Panel>
  );
}
