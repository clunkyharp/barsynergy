import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'pending';

const variants: Record<StatusBadgeVariant, string> = {
  success: 'border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-text)]',
  warning: 'border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)]',
  danger: 'border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]',
  neutral: 'border-[var(--border-default)] text-[var(--muted)]',
  pending: 'border-[var(--border-default)] bg-[var(--pending-bg)] text-[var(--text)]'
};

type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: StatusBadgeVariant;
};

export function StatusBadge({ className, variant = 'neutral', ...props }: StatusBadgeProps) {
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
