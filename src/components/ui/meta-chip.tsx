import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type MetaChipVariant = 'default' | 'filter' | 'selected' | 'inverse';

const variants: Record<MetaChipVariant, string> = {
  default: 'border-[var(--border-default)] bg-transparent text-[var(--muted)]',
  filter: 'border-[var(--border-subtle)] bg-[var(--surface-wash)] text-[var(--text)]',
  selected: 'border-[var(--selected-border)] bg-[var(--selected-bg)] text-[var(--accent-contrast)]',
  inverse: 'border-[var(--border-inverse)] bg-transparent text-white'
};

type MetaChipProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: MetaChipVariant;
};

export function MetaChip({ className, variant = 'default', ...props }: MetaChipProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-[2.125rem] items-center rounded-[var(--radius-pill)] border px-3.5 py-1.5 text-[13px] font-medium leading-[18px] tracking-normal',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
