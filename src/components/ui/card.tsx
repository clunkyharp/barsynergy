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
        'rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface)] shadow-none transition-[background-color,border-color,box-shadow] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
        interactive && 'hover:border-[var(--accent)] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20',
        selected && 'border-[var(--accent)] ring-2 ring-[var(--accent)]/20',
        loading && 'animate-pulse',
        error && 'border-[var(--danger-border)] bg-[var(--danger-bg)]',
        className
      )}
      {...props}
    />
  );
}
