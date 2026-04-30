import type { HTMLAttributes, ReactNode } from 'react';
import { Panel } from '@/components/ui/panel';
import { cn } from '@/lib/utils';

type StatCardProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: ReactNode;
  description?: ReactNode;
  tone?: 'default' | 'inverse';
  valueClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
};

export function StatCard({
  className,
  label,
  value,
  description,
  tone = 'default',
  valueClassName,
  labelClassName,
  descriptionClassName,
  ...props
}: StatCardProps) {
  return (
    <Panel
      className={cn(
        'relative overflow-hidden space-y-4 shadow-[0_24px_70px_rgba(20,20,18,0.08),inset_0_1px_0_rgba(255,255,255,0.6)]',
        tone === 'default' && 'bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(247,240,228,0.92)_54%,rgba(153,44,38,0.08)_100%)]',
        className
      )}
      padding="md"
      tone={tone === 'inverse' ? 'inverse' : 'default'}
      {...props}
    >
      {tone === 'default' ? (
        <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-[rgba(153,44,38,0.12)] blur-3xl" />
      ) : null}
      <div className="relative">
        <p
          className={cn(
            'text-[11px] font-semibold uppercase tracking-[0.16em]',
            tone === 'inverse' ? 'text-white/58' : 'text-[var(--muted)]',
            labelClassName
          )}
        >
          {label}
        </p>
        <div className={cn('mt-4 text-4xl font-semibold tracking-[-0.04em]', valueClassName)}>{value}</div>
        {description ? (
          <div className={cn(tone === 'inverse' ? 'mt-4 text-sm leading-6 text-white/72' : 'mt-4 text-sm leading-6 text-[var(--muted)]', descriptionClassName)}>
            {description}
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
