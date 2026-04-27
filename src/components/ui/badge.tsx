import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger';

const variants: Record<BadgeVariant, string> = {
  neutral: 'border-[var(--line)] text-[var(--muted)]',
  success: 'border-[var(--success)]/35 bg-[var(--success)]/10 text-[var(--success)]',
  warning: 'border-[var(--warning)]/35 bg-[var(--warning)]/10 text-[var(--warning)]',
  danger: 'border-[var(--danger)]/35 bg-[var(--danger)]/10 text-[var(--danger)]'
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
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
