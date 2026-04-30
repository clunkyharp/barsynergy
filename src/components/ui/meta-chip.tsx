import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type MetaChipVariant = 'default' | 'filter' | 'selected' | 'inverse';

const variants: Record<MetaChipVariant, string> = {
  default: 'border-[var(--border-default)] bg-transparent text-[var(--muted)]',
  filter: 'border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text)]',
  selected: 'border-[var(--selected-border)] bg-[var(--selected-bg)] text-white',
  inverse: 'border-[var(--border-inverse)] bg-transparent text-white'
};

type MetaChipProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: MetaChipVariant;
};

export function MetaChip({ className, variant = 'default', ...props }: MetaChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
