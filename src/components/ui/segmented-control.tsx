'use client';

import { cn } from '@/lib/utils';

type SegmentedControlItem<T extends string> = {
  value: T;
  eyebrow?: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

type SegmentedControlProps<T extends string> = {
  items: SegmentedControlItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  variant?: 'default' | 'inverse' | 'compact';
};

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  className,
  variant = 'default'
}: SegmentedControlProps<T>) {
  return (
    <div className={cn('grid gap-3', variant === 'compact' ? 'md:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-none', className)} role="group">
      {items.map((item) => {
        const selected = item.value === value;

        return (
          <button
            aria-disabled={item.disabled || undefined}
            aria-pressed={selected}
            className={cn(
              'choice-card px-4 py-4 text-left',
              item.disabled && 'cursor-not-allowed opacity-60',
              variant === 'inverse' && !selected && 'border-[var(--border-inverse)] bg-white/6 text-white hover:bg-white/12'
            )}
            data-selected={selected || undefined}
            disabled={item.disabled}
            key={item.value}
            onClick={() => !item.disabled && onChange(item.value)}
            type="button"
          >
            {item.eyebrow ? (
              <p className={cn('text-[11px] font-semibold uppercase tracking-[0.14em]', selected ? 'choice-card-muted' : 'text-[var(--muted)]')}>
                {item.eyebrow}
              </p>
            ) : null}
            <p className={cn(item.eyebrow ? 'mt-2' : '', variant === 'compact' ? 'text-sm font-semibold leading-5' : 'text-base font-semibold leading-6')}>
              {item.label}
            </p>
            {item.description ? (
              <p className={cn('choice-card-muted mt-2 text-sm leading-6', !selected && variant !== 'inverse' && 'text-[var(--muted)]')}>
                {item.description}
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
