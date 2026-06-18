import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  elevation?: 'flat' | 'raised' | 'focal';
  interactive?: boolean;
  selected?: boolean;
  loading?: boolean;
  error?: boolean;
};

export function Card({ className, elevation = 'flat', interactive = false, selected = false, loading = false, error = false, ...props }: CardProps) {
  return (
    <div
      aria-busy={loading || undefined}
      aria-selected={selected || undefined}
      className={cn(
        'rounded-[var(--radius-md)] border shadow-none transition-[transform,background-color,border-color,box-shadow] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
        elevation === 'flat' && 'border-[var(--border-default)] bg-[var(--surface)]',
        elevation === 'raised' && 'border-[var(--border-default)] bg-[var(--surface-card)] shadow-[var(--shadow-card)]',
        elevation === 'focal' && 'border-[var(--card-border-selected)] bg-[var(--surface-card)] shadow-[var(--shadow-card)]',
        interactive && 'hover:-translate-y-px hover:border-[var(--accent)] hover:shadow-[var(--shadow-card)] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20',
        selected && 'border-[var(--accent)] ring-2 ring-[var(--accent)]/20',
        loading && 'animate-pulse',
        error && 'border-[var(--danger-border)] bg-[var(--danger-bg)]',
        className
      )}
      {...props}
    />
  );
}
