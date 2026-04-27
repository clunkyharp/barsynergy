import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  selected?: boolean;
  loading?: boolean;
  error?: boolean;
};

export function Card({ className, interactive = false, selected = false, loading = false, error = false, ...props }: CardProps) {
  return (
    <div
      aria-busy={loading || undefined}
      aria-selected={selected || undefined}
      className={cn(
        'rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-sm transition',
        interactive && 'hover:border-[var(--accent)] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20',
        selected && 'border-[var(--accent)] ring-2 ring-[var(--accent)]/20',
        loading && 'animate-pulse',
        error && 'border-[var(--danger)] bg-[var(--danger)]/5',
        className
      )}
      {...props}
    />
  );
}
